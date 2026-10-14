/* Гугл-таблиця для сайту: "Швидке повідомлення", "Відгуки" і дописи "Життя ліцею".

   Як підключити (один раз, хвилин 5):
   1. Створити нову таблицю (sheets.new) з акаунта ліцею.
   2. Розширення -> Apps Script, видалити все, що там є, і вставити цей файл.
   3. Зберегти, потім Розгорнути -> Нове розгортання -> тип "Вебзастосунок".
        Виконувати як: Я;  Хто має доступ: Усі.
      Google попросить доступ до таблиці і пошти - дозволити.
   4. Скопіювати URL вебзастосунку (закінчується на /exec) і вставити в js/data.js:
        formEndpoint:   "https://script.google.com/macros/s/.../exec",
        reviewEndpoint: "https://script.google.com/macros/s/.../exec",
   5. Все. В таблиці з'являться аркуші "Звернення" і "Відгуки".

   Модерація: на аркуші "Відгуки" ставимо галочку в "Схвалено" - відгук з'являється на сайті
   (протягом хвилини). Зняли галочку - зник.

   Життя ліцею (вкладка на сторінці новин): аркуш "Життя ліцею" створюється сам, коли сайт
   вперше його попросить. Один рядок = один допис:
     Дата | Заголовок | Текст (можна з абзацами) | Фото | Показувати (галочка)
   Фото: посилання на файли з Google Диска, кожне з нового рядка (або через пробіл).
   Відео: туди ж (або просто в текст) можна вставити посилання на YouTube - на сайті буде плеєр.
   Альбом: туди ж можна кинути посилання на альбом Google Фото чи папку Диска - на сайті будуть усі фото з нього
   (до 30). Альбом/папка мають бути відкриті за посиланням. Список фото оновлюється раз на 6 годин.
   Після вставки цього коду: зверху вибрати функцію authorize -> "Виконати" -> дозволити доступ.
   Самі файли чи папка мають бути відкриті "Усі, хто має посилання", інакше фото не покажуться.
   Допис з'являється на сайті, коли стоїть галочка "Показувати", нові зверху (за датою).

   Якщо міняли цей код: Розгорнути -> Керувати розгортаннями -> Редагувати -> Нова версія. */

var NOTIFY_EMAIL = "pidgorodne.lyceum2@gmail.com";   // куди слати листи про нові звернення ("" - не слати)
var REVIEWS = "Відгуки", MESSAGES = "Звернення", LIFE = "Життя ліцею";

function sheet_(name, head) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(head);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight("bold");
  }
  return sh;
}
function clean_(v, max) { return String(v == null ? "" : v).replace(/[<>]/g, "").slice(0, max || 1000).trim(); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

/* приймаємо форми з сайту */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.website) return json_({ ok: true });            // пастка для ботів
    var now = new Date();
    if (d.type === "review") {
      var sh = sheet_(REVIEWS, ["Дата", "Ім'я", "Хто", "Оцінка", "Відгук", "Схвалено"]);
      sh.appendRow([now, clean_(d.name, 60), clean_(d.who, 40), Number(d.rating) || "", clean_(d.text, 1000), false]);
      sh.getRange(sh.getLastRow(), 6).insertCheckboxes();
      if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, "Новий відгук на сайті (чекає перевірки)",
        clean_(d.text, 1000) + "\n\n" + clean_(d.name, 60) + " (" + clean_(d.who, 40) + ")\n\nСхваліть його галочкою в таблиці: " +
        SpreadsheetApp.getActiveSpreadsheet().getUrl());
    } else {
      var sm = sheet_(MESSAGES, ["Дата", "Ім'я", "Контакт для відповіді", "Повідомлення", "Відповіли"]);
      sm.appendRow([now, clean_(d.name, 80), clean_(d.contact, 120), clean_(d.message, 1000), false]);
      sm.getRange(sm.getLastRow(), 5).insertCheckboxes();
      if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, "Звернення з сайту від " + clean_(d.name, 80),
        clean_(d.message, 1000) + "\n\nКонтакт для відповіді: " + clean_(d.contact, 120));
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* віддаємо дані сайту: .../exec?action=reviews (схвалені відгуки), .../exec?action=life (дописи) */
function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";
  if (action === "reviews") return json_(reviews_());
  if (action === "life") return json_(life_());
  return json_({ ok: true });
}

function reviews_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REVIEWS);
  if (!sh || sh.getLastRow() < 2) return [];
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues();
  var months = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];
  return rows.filter(function (r) { return r[5] === true; }).reverse().map(function (r) {
    var dt = r[0] instanceof Date ? r[0] : null;
    return { name: String(r[1]), who: String(r[2]), rating: Number(r[3]) || "", text: String(r[4]),
             date: dt ? months[dt.getMonth()] + " " + dt.getFullYear() : "" };
  });
}

