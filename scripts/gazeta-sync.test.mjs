// Тести gazeta-sync.mjs без справжнього Google Drive і без poppler.
// Запуск: node --test scripts/gazeta-sync.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseName, schoolYear, plan, run, NAME_HINT } from "./gazeta-sync.mjs";

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

const MB = 1024 * 1024;
const FILES = [
  { id: "A", name: "2026-11 №1 Осінній випуск.pdf", mimeType: "application/pdf", size: 4 * MB, modifiedTime: "2026-11-02T10:00:00Z" },
  { id: "B", name: "Газета листопад.pdf", mimeType: "application/pdf", size: MB, modifiedTime: "2026-11-02T10:00:00Z" },
  { id: "C", name: "2026-12 №2 Зимовий.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: MB, modifiedTime: "2026-12-01T10:00:00Z" },
  { id: "D", name: "2026-12 №2 Зимовий випуск.pdf", mimeType: "application/pdf", size: 30 * MB, modifiedTime: "2026-12-20T10:00:00Z" },
  { id: "E", name: "2026-12 №3 Не PDF.pdf", mimeType: "application/pdf", size: MB, modifiedTime: "2026-12-21T10:00:00Z" }
];

test("план: новий, неправильна назва, не PDF, завеликий", () => {
  const p = plan(FILES, []);
  assert.deepEqual(p.publish.map((x) => x.meta.id).sort(), ["2026-11-1", "2026-12-2", "2026-12-3"]);
  assert.equal(p.errors.length, 2);
  assert.equal(p.errors.find((e) => e.file === "Газета листопад.pdf").reason, NAME_HINT);
  assert.match(p.errors.find((e) => e.file.endsWith(".docx")).reason, /не PDF/);
  assert.match(p.warnings.find((w) => w.file.startsWith("2026-12 №2")).reason, /великий \(30 МБ\)/);
});

test("план: той самий номер з новим ID - оновлення; без змін - пропуск; прибраний з папки - лишається", () => {
  const issues = [
    { id: "2026-11-1", driveFileId: "A", driveModified: "2026-11-02T10:00:00Z", number: 1, title: "Осінній випуск" },
    { id: "2026-10-9", driveFileId: "OLD", driveModified: "2026-10-01T10:00:00Z", number: 9, title: "Старий" },
    { id: "2026-12-2", driveFileId: "D-old", driveModified: "2026-12-01T10:00:00Z", number: 2, title: "Зимовий випуск" }
  ];
  const p = plan(FILES, issues);
  assert.deepEqual(p.same.map((x) => x.meta.id), ["2026-11-1"]);
  assert.deepEqual(p.update.map((x) => x.meta.id), ["2026-12-2"]);
  assert.deepEqual(p.missing.map((x) => x.id), ["2026-10-9"]);
});

test("план: два файли на один номер - беремо новіший", () => {
  const p = plan([
    { id: "X1", name: "2026-11 №1 Перший.pdf", mimeType: "application/pdf", size: 1, modifiedTime: "2026-11-01T10:00:00Z" },
    { id: "X2", name: "2026-11 № 1 Перший (виправлений).pdf", mimeType: "application/pdf", size: 1, modifiedTime: "2026-11-03T10:00:00Z" }
  ], []);
  assert.equal(p.publish.length, 1);
  assert.equal(p.publish[0].file.id, "X2");
  assert.equal(p.warnings.length, 1);
});

/* повний прогін з підробленим Диском і poppler */
function fakeDrive(files, content) {
  return { list: async () => files, download: async (id, to) => writeFileSync(to, content[id] ?? "%PDF-1.7 fake") };
}
const fakePdf = {
  pages: () => 4,
  cover: (pdf, jpg) => writeFileSync(jpg, "jpg"),
  text: (pdf, n) => `Сторінка ${n}. Інтерв'ю з директо-\nром і новини   ліцею.`
};

test("прогін: публікує, пише json, обкладинку й сторінку для прев'ю; не-PDF усередині - помилка", async () => {
  const root = mkdtempSync(join(tmpdir(), "gz-test-"));
  try {
    const logs = [];
    const res = await run({ drive: fakeDrive(FILES, { E: "<html>not a pdf</html>" }), pdf: fakePdf, root, now: new Date("2026-12-21T12:00:00Z"), log: (m) => logs.push(m) });
    const data = JSON.parse(readFileSync(join(root, "data/gazeta.json"), "utf8"));
    const index = JSON.parse(readFileSync(join(root, "data/gazeta-index.json"), "utf8"));
    assert.deepEqual(data.issues.map((x) => x.id), ["2026-12-2", "2026-11-1"]);   // новіші зверху
    const a = data.issues.find((x) => x.id === "2026-11-1");
    assert.equal(a.schoolYear, "2026/2027");
    assert.equal(a.pages, 4);
    assert.equal(a.cover, "gazeta/2026-11-1/cover.jpg");
    assert.ok(existsSync(join(root, "gazeta/2026-11-1/cover.jpg")));
    assert.match(readFileSync(join(root, "gazeta/2026-11-1/index.html"), "utf8"), /og:image" content="https:\/\/vlddds\.github\.io\/liceum2\/gazeta\/2026-11-1\/cover\.jpg"/);
    assert.equal(index.pages.filter((x) => x.id === "2026-11-1").length, 4);
    assert.equal(index.pages[0].text, "Сторінка 1. Інтерв'ю з директором і новини ліцею.");   // перенос склеєно, пробіли стиснуто
    assert.equal(res.errors.length, 3);   // назва, docx, html під виглядом pdf
    assert.equal(res.fresh.length, 3);
    assert.match(res.errors.find((e) => e.file.includes("Не PDF")).reason, /всередині не PDF/);
    assert.equal(res.message, "Газета: №1 Осінній випуск; №2 Зимовий випуск");
    assert.ok(logs.some((l) => l.startsWith("⚠️") && l.includes("30 МБ")));

    /* другий прогін - нічого нового, нічого не комітимо */
    const again = await run({ drive: fakeDrive(FILES, { E: "<html>" }), pdf: fakePdf, root, now: new Date("2026-12-21T13:00:00Z"), log: () => {} });
    assert.equal(again.changed, false);
    assert.equal(again.errors.length, 3);   // помилки ті самі...
    assert.equal(again.fresh.length, 0);    // ...але вдруге про них не повідомляємо

    /* виправлений файл того самого номера з новим ID - оновлення, дата публікації лишається */
    const fixed = FILES.map((f) => f.id === "A" ? { ...f, id: "A2", modifiedTime: "2026-12-22T09:00:00Z" } : f);
    const upd = await run({ drive: fakeDrive(fixed, { E: "<html>" }), pdf: fakePdf, root, now: new Date("2026-12-22T10:00:00Z"), log: () => {} });
    assert.equal(upd.message, "Газета: оновлено №1 Осінній випуск");
    const a2 = JSON.parse(readFileSync(join(root, "data/gazeta.json"), "utf8")).issues.find((x) => x.id === "2026-11-1");
    assert.equal(a2.driveFileId, "A2");
    assert.equal(a2.publishedAt, a.publishedAt);
    assert.ok(a2.updatedAt);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("прогін: службова позначка раз на 45 днів, якщо випусків немає", async () => {
  const root = mkdtempSync(join(tmpdir(), "gz-test-"));
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
