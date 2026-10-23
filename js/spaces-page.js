/* Сторінка «Наші простори» (spaces.html). Дані - data/spaces.js.
   Чипи-фільтри за тегами (spaces.html?tag=stem одразу вмикає потрібний),
   клік по фото - перегляд на весь екран з гортанням (той самий, що на головній). */
(function () {
  "use strict";

  var L = window.L2, list = window.SPACES, TAGS = window.SPACE_TAGS || {};
  if (!L || !Array.isArray(list)) { if (window.console) console.error("Не завантажено js/common.js або data/spaces.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, plural = L.plural;

  /* у фільтрі - лише ті теги, що справді є в просторів, у порядку SPACE_TAGS */
  var used = {};
  list.forEach(function (s) { (s.tags || []).forEach(function (t) { used[t] = 1; }); });
  var tags = Object.keys(TAGS).filter(function (t) { return used[t]; });
  Object.keys(used).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); });
  function tagName(t) { return TAGS[t] || t; }

  function card(s, i) {
    var ph = (s.photos || []).filter(Boolean), n = ph.length;
    var pic = n
      ? '<button type="button" class="sp-pic gal-item" data-k="' + i + '" aria-label="Переглянути фото: ' + esc(s.title) + ", " + n + " " + plural(n, "фото", "фото", "фото") + '">' +
          L.photoHTML({ src: ph[0], caption: s.title }, i, true) +
          (n > 1 ? '<span class="sp-n">' + ICON("image") + n + "</span>" : "") + "</button>"
      : '<div class="sp-pic sp-ph" aria-hidden="true">' + ICON("image") + "<small>Фото скоро</small></div>";
    return '<li class="sp-card" data-tags="' + esc((s.tags || []).join(" ")) + '">' + pic +
      '<div class="sp-txt"><h2>' + esc(s.title) + "</h2>" +
        (s.description ? "<p>" + esc(s.description) + "</p>" : "") +
        ((s.tags || []).length ? '<ul class="sp-tags" aria-label="Теги">' + s.tags.map(function (t) { return "<li>" + esc(tagName(t)) + "</li>"; }).join("") + "</ul>" : "") +
      "</div></li>";
  }

  var main = $("#main");
  main.innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1">' +
      '<div class="hero-bg" aria-hidden="true"><span class="num"></span></div>' +
      '<div class="wrap hero-in">' +
        '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
          '<a href="about.html">Про ліцей</a><span aria-hidden="true">/</span><span aria-current="page">Наші простори</span></nav>' +
        '<h1 id="h1">Наші простори</h1>' +
        '<p class="hero-sub">Фотоекскурсія ліцеєм: кабінети, лабораторії, бібліотека, спортзал і місця, де проходить шкільне життя.</p>' +
      "</div></section>" +
    '<div class="sec sp-sec2"><div class="wrap">' +
      (tags.length > 1 ? '<div class="sp-filter" role="group" aria-label="Показати простори">' +
        '<button type="button" class="chip" data-tag="" aria-pressed="true">Усі</button>' +
        tags.map(function (t) { return '<button type="button" class="chip" data-tag="' + esc(t) + '" aria-pressed="false">' + esc(tagName(t)) + "</button>"; }).join("") +
      "</div>" : "") +
      '<p class="sp-count" id="sp-count" aria-live="polite"></p>' +
      '<ul class="sp-grid" id="sp-grid">' + list.map(card).join("") + "</ul>" +
    "</div></div>";

  /* фільтр */
  var grid = $("#sp-grid");
  function setTag(t, push) {
    if (t && tags.indexOf(t) < 0) t = "";
    $$(".sp-filter .chip", main).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tag") === t ? "true" : "false"); });
    var n = 0;
    $$(".sp-card", grid).forEach(function (li) {
      var ok = !t || (" " + li.getAttribute("data-tags") + " ").indexOf(" " + t + " ") > -1;
      li.hidden = !ok; if (ok) n++;
    });
    $("#sp-count").textContent = t ? tagName(t) + ": " + n + " " + plural(n, "простір", "простори", "просторів") : "";
    if (push && history.replaceState) history.replaceState(null, "", t ? "?tag=" + encodeURIComponent(t) : location.pathname);
  }
  main.addEventListener("click", function (e) {
    var b = e.target.closest(".sp-filter .chip");
    if (b) setTag(b.getAttribute("data-tag"), true);
  });
  var m = /[?&]tag=([^&]+)/.exec(location.search);
  setTag(m ? decodeURIComponent(m[1]) : "", false);

  /* фото на весь екран, після закриття фокус повертається на картку */
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".sp-pic[data-k]");
    if (!b) return;
    var s = list[+b.getAttribute("data-k")];
    L.lightbox(s.photos.filter(Boolean).map(function (src) { return { src: src, caption: s.title }; }), 0, function () { b.focus({ preventScroll: true }); });
  });

  /* поява при прокрутці */
  var reveal = $$(".sp-card", grid);
  reveal.forEach(function (el, i) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (i % 3 * 0.05).toFixed(2) + "s"); });
  if ("IntersectionObserver" in window && !L.reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { threshold: 0.05 });
    reveal.forEach(function (el) { ro.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }
})();
