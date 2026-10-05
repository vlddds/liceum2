/* Спільне для всіх сторінок: шапка, підвал, налаштування (тема, розмір тексту, контраст), пасхалка.
   Підключається після js/data.js і перед скриптом сторінки. */
(function () {
  "use strict";

  var D = window.SITE_DATA;
  if (!D) { if (window.console) console.error("Не завантажено js/data.js"); return; }
  var CONFIG = D.config, root = document.documentElement;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches);
  var isWeb = function (h) { return /^https?:/i.test(h); };
  var mailto = "mailto:" + CONFIG.email;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function ICON(id) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  }

  /* 1. ЛОГОТИП, ВЕРХНЯ СМУЖКА, ПІДВАЛ ------------------------------------------ */
  $("#logo").innerHTML = CONFIG.logoUrl
    ? '<img class="mark" src="' + esc(CONFIG.logoUrl) + '" alt="" width="48" height="48" fetchpriority="high">'
    : '<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#14274E"/><rect y="33" width="48" height="3" fill="#F4B400"/><text x="24" y="29" text-anchor="middle" font-family="Literata,Georgia,serif" font-weight="700" font-size="26" fill="#fff">2</text></svg>';
  $("#u-mail").href = mailto; $("#u-mail span").textContent = CONFIG.email;
  $("#u-addr span").textContent = "вул. Державна, 2, м. Підгородне";
  $("#u-fb").href = CONFIG.facebook;
  $("#f-addr").textContent = CONFIG.address;
  $("#f-mail").href = mailto; $("#f-mail").textContent = CONFIG.email;
  $("#year").textContent = new Date().getFullYear();
  $("#f-links").innerHTML = D.useful.map(function (l) {
    return '<li><a href="' + esc(l[1]) + '">' + esc(l[0]) + "</a></li>";
  }).join("");

  /* 2. МЕНЮ, ПРОКРУТКА, «НАГОРУ» ------------------------------------------------ */
  var header = $(".site-header"), menuBtn = $("#menu-btn"), totop = $("#totop"), progress = $("#progress");
  menuBtn.addEventListener("click", function () {
    var open = header.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    $("#menu-ic").innerHTML = '<use href="#i-' + (open ? "close" : "menu") + '"/>';
  });
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 8);
    totop.classList.toggle("show", y > 700);
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  totop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* 3. НАЛАШТУВАННЯ: темна тема, більший текст, контраст (запам'ятовуються) ------------
     Початковий стан ставить короткий скрипт у <head>, щоб не було «спалаху» світлої теми. */
  var KEY = "l2prefs", prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { prefs = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} }
  function syncButtons() {
    ["large", "contrast", "dark"].forEach(function (cls) {
      var b = $("#btn-" + cls);
      if (b) b.setAttribute("aria-pressed", root.classList.contains(cls) ? "true" : "false");
    });
  }
  function setPref(cls, on) {
    if (!reduce) { root.classList.add("theming"); setTimeout(function () { root.classList.remove("theming"); }, 450); }
    root.classList.toggle(cls, on);
    if (cls === "dark") { prefs.theme = on ? "dark" : "light"; if (on) root.classList.remove("contrast"); }
    if (cls === "contrast" && on) root.classList.remove("dark");
    prefs.large = root.classList.contains("large");
    prefs.contrast = root.classList.contains("contrast");
    save(); syncButtons();
    window.dispatchEvent(new Event("resize"));
  }
  ["large", "contrast", "dark"].forEach(function (cls) {
    var b = $("#btn-" + cls);
    if (b) b.addEventListener("click", function () { setPref(cls, !root.classList.contains(cls)); });
  });
  syncButtons();
  /* За замовчуванням сайт світлий; темна тема — лише якщо відвідувач сам її увімкнув кнопкою */

  /* 4. «ХВИЛЯ» ПІД ЧАС НАТИСКАННЯ НА КНОПКИ ------------------------------------ */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".btn, .search .go");
    if (!b || reduce || e.detail === 0) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement("span");
    sp.className = "ripple";
    sp.style.width = sp.style.height = s + "px";
    sp.style.left = (e.clientX - r.left - s / 2) + "px";
    sp.style.top = (e.clientY - r.top - s / 2) + "px";
    b.appendChild(sp);
    setTimeout(function () { sp.remove(); }, 700);
  });

  /* 5. ПАСХАЛКА: міні-гра (js/game.js завантажується лише коли потрібна) -------------- */
  function openGame() {
    if (window.L2Game) { window.L2Game.open(); return; }
    var s = document.createElement("script");
    s.src = "js/game.js?v=20261005-16";
    s.onload = function () { if (window.L2Game) window.L2Game.open(); };
    document.body.appendChild(s);
  }
  var KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"], kPos = 0;
  document.addEventListener("keydown", function (e) {
    var c = /^Arrow/.test(e.key) ? e.key : e.code;
    if (c === KONAMI[kPos]) {
      kPos++;
      if (kPos === KONAMI.length) { kPos = 0; openGame(); }
    } else {
      kPos = c === KONAMI[0] ? (kPos === 2 ? 2 : 1) : 0;
    }
  });
  var taps = 0, tapTimer = null;
  $("#year").addEventListener("click", function () {
    taps++; clearTimeout(tapTimer);
    tapTimer = setTimeout(function () { taps = 0; }, 1500);
    if (taps >= 5) { taps = 0; openGame(); }
  });

  /* 6. ЗОВНІШНІ ПОСИЛАННЯ відкриваються так, як задано в config.linkTarget ------------ */
  document.addEventListener("DOMContentLoaded", function () {
    $$("a[href]").forEach(function (a) {
      if (isWeb(a.getAttribute("href"))) { a.target = CONFIG.linkTarget; a.rel = "noopener"; }
    });
  });

  /* Відправка форм. Google Apps Script не приймає JSON-заголовки з іншого сайту,
     тому йому шлемо «простий» запит (text/plain); іншим сервісам (Formspree тощо) — JSON. */
  function postForm(url, data) {
    var gas = /script\.google\.com/.test(url);
    return fetch(url, {
      method: "POST",
      headers: gas ? { "Content-Type": "text/plain;charset=utf-8" } : { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return gas ? r.json().then(function (j) { if (!j || !j.ok) throw new Error("gas"); return j; }) : r;
    });
  }

  /* Перед друком розгортаємо всі «питання-відповіді» та згорнуті блоки, після — повертаємо як було */
  window.addEventListener("beforeprint", function () {
    $$("details").forEach(function (d) { d.setAttribute("data-was", d.open ? "1" : "0"); d.open = true; });
  });
  window.addEventListener("afterprint", function () {
    $$("details[data-was]").forEach(function (d) { d.open = d.getAttribute("data-was") === "1"; d.removeAttribute("data-was"); });
  });

  /* 7. ФОТО: заглушка і перегляд на весь екран (карусель на головній, архів) ----------
     Для сторінок, де є фото, у наборі іконок потрібні i-image, i-close та i-chev. */
  /* Розміри фото з js/img-sizes.js → width/height, щоб сторінка не «стрибала» */
  function imgSize(src) {
    var s = (window.IMG_SIZES || {})[src];
    return s ? ' width="' + s[0] + '" height="' + s[1] + '"' : "";
  }
  /* lazy: true — вантажити, коли дійде прокрутка; "high" — головне фото (перший слайд), вантажити першим */
  function photoHTML(p, i, lazy) {
    if (p && p.src) return '<img src="' + esc(p.src) + '" alt="' + esc(p.caption || "") + '"' + imgSize(p.src) +
      (lazy === "high" ? ' fetchpriority="high" decoding="async"' : lazy ? ' loading="lazy" decoding="async"' : "") + ">";
    return '<span class="gal-ph">' + ICON("image") + (i >= 0 ? "<small>Фото " + (i + 1) + "</small>" : "") + "</span>";
  }
  /* Lazyload: фото з loading="lazy" вантажаться, коли до них доходить прокрутка,
     і плавно з'являються (поки вантажаться — мерехтливий фон, див. style.css) */
  document.documentElement.classList.add("lazy-on");
  function loaded(e) {
    var img = e.target;
    if (img.tagName === "IMG") img.classList.add("is-loaded");
  }
  document.addEventListener("load", loaded, true);
  document.addEventListener("error", loaded, true);
  /* На випадок, якщо фото вже було в кеші й подія пройшла раніше */
  setInterval(function () {
    $$('img[loading="lazy"]:not(.is-loaded)').forEach(function (img) { if (img.complete && img.naturalWidth) img.classList.add("is-loaded"); });
  }, 1000);
  /* Фото не завантажилось: замість «битої» картинки показуємо заглушку */
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (img.tagName === "IMG" && img.closest(".gal-item, .lb-img, .ev-cover")) img.outerHTML = photoHTML(null, -1);
  }, true);

  var lb = null, lbItems = [], lbAt = 0, lbDone = null;
  function lbBuild() {
    lb = document.createElement("dialog");
    lb.className = "lb"; lb.setAttribute("aria-label", "Перегляд фото");
    lb.innerHTML =
      '<button class="lb-x" type="button" aria-label="Закрити">' + ICON("close") + "</button>" +
      '<figure class="lb-fig"><div class="lb-img"></div><figcaption><span class="lb-cap"></span><span class="lb-pos"></span></figcaption></figure>' +
      '<button class="lb-nav prev" type="button" aria-label="Попереднє фото">' + ICON("chev") + "</button>" +
      '<button class="lb-nav next" type="button" aria-label="Наступне фото">' + ICON("chev") + "</button>";
    document.body.appendChild(lb);
    $(".lb-x", lb).addEventListener("click", function () { lb.close(); });
    $(".lb-nav.prev", lb).addEventListener("click", function () { lbShow(lbAt - 1); });
    $(".lb-nav.next", lb).addEventListener("click", function () { lbShow(lbAt + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-img")) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") lbShow(lbAt - 1);
      else if (e.key === "ArrowRight") lbShow(lbAt + 1);
    });
    lb.addEventListener("close", function () { if (lbDone) lbDone(lbAt); });
    var sx = 0, sy = 0;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) lbShow(lbAt + (dx < 0 ? 1 : -1));
    });
  }
  function lbShow(i) {
    var n = lbItems.length;
    lbAt = (i + n) % n;
    var p = lbItems[lbAt];
    $(".lb-img", lb).innerHTML = photoHTML(p, lbAt, false);
    $(".lb-cap", lb).textContent = p.caption || "";
    $(".lb-pos", lb).textContent = n > 1 ? (lbAt + 1) + " / " + n : "";
    $$(".lb-nav", lb).forEach(function (b) { b.hidden = n < 2; });
    if (!reduce) restart($(".lb-img", lb), "swap");
  }
  /* items: [{ src, caption }], i: з якого почати, onClose(i): викликається після закриття */
  function lightbox(items, i, onClose) {
    if (!items || !items.length) return;
    if (!lb) lbBuild();
    lbItems = items; lbDone = onClose || null;
    lbShow(i || 0);
    lb.showModal(); $(".lb-x", lb).focus();
  }

  /* 8. ПАСХАЛКА «КРОЛИК» ------------------------------------------------------------
     На кожній сторінці з-за однієї з карток визирає маленький кролик (щоразу в іншому місці).
     Знайшли й натиснули — він вистрибує і стрибає за вказівником. Також: «bunny» у пошуку на головній.
     Прибрати: Esc. */
  var bunny = (function () {
    var B = null, BW = 80, BH = 67;
    var SVG = '<svg viewBox="0 0 120 100"><g>' +
        '<ellipse cx="72" cy="22" rx="7" ry="18" transform="rotate(-22 72 22)" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="72" cy="22" rx="3" ry="12" transform="rotate(-22 72 22)" fill="#ffb3c7"/>' +
        '<ellipse cx="86" cy="19" rx="7" ry="18" transform="rotate(-6 86 19)" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="86" cy="19" rx="3" ry="12" transform="rotate(-6 86 19)" fill="#ffb3c7"/>' +
        '<circle cx="22" cy="70" r="9" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="58" cy="70" rx="36" ry="24" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<circle cx="80" cy="50" r="20" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<circle cx="86" cy="46" r="3.2" fill="#16213a"/><circle cx="87.2" cy="44.8" r="1" fill="#fff"/>' +
        '<ellipse cx="98" cy="53" rx="3" ry="2.3" fill="#ff7aa2"/>' +
        '<circle cx="84" cy="56" r="4" fill="#ffb3c7" opacity=".6"/>' +
        '<ellipse cx="44" cy="92" rx="12" ry="5" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="76" cy="92" rx="9" ry="4.5" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
      "</g></svg>";
    function place(x, y, rot) {
      B.el.style.transform = "translate(" + (x - BW / 2) + "px," + (y - BH) + "px) scaleX(" + B.dir + ") rotate(" + rot + "deg)";
    }
    function start(x, y, pop) {
      if (B) return;
      var el = document.createElement("div");
      el.className = "bunny" + (pop && !reduce ? " pop" : ""); el.setAttribute("aria-hidden", "true");
      el.innerHTML = SVG;
      document.body.appendChild(el);
      B = { el: el, dir: 1, leaving: false,
            x: Math.max(BW / 2, Math.min(x, innerWidth - BW / 2)), y: Math.max(BH + 10, Math.min(y, innerHeight - 8)) };
      B.tx = B.x; B.ty = B.y;
      place(B.x, B.y, 0);
      if (pop && !reduce) setTimeout(function () { el.classList.remove("pop"); hop(); }, 520); else hop();
    }
    function leave() {
      if (!B) return;
      B.leaving = true; B.tx = innerWidth + 140; B.ty = B.y;
    }
    function target(px, py) {
      if (!B || B.leaving) return;
      var side = px < B.x ? 1 : -1;   /* сідає збоку від вказівника, з того боку, звідки прийшов */
      B.tx = Math.max(BW / 2, Math.min(innerWidth - BW / 2, px + side * 55));
      B.ty = Math.max(BH, Math.min(innerHeight - 6, py + 34));
    }
    function hop() {
      if (!B) return;
      var dx = B.tx - B.x, dy = B.ty - B.y, d = Math.sqrt(dx * dx + dy * dy);
      if (B.leaving && B.x > innerWidth + 60) { B.el.remove(); B = null; return; }
      if (d < 14) { setTimeout(hop, 160); return; }
      if (Math.abs(dx) > 4) B.dir = dx < 0 ? -1 : 1;
      var step = Math.min(d, reduce ? 60 : 120), x0 = B.x, y0 = B.y,
          x1 = x0 + dx / d * step, y1 = y0 + dy / d * step,
          dur = reduce ? 260 : 380, h = reduce ? 0 : 20 + step * 0.2, t0 = null;
      requestAnimationFrame(function frame(now) {
        if (!B) return;
        if (t0 === null) t0 = now;
        var t = Math.min(1, (now - t0) / dur), arc = Math.sin(Math.PI * t);
        place(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - arc * h, reduce ? 0 : -8 * arc);
        if (t < 1) { requestAnimationFrame(frame); return; }
        B.x = x1; B.y = y1;
        if (!reduce) { var el = B.el; el.classList.add("land"); setTimeout(function () { el.classList.remove("land"); }, 130); }
        setTimeout(hop, reduce ? 30 : 90);
      });
    }
    document.addEventListener("pointermove", function (e) { target(e.clientX, e.clientY); });
    document.addEventListener("pointerdown", function (e) { target(e.clientX, e.clientY); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && B) leave(); });

    /* Схованка: маленький кролик визирає з-за верхнього краю випадкової картки на сторінці */
    var peek = null, spot = null;
    function cards() {
      return $$("main *").filter(function (el) {
        if (el.closest("dialog, .bunny-peek, .results, [hidden]")) return false;
        var shut = el.closest("details:not([open])");   /* за згорнутим блоком можна, у його схований вміст — ні */
        if (shut && shut !== el) return false;
        var r = el.getBoundingClientRect();
        if (r.width < (innerWidth < 600 ? 120 : 180) || r.height < 70 || !inView(r)) return false;
        /* не в каруселях і інших блоках, що прокручуються вбік, — інакше кролик опиниться за краєм екрана */
        for (var a = el.parentElement; a && a.tagName !== "MAIN"; a = a.parentElement) {
          if (/auto|scroll/.test(getComputedStyle(a).overflowX)) return false;
        }
        var s = getComputedStyle(el);
        return parseFloat(s.borderTopLeftRadius) >= 10 && s.position !== "fixed" &&
          (s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.backgroundImage !== "none");
      });
    }
    function inView(r) { return r.left >= 0 && r.right <= document.documentElement.clientWidth; }
    function placePeek() {
      if (!peek) return;
      var r = spot && document.contains(spot) ? spot.getBoundingClientRect() : null;
      /* картка зникла або вийшла за край (поворот телефона, зміна вікна) — ховаємось деінде */
      if (!r || !r.width || !inView(r)) { peek.remove(); peek = null; hide(); return; }
      var x = Math.max(8, Math.min(r.left + r.width * 0.72 - 21, document.documentElement.clientWidth - 50));
      peek.style.left = (x + scrollX) + "px";
      peek.style.top = (r.top + scrollY - 21) + "px";
    }
    function hide() {
      var list = cards();
      if (!list.length) return;
      spot = list[Math.floor(Math.random() * list.length)];
      peek = document.createElement("button");
      peek.type = "button"; peek.className = "bunny-peek";
      peek.setAttribute("aria-label", "Схований кролик");
      peek.innerHTML = '<svg viewBox="0 0 60 32" aria-hidden="true">' +
        /* кожне вушко — одна група: біле й рожеве ворушаться разом навколо основи вуха */
        '<g class="ear" style="transform-origin:23px 27px"><g transform="rotate(-12 22 14)">' +
          '<ellipse cx="22" cy="14" rx="5.5" ry="13" fill="#fff" stroke="#8a93a6" stroke-width="2"/>' +
          '<ellipse cx="22" cy="14" rx="2.3" ry="9" fill="#ffb3c7"/></g></g>' +
        '<g class="ear ear-r" style="transform-origin:37px 27px"><g transform="rotate(12 38 14)">' +
          '<ellipse cx="38" cy="14" rx="5.5" ry="13" fill="#fff" stroke="#8a93a6" stroke-width="2"/>' +
          '<ellipse cx="38" cy="14" rx="2.3" ry="9" fill="#ffb3c7"/></g></g>' +
        '<circle cx="30" cy="40" r="17" fill="#fff" stroke="#8a93a6" stroke-width="2"/>' +
        '<circle cx="24" cy="30" r="2.3" fill="#16213a"/><circle cx="36" cy="30" r="2.3" fill="#16213a"/>' +
        "</svg>";
      document.body.appendChild(peek);
      placePeek();
      peek.addEventListener("click", function () {
        var p = peek, r = p.getBoundingClientRect();
        peek = null;
        /* вихід зі схованки: визирає вище, вистрибує й «пружинить» до повного розміру */
        p.classList.add("out");
        setTimeout(function () { p.remove(); start(r.left + r.width / 2, r.bottom, true); }, reduce ? 0 : 280);
      });
    }
    window.addEventListener("resize", placePeek);
    window.addEventListener("load", function () {
      setTimeout(function () { hide(); setInterval(placePeek, 700); }, 1200);   /* картки «виїжджають» анімацією — підлаштовуємось */
    });

    return { start: start, leave: leave, toggle: function (x, y) { if (B) leave(); else start(x, y); } };
  })();

  window.L2 = { $: $, $$: $$, esc: esc, ICON: ICON, restart: restart, plural: plural,
    reduce: reduce, mailto: mailto, openGame: openGame,
    photoHTML: photoHTML, imgSize: imgSize, lightbox: lightbox, postForm: postForm, lightboxOpen: function () { return !!(lb && lb.open); }, bunny: bunny };
})();
