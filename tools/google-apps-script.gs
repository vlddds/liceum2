/* Гугл-таблиця для форм сайту: "Швидке повідомлення" і "Відгуки".

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

   Якщо міняли цей код: Розгорнути -> Керувати розгортаннями -> Редагувати -> Нова версія. */

var NOTIFY_EMAIL = "pidgorodne.lyceum2@gmail.com";   // куди слати листи про нові звернення ("" - не слати)
var REVIEWS = "Відгуки", MESSAGES = "Звернення";

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

/* віддаємо схвалені відгуки: .../exec?action=reviews */
function doGet(e) {
  if (!e || !e.parameter || e.parameter.action !== "reviews") return json_({ ok: true });
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REVIEWS);
  if (!sh || sh.getLastRow() < 2) return json_([]);
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues();
  var months = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];
  var out = rows.filter(function (r) { return r[5] === true; }).reverse().map(function (r) {
    var dt = r[0] instanceof Date ? r[0] : null;
    return { name: String(r[1]), who: String(r[2]), rating: Number(r[3]) || "", text: String(r[4]),
             date: dt ? months[dt.getMonth()] + " " + dt.getFullYear() : "" };
  });
  return json_(out);
}
