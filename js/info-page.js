/* Інформаційна сторінка-пам'ятка (safety.html, grade5.html).
   Малює все з window.PAGE (файли data/*.js), блоки беруться з blocks.js.
   На відміну від section-page.js, розділи не згортаються: це текст, який читають підряд.

   PAGE = { title, lead, num, crumb: { title, url }, updated, sections: [розділ, ...], help }
   розділ = { id, title, short, icon, blocks: [блок, ...] }
   help   = { title, phones: [{ title, phone }] } - плашка з телефонами внизу (необов'язково) */
(function () {
  "use strict";

  var P = window.PAGE, L = window.L2, D = window.SITE_DATA;
  if (!P || !L || !window.L2B) { if (window.console) console.error("Не завантажено js/common.js, js/blocks.js або дані сторінки"); return; }
  var $$ = L.$$, esc = L.esc, ICON = L.ICON, reduce = L.reduce;
  var isWeb = function (h) { return /^https?:/i.test(h || ""); };
  var secs = P.sections || [];

  var main = document.getElementById("main");
  main.innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1">' +
      '<div class="hero-bg" aria-hidden="true"><span class="num">' + esc(P.num || "") + "</span></div>" +
      '<div class="wrap hero-in">' +
        '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
          (P.crumb ? '<a href="' + esc(P.crumb.url) + '">' + esc(P.crumb.title) + '</a><span aria-hidden="true">/</span>' : "") +
          '<span aria-current="page">' + esc(P.title) + "</span></nav>" +
        '<h1 id="h1">' + esc(P.title) + "</h1>" +
        (P.lead ? '<p class="hero-sub">' + esc(P.lead) + "</p>" : "") +
        (secs.length > 1 ? '<ul class="jump" aria-label="Розділи сторінки">' + secs.map(function (s) {
          return '<li><a href="#' + esc(s.id) + '">' + esc(s.short || s.title) + "</a></li>";
        }).join("") + "</ul>" : "") +
      "</div></section>" +
    '<div class="sec ip-sec"><div class="wrap ip">' +
      secs.map(function (s) {
        return '<section class="ip-card" id="' + esc(s.id) + '" aria-labelledby="h-' + esc(s.id) + '">' +
          '<h2 id="h-' + esc(s.id) + '"><span class="ico">' + ICON(s.icon || "doc") + "</span>" + esc(s.title) + "</h2>" +
          '<div class="ip-body">' + window.L2B.render(s.blocks || []) + "</div></section>";
      }).join("") +
      (P.help && P.help.phones ? '<section class="ip-help" aria-labelledby="h-ip-help"><h2 id="h-ip-help">' + esc(P.help.title || "Якщо потрібна допомога") + "</h2>" +
        window.L2B.render([{ type: "phones", items: P.help.phones }]) + "</section>" : "") +
      (P.updated ? '<p class="ip-upd">Оновлено: ' + esc(P.updated) + "</p>" : "") +
    "</div></div>";
  document.title = P.title + " · Підгородненський Ліцей №2";

  /* заглушки в [квадратних дужках] підсвічуємо, щоб їх було легко помітити й замінити */
  var tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null), nodes = [];
  while (tw.nextNode()) if (/\[[^\]]+\]/.test(tw.currentNode.nodeValue)) nodes.push(tw.currentNode);
  nodes.forEach(function (n) {
    var span = document.createElement("span");
    span.innerHTML = esc(n.nodeValue).replace(/\[[^\]]+\]/g, function (m) { return '<mark class="ph">' + m + "</mark>"; });
    n.parentNode.replaceChild(span, n);
  });

  /* зовнішні посилання в новій вкладці, як скрізь */
  $$("a[href]", main).forEach(function (a) {
    if (isWeb(a.getAttribute("href"))) { a.target = D.config.linkTarget; a.rel = "noopener"; }
  });

  /* поява при прокрутці */
  var reveal = $$(".ip-card, .ip-help", main);
  reveal.forEach(function (el, i) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (Math.min(i, 4) * 0.05).toFixed(2) + "s"); });
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { threshold: 0.05 });
    reveal.forEach(function (el) { ro.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }

  /* safety.html#pickup - одразу до потрібного розділу (сторінка малюється скриптом, тож браузер сам не докрутить) */
  if (location.hash) {
    var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 60);
  }
})();
