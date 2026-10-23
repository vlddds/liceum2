/* Учнівський блог: blog.html (список) і post.html?p=id (окремий допис). Дані - data/blog.js.
   Яка сторінка - видно з атрибута data-blog на <main>: "list" або "post". */
(function () {
  "use strict";

  var L = window.L2, B = window.BLOG;
  if (!L || !B) { if (window.console) console.error("Не завантажено js/common.js або data/blog.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON;
  var MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var main = $("#main"), mode = main.getAttribute("data-blog");

  /* нові зверху, навіть якщо хтось дописав не на початок */
  var posts = (B.posts || []).filter(function (p) { return p && p.id && p.title; })
    .sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
  var formOk = /^https?:/i.test(B.formUrl || "");

  function date(s) {
    var p = String(s || "").split("-");
    return p.length === 3 ? +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0] : "";
  }
  function by(p) { return [p.author, p.grade].filter(Boolean).map(esc).join(", "); }
  function paras(t) { return String(t || "").split(/\n+/).filter(function (x) { return x.trim(); }).map(function (x) { return "<p>" + esc(x) + "</p>"; }).join(""); }
  function excerpt(t) {
    var s = String(t || "").replace(/\s+/g, " ").trim();
    return s.length > 180 ? s.slice(0, 180).replace(/\s+\S*$/, "") + "…" : s;
  }
  function hero(title, sub, crumbs) {
    return '<section class="hero t-hero on-dark" aria-labelledby="h1">' +
      '<div class="hero-bg" aria-hidden="true"><span class="num"></span></div>' +
      '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' + crumbs + "</nav>" +
        '<h1 id="h1">' + esc(title) + "</h1>" + (sub ? '<p class="hero-sub">' + sub + "</p>" : "") + "</div></section>";
  }
  var sendBtn = formOk
    ? '<a class="btn primary" href="' + esc(B.formUrl) + '" target="_blank" rel="noopener">' + ICON("pen") + 'Надіслати допис<span class="sr"> (відкриється Google Form)</span></a>'
    : '<button class="btn" type="button" disabled>' + ICON("pen") + "Надіслати допис — скоро</button>";

  /* список */
  if (mode === "list") {
    main.innerHTML = hero("Учнівський блог", "Пишуть учні ліцею: про події, захоплення, враження й ідеї. Хочеш, щоб і твій текст був тут? Надсилай!",
        '<a href="news.html">Новини</a><span aria-hidden="true">/</span><span aria-current="page">Учнівський блог</span>') +
      '<div class="sec bl-sec"><div class="wrap">' +
        '<div class="bl-send"><div><h2>Хочеш написати?</h2><p>Заповни форму: заголовок, текст, клас і ім\'я (без прізвища). Можна додати посилання на фото. Ми прочитаємо й опублікуємо.</p></div>' + sendBtn + "</div>" +
        (posts.length
          ? '<ul class="bl-list">' + posts.map(function (p) {
              return '<li class="bl-card">' +
                (p.photo ? '<div class="bl-pic">' + L.photoHTML({ src: p.photo, caption: "" }, -1, true) + "</div>" : "") +
                '<div class="bl-txt"><p class="bl-meta">' + esc(date(p.date)) + (by(p) ? " · " + by(p) : "") + "</p>" +
                  '<h2><a href="post.html?p=' + encodeURIComponent(p.id) + '">' + esc(p.title) + "</a></h2>" +
                  "<p>" + esc(excerpt(p.text)) + "</p>" +
                  '<span class="bl-more" aria-hidden="true">Читати →</span></div></li>';
            }).join("") + "</ul>"
          : '<p class="empty-note bl-empty">Тут скоро з\'являться перші дописи. Стань першим автором!</p>') +
      "</div></div>";
    /* уся картка клікабельна, але посилання одне - заголовок (так зручніше для екранних читачів) */
    main.addEventListener("click", function (e) {
      var c = e.target.closest(".bl-card");
      if (!c || e.target.closest("a")) return;
      var a = $("h2 a", c); if (a) a.click();
    });
  }

  /* окремий допис */
  if (mode === "post") {
    var m = /[?&]p=([^&]+)/.exec(location.search), id = m ? decodeURIComponent(m[1]) : "", at = -1;
    posts.forEach(function (p, i) { if (p.id === id) at = i; });
    var p = posts[at];
    if (!p) {
      main.innerHTML = hero("Допис не знайдено", "Можливо, посилання застаріло або допис прибрали.",
          '<a href="blog.html">Учнівський блог</a>') +
        '<div class="sec"><div class="wrap"><a class="btn" href="blog.html">← До всіх дописів</a></div></div>';
      document.title = "Допис не знайдено · Підгородненський Ліцей №2";
      return;
    }
    var prev = posts[at + 1], next = posts[at - 1];
    main.innerHTML = hero(p.title, esc(date(p.date)) + (by(p) ? " · " + by(p) : ""),
        '<a href="blog.html">Учнівський блог</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(p.title) + "</span>") +
      '<div class="sec bl-sec"><div class="wrap"><article class="bl-post" aria-labelledby="h1">' +
        (p.photo ? '<button type="button" class="bl-photo gal-item" aria-label="Відкрити фото на весь екран">' + L.photoHTML({ src: p.photo, caption: p.title }, -1, false) + "</button>" : "") +
        '<div class="bl-body">' + paras(p.text) + "</div>" +
        '<p class="bl-author">' + ICON("pen") + "<span>Автор: " + (by(p) || "учень ліцею") + "</span></p>" +
      "</article>" +
      '<nav class="bl-nav" aria-label="Інші дописи">' +
        (prev ? '<a class="bl-nav-a" href="post.html?p=' + encodeURIComponent(prev.id) + '"><small>← Попередній</small><b>' + esc(prev.title) + "</b></a>" : "<span></span>") +
        (next ? '<a class="bl-nav-a next" href="post.html?p=' + encodeURIComponent(next.id) + '"><small>Наступний →</small><b>' + esc(next.title) + "</b></a>" : "<span></span>") +
      "</nav>" +
      '<p class="bl-back"><a class="btn" href="blog.html">← До всіх дописів</a></p>' +
      "</div></div>";
    document.title = p.title + " · Учнівський блог · Підгородненський Ліцей №2";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", excerpt(p.text));
    var ph = $(".bl-photo", main);
    if (ph) ph.addEventListener("click", function () { L.lightbox([{ src: p.photo, caption: p.title }], 0, function () { ph.focus({ preventScroll: true }); }); });
  }

  /* поява при прокрутці */
  var reveal = $$(".bl-card, .bl-send", main);
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
