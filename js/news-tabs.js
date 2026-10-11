/* новини: дві вкладки - "Новини" (як було) і "Життя ліцею" (дописи з гугл-таблиці, аркуш "Життя ліцею").
   підключати після section-page.js. news.html#life одразу відкриває другу вкладку.
   дописи тягнемо тільки коли відкрили вкладку, кешуємо на 2 хв, через 8 с без відповіді - запасний текст */
(function () {
  "use strict";

  var L = window.L2, D = window.SITE_DATA;
  var sec = document.querySelector(".sp-sec .wrap");
  if (!L || !D || !sec) return;
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, reduce = L.reduce;
  var CFG = D.config, FEED = CFG.lifeEndpoint || CFG.reviewEndpoint || CFG.formEndpoint || "", FB = CFG.facebook || "";
  var KEY = "l2life", TTL = 2 * 60 * 1000, TIMEOUT = 8000;

  /* обгортаємо все, що вже намалював section-page.js, у першу вкладку */
  var newsPanel = document.createElement("div");
  newsPanel.id = "panel-news"; newsPanel.className = "nt-panel";
  newsPanel.setAttribute("role", "tabpanel"); newsPanel.setAttribute("aria-labelledby", "tab-news"); newsPanel.tabIndex = -1;
  newsPanel.innerHTML = '<p class="nt-lead">Офіційні оголошення та важливі події ліцею</p>';
  while (sec.firstChild) newsPanel.appendChild(sec.firstChild);

  var lifePanel = document.createElement("div");
  lifePanel.id = "panel-life"; lifePanel.className = "nt-panel"; lifePanel.hidden = true;
  lifePanel.setAttribute("role", "tabpanel"); lifePanel.setAttribute("aria-labelledby", "tab-life"); lifePanel.tabIndex = -1;
  lifePanel.innerHTML = '<p class="nt-lead">Свята, конкурси, досягнення та будні ліцею</p>' +
    '<div class="life-list" id="life-list" aria-live="polite"></div>' +
    (FB ? '<p class="fb-alt">' + ICON("fb") + '<a href="' + esc(FB) + '" target="_blank" rel="noopener">Ще більше фото й новин — у нашій групі у Facebook</a></p>' : "");

  var tabs = document.createElement("div");
  tabs.className = "nt-tabs"; tabs.setAttribute("role", "tablist"); tabs.setAttribute("aria-label", "Новини та життя ліцею");
  tabs.innerHTML =
    '<button type="button" role="tab" id="tab-news" aria-controls="panel-news" aria-selected="true">' + ICON("doc") + "Новини</button>" +
    '<button type="button" role="tab" id="tab-life" aria-controls="panel-life" aria-selected="false" tabindex="-1">' + ICON("image") + "Життя ліцею</button>";

  sec.appendChild(tabs); sec.appendChild(newsPanel); sec.appendChild(lifePanel);
  var btns = $$('[role="tab"]', tabs), panels = [newsPanel, lifePanel], loaded = false;

  function select(i, focus, push) {
    btns.forEach(function (b, k) {
      b.setAttribute("aria-selected", k === i ? "true" : "false");
      b.tabIndex = k === i ? 0 : -1;
      panels[k].hidden = k !== i;
    });
    tabs.style.setProperty("--x", i * 100 + "%");
    if (focus) btns[i].focus();
    if (push && history.replaceState) history.replaceState(null, "", i === 1 ? "#life" : location.pathname + location.search);
    if (i === 1 && !loaded) { loaded = true; loadLife(); }
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest('[role="tab"]');
    if (b) select(btns.indexOf(b), false, true);
  });
  /* стрілки, Home, End - як у звичайних вкладках */
  tabs.addEventListener("keydown", function (e) {
    var i = btns.indexOf(document.activeElement), n = btns.length, to = -1;
    if (i < 0) return;
    if (e.key === "ArrowRight") to = (i + 1) % n;
    else if (e.key === "ArrowLeft") to = (i - 1 + n) % n;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = n - 1;
    if (to < 0) return;
    e.preventDefault(); select(to, true, true);
  });

  /* #life - друга вкладка; якщо в адресі якась новина - перша (її відкриє section-page.js) */
  function fromHash() {
    var h = location.hash.slice(1), t = h && document.getElementById(decodeURIComponent(h));
    if (h === "life") { select(1, false, false); sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
    else if (t && newsPanel.contains(t)) select(0, false, false);
  }
  /* посилання з шапки сторінки на окремі новини теж повертають першу вкладку */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var t = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
    if (t && newsPanel.contains(t)) select(0, false, false);
  }, true);

  /* дописи з таблиці */
  var list = $("#life-list"), posts = [];
  function note(text) { list.innerHTML = '<p class="empty-note">' + text + "</p>"; }
  function paras(t) { return String(t || "").split(/\n+/).filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }
  function card(p, k) {
    var ph = p.photos || [], more = ph.length - 4;
    return '<article class="life-card" style="--i:' + Math.min(k, 6) + '">' +
      (ph.length ? '<div class="life-ph n' + Math.min(ph.length, 4) + '">' + ph.slice(0, 4).map(function (src, i) {
        return '<button type="button" class="gal-item" data-k="' + k + '" data-i="' + i + '" aria-label="Відкрити фото ' + (i + 1) + " з " + ph.length + '">' +
          L.photoHTML({ src: src, caption: p.title || "" }, i, true) +
          (i === 3 && more > 0 ? '<span class="life-more">+' + more + "</span>" : "") + "</button>";
      }).join("") + "</div>" : "") +
      '<div class="life-body">' + (p.date ? '<time class="life-date">' + esc(p.date) + "</time>" : "") +
      (p.title ? "<h3>" + esc(p.title) + "</h3>" : "") + paras(p.text) + "</div></article>";
  }
  function render(arr) {
    posts = Array.isArray(arr) ? arr : [];
    if (!posts.length) { note("Скоро тут з'являться фото й новини з життя ліцею."); return; }
    list.innerHTML = posts.map(card).join("");
  }
  list.addEventListener("click", function (e) {
    var b = e.target.closest(".gal-item");
    if (!b) return;
    var p = posts[+b.getAttribute("data-k")];
    L.lightbox(p.photos.map(function (src) { return { src: src, caption: p.title || "" }; }), +b.getAttribute("data-i"));
  });
  function loadLife() {
    if (!FEED || !/script\.google\.com/.test(FEED) || !window.fetch) { note("Тут скоро з'являться фото й новини з життя ліцею."); return; }
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) {}
    if (cached && Date.now() - cached.t < TTL) { render(cached.list); return; }
    list.innerHTML = '<div class="life-loading">' + ICON("clock") + "Завантажуємо…</div>";
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT);
    Promise.race([
      fetch(FEED + (FEED.indexOf("?") > -1 ? "&" : "?") + "action=life", ctrl ? { signal: ctrl.signal } : {})
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }),
      new Promise(function (_, no) { setTimeout(function () { no(new Error("timeout")); }, TIMEOUT + 100); })
    ]).then(function (arr) {
      clearTimeout(timer);
      if (!Array.isArray(arr)) throw new Error("bad");
      try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), list: arr })); } catch (e) {}
      render(arr);
    }).catch(function () {
      clearTimeout(timer);
      if (cached && cached.list) render(cached.list);
      else note("Дописи зараз не завантажились. Спробуйте оновити сторінку трохи пізніше.");
    });
  }

  /* стартуємо, коли все вище вже оголошено */
  fromHash();
  window.addEventListener("hashchange", fromHash);
})();
