/* спільне для всіх сторінок: шапка, підвал, тема/контраст/розмір тексту, пасхалки.
   підключати після data.js, але перед скриптом сторінки */
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

  /* логотип, верхня смужка, підвал */
  $("#logo").innerHTML = CONFIG.logoUrl
    ? '<img class="mark" src="' + esc(CONFIG.logoUrl) + '" alt="" width="48" height="48" fetchpriority="high">'
    : '<svg class="mark" viewBox="0 0 52 52" aria-hidden="true"><defs><clipPath id="mk"><rect width="52" height="52" rx="14"/></clipPath></defs>' +
      '<g clip-path="url(#mk)"><rect width="52" height="52" fill="#14274E"/><rect y="47" width="52" height="5" fill="#F6B800"/></g>' +
      '<text x="26" y="35" text-anchor="middle" font-family="Unbounded,Manrope,sans-serif" font-weight="800" font-size="26" fill="#fff">2</text></svg>';
  $("#u-mail").href = mailto; $("#u-mail span").textContent = CONFIG.email;
  $("#u-addr span").textContent = "вул. Державна, 2, м. Підгородне";
  $("#u-fb").href = CONFIG.facebook;
  $("#f-addr").textContent = CONFIG.address;
  $("#f-mail").href = mailto; $("#f-mail").textContent = CONFIG.email;
  $("#year").textContent = new Date().getFullYear();
  if ($("#f-fb")) $("#f-fb").href = CONFIG.facebook;
  if ($(".foot-print")) $(".foot-print").addEventListener("click", function () { window.print(); });
  $("#f-links").innerHTML = D.useful.map(function (l) {
    return '<li><a href="' + esc(l[1]) + '">' + esc(l[0]) + "</a></li>";
  }).join("");

  /* меню, скрол і кнопка нагору */
  /* меню одне на весь сайт, група підсвічується, якщо ми на її сторінці.
     нова сторінка: дописати ["файл.html", "Назва"] в потрібну групу */
  var NAV = [
    { title: "Про ліцей", items: [["about.html", "Все про заклад"], ["teachers.html", "Педагогічний колектив"],
      ["public.html", "Публічна інформація"], ["albums.html", "Фотоальбоми"], ["spaces.html", "Наші простори"]] },
    { title: "Новини", items: [["news.html", "Новини"], ["news.html#life", "Життя ліцею"], ["calendar.html", "Календар подій"], ["blog.html", "Учнівський блог"], ["archive.html", "Архів"]] },
    { title: "Навчання", items: [["schedule.html", "Розклад уроків"], ["education.html", "Освітній процес"],
      ["profile.html", "Перехід на профільне навчання"], ["upbringing.html", "Виховна робота"], ["index.html#clubs", "Гуртки"]] },
    { title: "Учням і батькам", items: [["menu.html", "Меню їдальні"], ["services.html", "Сервіси та служби"], ["faq.html", "Часті питання"], ["safety.html", "Безпека та укриття"], ["forms.html", "Бланки та заяви"], ["grade5.html", "Перший раз у 5 клас"]] },
    { title: "Контакти", href: "index.html#contacts" }
  ];
  var page = location.pathname.split("/").pop() || "index.html";
  function navHref(h) { return page === "index.html" && h.indexOf("index.html#") === 0 ? h.slice(10) : h; }
  $("#nav").innerHTML = "<ul>" + NAV.map(function (g, i) {
    if (g.href) return '<li><a href="' + navHref(g.href) + '">' + g.title + "</a></li>";
    var here = g.items.some(function (it) { return it[0] === page; });
    return '<li class="nav-grp' + (here ? " here" : "") + '"><button type="button" class="nav-btn" aria-expanded="false" aria-controls="ng-' + i + '">' +
      g.title + ICON("chev") + '</button><ul class="nav-sub" id="ng-' + i + '">' + g.items.map(function (it) {
        return '<li><a href="' + navHref(it[0]) + '"' + (it[0] === page ? ' aria-current="page"' : "") + ">" + it[1] + "</a></li>";
      }).join("") + "</ul></li>";
  }).join("") +
    '<li class="nav-cta"><a href="profile-test.html">Тест на профіль</a></li></ul>';   /* пошук і тест - кнопками справа в шапці, тест ще й тут для телефона */
  function closeGroups(except) {
    $$("#nav .nav-grp.open").forEach(function (li) {
      if (li !== except) { li.classList.remove("open"); $(".nav-btn", li).setAttribute("aria-expanded", "false"); }
    });
  }
  $("#nav").addEventListener("click", function (e) {
    var b = e.target.closest(".nav-btn");
    if (!b) return;
    var li = b.parentNode, open = li.classList.toggle("open");
    b.setAttribute("aria-expanded", open ? "true" : "false");
    closeGroups(li);
  });
  document.addEventListener("click", function (e) { if (!e.target.closest("#nav")) closeGroups(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var li = e.target.closest && e.target.closest(".nav-grp.open");
    closeGroups();
    if (li) $(".nav-btn", li).focus();
    else if (header.classList.contains("open")) { menuBtn.click(); menuBtn.focus(); }   /* мобільне меню на весь екран */
  });

  var header = $(".site-header"), menuBtn = $("#menu-btn"), totop = $("#totop"), progress = $("#progress");
  menuBtn.addEventListener("click", function () {
    var open = header.classList.toggle("open");
    /* на телефоні меню - панель на весь екран під шапкою */
    root.style.setProperty("--hd-h", Math.max(0, header.getBoundingClientRect().bottom) + "px");
    root.classList.toggle("hd-open", open);
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

  /* налаштування: темна тема, більший текст, контраст (запам'ятовуються).
     перший раз їх ставить маленький скрипт у <head>, щоб не мигала світла тема */
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
  /* за замовчуванням світла, темна тільки якщо людина сама її увімкнула */

  /* хвилька при натисканні на кнопки */
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

  /* пасхалка з грою, game.js вантажиться тільки коли треба */
  function openGame() {
    if (window.L2Game) { window.L2Game.open(); return; }
    var s = document.createElement("script");
    s.src = "js/game.js?v=20261023-11";
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

  /* зовнішні посилання відкриваються так, як задано в config.linkTarget */
  document.addEventListener("DOMContentLoaded", function () {
    $$("a[href]").forEach(function (a) {
      if (isWeb(a.getAttribute("href"))) { a.target = CONFIG.linkTarget; a.rel = "noopener"; }
    });
  });

  /* відправка форм. Apps Script не любить JSON-заголовки з чужого сайту,
     тому шлемо як text/plain, а всяким Formspree - нормальний JSON */
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

  /* перед друком розгортаємо все згорнуте, після друку повертаємо як було */
  window.addEventListener("beforeprint", function () {
    $$("details").forEach(function (d) { d.setAttribute("data-was", d.open ? "1" : "0"); d.open = true; });
  });
  window.addEventListener("afterprint", function () {
    $$("details[data-was]").forEach(function (d) { d.open = d.getAttribute("data-was") === "1"; d.removeAttribute("data-was"); });
  });

  /* фото: заглушка і перегляд на весь екран (карусель, архів).
     на сторінці мають бути іконки i-image, i-close та i-chev */
  /* беремо розміри з img-sizes.js, щоб сторінка не стрибала, поки вантажаться фото */
  function imgSize(src) {
    var s = (window.IMG_SIZES || {})[src];
    return s ? ' width="' + s[0] + '" height="' + s[1] + '"' : "";
  }
  /* lazy=true - вантажимо, коли докрутили, "high" - перший слайд, вантажимо одразу */
  function photoHTML(p, i, lazy) {
    if (p && p.src) return '<img src="' + esc(p.src) + '" alt="' + esc(p.caption || "") + '"' + imgSize(p.src) +
      (lazy === "high" ? ' fetchpriority="high" decoding="async"' : lazy ? ' loading="lazy" decoding="async"' : "") + ">";
    return '<span class="gal-ph">' + ICON("image") + (i >= 0 ? "<small>Фото " + (i + 1) + "</small>" : "") + "</span>";
  }
  /* lazyload: фото вантажаться, коли до них докрутили, і плавно проявляються
     (поки вантажиться - мерехтить фон, див. style.css) */
  document.documentElement.classList.add("lazy-on");
  function loaded(e) {
    var img = e.target;
    if (img.tagName === "IMG") img.classList.add("is-loaded");
  }
  document.addEventListener("load", loaded, true);
  document.addEventListener("error", loaded, true);
  /* якщо фото вже було в кеші і подію load ми проґавили */
  setInterval(function () {
    $$('img[loading="lazy"]:not(.is-loaded)').forEach(function (img) { if (img.complete && img.naturalWidth) img.classList.add("is-loaded"); });
  }, 1000);
  /* фото не завантажилось - показуємо заглушку замість битої картинки */
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
  /* items: [{ src, caption }], i - з якого фото почати, onClose(i) - після закриття */
  function lightbox(items, i, onClose) {
    if (!items || !items.length) return;
    if (!lb) lbBuild();
    lbItems = items; lbDone = onClose || null;
    lbShow(i || 0);
    lb.showModal(); $(".lb-x", lb).focus();
  }

  /* пасхалка з кроликом
     на кожній сторінці він визирає з-за якоїсь картки (щоразу з іншої).
     знайшли, натиснули - вистрибує і бігає за мишкою. ще можна написати bunny в пошуку.
     Esc - прибрати. на телефоні - натиснути на нього двічі */
  /* кролик поки відпочиває, замість нього кішка (нижче). повернути: bunnyEgg() і в L2 віддати його */
  function bunnyEgg() {
    var B = null, BW = 80, BH = 67, OFF = "l2bunnyOff";
    function touch() { return !!(window.matchMedia && matchMedia("(hover: none) and (pointer: coarse)").matches); }
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
      B.el.style.transform = "translate(" + (x - BW / 2) + "px," + (y - BH) + "px) rotate(" + (rot * B.dir) + "deg)";
      B.flip.style.transform = "scaleX(" + B.dir + ")";   /* розвертаємо тільки малюнок, щоб бульбашка з текстом не віддзеркалювалась */
      if (B.sayOn) fitSay(x);
    }
    /* бульбашка над кроликом (тільки на телефоні) */
    function say(text, ms) {
      if (!B || !B.say) return;
      B.say.textContent = text; B.sayOn = true; B.el.classList.add("say");
      fitSay(B.x);
      clearTimeout(B.sayT);
      B.sayT = setTimeout(function () { if (B) { B.sayOn = false; B.el.classList.remove("say"); } }, ms || 3500);
    }
    function fitSay(x) {   /* щоб бульбашка не вилазила за край екрана */
      var w = B.say.offsetWidth, left = x - w / 2, shift = 0;
      if (left < 8) shift = 8 - left; else if (left + w > innerWidth - 8) shift = innerWidth - 8 - left - w;
      B.say.style.transform = "translateX(calc(-50% + " + shift + "px))";
    }
    function start(x, y, pop) {
      if (B) return;
      var el = document.createElement("div");
      var tap = touch();
      el.className = "bunny" + (pop && !reduce ? " pop" : "") + (tap ? " touch" : ""); el.setAttribute("aria-hidden", "true");
      el.innerHTML = (tap ? '<span class="bunny-say"></span>' : "") + '<span class="bunny-flip">' + SVG + "</span>";
      document.body.appendChild(el);
      B = { el: el, flip: el.querySelector(".bunny-flip"), say: el.querySelector(".bunny-say"), dir: 1, leaving: false, lastTap: 0,
            x: Math.max(BW / 2, Math.min(x, innerWidth - BW / 2)), y: Math.max(BH + 10, Math.min(y, innerHeight - 8)) };
      B.tx = B.x; B.ty = B.y;
      place(B.x, B.y, 0);
      if (tap) {
        setTimeout(function () { say("Натисни на мене двічі, і я піду", 4500); }, pop && !reduce ? 550 : 0);
        /* подвійний дотик - кролик іде і більше не ховається, поки відкрита вкладка */
        el.addEventListener("pointerup", function () {
          if (!B || B.leaving) return;
          var now = Date.now();
          if (now - B.lastTap < 600) {
            say("Бувай!", 1500); leave();
            try { sessionStorage.setItem(OFF, "1"); } catch (e) {}
          } else say("Ще раз, і я піду", 2000);
          B.lastTap = now;
        });
      }
      if (pop && !reduce) setTimeout(function () { el.classList.remove("pop"); hop(); }, 520); else hop();
    }
    function leave() {
      if (!B) return;
      B.leaving = true; B.tx = innerWidth + 140; B.ty = B.y;
    }
    function target(px, py) {
      if (!B || B.leaving) return;
      var side = px < B.x ? 1 : -1;   /* сідає збоку від курсора, з того боку, звідки прибіг */
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
    document.addEventListener("pointerdown", function (e) {
      if (e.target.closest && e.target.closest(".bunny")) return;   /* тап по самому кролику його не зсуває, інакше вдруге не влучиш */
      target(e.clientX, e.clientY);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && B) leave(); });

    /* схованка: вушка визирають з-за верхнього краю випадкової картки */
    var peek = null, spot = null, hidden = false;   /* hidden = вже сховався (після того як вистрибнув, вдруге не ховаємо) */
    function cards() {
      return $$("main *").filter(function (el) {
        if (el.closest("dialog, .bunny-peek, .results, [hidden]")) return false;
        var shut = el.closest("details:not([open])");   /* за згорнутий блок можна, а всередину нього ні */
        if (shut && shut !== el) return false;
        var r = el.getBoundingClientRect();
        if (r.width < (innerWidth < 600 ? 120 : 180) || r.height < 70 || !inView(r)) return false;
        /* в каруселях не ховаємось, бо кролик опиниться за краєм екрана */
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
      /* картка зникла або поїхала за край (повернули телефон і т.д.) - шукаємо інше місце */
      if (!r || !r.width || !inView(r)) { peek.remove(); peek = null; hide(); return; }
      var x = Math.max(8, Math.min(r.left + r.width * 0.72 - 21, document.documentElement.clientWidth - 50));
      peek.style.left = (x + scrollX) + "px";
      peek.style.top = (r.top + scrollY - 21) + "px";
    }
    function hide() {
      try { if (sessionStorage.getItem(OFF)) { hidden = true; return; } } catch (e) {}
      var list = cards();
      if (!list.length) return;
      spot = list[Math.floor(Math.random() * list.length)];
      peek = document.createElement("button");
      peek.type = "button"; peek.className = "bunny-peek";
      peek.setAttribute("aria-label", "Схований кролик");
      peek.innerHTML = '<svg viewBox="0 0 60 32" aria-hidden="true">' +
        /* вушко = одна група, щоб біле і рожеве рухались разом */
        '<g class="ear" style="transform-origin:23px 27px"><g transform="rotate(-12 22 14)">' +
          '<ellipse cx="22" cy="14" rx="5.5" ry="13" fill="#fff" stroke="#8a93a6" stroke-width="2"/>' +
          '<ellipse cx="22" cy="14" rx="2.3" ry="9" fill="#ffb3c7"/></g></g>' +
        '<g class="ear ear-r" style="transform-origin:37px 27px"><g transform="rotate(12 38 14)">' +
          '<ellipse cx="38" cy="14" rx="5.5" ry="13" fill="#fff" stroke="#8a93a6" stroke-width="2"/>' +
          '<ellipse cx="38" cy="14" rx="2.3" ry="9" fill="#ffb3c7"/></g></g>' +
        '<circle cx="30" cy="40" r="17" fill="#fff" stroke="#8a93a6" stroke-width="2"/>' +
        '<circle cx="24" cy="30" r="2.3" fill="#16213a"/><circle cx="36" cy="30" r="2.3" fill="#16213a"/>' +
        "</svg>";
      document.body.appendChild(peek); hidden = true;
      placePeek();
      peek.addEventListener("click", function () {
        var p = peek, r = p.getBoundingClientRect();
        peek = null;
        /* виходить зі схованки: визирає, вистрибує і пружинить */
        p.classList.add("out");
        setTimeout(function () { p.remove(); start(r.left + r.width / 2, r.bottom, true); }, reduce ? 0 : 280);
      });
    }
    window.addEventListener("resize", placePeek);
    window.addEventListener("load", function () {
      setTimeout(function () {
        hide();
        setInterval(function () { if (!hidden) hide(); else placePeek(); }, 700);   /* не вийшло сховатись (наприклад, вкладка у фоні) - пробуємо ще раз */
      }, 1200);   /* картки виїжджають з анімацією, тому підлаштовуємось */
    });

    return { start: start, leave: leave, toggle: function (x, y) { if (B) leave(); else start(x, y); } };
  }

  /* пасхалка з кішкою (трибарвна, як наша)
     визирає вушками з-за якоїсь картки. натиснули - вистрибує, і курсор одразу стає лазерною указкою, вона стрибає за ним.
     натиснули на саму кішку - лазер вимикається / вмикається.
     Esc - кішка йде. на телефоні: тап - лазер, водиш пальцем; два тапи - йде. ще можна написати "кіт" в пошуку */
  var cat = (function () {
    var C = null, CW = 76, CH = 58, OFF = "l2catOff";
    var OR = "#d9894a", BL = "#2b2522", LN = "#8a93a6";
    function touch() { return !!(window.matchMedia && matchMedia("(hover: none) and (pointer: coarse)").matches); }
    /* мультяшна, в тому ж стилі що й кролик: кругла голова, оченята-крапки, рум'янець */
    var SVG = '<svg viewBox="0 0 130 100"><defs>' +
        '<clipPath id="l2cat-b"><ellipse cx="56" cy="72" rx="32" ry="20"/></clipPath>' +
        '<clipPath id="l2cat-h"><circle cx="86" cy="48" r="21"/></clipPath></defs>' +
        /* хвіст гачком, рудий з чорним кінчиком */
        '<g class="cat-tail"><path d="M28 74C12 72 8 54 18 44" fill="none" stroke="' + LN + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M28 74C12 72 8 54 18 44" fill="none" stroke="' + OR + '" stroke-width="8.5" stroke-linecap="round"/>' +
        '<path d="M14 51C14.5 48 16 46 18 44" fill="none" stroke="' + BL + '" stroke-width="8.5" stroke-linecap="round"/></g>' +
        '<g class="cat-body">' +
        '<ellipse cx="56" cy="72" rx="32" ry="20" fill="#fff"/>' +
        '<g clip-path="url(#l2cat-b)"><ellipse cx="46" cy="57" rx="18" ry="10" fill="' + OR + '"/><ellipse cx="28" cy="70" rx="9" ry="11" fill="' + BL + '"/></g>' +
        '<ellipse cx="56" cy="72" rx="32" ry="20" fill="none" stroke="' + LN + '" stroke-width="2.5"/>' +
        /* вушка: ліве чорне, праве руде */
        '<path d="M68 40 71 19 84 30Z" fill="' + BL + '" stroke="' + LN + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M72 33 73 24 79 29Z" fill="#ffb3c7"/>' +
        '<path d="M89 29 102 18 105 39Z" fill="' + OR + '" stroke="' + LN + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M94 29 100.5 23.5 102 33Z" fill="#ffb3c7"/>' +
        '<circle cx="86" cy="48" r="21" fill="#fff"/>' +
        '<g clip-path="url(#l2cat-h)"><ellipse cx="73" cy="31" rx="14" ry="10" fill="' + BL + '"/><ellipse cx="101" cy="32" rx="13" ry="9" fill="' + OR + '"/></g>' +
        '<circle cx="86" cy="48" r="21" fill="none" stroke="' + LN + '" stroke-width="2.5"/>' +
        /* оченята, рум'янець, носик, ротик */
        '<circle cx="80" cy="49" r="3.4" fill="#16213a"/><circle cx="81.2" cy="47.7" r="1.2" fill="#fff"/>' +
        '<circle cx="95" cy="49" r="3.4" fill="#16213a"/><circle cx="96.2" cy="47.7" r="1.2" fill="#fff"/>' +
        '<ellipse cx="76" cy="56" rx="3.6" ry="2.2" fill="#ffb3c7" opacity=".75"/><ellipse cx="99.5" cy="56" rx="3.6" ry="2.2" fill="#ffb3c7" opacity=".75"/>' +
        '<path d="M85.8 53.6h3.6l-1.8 2.1z" fill="#ff7aa2"/>' +
        '<path d="M87.6 55.8q-1 1.9-2.6 1.1M87.6 55.8q1 1.9 2.6 1.1" fill="none" stroke="' + LN + '" stroke-width="1.1" stroke-linecap="round"/>' +
        '<path d="M106 52.5 113 51M106 56 113 57" stroke="' + LN + '" stroke-width="1" stroke-linecap="round"/>' +
        "</g>" +
        '<ellipse cx="42" cy="92" rx="11" ry="5" fill="#fff" stroke="' + LN + '" stroke-width="2.5"/>' +
        '<ellipse cx="74" cy="92" rx="9" ry="4.5" fill="#fff" stroke="' + LN + '" stroke-width="2.5"/>' +
      "</svg>";

    function place(x, y, rot) {
      C.el.style.transform = "translate(" + (x - CW / 2) + "px," + (y - CH) + "px) rotate(" + (rot * C.dir) + "deg)";
      C.flip.style.transform = "scaleX(" + C.dir + ")";
      if (C.sayOn) fitSay(x);
    }
    function say(text, ms) {
      if (!C) return;
      C.say.textContent = text; C.sayOn = true; C.el.classList.add("say");
      fitSay();
      clearTimeout(C.sayT);
      C.sayT = setTimeout(function () { if (C) { C.sayOn = false; C.el.classList.remove("say"); } }, ms || 3500);
    }
    function fitSay(x) {   /* щоб бульбашка не вилазила за край екрана */
      var w = C.say.offsetWidth, left = (x == null ? C.x : x) - w / 2, shift = 0;
      if (left < 8) shift = 8 - left; else if (left + w > innerWidth - 8) shift = innerWidth - 8 - left - w;
      C.say.style.transform = "translateX(calc(-50% + " + shift + "px))";
    }

    /* лазер */
    var dot = null;
    function laser(on, x, y) {   /* x, y - де зараз курсор, щоб точка з'явилась одразу */
      if (!C) return;
      if (x != null) { C.mx = x; C.my = y; }
      C.laser = on;
      C.el.classList.toggle("hunt", on);
      document.documentElement.classList.toggle("cat-laser-on", on && !C.tap);
      if (on && !dot) {
        dot = document.createElement("div"); dot.className = "cat-laser"; dot.setAttribute("aria-hidden", "true");
        document.body.appendChild(dot);
      }
      if (dot) dot.hidden = !on;
      if (on && C.mx != null) aim(C.mx, C.my);
    }
    function aim(px, py) {
      C.mx = px; C.my = py;
      if (dot) dot.style.transform = "translate(" + px + "px," + py + "px)";
      if (!C.laser || C.leaving) return;
      var side = px >= C.x ? 1 : -1;   /* підбігає збоку, мордочкою до точки */
      C.tx = Math.max(CW / 2, Math.min(innerWidth - CW / 2, px - side * 30));
      C.ty = Math.max(CH, Math.min(innerHeight - 4, py + 12));
    }

    function start(x, y, pop, lx, ly) {   /* lx, ly - якщо є, лазер вмикається одразу в цій точці */
      if (C) return;
      var el = document.createElement("div"), tap = touch();
      el.className = "cat" + (pop && !reduce ? " pop" : "") + (tap ? " touch" : ""); el.setAttribute("aria-hidden", "true");
      el.innerHTML = '<span class="cat-say"></span><span class="cat-flip">' + SVG + "</span>";
      document.body.appendChild(el);
      C = { el: el, flip: el.querySelector(".cat-flip"), say: el.querySelector(".cat-say"), dir: 1, tap: tap, laser: false, leaving: false,
            lastTap: 0, mx: null, my: null,
            x: Math.max(CW / 2, Math.min(x, innerWidth - CW / 2)), y: Math.max(CH + 10, Math.min(y, innerHeight - 8)) };
      C.tx = C.x; C.ty = C.y;
      place(C.x, C.y, 0);
      if (lx != null) laser(true, lx, ly);
      setTimeout(function () { say("Мяу!", 2000); }, pop && !reduce ? 550 : 0);
      el.addEventListener("click", function (e) {
        if (!C || C.leaving) return;
        if (C.tap) {   /* телефон: перший тап - лазер, два тапи підряд - йде */
          var now = Date.now();
          if (now - C.lastTap < 600) {
            say("Мяу!", 1500); leave();
            try { sessionStorage.setItem(OFF, "1"); } catch (e) {}
          } else if (!C.laser) { laser(true, e.clientX, e.clientY); say("Мяу!", 2000); }
          else say("Мяу!", 2000);
          C.lastTap = now;
          return;
        }
        laser(!C.laser, e.clientX, e.clientY);
        say("Мяу!", 2000);
      });
      if (pop && !reduce) setTimeout(function () { if (C) { C.el.classList.remove("pop"); hop(); } }, 520); else hop();
    }
    function leave() {
      if (!C) return;
      laser(false);
      C.leaving = true; C.tx = C.x < innerWidth / 2 ? -120 : innerWidth + 120; C.ty = C.y;
    }
    /* стрибає як кролик: дуга до цілі, приземлилась - наступна. за лазером - швидше */
    function hop() {
      if (!C) return;
      var dx = C.tx - C.x, dy = C.ty - C.y, d = Math.sqrt(dx * dx + dy * dy);
      if (C.leaving && (C.x < -90 || C.x > innerWidth + 90)) { C.el.remove(); C = null; return; }
      C.el.classList.toggle("wag", C.laser && d < 14);   /* добігла до лазера - сидить і махає хвостиком */
      if (d < 14) { setTimeout(hop, 120); return; }
      if (Math.abs(dx) > 4) C.dir = dx < 0 ? -1 : 1;
      var step = Math.min(d, reduce ? 60 : (C.laser ? 150 : 120)), x0 = C.x, y0 = C.y,
          x1 = x0 + dx / d * step, y1 = y0 + dy / d * step,
          dur = reduce ? 260 : (C.laser ? 320 : 380), h = reduce ? 0 : 20 + step * 0.2, t0 = null;
      requestAnimationFrame(function frame(now) {
        if (!C) return;
        if (t0 === null) t0 = now;
        var t = Math.min(1, (now - t0) / dur), arc = Math.sin(Math.PI * t);
        place(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - arc * h, reduce ? 0 : -8 * arc);
        if (t < 1) { requestAnimationFrame(frame); return; }
        C.x = x1; C.y = y1;
        if (!reduce) { var el = C.el; el.classList.add("land"); setTimeout(function () { el.classList.remove("land"); }, 130); }
        setTimeout(hop, reduce ? 30 : (C.laser ? 50 : 90));
      });
    }
    document.addEventListener("pointermove", function (e) {
      if (!C) return;
      if (C.laser) aim(e.clientX, e.clientY);
      else { C.mx = e.clientX; C.my = e.clientY; if (!C.leaving && Math.abs(e.clientX - C.x) > 20) { C.dir = e.clientX < C.x ? -1 : 1; C.flip.style.transform = "scaleX(" + C.dir + ")"; } }   /* просто дивиться на мишку */
    });
    document.addEventListener("pointerdown", function (e) {
      if (!C || (e.target.closest && e.target.closest(".cat"))) return;
      if (C.laser) aim(e.clientX, e.clientY);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && C) leave(); });

    /* схованка: вушка визирають з-за верхнього краю випадкової картки */
    var peek = null, spot = null, hidden = false;
    function cards() {
      return $$("main *").filter(function (el) {
        if (el.closest("dialog, .cat-peek, .results, [hidden]")) return false;
        var shut = el.closest("details:not([open])");
        if (shut && shut !== el) return false;
        var r = el.getBoundingClientRect();
        if (r.width < (innerWidth < 600 ? 120 : 180) || r.height < 70 || !inView(r)) return false;
        if (!shown(el, r)) return false;
        var s = getComputedStyle(el);
        return parseFloat(s.borderTopLeftRadius) >= 10 && s.position !== "fixed" &&
          (s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.backgroundImage !== "none");
      });
    }
    /* картку справді видно: не в згорнутому акордеоні (там вона є, але обрізана і visibility:hidden), не в каруселі */
    function shown(el, r) {
      if (getComputedStyle(el).visibility !== "visible") return false;
      for (var a = el.parentElement; a && a.tagName !== "MAIN"; a = a.parentElement) {
        var st = getComputedStyle(a);
        if (/auto|scroll/.test(st.overflowX)) return false;
        if (/hidden|clip/.test(st.overflowY + st.overflowX)) {
          var ar = a.getBoundingClientRect();
          if (r.top < ar.top - 1 || r.top > ar.bottom - 20) return false;
        }
      }
      return true;
    }
    function inView(r) { return r.left >= 0 && r.right <= document.documentElement.clientWidth; }
    function placePeek() {
      if (!peek) return;
      var r = spot && document.contains(spot) ? spot.getBoundingClientRect() : null;
      if (!r || !r.width || !inView(r) || !shown(spot, r)) { peek.remove(); peek = null; hide(); return; }
      var x = Math.max(8, Math.min(r.left + r.width * 0.72 - 23, document.documentElement.clientWidth - 54));
      peek.style.left = (x + scrollX) + "px";
      peek.style.top = (r.top + scrollY - 23) + "px";
    }
    function hide() {
      try { if (sessionStorage.getItem(OFF)) { hidden = true; return; } } catch (e) {}
      var list = cards();
      if (!list.length) return;
      spot = list[Math.floor(Math.random() * list.length)];
      peek = document.createElement("button");
      peek.type = "button"; peek.className = "cat-peek";
      peek.setAttribute("aria-label", "Схована кішка");
      peek.innerHTML = '<svg viewBox="0 0 60 32" aria-hidden="true"><defs><clipPath id="l2cat-p"><circle cx="30" cy="42" r="18"/></clipPath></defs>' +
        '<g class="ear" style="transform-origin:20px 28px"><path d="M12 30 15 7 27 22Z" fill="' + BL + '" stroke="' + LN + '" stroke-width="2" stroke-linejoin="round"/>' +
          '<path d="M16 25 17 15 22 22Z" fill="#ffb3c7"/></g>' +
        '<g class="ear ear-r" style="transform-origin:40px 28px"><path d="M33 22 45 7 48 30Z" fill="' + OR + '" stroke="' + LN + '" stroke-width="2" stroke-linejoin="round"/>' +
          '<path d="M38 22 43 15 44 25Z" fill="#ffb3c7"/></g>' +
        '<circle cx="30" cy="42" r="18" fill="#fff"/>' +
        '<g clip-path="url(#l2cat-p)"><ellipse cx="18" cy="27" rx="14" ry="9" fill="' + BL + '"/><ellipse cx="43" cy="27" rx="13" ry="9" fill="' + OR + '"/>' +
          '<ellipse cx="30" cy="30" rx="3" ry="9" fill="#fff"/></g>' +
        '<circle cx="30" cy="42" r="18" fill="none" stroke="' + LN + '" stroke-width="2"/>' +
        '<circle cx="23" cy="31" r="2.6" fill="#16213a"/><circle cx="24" cy="30" r=".9" fill="#fff"/>' +
        '<circle cx="37" cy="31" r="2.6" fill="#16213a"/><circle cx="38" cy="30" r=".9" fill="#fff"/>' +
        "</svg>";
      document.body.appendChild(peek); hidden = true;
      placePeek();
      peek.addEventListener("click", function (e) {
        var p = peek, r = p.getBoundingClientRect(), lx = e.clientX, ly = e.clientY;
        peek = null;
        p.classList.add("out");
        setTimeout(function () { p.remove(); start(r.left + r.width / 2, r.bottom, true, lx, ly); }, reduce ? 0 : 280);
      });
    }
    window.addEventListener("resize", placePeek);
    window.addEventListener("load", function () {
      setTimeout(function () {
        hide();
        setInterval(function () { if (!hidden) hide(); else placePeek(); }, 700);
      }, 1200);
    });

    return { start: start, leave: leave, toggle: function (x, y) { if (C) leave(); else start(x, y); } };
  })();

  /* ряд карток з прокруткою і стрілками по боках (головна: "Що потрібно", гуртки).
     стрілки гортають на ширину видимих карток, на краях ховаються */
  function rail(list, prev, next) {
    function paint() {
      var max = list.scrollWidth - list.clientWidth;
      prev.disabled = list.scrollLeft <= 2;
      next.disabled = list.scrollLeft >= max - 2;
    }
    function slide(dir) {
      var li = list.children[0], gap = parseFloat(getComputedStyle(list).columnGap) || 16;
      var step = li ? li.getBoundingClientRect().width + gap : 240;
      var per = Math.max(1, Math.floor((list.clientWidth + gap) / step));
      list.scrollBy({ left: dir * per * step, behavior: reduce ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { slide(-1); });
    next.addEventListener("click", function () { slide(1); });
    var raf = 0;
    list.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }, { passive: true });
    window.addEventListener("resize", paint);
    paint();
    return { reset: function () { list.scrollLeft = 0; paint(); } };
  }

  window.L2 = { $: $, $$: $$, esc: esc, ICON: ICON, restart: restart, plural: plural,
    reduce: reduce, mailto: mailto, openGame: openGame,
    photoHTML: photoHTML, imgSize: imgSize, lightbox: lightbox, postForm: postForm, rail: rail, lightboxOpen: function () { return !!(lb && lb.open); }, bunny: cat };
})();
