/* ==========================================================================
   Google-таблиця для форм сайту Ліцею №2: «Швидке повідомлення» та «Відгуки».

   ЯК ПІДКЛЮЧИТИ (один раз, ~5 хвилин):
   1. Створіть нову Google-таблицю (sheets.new) від акаунта ліцею.
   2. Меню «Розширення» → «Apps Script». Видаліть усе в редакторі й вставте цей файл повністю.
   3. Натисніть «Зберегти», потім «Розгорнути» → «Нове розгортання» → тип «Вебзастосунок».
        Виконувати як: «Я»;  Хто має доступ: «Усі».
      Дозвольте доступ до таблиці й пошти, коли Google попросить.
   4. Скопіюйте «URL вебзастосунку» (закінчується на /exec) і вставте його в js/data.js:
        formEndpoint:   "https://script.google.com/macros/s/…/exec",
        reviewEndpoint: "https://script.google.com/macros/s/…/exec",
   5. Готово. У таблиці з'являться аркуші «Звернення» і «Відгуки».

   МОДЕРАЦІЯ ВІДГУКІВ: на аркуші «Відгуки» поставте галочку в стовпці «Схвалено» —
   відгук з'явиться на сайті (оновлення протягом кількох хвилин). Зняли галочку — зник.

   Після змін у цьому коді: «Розгорнути» → «Керувати розгортаннями» → «Редагувати» → «Нова версія».
   ========================================================================== */

var NOTIFY_EMAIL = "pidgorodne.lyceum2@gmail.com";   // куди надсилати сповіщення про нові звернення ("" — не надсилати)
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

/* Прийом форм із сайту */
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

/* Видача схвалених відгуків для сайту: …/exec?action=reviews */
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
