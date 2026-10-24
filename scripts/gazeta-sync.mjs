// Шкільна газета: забирає нові випуски з папки Google Drive «Газета — опублікувати»
// і готує їх для сайту. Запускається з .github/workflows/gazeta.yml.
//
// Сам PDF у репозиторій не кладемо: сайт читає його прямо з Диска.
// У репозиторії лишається тільки те, що потрібно сторінкам:
//   gazeta/<id>/cover.jpg     обкладинка, 1200 px по ширині
//   gazeta/<id>/index.html    сторінка для прев'ю в соцмережах (og:image), одразу переводить у читалку
//   data/gazeta.json          список випусків
//   data/gazeta-index.json    текст сторінок для пошуку по сайту
//
// Назва файлу = дані випуску: "2026-11 №1 Осінній випуск.pdf".
// Змінні середовища: GDRIVE_SERVICE_ACCOUNT_JSON, GDRIVE_PUBLISH_FOLDER_ID, GITHUB_OUTPUT (від Actions).
// Без залежностей: потрібні лише Node 20+ і poppler-utils (pdfinfo, pdftoppm, pdftotext).

import { createSign } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://vlddds.github.io/liceum2/";
const BIG = 25 * 1024 * 1024;      // більше - попереджаємо: на телефоні такий файл вантажиться довго
const PAGE_TEXT = 2000;            // скільки символів тексту сторінки кладемо в пошук
const HEARTBEAT_DAYS = 45;         // GitHub вимикає розклад після 60 днів без комітів
const MONTHS = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];

export const NAME_HINT = "Назва файлу має бути у форматі «2026-11 №1 Назва.pdf»: рік-місяць, номер, назва випуску.";