/* дописи "Життя ліцею": тільки з галочкою, нові зверху, не більше 30 */
function life_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIFE);
  if (!sh) {
    sh = sheet_(LIFE, ["Дата", "Заголовок", "Текст", "Фото (посилання з Google Диска, кожне з нового рядка)", "Показувати"]);
    sh.getRange("A2:A500").setNumberFormat("dd.mm.yyyy");
    sh.getRange("E2:E500").insertCheckboxes();
    sh.setColumnWidth(2, 220); sh.setColumnWidth(3, 420); sh.setColumnWidth(4, 320);
  }
  if (sh.getLastRow() < 2) return [];
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues();
  var months = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  return rows.filter(function (r) { return r[4] === true && (r[1] || r[2]); })
    .sort(function (a, b) { return (b[0] instanceof Date ? b[0].getTime() : 0) - (a[0] instanceof Date ? a[0].getTime() : 0); })
    .slice(0, 30)
    .map(function (r) {
      var dt = r[0] instanceof Date ? r[0] : null;
      return { date: dt ? dt.getDate() + " " + months[dt.getMonth()] + " " + dt.getFullYear() : String(r[0] || ""),
               title: clean_(r[1], 200), text: clean_(r[2], 3000), photos: photos_(r[3]) };
    });
}

/* що лежить у колонці "Фото" -> список картинок для сайту:
   - файл з Диска -> пряма картинка (файл відкритий за посиланням)
   - папка Диска -> всі картинки з неї
   - альбом Google Фото -> всі фото з альбому (альбом відкритий за посиланням)
   - ютуб і інші https-посилання віддаємо як є (сайт сам розбереться)
   альбоми й папки кешуємо на 6 годин, щоб не відкривати їх щоразу */
function photos_(cell) {
  var out = [];
  String(cell || "").split(/[\s,]+/).filter(Boolean).forEach(function (u) {
    if (out.length >= 40) return;
    var folder = u.match(/drive\.google\.com\/(?:drive\/)?(?:u\/\d+\/)?folders\/([\w-]{20,})/);
    if (folder) { out = out.concat(cached_("dir:" + folder[1], function () { return driveFolder_(folder[1]); }, u)); return; }
    if (/^https?:\/\/(photos\.app\.goo\.gl|goo\.gl\/photos|photos\.google\.com\/(u\/\d+\/)?share)/i.test(u)) {
      out = out.concat(cached_("alb:" + u, function () { return photosAlbum_(u); }, u)); return;
    }
    var m = u.match(/\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/);
    if (m) out.push("https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1600");
    else if (/^https:\/\//.test(u)) out.push(u);
  });
  return out.slice(0, 40);
}

/* беремо з кешу або рахуємо; якщо не вийшло - віддаємо саме посилання (на сайті буде кнопка на альбом) */
function cached_(key, fn, fallback) {
  var cache = CacheService.getScriptCache(), k = key.slice(0, 240), hit = cache.get(k);
  if (hit) return JSON.parse(hit);
  var list = [];
  try { list = fn() || []; } catch (e) { list = []; }
  if (!list.length) return [fallback];
  try { cache.put(k, JSON.stringify(list), 21600); } catch (e) {}
  return list;
}

/* усі картинки з папки Диска (за назвою файлу) */
function driveFolder_(id) {
  var files = DriveApp.getFolderById(id).getFiles(), list = [];
  while (files.hasNext() && list.length < 30) {
    var f = files.next();
    if (/^image\//.test(f.getMimeType())) list.push({ name: f.getName(), id: f.getId() });
  }
  list.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
  return list.map(function (f) { return "https://drive.google.com/thumbnail?id=" + f.id + "&sz=w1600"; });
}

/* фото з публічного альбому Google Фото: беремо їх зі сторінки альбому.
   офіційного способу Google не дає, тож якщо колись зламається - на сайті буде кнопка на альбом */
function photosAlbum_(url) {
  var html = UrlFetchApp.fetch(url, { followRedirects: true, muteHttpExceptions: true }).getContentText();
  var seen = {}, list = [], re = /"(https:\/\/lh3\.googleusercontent\.com\/pw\/[\w-]{40,})"/g, m;
  while ((m = re.exec(html)) && list.length < 30) {
    if (!seen[m[1]]) { seen[m[1]] = 1; list.push(m[1] + "=w1600"); }
  }
  return list;
}

/* щоб дати скрипту доступ до Диска й інтернету: вибрати цю функцію зверху і натиснути "Виконати" */
function authorize() {
  DriveApp.getRootFolder();
  UrlFetchApp.fetch("https://www.google.com", { muteHttpExceptions: true });
  CacheService.getScriptCache().put("ok", "1", 60);
}
