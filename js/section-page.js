/* Розділова сторінка (education, public, upbringing, services, news).
   Малює все з window.SECTION (файли sections/*.js), блоки беруться з blocks.js.

   SECTION = { title, lead, num, crumb, items: [пункт, ...] }
   пункт   = { id, title, short, icon, sub, open, blocks: [блок, ...] }
             або просто посилання: { id, title, icon, sub, href } (як "Педагогічний колектив") */
(function () {
  "use strict";

  var S = window.SECTION, L = window.L2, D = window.SITE_DATA;
  if (!S || !L || !window.L2B) { if (window.console) console.error("Не завантажено js/common.js, js/blocks.js або дані розділу"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, plural = L.plural, reduce = L.reduce;
  var isWeb = function (h) { return /^https?:/i.test(h || ""); };

  function blocks(item) { return window.L2B.render(item.blocks); }
  function countDocs(item) {
    var n = 0;
    (item.blocks || []).forEach(function (b) { if (b.type === "docs") n += b.items.length; });
    return n;
  }

  /* 2. сторінка */
  var items = S.items || [];
  var main = $("#main");
  main.innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1">' +
      '<div class="hero-bg" aria-hidden="true"><span class="num">' + esc(S.num || "") + "</span></div>" +
      '<div class="wrap hero-in">' +
        '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
          (S.crumb ? '<a href="' + esc(S.crumb.url) + '">' + esc(S.crumb.title) + '</a><span aria-hidden="true">/</span>' : "") +
          '<span aria-current="page">' + esc(S.title) + "</span></nav>" +
        '<h1 id="h1">' + esc(S.title) + "</h1>" +
        (S.lead ? '<p class="hero-sub">' + esc(S.lead) + "</p>" : "") +
        (items.length > 1 ? '<ul class="jump" aria-label="Розділи сторінки">' + items.map(function (it) {
          return '<li><a href="' + esc(it.href || "#" + it.id) + '">' + esc(it.short || it.title) + "</a></li>";
        }).join("") + "</ul>" : "") +
      "</div></section>" +
    '<section class="sec alt sp-sec" aria-label="' + esc(S.title) + '"><div class="wrap">' +
      '<div class="sp-tools">' + (items.length > 3 ? '<div class="t-find">' + ICON("search") +
        '<input id="sp-q" type="search" placeholder="Знайти на сторінці" aria-label="Пошук на сторінці" autocomplete="off"></div>' +
        '<button class="btn" id="sp-all" type="button" aria-pressed="false">Розгорнути все</button>' : "") +
        '<button class="btn" id="sp-print" type="button" title="Надрукувати розділи, які зараз видно (з пошуком — лише знайдені)">' + ICON("doc") + "Друкувати</button></div>" +
      '<div class="acc" id="acc">' + items.map(function (it) {
        var ico = '<span class="ico">' + ICON(it.icon || "doc") + "</span>";
        if (it.href) {
          return '<div class="acc-item link" id="' + esc(it.id) + '"><h3><a class="acc-head" href="' + esc(it.href) + '">' + ico +
            '<span class="acc-t">' + esc(it.title) + "<small>" + esc(it.sub || "") + "</small></span>" +
            '<span class="acc-go">Перейти' + ICON("chev") + "</span></a></h3></div>";
        }
        var nd = countDocs(it), sub = it.sub || (nd ? nd + " " + plural(nd, "документ", "документи", "документів") : "");
        return '<div class="acc-item" id="' + esc(it.id) + '"><h3><button class="acc-head" type="button" aria-expanded="false" aria-controls="p-' + esc(it.id) + '" id="b-' + esc(it.id) + '">' +
          ico + '<span class="acc-t">' + esc(it.title) + "<small>" + esc(sub) + "</small></span>" +
          '<svg class="ic acc-chev" aria-hidden="true"><use href="#i-chev"/></svg></button></h3>' +
          '<div class="acc-body" id="p-' + esc(it.id) + '" role="region" aria-labelledby="b-' + esc(it.id) + '"><div class="acc-in"><div class="acc-pad">' +
          blocks(it) + "</div></div></div></div>";
      }).join("") + "</div>" +
      '<p class="empty-note" id="sp-none" hidden>Нічого не знайдено. Спробуйте інше слово.</p>' +
    "</div></section>";
  document.title = S.title + " · Підгородненський Ліцей №2";

  /* акордеон, пошук, кнопка "розгорнути все" */
  var acc = $("#acc");
  function setPanel(item, open, animate) {
    var btn = $("button.acc-head", item);
    if (!btn) return;
    item.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (!animate) { item.classList.add("instant"); requestAnimationFrame(function () { item.classList.remove("instant"); }); }
  }
  acc.addEventListener("click", function (e) {
    var btn = e.target.closest("button.acc-head");
    if (!btn) return;
    var item = btn.closest(".acc-item"), open = !item.classList.contains("open");
    setPanel(item, open, true);
    if (open && history.replaceState) history.replaceState(null, "", "#" + item.id);
  });
  items.forEach(function (it) { if (it.open) setPanel(document.getElementById(it.id), true, false); });

  var all = $("#sp-all");
  if (all) all.addEventListener("click", function () {
    var on = all.getAttribute("aria-pressed") !== "true";
    all.setAttribute("aria-pressed", on ? "true" : "false");
    all.textContent = on ? "Згорнути все" : "Розгорнути все";
    $$(".acc-item:not(.link)", acc).forEach(function (el) { if (!el.hidden) setPanel(el, on, true); });
  });

  $("#sp-print").addEventListener("click", function () { window.print(); });

  var q = $("#sp-q");
  if (q) {
    var norm = function (s) { return String(s || "").toLowerCase().replace(/[’ʼ`]/g, "'"); };
    var hay = $$(".acc-item", acc).map(function (el) { return norm(el.textContent); });
    q.addEventListener("input", function () {
      var t = norm(q.value.trim()).split(/\s+/).filter(Boolean), shown = 0;
      $$(".acc-item", acc).forEach(function (el, i) {
        var ok = t.every(function (w) { return hay[i].indexOf(w) > -1; });
        el.hidden = !ok; if (ok) shown++;
        if (t.length && ok && !el.classList.contains("link")) setPanel(el, true, false);
        if (!t.length) setPanel(el, false, false);
      });
      $("#sp-none").hidden = shown > 0;
    });
  }

  /* education.html#dpa одразу відкриває потрібний пункт */
  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1)), t = id && document.getElementById(id);
    if (t && t.classList.contains("acc-item")) {
      t.hidden = false;
      setPanel(t, true, false);
      setTimeout(function () { t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 60);
    }
  }
  fromHash();
  window.addEventListener("hashchange", fromHash);
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1), t = document.getElementById(id);
    if (!t || !t.classList.contains("acc-item")) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    fromHash();
  });

  /* зовнішні посилання в новій вкладці, як скрізь */
  $$("a[href]", main).forEach(function (a) {
    if (isWeb(a.getAttribute("href"))) { a.target = D.config.linkTarget; a.rel = "noopener"; }
  });

  /* 6. поява при прокрутці */
  var reveal = $$(".acc-item, .sp-tools", main);
  reveal.forEach(function (el, i) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (Math.min(i, 6) * 0.05).toFixed(2) + "s"); });
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { threshold: 0.05 });
    reveal.forEach(function (el) { ro.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }
})();