/* 1. розбір назви файлу. Терпимо до "№1", "№ 1", "N1", "No 1", різних тире й зайвих пробілів */
export function parseName(name) {
  const s = String(name || "")
    .normalize("NFC")
    .replace(/[‐-―−]/g, "-")      // різні тире -> звичайний дефіс
    .replace(/[  -​ ]/g, " ") // нерозривні та інші пробіли
    .replace(/\s+/g, " ")
    .trim();
  const m = /^(\d{4}) ?- ?(\d{1,2}) ?[ _-]? ?(?:№|N[oº°]?\.?) ?(\d{1,3})(?: ?[-–:.] ?| )(.+?) ?\.pdf$/i.exec(s);
  if (!m) return null;
  const year = +m[1], month = +m[2], number = +m[3];
  const title = m[4].replace(/^[«"'„]+|[»"'“]+$/g, "").trim();
  if (month < 1 || month > 12 || year < 2000 || year > 2100 || !number || !title) return null;
  const mm = String(month).padStart(2, "0");
  return { id: `${year}-${mm}-${number}`, year, month, number, title, date: `${year}-${mm}-01` };
}

/* навчальний рік: вересень-серпень */
export function schoolYear(year, month) {
  return month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

/* 2. що робити з файлами в папці: новий випуск, оновлення, без змін, помилка.
   files - список з Drive: { id, name, mimeType, size, modifiedTime }
   issues - уже опубліковані випуски з data/gazeta.json */
export function plan(files, issues) {
  const byId = new Map(issues.filter((x) => !x.draft).map((x) => [x.id, x]));
  const out = { publish: [], update: [], same: [], errors: [], warnings: [], missing: [] };
  const seen = new Map();   // id випуску -> файл (якщо в папці два файли на один номер - беремо новіший)

  for (const f of files) {
    const isPdf = f.mimeType === "application/pdf" || /\.pdf$/i.test(f.name || "");
    if (!isPdf) { out.errors.push({ file: f.name, key: f.id + "@" + f.modifiedTime, reason: "Це не PDF. Експортуйте випуск у Canva як «PDF стандартний»." }); continue; }
    const meta = parseName(f.name);
    if (!meta) { out.errors.push({ file: f.name, key: f.id + "@" + f.modifiedTime, reason: NAME_HINT }); continue; }
    const prev = seen.get(meta.id);
    if (prev) {
      const keep = String(f.modifiedTime) > String(prev.f.modifiedTime) ? { f, meta } : prev;
      const drop = keep === prev ? f : prev.f;
      out.warnings.push({ file: drop.name, reason: `У папці два файли для ${meta.id}: беремо новіший «${keep.f.name}», цей пропускаємо.` });
      seen.set(meta.id, keep);
      continue;
    }
    seen.set(meta.id, { f, meta });
  }

  for (const { f, meta } of seen.values()) {
    if (+f.size > BIG) out.warnings.push({ file: f.name, reason: `Файл великий (${Math.round(f.size / 1048576)} МБ): на телефоні відкриватиметься повільно. Краще до 25 МБ.` });
    const old = byId.get(meta.id);
    if (!old) out.publish.push({ file: f, meta });
    else if (old.driveFileId !== f.id || old.driveModified !== f.modifiedTime) out.update.push({ file: f, meta, old });
    else out.same.push({ file: f, meta });
  }

  /* файл прибрали з папки - випуск лишаємо на сайті, лише пишемо в лог */
  for (const x of byId.values()) if (!seen.has(x.id)) out.missing.push(x);
  return out;
}

/* 3. Google: токен сервісного акаунта (JWT RS256) і запити до Drive */
function b64url(x) { return Buffer.from(x).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"); }

async function driveToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const sig = createSign("RSA-SHA256").update(`${head}.${body}`).sign(sa.private_key);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${body}.${b64url(sig)}` })
  });
  if (!r.ok) throw new Error(`Google не видав токен (${r.status}): ${await r.text()}`);
  return (await r.json()).access_token;
}

export function googleDrive(sa, folderId) {
  let token = null;
  async function api(url) {
    token = token || await driveToken(sa);
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Drive API ${r.status}: ${await r.text()}`);
    return r;
  }
  return {
    async list() {
      const files = [];
      let page = "";
      do {
        const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
        const r = await api(`https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true` +
          `&fields=nextPageToken,files(id,name,mimeType,size,modifiedTime)${page ? "&pageToken=" + page : ""}`);
        const j = await r.json();
        files.push(...(j.files || []));
        page = j.nextPageToken || "";
      } while (page);
      return files;
    },
    async download(id, to) {
      const r = await api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`);
      writeFileSync(to, Buffer.from(await r.arrayBuffer()));
    }
  };
}

/* 4. PDF: сторінки, обкладинка, текст (poppler-utils) */
export const poppler = {
  pages(pdf) {
    const m = /Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [pdf], { encoding: "utf8" }));
    if (!m) throw new Error("pdfinfo не назвав кількість сторінок");
    return +m[1];
  },
  cover(pdf, jpg) {
    const base = jpg.replace(/\.jpg$/, "");
    execFileSync("pdftoppm", ["-f", "1", "-l", "1", "-singlefile", "-jpeg", "-jpegopt", "quality=80", "-scale-to-x", "1200", "-scale-to-y", "-1", pdf, base]);
  },
  text(pdf, page) {
    return execFileSync("pdftotext", ["-f", String(page), "-l", String(page), "-enc", "UTF-8", pdf, "-"], { encoding: "utf8", maxBuffer: 16 << 20 });
  }
};

function cleanText(t) {
  return String(t || "").replace(/-\n(?=\p{Ll})/gu, "").replace(/\s+/g, " ").trim().slice(0, PAGE_TEXT);
}
function readJSON(p, def) { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return def; } }
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

/* сторінка для прев'ю посилання: соцмережі не виконують скрипти, тож og-теги мають бути в самому HTML */
export function shareHTML(issue, gazetaName) {
  const title = `${gazetaName} №${issue.number} — ${issue.title}`;
  const month = `${MONTHS[+issue.date.slice(5, 7) - 1]} ${issue.date.slice(0, 4)}`;
  const reader = `../../post.html?id=${encodeURIComponent(issue.id)}`;
  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Підгородненський Ліцей №2</title>
<meta name="description" content="${esc(`Шкільна газета Ліцею №2, ${month}. ${issue.pages} с.`)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Підгородненський Ліцей №2">
<meta property="og:locale" content="uk_UA">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(`Шкільна газета Ліцею №2, ${month}. Читайте онлайн.`)}">
<meta property="og:url" content="${SITE}gazeta/${issue.id}/">
<meta property="og:image" content="${SITE}${issue.cover}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${SITE}post.html?id=${encodeURIComponent(issue.id)}">
<meta http-equiv="refresh" content="0; url=${reader}">
<script>location.replace(${JSON.stringify(reader)} + location.hash);</script>
</head>
<body><p><a href="${reader}">Читати ${esc(title)}</a></p></body>
</html>
`;
}

/* 5. один запуск: список -> план -> обробка -> файли сайту. drive і pdf можна підмінити в тестах */
export async function run({ drive, pdf = poppler, root = ROOT, now = new Date(), log = console.log, gazetaName = "Шкільна газета" }) {
  const dataPath = join(root, "data", "gazeta.json"), indexPath = join(root, "data", "gazeta-index.json");
  const data = readJSON(dataPath, { issues: [] });
  data.issues = data.issues || [];
  const index = readJSON(indexPath, { pages: [] });
  index.pages = index.pages || [];

  const files = await drive.list();
  const p = plan(files, data.issues);
  log(`У папці файлів: ${files.length}. Нових: ${p.publish.length}, оновлених: ${p.update.length}, без змін: ${p.same.length}, з помилками: ${p.errors.length}.`);
  for (const w of p.warnings) log(`⚠️  ${w.file}: ${w.reason}`);
  for (const m of p.missing) log(`ℹ️  №${m.number} «${m.title}» (${m.id}) більше немає в папці. На сайті випуск лишається; щоб прибрати - видаліть його з data/gazeta.json вручну.`);

  const done = [], errors = [...p.errors];
  const tmp = mkdtempSync(join(tmpdir(), "gazeta-"));
  try {
    for (const job of [...p.publish, ...p.update]) {
      const { file, meta } = job;
      try {
        const local = join(tmp, `${meta.id}.pdf`);
        await drive.download(file.id, local);
        const head = readFileSync(local).subarray(0, 5).toString("latin1");
        if (head !== "%PDF-") throw new Error("Файл називається .pdf, але всередині не PDF. Експортуйте ще раз як «PDF стандартний».");

        const pages = pdf.pages(local);
        const dir = join(root, "gazeta", meta.id);
        mkdirSync(dir, { recursive: true });
        pdf.cover(local, join(dir, "cover.jpg"));
        if (!existsSync(join(dir, "cover.jpg"))) throw new Error("Не вдалося зробити обкладинку з першої сторінки.");

        index.pages = index.pages.filter((x) => x.id !== meta.id);
        for (let n = 1; n <= pages; n++) {
          const text = cleanText(pdf.text(local, n));
          if (text) index.pages.push({ id: meta.id, page: n, text });
        }

        const issue = {
          id: meta.id, driveFileId: file.id, driveModified: file.modifiedTime,
          number: meta.number, title: meta.title, date: meta.date, schoolYear: schoolYear(meta.year, meta.month),
          pdf: `https://drive.google.com/file/d/${file.id}/view`, cover: `gazeta/${meta.id}/cover.jpg`,
          pages, size: +file.size || 0,
          publishedAt: job.old ? job.old.publishedAt : now.toISOString(),
          ...(job.old ? { updatedAt: now.toISOString() } : {})
        };
        writeFileSync(join(dir, "index.html"), shareHTML(issue, gazetaName));
        data.issues = data.issues.filter((x) => x.id !== meta.id).concat(issue);
        done.push({ issue, updated: !!job.old });
        log(`✅ ${job.old ? "Оновлено" : "Опубліковано"}: №${meta.number} «${meta.title}» (${pages} с.)`);
      } catch (e) {
        errors.push({ file: file.name, key: file.id + "@" + file.modifiedTime, reason: e.message });
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  /* про файл з помилкою повідомляємо один раз (інакше лист щогодини), доки його не виправлять чи не приберуть */
  const was = new Set(data.rejected || []);
  const fresh = errors.filter((e) => !was.has(e.key));
  const rejected = errors.map((e) => e.key).sort();
  const rejectedChanged = rejected.join() !== [...was].sort().join();
  data.rejected = rejected;

  /* службова позначка, щоб розклад не вимкнувся за довгу паузу (літо) */
  const beat = data.heartbeat ? Date.parse(data.heartbeat) : 0;
  const heartbeat = !done.length && now - beat > HEARTBEAT_DAYS * 864e5;
  if (done.length || heartbeat || rejectedChanged) {
    data.issues.sort((a, b) => (b.date + String(b.number).padStart(3, "0")).localeCompare(a.date + String(a.number).padStart(3, "0")));
    data.heartbeat = now.toISOString();
    mkdirSync(dirname(dataPath), { recursive: true });
    writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
    index.pages.sort((a, b) => a.id.localeCompare(b.id) || a.page - b.page);
    writeFileSync(indexPath, JSON.stringify(index) + "\n");
  }

  for (const e of errors) log(`❌ ${e.file}: ${e.reason}${was.has(e.key) ? " (про цей файл уже повідомляли)" : ""}`);
  const message = done.length
    ? "Газета: " + done.map((d) => `${d.updated ? "оновлено " : ""}№${d.issue.number} ${d.issue.title}`).join("; ")
    : heartbeat || rejectedChanged ? "Газета: службова позначка" : "";
  return { changed: !!message, message, done, errors, fresh, plan: p };
}

/* запуск з командного рядка (з workflow) */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const sa = JSON.parse(process.env.GDRIVE_SERVICE_ACCOUNT_JSON || "null");
  const folder = process.env.GDRIVE_PUBLISH_FOLDER_ID;
  if (!sa || !folder) {
    console.error("❌ Не задано секрети GDRIVE_SERVICE_ACCOUNT_JSON і GDRIVE_PUBLISH_FOLDER_ID (Settings → Secrets and variables → Actions).");
    process.exit(1);
  }
  /* назва газети - з data/gazeta-config.js (поки там заглушка в [дужках] - просто «Шкільна газета») */
  let gazetaName = "Шкільна газета";
  try {
    const m = /name:\s*"([^"]+)"/.exec(readFileSync(join(ROOT, "data", "gazeta-config.js"), "utf8"));
    if (m && !m[1].startsWith("[")) gazetaName = m[1];
  } catch {}
  const res = await run({ drive: googleDrive(sa, folder), gazetaName });
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${res.changed}\nmessage=${res.message.replace(/\n/g, " ")}\nerrors=${res.fresh.length}\n`);
  }
}
