/* Сторінка «Бланки та заяви» (forms.html). Дані - data/documents.js.
   Документи групуються, вгорі пошук за назвою. Розмір файлу питаємо в сервера (HEAD-запит):
   файлу нема - кнопка неактивна «Скоро». Якщо сторінку відкрито просто з диска, перевірити не вийде -
   тоді кнопка звичайна, без розміру. */
(function () {
  "use strict";

  var L = window.L2, list = window.DOCUMENTS;
  if (!L || !Array.isArray(list)) { if (window.console) console.error("Не завантажено js/common.js або data/documents.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, plural = L.plural;
  var GROUPS = ["Для батьків", "Для учнів", "Вступ і переведення"];
  var MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];

  function type(f) { var m = /\.([a-z0-9]+)$/i.exec(f || ""); return m ? m[1].toUpperCase() : "ФАЙЛ"; }
  function date(s) {
    var p = String(s || "").split("-");
    return p.length === 3 ? +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0] : "";
  }
  function size(b) {
    if (b < 1024) return b + " Б";
    if (b < 1048576) return Math.round(b / 1024) + " КБ";
    return (b / 1048576).toFixed(1).replace(".", ",") + " МБ";
  }

  /* групи в заданому порядку, а якщо хтось вписав іншу - вона піде в кінець */
  var groups = GROUPS.slice();
  list.forEach(function (d) { if (d.group && groups.indexOf(d.group) < 0) groups.push(d.group); });

  function row(d, i) {
    var t = type(d.file), upd = date(d.updated);
    return '<li class="fm-row" data-k="' + i + '">' +
      '<span class="fm-type fm-' + esc(t.toLowerCase()) + '" aria-hidden="true">' + ICON("doc") + "<b>" + esc(t) + "</b></span>" +
      '<div class="fm-txt"><h3>' + esc(d.title) + "</h3>" +
        (d.description ? "<p>" + esc(d.description) + "</p>" : "") +
        '<p class="fm-meta"><span class="sr">Формат: </span>' + esc(t) + '<span class="fm-size"></span>' + (upd ? " · оновлено " + esc(upd) : "") + "</p></div>" +
      '<span class="fm-act"><button class="btn" type="button" disabled>Скоро</button></span></li>';
  }

  var main = $("#main");
  main.innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1">' +
      '<div class="hero-bg" aria-hidden="true"><span class="num"></span></div>' +
      '<div class="wrap hero-in">' +
        '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
          '<a href="index.html#paths">Учням і батькам</a><span aria-hidden="true">/</span><span aria-current="page">Бланки та заяви</span></nav>' +
        '<h1 id="h1">Бланки та заяви</h1>' +
        '<p class="hero-sub">Зразки заяв і бланків, які найчастіше потрібні батькам і учням. Завантажте, заповніть і передайте класному керівнику або в канцелярію.</p>' +
      "</div></section>" +
    '<div class="sec fm-sec"><div class="wrap fm">' +
      '<div class="fm-find t-find">' + ICON("search") +
        '<label class="sr" for="fm-q">Пошук бланка за назвою</label>' +
        '<input id="fm-q" type="search" placeholder="Знайти бланк за назвою" autocomplete="off"></div>' +
      groups.map(function (g) {
        var items = list.map(function (d, i) { return d.group === g ? row(d, i) : ""; }).join("");
        if (!items) return "";
        var id = "g-" + groups.indexOf(g);
        return '<section class="fm-grp" aria-labelledby="' + id + '"><h2 id="' + id + '">' + esc(g) + '</h2><ul class="fm-list">' + items + "</ul></section>";
      }).join("") +
      '<p class="empty-note" id="fm-none" hidden>Нічого не знайдено. Спробуйте інше слово або <a href="index.html#contacts">напишіть нам</a>.</p>' +
      '<p class="fm-count" id="fm-count" aria-live="polite"></p>' +
    "</div></div>";

  /* кнопка: файл є - посилання на завантаження, нема - «Скоро» */
  function ready(li, d, bytes) {
    var a = document.createElement("a");
    a.className = "btn primary";
    a.href = d.file;
    a.setAttribute("download", "");
    a.innerHTML = "Завантажити" + '<span class="sr"> ' + esc(d.title) + "</span>";
    $(".fm-act", li).replaceChildren(a);
    if (bytes) $(".fm-size", li).textContent = " · " + size(bytes);
  }
  $$(".fm-row", main).forEach(function (li) {
    var d = list[+li.getAttribute("data-k")];
    if (!d.file) return;
    if (location.protocol === "file:" || !window.fetch) { ready(li, d, 0); return; }
    fetch(d.file, { method: "HEAD", cache: "no-cache" }).then(function (r) {
      if (r.ok) ready(li, d, +r.headers.get("Content-Length") || 0);
    }).catch(function () {});
  });

  /* пошук за назвою (і за описом), порожні групи ховаються */
  var q = $("#fm-q");
  function norm(s) { return String(s || "").toLowerCase().replace(/[’ʼ`]/g, "'").replace(/[\[\]]/g, ""); }
  q.addEventListener("input", function () {
    var t = norm(q.value.trim()).split(/\s+/).filter(Boolean), shown = 0;
    $$(".fm-row", main).forEach(function (li) {
      var d = list[+li.getAttribute("data-k")], hay = norm(d.title + " " + (d.description || ""));
      var ok = t.every(function (w) { return hay.indexOf(w) > -1; });
      li.hidden = !ok; if (ok) shown++;
    });
    $$(".fm-grp", main).forEach(function (g) { g.hidden = !$(".fm-row:not([hidden])", g); });
    $("#fm-none").hidden = shown > 0;
    $("#fm-count").textContent = t.length ? "Знайдено: " + shown + " " + plural(shown, "бланк", "бланки", "бланків") : "";
  });

  /* поява при прокрутці */
  var reveal = $$(".fm-grp", main);
  reveal.forEach(function (el) { el.setAttribute("data-reveal", ""); });
  if ("IntersectionObserver" in window && !L.reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { threshold: 0.05 });
    reveal.forEach(function (el) { ro.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }
})();
