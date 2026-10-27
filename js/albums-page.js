/* Фотоальбоми (albums.html) як справжній шкільний альбом: сторінка на подію, фото - полароїди на скотчі.
   Дані - js/sections/albums.js (той самий формат, що й раніше: галереї в blocks).
   Клік по фото - на весь екран з гортанням по альбому. Альбом без фото - наліпка «Фото ще чекаємо». */
(function () {
  "use strict";

  var S = window.SECTION, L = window.L2;
  if (!S || !L) { if (window.console) console.error("Не завантажено js/common.js або js/sections/albums.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, plural = L.plural;
  var TILT = [-3, 2.2, -1.4, 3, -2.4, 1.2, -0.8, 2.6];

  /* фото альбому: з усіх галерей, порожні рамки ("") пропускаємо */
  var albums = (S.items || []).map(function (it) {
    var photos = [], links = [];
    (it.blocks || []).forEach(function (b) {
      if (b.type === "gallery") (b.items || []).forEach(function (s) {
        var p = s && typeof s === "object" ? { src: s.src, caption: s.caption || "" } : { src: s, caption: "" };
        if (p.src) photos.push(p);
      });
      if (b.type === "button" && b.url) links.push(b);
    });
    return { id: it.id, title: it.title, short: it.short || it.title, sub: it.sub || "", photos: photos, links: links };
  });

  function polaroid(a, p, i) {
    var cap = p.caption || a.short;
    return '<li class="pl" style="--tilt:' + TILT[i % TILT.length] + 'deg;--tape:' + (i % 2 ? 4 : -5) + 'deg">' +
      '<button type="button" class="pl-btn" data-a="' + esc(a.id) + '" data-i="' + i + '" aria-label="Відкрити фото ' + (i + 1) + ": " + esc(cap) + '">' +
        '<span class="pl-ph">' + L.photoHTML(p, i, true) + "</span>" +
        '<span class="pl-cap" aria-hidden="true">' + esc(cap) + "</span>" +
      "</button></li>";
  }

  var main = $("#main");
  main.innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1">' +
      '<div class="hero-bg" aria-hidden="true"><span class="num"></span></div>' +
      '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(S.title) + "</span></nav>" +
        '<h1 id="h1">' + esc(S.title) + "</h1>" +
        (S.lead ? '<p class="hero-sub">' + esc(S.lead) + "</p>" : "") +
        (albums.length > 1 ? '<ul class="jump" aria-label="Альбоми">' + albums.map(function (a) {
          return '<li><a href="#' + esc(a.id) + '">' + esc(a.short) + "</a></li>";
        }).join("") + "</ul>" : "") +
      "</div></section>" +
    '<div class="sec ab-sec"><div class="wrap ab-book">' +
      albums.map(function (a) {
        var n = a.photos.length;
        return '<section class="ab-page' + (n ? "" : " empty") + '" id="' + esc(a.id) + '" aria-labelledby="ab-' + esc(a.id) + '">' +
          '<header class="ab-head"><h2 id="ab-' + esc(a.id) + '">' + esc(a.title) + "</h2>" +
            '<p class="ab-sub">' + esc([a.sub, n ? n + " " + plural(n, "фото", "фото", "фото") : ""].filter(Boolean).join(" · ")) + "</p></header>" +
          (n ? '<ul class="ab-photos">' + a.photos.map(function (p, i) { return polaroid(a, p, i); }).join("") + "</ul>"
             : '<p class="ab-note">' + ICON("image") + "Фото з цієї події ще чекаємо</p>") +
          (a.links.length ? '<p class="ab-links">' + a.links.map(function (b) {
            return '<a class="btn" href="' + esc(b.url) + '">' + esc(b.title) + ICON("chev") + "</a>";
          }).join("") + "</p>" : "") +
        "</section>";
      }).join("") +
    "</div></div>";
  document.title = S.title + " · Підгородненський Ліцей №2";

  /* на весь екран: гортаються всі фото цього альбому */
  main.addEventListener("click", function (e) {
    var b = e.target.closest(".pl-btn");
    if (!b) return;
    var a = albums.filter(function (x) { return x.id === b.getAttribute("data-a"); })[0];
    L.lightbox(a.photos.map(function (p) { return { src: p.src, caption: p.caption || a.title }; }), +b.getAttribute("data-i"), function () { b.focus({ preventScroll: true }); });
  });

  /* albums.html#first-bell-2025 - одразу до потрібного альбому (сторінка малюється скриптом) */
  if (location.hash) {
    var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 60);
  }

  /* поява при прокрутці */
  var reveal = $$(".ab-page", main);
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
