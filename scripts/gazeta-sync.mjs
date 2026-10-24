// Шкільна газета: забирає нові випуски з папки Google Drive «Газета — опублікувати»
// і готує їх для сайту. Запускається з .github/workflows/gazeta.yml.
//
// Ключі не потрібні: папка відкрита за посиланням («Усі, хто має посилання → Читач»),
// список файлів беремо зі сторінки перегляду папки, файли - звичайним посиланням на завантаження.
// Якщо колись Google змінить сторінку перегляду - додайте секрет GDRIVE_API_KEY, і список братиметься через Drive API.
//
// Сам PDF лишається на Диску (кнопки «Завантажити PDF» ведуть туди). У репозиторій кладемо лише те, що показує сайт:
//   gazeta/<id>/p-N.jpg       сторінки для читалки, 1400 px по ширині
//   gazeta/<id>/t-N.jpg       мініатюри сторінок
//   gazeta/<id>/cover.jpg     обкладинка, 1200 px (картинка з тією ж назвою, що й PDF, або перша сторінка)
//   gazeta/<id>/index.html    сторінка для прев'ю в соцмережах (og:image), одразу переводить у читалку
//   data/gazeta.json          список випусків
//   data/gazeta-index.json    текст сторінок для пошуку по сайту
//
// Назва файлу = дані випуску: "2026-11 №1 Осінній випуск.pdf".
// Назва самої газети - теж з Диска: файл (будь-який, хоч порожній Google Документ) «Назва газети: Вісник ліцею».
// Потрібні Node 20+, poppler-utils (pdfinfo, pdftoppm, pdftotext) і ImageMagick (convert) для власної обкладинки.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync, renameSync, appendFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://vlddds.github.io/liceum2/";
const BIG = 25 * 1024 * 1024;      // більше - попереджаємо: на телефоні такий PDF вантажиться довго
const PAGE_TEXT = 2000;            // скільки символів тексту сторінки кладемо в пошук
const HEARTBEAT_DAYS = 45;         // GitHub вимикає розклад після 60 днів без комітів
const MONTHS = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];
const IMG = /\.(jpe?g|png|webp)$/i;

export const NAME_HINT = "Назва файлу має бути у форматі «2026-11 №1 Назва.pdf»: рік-місяць, номер, назва випуску.";

