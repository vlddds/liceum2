/* меню їдальні, дані в menu.js */
(function () {
  "use strict";

  var M = window.MENU, L = window.L2;
  if (!M || !L) { if (window.console) console.error("Не завантажено js/common.js або js/menu.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart, reduce = L.reduce, plural = L.plural;

  var DAYS = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця"];
  var SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт"];
  var MONTHS_G = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var KEY = "l2age";

  var now = new Date(); now.setHours(0, 0, 0, 0);
  var wd = (now.getDay() + 6) % 7;            /* 0 - понеділок, 6 - неділя */
  var weekend = wd > 4;
  var day = weekend ? 0 : wd;
  var age = 0; try { age = +localStorage.getItem(KEY) || 0; } catch (e) {}
  if (!M.ages[age]) age = 0;

  /* який зараз тиждень циклу (у вихідні показуємо наступний) */
  function weekIndex() {
    if (M.weeks.length < 2 || !M.cycleStart) return 0;
    var p = M.cycleStart.split("-"), start = new Date(+p[0], +p[1] - 1, +p[2]);
    var monday = new Date(now); monday.setDate(now.getDate() - wd + (weekend ? 7 : 0));
    var diff = Math.round((monday - start) / (7 * 864e5));
    return ((diff % M.weeks.length) + M.weeks.length) % M.weeks.length;
  }
  var W = M.weeks[weekIndex()];

  /* іконка під страву по назві */
  var KIND = [
    [/салат/i, "leaf", "Салат"],
    [/компот|узвар|какао|сік|чай|кисіль|молоко/i, "utensils", "Напій"],
    [/свіж|йогурт/i, "heart", "Фрукти, десерт"],
    [/хліб|масло/i, "book", "Хліб"],
    [/рис|пюре|булгур|каша|кускус|макарон|гречк|картопл/i, "star", "Гарнір"],
    [/./, "award", "Основна страва"]
  ];
  function kind(name) { for (var i = 0; i < KIND.length; i++) if (KIND[i][0].test(name)) return KIND[i]; }
  function grams(v) { return String(v).split("/").reduce(function (a, x) { return a + (parseFloat(x) || 0); }, 0); }

  function dateOf(i) {
    var d = new Date(now); d.setDate(now.getDate() - wd + i + (weekend ? 7 : 0));
    return d.getDate() + " " + MONTHS_G[d.getMonth()];
  }

  /* 1. сторінка */
  $("#main").innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1"><div class="hero-bg" aria-hidden="true"><span class="num">' + (day + 1) + "</span></div>" +
    '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span><a href="services.html">Сервіси та служби</a><span aria-hidden="true">/</span><span aria-current="page">Меню їдальні</span></nav>' +
    '<h1 id="h1">Меню їдальні</h1><p class="hero-sub">' + esc(W.season || "Меню на тиждень") + " · " + esc(W.title) + ". Оберіть день і вікову групу — покажемо страви та вихід порцій.</p></div></section>" +
    '<section class="sec alt sp-sec" aria-label="Меню"><div class="wrap">' +
      '<div class="sch-now mn-now" id="mn-now"></div>' +
      '<div class="mn-bar">' +
        '<div class="rules-tabs" id="mn-days" role="tablist" aria-label="День тижня"></div>' +
        '<div class="mn-age" role="group" aria-label="Вікова група">' + M.ages.map(function (a, i) {
          return '<button type="button" class="chip" data-a="' + i + '" aria-pressed="' + (i === age ? "true" : "false") + '">' + esc(a) + "</button>";
        }).join("") + "</div>" +
      "</div>" +
      '<div class="mn-grid"><div class="mn-card" id="mn-card"></div>' +
        '<aside class="sch-side mn-side"><h2>Меню на тиждень</h2><ol class="mn-week" id="mn-week"></ol>' +
        '<a class="btn mn-print" href="#" id="mn-print">' + ICON("doc") + "Друкувати меню</a>" +
        '<a class="more" href="services.html#food">Норми харчування та технологічні карти</a></aside>' +
      "</div></div></section>";

  $("#mn-days").innerHTML = DAYS.map(function (d, i) {
    return '<button type="button" class="chip" role="tab" data-d="' + i + '" aria-pressed="false">' + d + (!weekend && i === wd ? " · сьогодні" : "") + "</button>";
  }).join("");

  /* 2. вміст */
  function renderNow() {
    var list = W.days[weekend ? 0 : wd] || [];
    var main = list.filter(function (x) { return kind(x[0])[2] === "Основна страва"; })[0] || list[0];
    $("#mn-now").innerHTML = weekend
      ? ICON("star") + "<div><b>Сьогодні вихідний</b><small>У понеділок, " + dateOf(0) + ": " + esc(main ? main[0] : "меню ще не додано") + "</small></div>"
      : ICON("utensils") + "<div><b>Сьогодні в їдальні: " + esc(main ? main[0] : "меню ще не додано") + "</b><small>" + DAYS[wd] + ", " + dateOf(wd) + " · " + list.length + " " + plural(list.length, "страва", "страви", "страв") + "</small></div>";
  }
  function render(animate) {
    $$("#mn-days .chip").forEach(function (c, i) { c.setAttribute("aria-pressed", i === day ? "true" : "false"); });
    var list = W.days[day] || [], total = 0;
    var rows = list.map(function (x, i) {
      var k = kind(x[0]), g = x[1 + age] || x[1];
      total += grams(g);
      return '<li style="--i:' + i + '"><span class="ico">' + ICON(k[1]) + '</span><span class="mn-name"><b>' + esc(x[0]) + "</b><small>" + k[2] + '</small></span><span class="mn-g">' + esc(g) + " г</span></li>";
    }).join("");
    $("#mn-card").innerHTML =
      '<div class="mn-head"><h2>' + DAYS[day] + "</h2><span>" + dateOf(day) + (day === wd && !weekend ? " · сьогодні" : "") + "</span></div>" +
      (list.length ? '<ul class="mn-list">' + rows + "</ul>" +
        '<p class="mn-total"><span>Загальний вихід для ' + esc(M.ages[age]) + "</span><b>≈ " + Math.round(total) + " г</b></p>"
        : '<p class="empty-note">Меню на цей день ще не додано.</p>');
    if (animate && !reduce) restart($("#mn-card"), "swap");
    $$("#mn-week li").forEach(function (li, i) { li.classList.toggle("cur", i === day); });
  }
  function renderWeek() {
    $("#mn-week").innerHTML = DAYS.map(function (d, i) {
      var list = W.days[i] || [], main = list.filter(function (x) { return kind(x[0])[2] === "Основна страва"; })[0];
      return '<li data-d="' + i + '"' + (!weekend && i === wd ? ' class="today"' : "") + '><span>' + SHORT[i] + "</span><b>" + esc(main ? main[0] : list[0] ? list[0][0] : "—") + "</b></li>";
    }).join("");
  }

  $("#mn-days").addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (c) { day = +c.getAttribute("data-d"); render(true); } });
  $("#mn-week").addEventListener("click", function (e) { var li = e.target.closest("li"); if (li) { day = +li.getAttribute("data-d"); render(true); } });
  $(".mn-age").addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c) return;
    age = +c.getAttribute("data-a");
    try { localStorage.setItem(KEY, age); } catch (er) {}
    $$(".mn-age .chip").forEach(function (b) { b.setAttribute("aria-pressed", b === c ? "true" : "false"); });
    render(true);
  });
  $("#mn-print").addEventListener("click", function (e) { e.preventDefault(); document.body.classList.add("mn-printing"); window.print(); });
  window.addEventListener("afterprint", function () { document.body.classList.remove("mn-printing"); });

  /* табличка на весь тиждень, тільки для друку */
  var pt = document.createElement("div");
  pt.className = "mn-printable";
  pt.innerHTML = "<h2>" + esc(W.season || "Меню") + " · " + esc(W.title) + "</h2>" + DAYS.map(function (d, i) {
    return "<h3>" + d + '</h3><table><thead><tr><th>Страва</th><th>' + M.ages.map(esc).join("</th><th>") + "</th></tr></thead><tbody>" +
      (W.days[i] || []).map(function (x) { return "<tr><td>" + esc(x[0]) + "</td><td>" + esc(x[1]) + "</td><td>" + esc(x[2]) + "</td></tr>"; }).join("") + "</tbody></table>";
  }).join("");
  $("#main").appendChild(pt);

  renderWeek(); renderNow(); render(false);
})();
