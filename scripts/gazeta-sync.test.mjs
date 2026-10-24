// Тести gazeta-sync.mjs без справжнього Google Drive і без poppler.
// Запуск: node --test scripts/gazeta-sync.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseName, schoolYear, plan, run, parseFolderPage, readConfig, NAME_HINT } from "./gazeta-sync.mjs";

function tmp() { return mkdtempSync(join(tmpdir(), "gz-test-")); }

test("назва: різні способи написати номер і тире", () => {
  for (const n of ["2026-11 №1 Осінній випуск.pdf", "2026-11 № 1 Осінній випуск.pdf", "2026-11 N1 Осінній випуск.pdf",
    "2026–11 №1 – Осінній випуск.pdf", "2026 - 11  №1  Осінній випуск.PDF", "2026-11 No 1 Осінній випуск.pdf", "2026-11 №1 Осінній випуск.pdf"]) {
    const m = parseName(n);
    assert.ok(m, n);
    assert.equal(m.id, "2026-11-1", n);
    assert.equal(m.title, "Осінній випуск", n);
    assert.equal(m.date, "2026-11-01", n);
  }
  assert.equal(parseName("2027-3 №12 «Весна».pdf").id, "2027-03-12");
  assert.equal(parseName("2027-3 №12 «Весна».pdf").title, "Весна");
  assert.equal(parseName("2026-10 №0 Наш новий сайт.pdf").id, "2026-10-0");   // пілотний номер
});

test("назва: неправильні варіанти не проходять", () => {
  for (const n of ["Осінній випуск.pdf", "2026-11 Осінній випуск.pdf", "2026-13 №1 Назва.pdf", "11-2026 №1 Назва.pdf", "2026-11 №1 .pdf", "2026-11 №1 Назва.docx"]) {
    assert.equal(parseName(n), null, n);
  }
});

test("навчальний рік вересень-серпень", () => {
  assert.equal(schoolYear(2026, 9), "2026/2027");
  assert.equal(schoolYear(2027, 5), "2026/2027");
  assert.equal(schoolYear(2027, 8), "2026/2027");
});

test("сторінка перегляду папки Диска: файли так, вкладені папки ні", () => {
  const html = `<div class="flip-entries">
    <div class="flip-entry" id="entry-FOLDER1" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/drive/folders/FOLDER1" target="_blank"><div class="flip-entry-title">Газета — на перевірку</div></a></div></div>
    <div class="flip-entry" id="entry-16bOpIDVp2_Ae4Nj6Qhz6omVrp09P_aHR" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/file/d/16bOpIDVp2_Ae4Nj6Qhz6omVrp09P_aHR/view?usp=drive_web" target="_blank"><div class="flip-entry-title">2026-10 №0 Наш новий сайт.pdf</div></a></div></div>
    <div class="flip-entry" id="entry-IMG-1" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/file/d/IMG-1/view" target="_blank"><div class="flip-entry-title">Тест &amp; обкладинка&#39;.jpg</div></a></div></div>
  </div>`;
  assert.deepEqual(parseFolderPage(html), [
    { id: "16bOpIDVp2_Ae4Nj6Qhz6omVrp09P_aHR", name: "2026-10 №0 Наш новий сайт.pdf" },
    { id: "IMG-1", name: "Тест & обкладинка'.jpg" }
  ]);
});

