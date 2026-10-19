/* сторінка "Перехід на профільне навчання", дані в profile.js.
   діаграми свої (svg + css), "виростають" коли до них докрутили */
(function () {
  "use strict";

  var P = window.PROFILE, L = window.L2;
  if (!P || !L) { if (window.console) console.error("Не завантажено js/common.js або js/profile.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, reduce = L.reduce;
  var COLORS = ["var(--pr-c1)", "var(--pr-c2)", "var(--pr-c3)", "var(--pr-c4)", "var(--pr-c5)", "var(--pr-c6)", "var(--pr-c7)"];

  /* діаграми */
  function donut(ch) {
    var total = ch.items.reduce(function (a, x) { return a + x[1]; }, 0), at = 0;
    var arcs = ch.items.map(function (x, i) {
      var part = x[1] / total * 100, seg = '<circle class="pr-arc" cx="21" cy="21" r="15.9155" style="--len:' + part.toFixed(2) +
        ";--off:" + (25 - at).toFixed(2) + ";--d:" + (i * 0.12).toFixed(2) + "s;stroke:" + COLORS[i % COLORS.length] + '"/>';
      at += part; return seg;
    }).join("");
    return '<figure class="pr-chart pr-donut"><figcaption>' + esc(ch.title) + (ch.note ? " <small>* " + esc(ch.note) + "</small>" : "") + "</figcaption>" +
      '<div class="pr-donut-in"><svg viewBox="0 0 42 42" role="img" aria-label="' + esc(ch.title + ": " + ch.items.map(function (x) { return x[0] + " " + x[1] + "%"; }).join(", ")) + '">' +
      '<circle class="pr-ring" cx="21" cy="21" r="15.9155"/>' + arcs + "</svg>" +
      '<ul class="pr-legend">' + ch.items.map(function (x, i) {
        return '<li><i style="background:' + COLORS[i % COLORS.length] + '"></i>' + esc(x[0]) + "<b>" + x[1] + "%</b></li>";
      }).join("") + "</ul></div></figure>";
  }
  function bars(ch) {
    var max = ch.max || Math.max.apply(null, ch.items.map(function (x) { return x[1]; })), unit = ch.unit || "%";
    return '<figure class="pr-chart pr-bars"><figcaption>' + esc(ch.title) + "</figcaption><ul>" + ch.items.map(function (x, i) {
      return '<li><span class="pr-bl">' + esc(x[0]) + '</span><span class="pr-bt"><i style="--w:' + (x[1] / max * 100).toFixed(1) +
        "%;--d:" + (i * 0.08).toFixed(2) + "s;background:" + COLORS[i % COLORS.length] + '"></i></span><b>' +
        String(x[1]).replace(".", ",") + unit + "</b></li>";
    }).join("") + "</ul></figure>";
  }
  function chart(ch) { return ch.type === "donut" ? donut(ch) : bars(ch); }
  function photos(list, cls) {
    return '<ul class="pr-gal ' + (cls || "") + '">' + list.map(function (p, i) {
      return '<li><button type="button" class="gal-item" data-gal="' + esc(cls || "") + '" data-i="' + i + '">' + L.photoHTML(p, i, true) +
        "</button><span>" + esc(p.caption) + "</span></li>";
    }).join("") + "</ul>";
  }
  function count(n, suffix) { return '<b class="pr-num" data-n="' + n + '" data-s="' + esc(suffix || "") + '">' + n.toLocaleString("uk-UA") + esc(suffix || "") + "</b>"; }
  function sec(id, kicker, title, body, alt) {
    return '<section class="sec' + (alt ? " alt" : "") + ' pr-sec" id="' + id + '" aria-labelledby="h-' + id + '"><div class="wrap">' +
      '<p class="pr-kicker">' + esc(kicker) + '</p><h2 id="h-' + id + '">' + esc(title) + "</h2>" + body + "</div></section>";
  }
  function src(t) { return t ? '<p class="pr-src">Джерело: ' + esc(t) + "</p>" : ""; }

  /* блок "Три кластери": банер з повним тестом, картки з кнопкою тесту, факти. дані - clusters.js.
     якщо блок знадобиться ще на якійсь сторінці - винести цю функцію в окремий файл */
  function clustersBlock() {
    var C = window.CLUSTERS;
    if (!C) return "";
    return '<div class="pr-banner"><div><b>Не знаєш, який кластер обрати?</b><span>Тест на 10 хвилин підкаже кластер і профіль</span></div>' +
      '<div class="pr-banner-act"><a class="btn primary" href="profile-test.html">Пройти повний тест' + ICON("chev") + "</a>" +
      '<a class="pr-banner-link" href="proforientation.html">Спершу дізнатися свої інтереси (тест Голланда)</a></div></div>' +
      '<div class="pr-grid3 pr-clusters">' + C.clusters.map(function (c) {
        return '<div class="pr-card pr-prof"><span class="ico">' + ICON(c.icon) + "</span><h3>" + esc(c.name) + '</h3><ul class="pr-check">' +
          c.profiles.map(function (id) { return "<li>" + ICON("check") + "<span>" + esc(C.profiles[id].name) + "</span></li>"; }).join("") +
          '</ul><p class="pr-deep"><b>Поглиблено:</b> ' + esc(c.deep) + "</p>" +
          '<a class="btn pr-prof-btn" href="profile-test.html?cluster=' + c.id + '" aria-label="Пройти тест кластера ' + esc(c.name) + '">Пройти тест' + ICON("chev") + "</a></div>";
      }).join("") + "</div>" +
      '<ul class="pr-facts">' + C.facts.map(function (x) { return "<li><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul>" +
      '<p class="pr-note">' + esc(C.note) + "</p>";
  }

  var JUMP = [["meetings", "Засідання"], ["test", "Тест на професію"], ["reform", "Реформа"], ["numbers", "Ліцей у цифрах"],
    ["roadmap", "Дорожня карта"], ["survey", "Голос родин"], ["market", "Ринок праці"], ["profiles", "Профілі"],
    ["base", "Матеріальна база"], ["challenges", "Виклики"], ["swot", "SWOT"]];

  $("#main").innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1"><div class="hero-bg" aria-hidden="true"><span class="num">2027</span></div>' +
    '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
    '<a href="education.html">Освітній процес</a><span aria-hidden="true">/</span><span aria-current="page">Перехід на профільне навчання</span></nav>' +
    '<h1 id="h1">Перехід на профільне навчання</h1><p class="hero-sub">' + esc(P.lead) + "</p>" +
    '<ul class="jump" aria-label="Розділи сторінки">' + JUMP.map(function (j) { return '<li><a href="#' + j[0] + '">' + j[1] + "</a></li>"; }).join("") + "</ul></div></section>" +

    /* засідання */
    sec("meetings", "Робоча група", "Засідання робочої групи",
      '<ol class="pr-meet">' + P.meetings.map(function (m) {
        return '<li class="pr-card"><div class="pr-meet-h"><span class="pr-badge">' + m.n + '</span><div><time>' + esc(m.date) + "</time><h3>" + esc(m.title) + "</h3>" +
          (m.tag ? '<span class="pr-tag">' + esc(m.tag) + "</span>" : "") + "</div></div>" +
          '<ul class="pr-check">' + m.items.map(function (t) { return "<li>" + ICON("check") + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul>" +
          (m.photos && m.photos.length ? photos(m.photos, "meet" + m.n) : "") + "</li>";
      }).join("") + "</ol>" +
      '<div class="pr-grid2"><div class="pr-card"><h3>Хто в групі</h3><ul class="pr-dl">' + P.group.members.map(function (x) { return "<li><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") +
      '</ul></div><div class="pr-card"><h3>Що робить група</h3><ul class="pr-dl">' + P.group.tasks.map(function (x) { return "<li><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul></div></div>") +

    /* тест */
    '<section class="sec pr-sec pr-test-sec" id="test" aria-labelledby="h-test"><div class="wrap"><a class="pr-test" href="' + esc(P.test.url) + '">' +
      '<span class="pr-test-ico">' + ICON("star") + '</span><span class="pr-test-txt"><span class="pr-kicker">Для 9-класників</span><b id="h-test">' + esc(P.test.title) + "</b><span>" + esc(P.test.text) + "</span></span>" +
      '<span class="btn primary">Пройти тест' + ICON("chev") + "</span></a></div></section>" +

    /* реформа */
    sec("reform", "Контекст реформи", "Навіщо змінюватися саме зараз",
      '<div class="pr-grid3">' + P.reform.why.map(function (x) { return '<div class="pr-card"><h3>' + esc(x[0]) + "</h3><p>" + esc(x[1]) + "</p></div>"; }).join("") + "</div>" +
      '<ol class="pr-time">' + P.reform.timeline.map(function (x, i) { return '<li style="--i:' + i + '"><b>' + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ol>", true) +

    /* цифри */
    sec("numbers", "Ліцей сьогодні", "Наш ліцей у цифрах",
      '<ul class="pr-stats">' + P.numbers.stats.map(function (x) { return "<li>" + count(x[0]) + "<span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul>" +
      '<div class="pr-grid2 pr-mid"><div><ul class="pr-check">' + P.numbers.notes.map(function (t) { return "<li>" + ICON("check") + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul>" + src(P.numbers.source) + "</div>" +
      chart(P.numbers.chart) + "</div>") +

    /* дорожня карта */
    sec("roadmap", "План роботи", "Дорожня карта: від аудиту до першого профільного вересня",
      '<ol class="pr-road">' + P.roadmap.map(function (x, i) {
        return '<li style="--i:' + i + '"><span class="pr-step">' + (i + 1) + "</span><time>" + esc(x[0]) + "</time><b>" + esc(x[1]) + "</b><span>" + esc(x[2]) + "</span></li>";
      }).join("") + "</ol><p class=\"pr-note\">" + esc(P.guide) + "</p>", true) +

    /* опитування */
    sec("survey", "Голос родин", "Що обирають дев'ятикласники",
      '<ul class="pr-big">' + P.survey.big.map(function (x) { return "<li>" + count(x[0], x[1]) + "<span>" + esc(x[2]) + "</span></li>"; }).join("") + "</ul>" +
      '<div class="pr-grid2">' + P.survey.charts.map(chart).join("") + "</div>" +
      '<div class="pr-card pr-mt"><h3>Професії, які називають</h3><ul class="pr-chips">' + P.survey.jobs.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
      src(P.survey.source)) +

    /* ринок праці */
    sec("market", "Ринок праці", "Скільки платять і кого шукають",
      '<ul class="pr-stats pr-stats3">' + P.market.stats.map(function (x) { return "<li><b class=\"pr-num\">" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul>" +
      '<div class="pr-grid2">' + P.market.charts.map(chart).join("") + "</div>" +
      '<div class="pr-grid2 pr-mt"><div class="pr-card"><h3>Топ дефіцитних професій області</h3><ul class="pr-chips">' + P.market.deficit.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="pr-card"><h3>Кого шукатиме Україна у відбудові</h3><p class="pr-lead">' + esc(P.market.forecast) + '</p><ul class="pr-dl">' +
      P.market.growth.map(function (x) { return "<li><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul></div></div>" + src(P.market.source), true) +

    /* профілі */
    sec("profiles", "Проєкт профілів 2027/28", "Три кластери — реальний вибір для кожного", clustersBlock()) +

    /* база */
    sec("base", "Матеріально-технічна база", "Що маємо і що плануємо",
      '<div class="pr-grid2"><div class="pr-card"><h3>Маємо сьогодні</h3><ul class="pr-check">' + P.base.have.map(function (t) { return "<li>" + ICON("check") + "<span>" + esc(t) + "</span></li>"; }).join("") +
      '</ul></div><div class="pr-card"><h3>Плануємо до 2027–2028</h3><ul class="pr-check pr-plan">' + P.base.plan.map(function (t) { return "<li>" + ICON("clock") + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul></div></div>" +
      "<h3 class=\"pr-h3\">Фото: що маємо</h3>" + photos(P.base.photos, "have") +
      "<h3 class=\"pr-h3\">Візуалізації: що плануємо</h3>" + photos(P.base.renders, "plan") +
      '<p class="pr-note">' + esc(P.base.money) + "</p>", true) +

    /* виклики */
    sec("challenges", "Виклики та рішення", "Чесно про складне — і що ми з цим робимо",
      '<ol class="pr-ch">' + P.challenges.map(function (x, i) {
        return '<li><span class="pr-step">' + (i + 1) + '</span><div class="pr-ch-p"><small>Виклик</small><b>' + esc(x[0]) + '</b></div><div class="pr-ch-s"><small>Рішення</small><span>' + esc(x[1]) + "</span></div></li>";
      }).join("") + "</ol>") +

    /* swot */
    sec("swot", "Стратегічний аналіз", "SWOT-аналіз ліцею",
      '<div class="pr-swot">' + P.swot.map(function (x) {
        return '<div class="pr-card pr-sw pr-sw-' + x[0].toLowerCase() + '"><span class="pr-sw-l">' + x[0] + "</span><h3>" + esc(x[1]) + "</h3><ul>" +
          x[2].map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</div>" +
      '<h3 class="pr-h3">Спільна відповідальність за усвідомлений вибір</h3><div class="pr-grid4">' +
      P.together.map(function (x) { return '<div class="pr-card"><h3>' + esc(x[0]) + "</h3><p>" + esc(x[1]) + "</p></div>"; }).join("") +
      '</div><p class="pr-quote">Профіль — не вирок, а перший крок. Обираймо разом.</p>', true);

  /* фото на весь екран */
  var GAL = { have: P.base.photos, plan: P.base.renders };
  P.meetings.forEach(function (m) { GAL["meet" + m.n] = m.photos || []; });
  $("#main").addEventListener("click", function (e) {
    var b = e.target.closest(".gal-item[data-gal]");
    if (b) L.lightbox(GAL[b.getAttribute("data-gal")], +b.getAttribute("data-i"));
  });

  /* анімації: діаграми ростуть, числа рахуються, коли блок у кадрі */
  function countUp(el) {
    var n = +el.getAttribute("data-n"), s = el.getAttribute("data-s") || "", t0 = null, dur = 1100;
    if (!n || reduce) return;
    requestAnimationFrame(function step(now) {
      if (t0 === null) t0 = now;
      var k = Math.min(1, (now - t0) / dur), v = Math.round(n * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString("uk-UA") + s;
      if (k < 1) requestAnimationFrame(step);
    });
  }
  var anim = $$(".pr-chart, .pr-num[data-n], .pr-time, .pr-road");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add("in");
        if (x.target.hasAttribute("data-n")) countUp(x.target);
        io.unobserve(x.target);
      });
    }, { threshold: 0.25 });
    anim.forEach(function (el) { io.observe(el); });
  } else anim.forEach(function (el) { el.classList.add("in"); });

  /* посилання з шапки - плавно до розділу */
  $$(".jump a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = document.getElementById(a.getAttribute("href").slice(1));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
    });
  });
})();
