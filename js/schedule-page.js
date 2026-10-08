/* розклад уроків, дані в schedule.js */
(function () {
  "use strict";

  var S = window.SCHEDULE, L = window.L2;
  if (!S || !L) { if (window.console) console.error("Не завантажено js/common.js або js/schedule.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart, reduce = L.reduce, plural = L.plural;

  var DAYS = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця"];
  var KEY = "l2class";
  function mins(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  var names = Object.keys(S.classes);
  var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  var cls = saved && S.classes[saved] ? saved : null;
  var wd = (new Date().getDay() + 6) % 7; /* 0 - понеділок */
  var day = wd < 5 ? wd : 0;

  function bellsFor(c) { return c && /^1-/.test(c) && S.bellsFirst ? S.bellsFirst : S.bells; }

  /* 1. сторінка */
  var grades = {};
  names.forEach(function (n) { var g = n.split("-")[0]; (grades[g] = grades[g] || []).push(n); });

  $("#main").innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1"><div class="hero-bg" aria-hidden="true"><span class="num">8:30</span></div>' +
    '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span><a href="education.html">Освітній процес</a><span aria-hidden="true">/</span><span aria-current="page">Розклад уроків</span></nav>' +
    '<h1 id="h1">Розклад уроків</h1><p class="hero-sub">Оберіть свій клас, щоб побачити уроки на сьогодні й на тиждень. Нагорі — що зараз: урок чи перерва.</p></div></section>' +
    '<section class="sec alt sp-sec" aria-label="Розклад"><div class="wrap">' +
      '<div class="sch-now" id="sch-now" aria-live="polite"></div>' +
      '<div class="sch-layout">' +
        '<div class="sch-main">' +
          '<div class="sch-pick"><label for="sch-class">Мій клас</label><select id="sch-class"><option value="">Оберіть клас…</option>' +
            Object.keys(grades).map(function (g) {
              return '<optgroup label="' + g + ' клас">' + grades[g].map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "</option>"; }).join("") + "</optgroup>";
            }).join("") + "</select></div>" +
          '<div class="rules-tabs" id="sch-days" role="tablist" aria-label="День тижня"></div>' +
          '<div id="sch-body"></div>' +
        "</div>" +
        '<aside class="sch-side"><h2>Розклад дзвінків</h2><ol class="sch-bells" id="sch-bells"></ol>' +
          (S.sample ? '<p class="b-note warn">' + ICON("alert") + "<span>Час дзвінків — зразок. Точний розклад дзвінків — у PDF нижче.</span></p>" : "") +
          '<h2>Файли розкладів</h2><ul class="doc-list sch-docs">' + S.docs.map(function (d) {
            return '<li><a class="doc-link" href="' + esc(d.url) + '">' + ICON("doc") + "<span>" + esc(d.title) + '</span><em class="doc-ext">Drive</em>' + ICON("chev") + "</a></li>";
          }).join("") + "</ul></aside>" +
      "</div></div></section>";

  $("#sch-days").innerHTML = DAYS.map(function (d, i) {
    return '<button type="button" class="chip" role="tab" data-d="' + i + '" aria-pressed="false">' + d + (i === wd ? " · сьогодні" : "") + "</button>";
  }).join("");

  /* що зараз: урок чи перерва */
  function status() {
    var now = new Date(), m = now.getHours() * 60 + now.getMinutes(), b = bellsFor(cls), box = $("#sch-now");
    var html;
    if (wd > 4) html = ICON("star") + "<div><b>Сьогодні вихідний</b><small>Гарного відпочинку! Уроки — з понеділка.</small></div>";
    else if (m < mins(b[0][0])) html = ICON("clock") + "<div><b>Уроки ще не почалися</b><small>Перший урок о " + b[0][0] + " (через " + (mins(b[0][0]) - m) + " хв)</small></div>";
    else if (m >= mins(b[b.length - 1][1])) html = ICON("check") + "<div><b>Уроки на сьогодні завершилися</b><small>Останній дзвінок був о " + b[b.length - 1][1] + "</small></div>";
    else {
      for (var i = 0; i < b.length; i++) {
        var s = mins(b[i][0]), e = mins(b[i][1]);
        if (m >= s && m < e) {
          var raw = cls && S.classes[cls].days[wd] ? S.classes[cls].days[wd][i] : "", lesson = Array.isArray(raw) ? raw[0] : raw;
          html = '<span class="sch-num">' + (i + 1) + "</span><div><b>Зараз " + (i + 1) + "-й урок" + (lesson ? ": " + esc(lesson) : "") + "</b><small>" +
            b[i][0] + "–" + b[i][1] + " · до кінця " + (e - m) + " " + plural(e - m, "хвилина", "хвилини", "хвилин") + "</small></div>" +
            '<span class="sch-bar"><i style="width:' + Math.round((m - s) / (e - s) * 100) + '%"></i></span>';
          break;
        }
        if (i + 1 < b.length && m >= e && m < mins(b[i + 1][0])) {
          var left = mins(b[i + 1][0]) - m;
          html = ICON("clock") + "<div><b>Перерва</b><small>Наступний, " + (i + 2) + "-й урок о " + b[i + 1][0] + " (через " + left + " хв)</small></div>";
          break;
        }
      }
    }
    box.innerHTML = html || "";
    $$("#sch-bells li").forEach(function (li, i) {
      li.classList.toggle("now", wd < 5 && m >= mins(b[i][0]) && m < mins(b[i][1]));
    });
  }

  /* розклад класу */
  function renderBells() {
    var b = bellsFor(cls);
    $("#sch-bells").innerHTML = b.map(function (x, i) { return "<li><span>" + (i + 1) + " урок</span><b>" + x[0] + "–" + x[1] + "</b></li>"; }).join("");
  }
  /* клас вважаємо заповненим, якщо є хоч один предмет (порожні заготовки не рахуються) */
  function filled(c) {
    return S.classes[c].days.some(function (d) { return d.some(function (l) { return Array.isArray(l) ? l[0] : l; }); });
  }
  function render(animate) {
    $$("#sch-days .chip").forEach(function (c, i) { c.setAttribute("aria-pressed", i === day ? "true" : "false"); });
    var body = $("#sch-body"), b = bellsFor(cls);
    if (!cls) body.innerHTML = '<p class="empty-note">Оберіть клас у списку вище.</p>';
    else if (!filled(cls)) body.innerHTML = '<p class="empty-note">Розклад ' + esc(cls) + " класу ще не додано на сайт. Подивіться файл розкладу праворуч.</p>";
    else {
      var lessons = S.classes[cls].days[day] || [];
      var most = Math.max.apply(null, S.classes[cls].days.map(function (d) { return d.length; }));
      body.innerHTML = '<ol class="rule-list sch-list">' + b.slice(0, most || b.length).map(function (x, i) {
        var raw = lessons[i], l = Array.isArray(raw) ? raw[0] : raw, room = Array.isArray(raw) && raw[1] ? raw[1] : "";
        return "<li" + (l ? "" : ' class="free"') + '><p><b>' + esc(l || "—") + "</b><small>" +
          (room ? '<span class="sch-room">каб. ' + esc(room) + "</span> · " : "") + x[0] + "–" + x[1] + "</small></p></li>";
      }).join("") + "</ol>";
    }
    if (animate && !reduce) restart(body, "swap");
  }

  var sel = $("#sch-class");
  if (cls) sel.value = cls;
  sel.addEventListener("change", function () {
    cls = sel.value || null;
    try { if (cls) localStorage.setItem(KEY, cls); else localStorage.removeItem(KEY); } catch (e) {}
    renderBells(); render(true); status();
  });
  $("#sch-days").addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c) return;
    day = +c.getAttribute("data-d"); render(true);
  });

  renderBells(); render(false); status();
  setInterval(status, 30000);
})();
