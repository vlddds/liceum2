/* календар подій, дані в calendar.js */
(function () {
  "use strict";

  var C = window.CALENDAR, L = window.L2;
  if (!C || !L) { if (window.console) console.error("Не завантажено js/common.js або js/calendar.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart, reduce = L.reduce, plural = L.plural;

  var MONTHS = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
  var MONTHS_G = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var WD = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function key(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function human(d) { return d.getDate() + " " + MONTHS_G[d.getMonth()] + " " + d.getFullYear(); }

  var events = C.events.map(function (e) {
    var s = parse(e.date), en = e.end ? parse(e.end) : s;
    return { start: s, end: en, title: e.title, type: e.type || "school", url: e.url || "" };
  }).sort(function (a, b) { return a.start - b.start; });

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var shown = {}; Object.keys(C.types).forEach(function (t) { shown[t] = true; });
  var view = new Date(today.getFullYear(), today.getMonth(), 1);

  /* розкидаємо події по днях */
  var byDay = {};
  events.forEach(function (e) {
    for (var d = new Date(e.start); d <= e.end; d.setDate(d.getDate() + 1)) {
      (byDay[key(d)] = byDay[key(d)] || []).push(e);
    }
  });

  /* шапка */
  $("#main").innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1"><div class="hero-bg" aria-hidden="true"><span class="num">' + today.getDate() + "</span></div>" +
    '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span><span aria-current="page">Календар подій</span></nav>' +
    '<h1 id="h1">Календар подій</h1><p class="hero-sub">Канікули, свята, пам\'ятні дні та важливі події ліцею. Сьогодні ' + human(today) + ".</p></div></section>" +
    '<section class="sec alt sp-sec" aria-label="Календар"><div class="wrap cal-layout">' +
      '<div class="cal-box">' +
        '<div class="cal-head"><button class="gal-btn prev" id="cal-prev" type="button" aria-label="Попередній місяць">' + ICON("chev") + '</button>' +
        '<h2 id="cal-title" aria-live="polite"></h2>' +
        '<button class="gal-btn" id="cal-next" type="button" aria-label="Наступний місяць">' + ICON("chev") + "</button></div>" +
        '<button class="chip cal-today" id="cal-today" type="button">Сьогодні</button>' +
        '<div class="cal-grid" id="cal-grid" role="grid"></div>' +
        '<div class="club-filters cal-legend" id="cal-legend" role="group" aria-label="Типи подій"></div>' +
      "</div>" +
      '<aside class="cal-side"><h2>Найближчі події</h2><ul class="cal-list" id="cal-next-list"></ul>' +
        '<h2 id="cal-day-h" hidden></h2><ul class="cal-list" id="cal-day-list" hidden></ul></aside>' +
    "</div></section>";

  $("#cal-legend").innerHTML = Object.keys(C.types).map(function (t) {
    return '<button type="button" class="chip" aria-pressed="true" data-t="' + t + '"><i class="cal-dot" style="background:' + C.types[t].color + '"></i>' + esc(C.types[t].label) + "</button>";
  }).join("");

  function item(e) {
    var when = e.end > e.start ? human(e.start) + " – " + human(e.end) : human(e.start);
    var inner = '<i class="cal-dot" style="background:' + C.types[e.type].color + '"></i><span><b>' + esc(e.title) + "</b><small>" + when + "</small></span>";
    return "<li>" + (e.url ? '<a href="' + esc(e.url) + '">' + inner + "</a>" : "<div>" + inner + "</div>") + "</li>";
  }

  /* сітка місяця */
  function render(animate) {
    var y = view.getFullYear(), m = view.getMonth();
    $("#cal-title").textContent = MONTHS[m] + " " + y;
    var first = new Date(y, m, 1), shift = (first.getDay() + 6) % 7;
    var html = WD.map(function (w, i) { return '<div class="cal-wd' + (i > 4 ? " we" : "") + '" role="columnheader">' + w + "</div>"; }).join("");
    for (var i = 0; i < 42; i++) {
      var d = new Date(y, m, 1 - shift + i), k = key(d);
      var evs = (byDay[k] || []).filter(function (e) { return shown[e.type]; });
      var cls = "cal-d" + (d.getMonth() !== m ? " out" : "") + (+d === +today ? " today" : "") + ((i % 7) > 4 ? " we" : "") +
        (evs.some(function (e) { return e.type === "vacation"; }) ? " vac" : "") + (evs.length ? " has" : "");
      html += '<button type="button" class="' + cls + '" data-k="' + k + '" role="gridcell" aria-label="' + human(d) + (evs.length ? ": " + evs.map(function (e) { return e.title; }).join(", ") : "") + '">' +
        "<span>" + d.getDate() + "</span>" +
        (evs.length ? '<span class="cal-dots">' + evs.slice(0, 3).map(function (e) { return '<i class="cal-dot" style="background:' + C.types[e.type].color + '"></i>'; }).join("") + "</span>" : "") +
        (evs.length ? '<span class="cal-t">' + esc(evs[0].title) + "</span>" : "") + "</button>";
    }
    $("#cal-grid").innerHTML = html;
    if (animate && !reduce) restart($("#cal-grid"), "swap");
  }
  function upcoming() {
    var list = events.filter(function (e) { return shown[e.type] && e.end >= today; }).slice(0, 8);
    $("#cal-next-list").innerHTML = list.length ? list.map(item).join("") : '<li class="empty-note">Найближчих подій поки немає.</li>';
  }
  function showDay(k) {
    var evs = (byDay[k] || []).filter(function (e) { return shown[e.type]; });
    var h = $("#cal-day-h"), ul = $("#cal-day-list");
    h.hidden = ul.hidden = false;
    h.textContent = human(parse(k));
    ul.innerHTML = evs.length ? evs.map(item).join("") : '<li class="empty-note">Подій цього дня немає.</li>';
    $$(".cal-d.sel").forEach(function (b) { b.classList.remove("sel"); });
    var b = $('.cal-d[data-k="' + k + '"]'); if (b) b.classList.add("sel");
  }

  $("#cal-prev").addEventListener("click", function () { view.setMonth(view.getMonth() - 1); render(true); });
  $("#cal-next").addEventListener("click", function () { view.setMonth(view.getMonth() + 1); render(true); });
  $("#cal-today").addEventListener("click", function () { view = new Date(today.getFullYear(), today.getMonth(), 1); render(true); showDay(key(today)); });
  $("#cal-grid").addEventListener("click", function (e) { var b = e.target.closest(".cal-d"); if (b) showDay(b.getAttribute("data-k")); });
  $("#cal-legend").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    var t = b.getAttribute("data-t"); shown[t] = !shown[t];
    b.setAttribute("aria-pressed", shown[t] ? "true" : "false");
    render(false); upcoming();
  });

  render(false); upcoming();
})();