test("налаштування з data/gazeta-config.js", () => {
  const root = tmp();
  try {
    assert.deepEqual(readConfig(root), { name: "Шкільна газета", folder: "" });
    mkdirSync(join(root, "data"));
    writeFileSync(join(root, "data", "gazeta-config.js"), 'window.GAZETA_CONFIG = { name: "[Назва газети]", publishFolderId: "ABC_123" };');
    assert.deepEqual(readConfig(root), { name: "Шкільна газета", folder: "ABC_123" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

const MB = 1024 * 1024;
const FILES = [
  { id: "A", name: "2026-11 №1 Осінній випуск.pdf", size: 4 * MB, modified: "2026-11-02T10:00:00.000Z" },
  { id: "B", name: "Газета листопад.pdf", size: MB, modified: "2026-11-02T10:00:00.000Z" },
  { id: "C", name: "2026-12 №2 Зимовий.docx", size: MB, modified: "2026-12-01T10:00:00.000Z" },
  { id: "D", name: "2026-12 №2 Зимовий випуск.pdf", size: 30 * MB, modified: "2026-12-20T10:00:00.000Z" },
  { id: "E", name: "2026-12 №3 Не PDF.pdf", size: MB, modified: "2026-12-21T10:00:00.000Z" },
  { id: "IMG", name: "2026-11 №1 Осінній випуск.jpg", size: MB, modified: "2026-11-02T10:00:00.000Z" },
  { id: "LOOSE", name: "gazeta-0-cover.jpg", size: MB, modified: "2026-11-02T10:00:00.000Z" }
];

test("план: новий, неправильна назва, не PDF, завеликий, своя обкладинка, зайва картинка", () => {
  const p = plan(FILES, []);
  assert.deepEqual(p.publish.map((x) => x.meta.id).sort(), ["2026-11-1", "2026-12-2", "2026-12-3"]);
  assert.equal(p.errors.length, 2);
  assert.equal(p.errors.find((e) => e.file === "Газета листопад.pdf").reason, NAME_HINT);
  assert.match(p.errors.find((e) => e.file.endsWith(".docx")).reason, /не PDF/);
  assert.match(p.warnings.find((w) => w.file.startsWith("2026-12 №2")).reason, /великий \(30 МБ\)/);
  assert.equal(p.publish.find((x) => x.meta.id === "2026-11-1").cover.id, "IMG");
  assert.deepEqual(p.skipped.map((s) => s.file), ["gazeta-0-cover.jpg"]);   // картинка без пари - не помилка
});

test("план: оновлення новим файлом, новою версією того самого файлу й новою обкладинкою; прибраний - лишається", () => {
  const issues = [
    { id: "2026-11-1", driveFileId: "A", driveModified: "2026-11-02T10:00:00.000Z", coverFile: "IMG@2026-11-02T10:00:00.000Z", number: 1, title: "Осінній випуск" },
    { id: "2026-10-9", driveFileId: "OLD", driveModified: "", number: 9, title: "Старий" },
    { id: "2026-12-2", driveFileId: "D-old", driveModified: "2026-12-01T10:00:00.000Z", number: 2, title: "Зимовий випуск" },
    { id: "2026-12-3", driveFileId: "E", driveModified: "2026-12-01T00:00:00.000Z", number: 3, title: "Не PDF" }
  ];
  const p = plan(FILES, issues);
  assert.deepEqual(p.same.map((x) => x.meta.id), ["2026-11-1"]);
  assert.deepEqual(p.update.map((x) => x.meta.id).sort(), ["2026-12-2", "2026-12-3"]);   // новий ID; той самий ID, новіша дата
  assert.deepEqual(p.missing.map((x) => x.id), ["2026-10-9"]);
  const newCover = FILES.map((f) => f.id === "IMG" ? { ...f, modified: "2026-11-05T10:00:00.000Z" } : f);
  assert.ok(plan(newCover, issues).update.some((x) => x.meta.id === "2026-11-1"));
});

test("план: два файли на один номер - беремо новіший", () => {
  const p = plan([
    { id: "X1", name: "2026-11 №1 Перший.pdf", modified: "2026-11-01T10:00:00Z" },
    { id: "X2", name: "2026-11 № 1 Перший (виправлений).pdf", modified: "2026-11-03T10:00:00Z" }
  ], []);
  assert.equal(p.publish.length, 1);
  assert.equal(p.publish[0].file.id, "X2");
  assert.equal(p.warnings.length, 1);
});

/* повний прогін з підробленим Диском і poppler */
function fakeDrive(files, content) {
  return {
    list: async () => files.map((f) => ({ ...f })),
    download: async (id, to) => writeFileSync(to, content[id] ?? "%PDF-1.7 fake"),
    viewUrl: (id) => `https://drive.google.com/file/d/${id}/view`,
    downloadUrl: (id) => `https://drive.google.com/uc?export=download&id=${id}`
  };
}
const calls = [];
const fakePdf = {
  info: () => ({ pages: 4, w: 595.28, h: 841.89 }),
  render: (pdf, dir, prefix) => { for (let n = 1; n <= 4; n++) writeFileSync(join(dir, `${prefix}-${n}.jpg`), "jpg"); },
  cover: (pdf, jpg) => { calls.push("cover-from-pdf"); writeFileSync(jpg, "jpg"); },
  coverFromImage: (img, jpg) => { calls.push("cover-from-image"); writeFileSync(jpg, "jpg"); },
  text: (pdf, n) => `Сторінка ${n}. Інтерв'ю з директо-\nром і новини   ліцею.`
};

test("прогін: публікує, пише json, сторінки, обкладинку й сторінку для прев'ю; не-PDF усередині - помилка", async () => {
  const root = tmp();
  calls.length = 0;
  try {
    const logs = [];
    const res = await run({ drive: fakeDrive(FILES, { E: "<html>not a pdf</html>" }), pdf: fakePdf, root, now: new Date("2026-12-21T12:00:00Z"), log: (m) => logs.push(m) });
    const data = JSON.parse(readFileSync(join(root, "data/gazeta.json"), "utf8"));
    const index = JSON.parse(readFileSync(join(root, "data/gazeta-index.json"), "utf8"));
    assert.deepEqual(data.issues.map((x) => x.id), ["2026-12-2", "2026-11-1"]);   // новіші зверху
    const a = data.issues.find((x) => x.id === "2026-11-1");
    assert.equal(a.schoolYear, "2026/2027");
    assert.equal(a.pages, 4);
    assert.equal(a.ratio, 0.7071);
    assert.equal(a.base, "gazeta/2026-11-1/");
    assert.equal(a.download, "https://drive.google.com/uc?export=download&id=A");
    assert.deepEqual(readdirSync(join(root, "gazeta/2026-11-1")).sort(),
      ["cover.jpg", "index.html", "p-1.jpg", "p-2.jpg", "p-3.jpg", "p-4.jpg", "t-1.jpg", "t-2.jpg", "t-3.jpg", "t-4.jpg"]);
    assert.deepEqual(calls.sort(), ["cover-from-image", "cover-from-pdf"]);   // №1 зі своєю обкладинкою, №2 - з першої сторінки
    assert.match(readFileSync(join(root, "gazeta/2026-11-1/index.html"), "utf8"), /og:image" content="https:\/\/vlddds\.github\.io\/liceum2\/gazeta\/2026-11-1\/cover\.jpg"/);
    assert.equal(index.pages.filter((x) => x.id === "2026-11-1").length, 4);
    assert.equal(index.pages[0].text, "Сторінка 1. Інтерв'ю з директором і новини ліцею.");   // перенос склеєно, пробіли стиснуто
    assert.equal(res.errors.length, 3);   // назва, docx, html під виглядом pdf
    assert.equal(res.fresh.length, 3);
    assert.match(res.errors.find((e) => e.file.includes("Не PDF")).reason, /всередині не PDF/);
    assert.equal(res.message, "Газета: №1 Осінній випуск; №2 Зимовий випуск");
    assert.ok(logs.some((l) => l.startsWith("⚠️") && l.includes("30 МБ")));
    assert.ok(logs.some((l) => l.startsWith("ℹ️") && l.includes("gazeta-0-cover.jpg")));

    /* другий прогін - нічого нового: не комітимо і вдруге про помилки не пишемо */
    const again = await run({ drive: fakeDrive(FILES, { E: "<html>" }), pdf: fakePdf, root, now: new Date("2026-12-21T13:00:00Z"), log: () => {} });
    assert.equal(again.changed, false);
    assert.equal(again.errors.length, 3);
    assert.equal(again.fresh.length, 0);

    /* виправлений файл того самого номера з новим ID - оновлення, дата публікації лишається, старі сторінки замінено */
    writeFileSync(join(root, "gazeta/2026-11-1/p-9.jpg"), "stale");
    const fixed = FILES.map((f) => f.id === "A" ? { ...f, id: "A2", modified: "2026-12-22T09:00:00.000Z" } : f);
    const upd = await run({ drive: fakeDrive(fixed, { E: "<html>" }), pdf: fakePdf, root, now: new Date("2026-12-22T10:00:00Z"), log: () => {} });
    assert.equal(upd.message, "Газета: оновлено №1 Осінній випуск");
    const a2 = JSON.parse(readFileSync(join(root, "data/gazeta.json"), "utf8")).issues.find((x) => x.id === "2026-11-1");
    assert.equal(a2.driveFileId, "A2");
    assert.equal(a2.publishedAt, a.publishedAt);
    assert.ok(a2.updatedAt);
    assert.ok(!existsSync(join(root, "gazeta/2026-11-1/p-9.jpg")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("прогін: тестовий номер (draft) робот не чіпає", async () => {
  const root = tmp();
  try {
    mkdirSync(join(root, "data"), { recursive: true });
    writeFileSync(join(root, "data/gazeta.json"), JSON.stringify({ issues: [{ id: "test", draft: true, number: 0, title: "Тест", date: "2026-10-01" }] }));
    await run({ drive: fakeDrive([FILES[0]], {}), pdf: fakePdf, root, now: new Date("2026-12-21T12:00:00Z"), log: () => {} });
    const ids = JSON.parse(readFileSync(join(root, "data/gazeta.json"), "utf8")).issues.map((x) => x.id);
    assert.deepEqual(ids.sort(), ["2026-11-1", "test"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("прогін: службова позначка раз на 45 днів, якщо випусків немає", async () => {
  const root = tmp();
  try {
    const r1 = await run({ drive: fakeDrive([], {}), pdf: fakePdf, root, now: new Date("2027-06-01T00:00:00Z"), log: () => {} });
    assert.equal(r1.message, "Газета: службова позначка");
    const r2 = await run({ drive: fakeDrive([], {}), pdf: fakePdf, root, now: new Date("2027-06-20T00:00:00Z"), log: () => {} });
    assert.equal(r2.changed, false);
    const r3 = await run({ drive: fakeDrive([], {}), pdf: fakePdf, root, now: new Date("2027-07-20T00:00:00Z"), log: () => {} });
    assert.equal(r3.changed, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