/* «Назва газети: Вісник ліцею» (з розширенням чи без) -> «Вісник ліцею» */
export function gazetaTitle(name) {
  const m = /^назва(?: газети)? ?[:—-] ?(.+?)(?:\.[a-z0-9]{2,5})?$/i.exec(tidy(name));
  return m ? m[1].replace(/^[«"'„]+|[»"'“]+$/g, "").trim() : "";
}

/* 1. розбір назви файлу. Терпимо до "№1", "№ 1", "N1", "No 1", різних тире й зайвих пробілів */
function tidy(name) {
  return String(name || "").normalize("NFC")
    .replace(/[‐-―−]/g, "-")
    .replace(/[  -​ ]/g, " ")
    .replace(/\s+/g, " ").trim();
}
export function parseName(name) {
  const m = /^(\d{4}) ?- ?(\d{1,2}) ?[ _-]? ?(?:№|N[oº°]?\.?) ?(\d{1,3})(?: ?[-:.] ?| )(.+?) ?\.pdf$/i.exec(tidy(name));
  if (!m) return null;
  const year = +m[1], month = +m[2], number = +m[3];
  const title = m[4].replace(/^[«"'„]+|[»"'“]+$/g, "").trim();
  if (month < 1 || month > 12 || year < 2000 || year > 2100 || !title) return null;
  const mm = String(month).padStart(2, "0");
  return { id: `${year}-${mm}-${number}`, year, month, number, title, date: `${year}-${mm}-01` };
}
/* «2026-10 №0 Наш новий сайт.jpg» - обкладинка до «2026-10 №0 Наш новий сайт.pdf» */
function baseName(name) { return tidy(name).replace(/\.[a-z0-9]+$/i, "").toLowerCase(); }

/* навчальний рік: вересень-серпень */
export function schoolYear(year, month) {
  return month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

/* 2. що робити з файлами в папці.
   files  - { id, name, modified, size } (modified і size - із заголовків Диска)
   issues - уже опубліковані випуски з data/gazeta.json */
export function plan(files, issues) {
  const byId = new Map(issues.filter((x) => !x.draft).map((x) => [x.id, x]));
  const out = { publish: [], update: [], same: [], errors: [], warnings: [], skipped: [], missing: [], name: "" };
  const images = new Map(files.filter((f) => IMG.test(f.name || "")).map((f) => [baseName(f.name), f]));
  const seen = new Map();

  for (const f of files) {
    if (IMG.test(f.name || "")) continue;
    const t = gazetaTitle(f.name);
    if (t) { out.name = t; continue; }
    if (!/\.pdf$/i.test(f.name || "")) {
      out.errors.push({ file: f.name, key: f.id, reason: "Це не PDF. Експортуйте випуск у Canva як «PDF стандартний»." });
      continue;
    }
    const meta = parseName(f.name);
    if (!meta) { out.errors.push({ file: f.name, key: f.id, reason: NAME_HINT }); continue; }
    const prev = seen.get(meta.id);
    if (prev) {
      /* два файли на один номер: беремо той, що новіший на Диску, а якщо дат нема - той, якого ще нема на сайті */
      const pub = byId.get(meta.id);
      const newer = f.modified && prev.f.modified ? Date.parse(f.modified) > Date.parse(prev.f.modified) : !!pub && pub.driveFileId === prev.f.id;
      const keep = newer ? { f, meta } : prev, drop = newer ? prev.f : f;
      out.warnings.push({ file: drop.name, reason: `У папці два файли для ${meta.id}: беремо «${keep.f.name}», цей пропускаємо. Старий файл краще видалити.` });
      seen.set(meta.id, keep);
      continue;
    }
    seen.set(meta.id, { f, meta });
  }

  const used = new Set();
  for (const { f, meta } of seen.values()) {
    const cover = images.get(baseName(f.name)) || null;
    if (cover) used.add(cover.id);
    if (+f.size > BIG) out.warnings.push({ file: f.name, reason: `Файл великий (${Math.round(f.size / 1048576)} МБ): «Завантажити PDF» на телефоні буде довгим. Краще до 25 МБ.` });
    const old = byId.get(meta.id);
    const job = { file: f, meta, cover, old };
    if (!old) out.publish.push(job);
    else if (old.driveFileId !== f.id || (f.modified && old.driveModified !== f.modified) ||
             (cover ? cover.id + "@" + (cover.modified || "") : "") !== (old.coverFile || "")) out.update.push(job);
    else out.same.push(job);
  }
  for (const img of images.values()) if (!used.has(img.id)) out.skipped.push({ file: img.name, reason: "Картинка без PDF з такою самою назвою - пропускаємо (обкладинку називайте так само, як PDF)." });

  /* номер прибрали з папки - на сайті лишаємо, лише пишемо в лог */
  for (const x of byId.values()) if (!seen.has(x.id)) out.missing.push(x);
  return out;
}

/* 3. Google Drive без ключа: список зі сторінки перегляду папки, дата й розмір - із заголовків завантаження */
const UA = { "User-Agent": "Mozilla/5.0 (liceum2 gazeta bot)" };
function unhtml(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
export function parseFolderPage(html) {
  const files = [];
  const re = /<div class="flip-entry" id="entry-([\w-]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<div class="flip-entry-title">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    if (/\/folders\//.test(m[2])) continue;   // вкладені папки не чіпаємо
    files.push({ id: m[1], name: unhtml(m[3]).trim() });
  }
  return files;
}
export function publicDrive(folderId, apiKey) {
  const dl = (id) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  async function listPage() {
    const r = await fetch(`https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}`, { headers: UA });
    if (!r.ok) throw new Error(`Не вдалося відкрити папку Диска (${r.status}). Чи відкрита вона «Усім, хто має посилання»?`);
    const html = await r.text();
    if (!/flip-entries/.test(html)) throw new Error("Сторінка папки Диска має незвичний вигляд (можливо, Google її змінив). Додайте секрет GDRIVE_API_KEY.");
    return parseFolderPage(html);
  }
  async function listApi() {
    const files = [];
    let page = "";
    do {
      const q = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`);
      const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&key=${encodeURIComponent(apiKey)}&pageSize=200&fields=nextPageToken,files(id,name,size,modifiedTime)${page ? "&pageToken=" + page : ""}`);
      if (!r.ok) throw new Error(`Drive API ${r.status}: ${await r.text()}`);
      const j = await r.json();
      files.push(...(j.files || []).map((f) => ({ id: f.id, name: f.name, size: +f.size || 0, modified: f.modifiedTime })));
      page = j.nextPageToken || "";
    } while (page);
    return files;
  }
  return {
    async list() {
      const files = apiKey ? await listApi() : await listPage();
      /* дата зміни й розмір: щоб помітити нову версію того самого файлу, не завантажуючи його щогодини */
      for (const f of files) {
        if (f.modified) continue;
        try {
          const r = await fetch(dl(f.id), { method: "HEAD", redirect: "follow", headers: UA });
          const lm = r.headers.get("last-modified");
          f.modified = lm ? new Date(lm).toISOString() : "";
          f.size = +r.headers.get("content-length") || 0;
        } catch { f.modified = ""; }
      }
      return files;
    },
    async download(id, to) {
      const r = await fetch(dl(id), { redirect: "follow", headers: UA });
      if (!r.ok) throw new Error(`Диск не віддав файл (${r.status}). Перевірте, що папка відкрита за посиланням.`);
      writeFileSync(to, Buffer.from(await r.arrayBuffer()));
    },
    viewUrl: (id) => `https://drive.google.com/file/d/${id}/view`,
    downloadUrl: dl
  };
}

/* 4. PDF і картинки */
export const tools = {
  info(pdf) {
    const t = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
    const pages = /Pages:\s+(\d+)/.exec(t), size = /Page size:\s+([\d.]+) x ([\d.]+)/.exec(t);
    if (!pages) throw new Error("Не вдалося прочитати PDF (можливо, файл пошкоджений). Збережіть його ще раз.");
    return { pages: +pages[1], w: size ? +size[1] : 595, h: size ? +size[2] : 842 };
  },
  /* сторінки й мініатюри: pdftoppm сам дописує номер, інколи з нулями (p-01.jpg) - перейменовуємо в p-1.jpg */
  render(pdf, dir, prefix, width, quality) {
    execFileSync("pdftoppm", ["-jpeg", "-jpegopt", `quality=${quality}`, "-scale-to-x", String(width), "-scale-to-y", "-1", pdf, join(dir, prefix)]);
    for (const f of readdirSync(dir)) {
      const m = new RegExp(`^${prefix}-0*(\\d+)\\.jpg$`).exec(f);
      if (m && f !== `${prefix}-${+m[1]}.jpg`) renameSync(join(dir, f), join(dir, `${prefix}-${+m[1]}.jpg`));
    }
  },
  cover(pdf, jpg) {
    execFileSync("pdftoppm", ["-f", "1", "-l", "1", "-singlefile", "-jpeg", "-jpegopt", "quality=80", "-scale-to-x", "1200", "-scale-to-y", "-1", pdf, jpg.replace(/\.jpg$/, "")]);
  },
  coverFromImage(img, jpg) {
    execFileSync("convert", [img + "[0]", "-auto-orient", "-resize", "1200x", "-strip", "-quality", "80", jpg]);
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

/* 5. один запуск: список -> план -> обробка -> файли сайту. drive і tools можна підмінити в тестах */
export async function run({ drive, pdf = tools, root = ROOT, now = new Date(), log = console.log, gazetaName: fallbackName = "Шкільна газета" }) {
  const dataPath = join(root, "data", "gazeta.json"), indexPath = join(root, "data", "gazeta-index.json");
  const data = readJSON(dataPath, { issues: [] });
  data.issues = data.issues || [];
  const index = readJSON(indexPath, { pages: [] });
  index.pages = index.pages || [];

  const files = await drive.list();
  const p = plan(files, data.issues);
  /* назва газети: з файлу «Назва газети: …» на Диску; змінилась - перебудовуємо сторінки прев'ю всіх номерів */
  const renamed = !!p.name && p.name !== data.name;
  if (renamed) { log(`📝 Назва газети: «${p.name}»`); data.name = p.name; }
  const gazetaName = data.name || fallbackName;
  log(`У папці файлів: ${files.length}. Нових номерів: ${p.publish.length}, оновлених: ${p.update.length}, без змін: ${p.same.length}, з помилками: ${p.errors.length}.`);
  for (const w of p.warnings) log(`⚠️  ${w.file}: ${w.reason}`);
  for (const s of p.skipped) log(`ℹ️  ${s.file}: ${s.reason}`);
  for (const m of p.missing) log(`ℹ️  №${m.number} «${m.title}» (${m.id}) більше немає в папці. На сайті номер лишається; щоб прибрати - видаліть його з data/gazeta.json і папку gazeta/${m.id}/ вручну.`);

  const done = [], errors = [...p.errors];
  const tmp = mkdtempSync(join(tmpdir(), "gazeta-"));
  try {
    for (const job of [...p.publish, ...p.update]) {
      const { file, meta, cover, old } = job;
      try {
        const local = join(tmp, `${meta.id}.pdf`);
        await drive.download(file.id, local);
        if (readFileSync(local).subarray(0, 5).toString("latin1") !== "%PDF-") {
          throw new Error("Файл називається .pdf, але всередині не PDF. Експортуйте ще раз як «PDF стандартний».");
        }
        const size = statSync(local).size;
        if (size > BIG && !(+file.size > BIG)) log(`⚠️  ${file.name}: файл великий (${Math.round(size / 1048576)} МБ). Краще до 25 МБ.`);
        const info = pdf.info(local);

        /* усе готуємо в тимчасовій папці й міняємо разом, щоб на сайті не було половини номера */
        const work = join(tmp, meta.id);
        mkdirSync(work, { recursive: true });
        pdf.render(local, work, "p", 1400, 78);
        pdf.render(local, work, "t", 240, 70);
        for (let n = 1; n <= info.pages; n++) {
          if (!existsSync(join(work, `p-${n}.jpg`))) throw new Error(`Не вдалося зробити картинку сторінки ${n}.`);
        }
        if (cover) {
          const img = join(tmp, `${meta.id}-cover`);
          await drive.download(cover.id, img);
          try { pdf.coverFromImage(img, join(work, "cover.jpg")); }
          catch { log(`⚠️  ${cover.name}: не вдалося прочитати картинку, обкладинка - перша сторінка PDF.`); }
        }
        if (!existsSync(join(work, "cover.jpg"))) pdf.cover(local, join(work, "cover.jpg"));

        index.pages = index.pages.filter((x) => x.id !== meta.id);
        for (let n = 1; n <= info.pages; n++) {
          const text = cleanText(pdf.text(local, n));
          if (text) index.pages.push({ id: meta.id, page: n, text });
        }

        const issue = {
          id: meta.id, driveFileId: file.id, driveModified: file.modified || "",
          coverFile: cover ? cover.id + "@" + (cover.modified || "") : "",
          number: meta.number, title: meta.title, date: meta.date, schoolYear: schoolYear(meta.year, meta.month),
          pdf: drive.viewUrl(file.id), download: drive.downloadUrl(file.id),
          base: `gazeta/${meta.id}/`, cover: `gazeta/${meta.id}/cover.jpg`,
          pages: info.pages, ratio: +(info.w / info.h).toFixed(4), size,
          publishedAt: old ? old.publishedAt : now.toISOString(),
          ...(old ? { updatedAt: now.toISOString() } : {})
        };
        writeFileSync(join(work, "index.html"), shareHTML(issue, gazetaName));
        const dir = join(root, "gazeta", meta.id);
        rmSync(dir, { recursive: true, force: true });
        mkdirSync(dirname(dir), { recursive: true });
        renameSync(work, dir);

        data.issues = data.issues.filter((x) => x.id !== meta.id).concat(issue);
        done.push({ issue, updated: !!old });
        log(`✅ ${old ? "Оновлено" : "Опубліковано"}: №${meta.number} «${meta.title}» (${info.pages} с.${cover ? ", своя обкладинка" : ""})`);
      } catch (e) {
        errors.push({ file: file.name, key: file.id + "@" + (file.modified || ""), reason: e.message });
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (renamed) {
    for (const x of data.issues) {
      const dir = join(root, "gazeta", x.id);
      if (!x.draft && existsSync(dir) && !done.some((d) => d.issue.id === x.id)) writeFileSync(join(dir, "index.html"), shareHTML(x, gazetaName));
    }
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
  if (done.length || heartbeat || rejectedChanged || renamed) {
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
    : renamed ? `Газета: назва «${gazetaName}»` : heartbeat || rejectedChanged ? "Газета: службова позначка" : "";
  return { changed: !!message, message, done, errors, fresh, plan: p };
}

/* налаштування з data/gazeta-config.js: назва газети й ID папки «Газета — опублікувати» */
export function readConfig(root = ROOT) {
  let s = "";
  try { s = readFileSync(join(root, "data", "gazeta-config.js"), "utf8"); } catch {}
  const get = (k) => { const m = new RegExp(`\\b${k}:\\s*"([^"]*)"`).exec(s); return m && !m[1].startsWith("[") ? m[1] : ""; };
  return { name: get("name") || "Шкільна газета", folder: get("publishFolderId") };
}

/* запуск з командного рядка (з workflow) */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const cfg = readConfig();
  const folder = process.env.GDRIVE_PUBLISH_FOLDER_ID || cfg.folder;
  if (!folder) {
    console.error("❌ Не вказано папку: впишіть publishFolderId у data/gazeta-config.js (ID папки «Газета — опублікувати»).");
    process.exit(1);
  }
  const res = await run({ drive: publicDrive(folder, process.env.GDRIVE_API_KEY || ""), gazetaName: cfg.name });
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${res.changed}\nmessage=${res.message.replace(/\n/g, " ")}\nerrors=${res.fresh.length}\n`);
  }
}
