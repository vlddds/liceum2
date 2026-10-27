/* Фотоальбом ліцею (albums.html): одна книга, яку відкривають і гортають (StPageFlip, як газета).
   Фото збираються самі з усього сайту - нічого руками в альбом класти не треба:
     - дописи «Життя ліцею» з гугл-таблиці (ті самі, що на сторінці новин), нові першими;
     - фото головної сторінки (photos у js/data.js);
     - заповнені галереї розділів (js/sections/*.js).
   Близькі до квадрата кадри - полароїди на скотчі з підписом у рамці,
   широкі й високі - звичайні надруковані фото у своїх пропорціях, з куточками й підписом поруч. */
(function () {
  "use strict";

  var L = window.L2, D = window.SITE_DATA || {}, PF = window.St && window.St.PageFlip;
  if (!L) return;
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, plural = L.plural;
  var SIZES = window.IMG_SIZES || {};
  var TILT = [-2.6, 1.8, -1.2, 2.4, -1.8, 1.1, -0.7, 2.1];

  /* 1. збираємо фото */
  var seen = {}, photos = [];
  function add(src, caption, from) {
    if (!src || seen[src]) return;
    seen[src] = 1;
    photos.push({ src: src, caption: caption || "", from: from });
  }
  function fromSite() {
    (D.photos || []).forEach(function (p) { if (p) add(p.src, p.caption, "home"); });
    var S = window.SECTIONS || {};
    Object.keys(S).forEach(function (k) {
      (S[k].items || []).forEach(function (it) {
        (it.blocks || []).forEach(function (b) {
          if (b.type !== "gallery") return;
          (b.items || []).forEach(function (s) {
            if (s && typeof s === "object") add(s.src, s.caption || it.title, k);
            else add(s, it.title, k);
          });
        });
      });
    });
  }
  /* «Життя ліцею»: той самий запит і кеш, що й на сторінці новин (js/news-tabs.js) */
  function fromLife() {
    var C = D.config || {}, feed = C.lifeEndpoint || C.reviewEndpoint || C.formEndpoint || "";
    if (!feed || !/script\.google\.com/.test(feed) || !window.fetch) return Promise.resolve([]);
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem("l2life") || "null"); } catch (e) {}
    if (cached && Date.now() - cached.t < 2 * 60 * 1000) return Promise.resolve(cached.list || []);
    return Promise.race([
      fetch(feed + (feed.indexOf("?") > -1 ? "&" : "?") + "action=life").then(function (r) { if (!r.ok) throw 0; return r.json(); }),
      new Promise(function (_, no) { setTimeout(no, 6000); })
    ]).then(function (list) {
      try { sessionStorage.setItem("l2life", JSON.stringify({ t: Date.now(), list: list })); } catch (e) {}
      return Array.isArray(list) ? list : [];
    }).catch(function () { return cached && cached.list ? cached.list : []; });
  }
  var NOT_PHOTO = /youtube\.com|youtu\.be|photos\.app\.goo\.gl|photos\.google\.com|drive\.google\.com\/(drive\/)?(u\/\d+\/)?folders/i;

  /* 2. вид фото: полароїд (близький до квадрата) чи надруковане фото (свої пропорції) */
  function shape(p) {
    var s = SIZES[p.src], r = s ? s[0] / s[1] : p.from === "life" ? 1.33 : 1.5;
    p.ratio = r;
    p.kind = r >= 0.78 && r <= 1.35 ? "pol" : r > 1.35 ? "wide" : "tall";
    return p;
  }

  /* 3. розкладка по сторінках: сітка 2×2. wide - на всю ширину (2 клітинки), tall - на всю висоту (2), полароїд - 1.
     Широке й високе разом не вміщаються. Якщо наступне фото не лізе, на вільне місце беремо найближче,
     яке влазить (дивимось на кілька фото вперед), щоб не лишалось пів порожньої сторінки. */
  function fits(pg, p) {
    var cost = p.kind === "pol" ? 1 : 2;
    if (pg.w + cost > 4) return false;
    if (p.kind === "wide" && pg.tall) return false;
    if (p.kind === "tall" && pg.wide) return false;
    return true;
  }
  function paginate(list) {
    var queue = list.slice(), pages = [];
    while (queue.length) {
      var pg = { items: [], w: 0, wide: 0, tall: 0 };
      for (var i = 0; i < queue.length && i < 6 && pg.w < 4; i++) {
        var p = queue[i];
        if (!fits(pg, p)) continue;
        pg.items.push(p); pg.w += p.kind === "pol" ? 1 : 2;
        if (p.kind === "wide") pg.wide++;
        if (p.kind === "tall") pg.tall++;
        queue.splice(i, 1); i--;
      }
      pages.push(pg);
    }
    return pages;
  }

  function item(p, i) {
    var tilt = TILT[i % TILT.length], cap = esc(p.caption);
    var img = '<img src="' + esc(p.src) + '" alt="' + cap + '"' + L.imgSize(p.src) + ' loading="lazy" decoding="async" draggable="false"' +
      (/^https?:/i.test(p.src) ? ' referrerpolicy="no-referrer"' : "") + ">";   /* Google Фото без цього не віддає картинку */
    if (p.kind === "pol") {
      return '<button type="button" class="ph pol" data-k="' + p.k + '" style="--tilt:' + tilt + 'deg" aria-label="Відкрити фото: ' + cap + '">' +
        '<span class="ph-img">' + img + "</span>" + (p.caption ? '<span class="ph-cap" aria-hidden="true">' + cap + "</span>" : "") + "</button>";
    }
    return '<figure class="ph print ' + p.kind + '" style="--tilt:' + tilt * 0.6 + 'deg">' +
      '<button type="button" class="ph-btn" data-k="' + p.k + '" aria-label="Відкрити фото: ' + cap + '"><span class="ph-img" style="aspect-ratio:' + p.ratio.toFixed(3) + '">' + img +
      '<i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i></span></button>' +
      (p.caption ? '<figcaption class="ph-note">' + cap + "</figcaption>" : "") + "</figure>";
  }

  /* 4. сторінка */
  var main = $("#main");
  main.innerHTML =
    '<section class="ab-top" aria-labelledby="h1"><div class="wrap">' +
      '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span><span aria-current="page">Фотоальбом</span></nav>' +
      '<h1 id="h1">Фотоальбом ліцею</h1>' +
      '<p class="gz-meta" id="ab-count">Збираємо фото…</p>' +
    "</div></section>" +
    '<div class="wrap ab-wrap"><div class="ab-desk" id="ab-desk"><div class="gz-skel-book" aria-hidden="true"><i></i><i></i></div></div>' +
    '<div class="gz-bar ab-bar" role="toolbar" aria-label="Гортати альбом" hidden>' +
      '<button class="gz-btn" id="ab-prev" type="button" aria-label="Попередня сторінка">' + ICON("chev") + "</button>" +
      '<span class="gz-num" id="ab-num" aria-live="polite"></span>' +
      '<button class="gz-btn" id="ab-next" type="button" aria-label="Наступна сторінка">' + ICON("chev") + "</button>" +
    "</div>" +
    '<p class="ab-hint">Нові фото з\'являються в альбомі самі: щойно їх додали на сайт.</p></div>';
  document.title = "Фотоальбом · Підгородненський Ліцей №2";

  fromSite();
  fromLife().then(function (posts) {
    /* дописи «Життя ліцею» - найсвіжіші, тож першими */
    var site = photos.splice(0, photos.length);
    seen = {};
    posts.forEach(function (post) {
      (post.photos || []).forEach(function (u) { if (!NOT_PHOTO.test(u)) add(u, post.title, "life"); });
    });
    site.forEach(function (p) { add(p.src, p.caption, p.from); });
    photos.forEach(function (p, k) { p.k = k; shape(p); });
    build();
  });

  function build() {
    var desk = $("#ab-desk"), n = photos.length;
    $("#ab-count").textContent = n ? n + " " + plural(n, "фото", "фото", "фото") + " · натисніть на обкладинку, щоб відкрити" : "Фото скоро з'являться";
    var pages = paginate(photos);
    /* після обкладинки - форзац; у PageFlip з обкладинкою кількість сторінок має бути парною */
    var inner = ['<div class="ab-pg ab-fly"><p class="ab-fly-t">Ліцей №2<br>Підгородне</p><p class="ab-fly-s">Тут живуть наші свята, уроки, перемоги й просто гарні дні.</p></div>']
      .concat(pages.map(function (pg, i) {
        return '<div class="ab-pg"><div class="ab-grid">' + pg.items.map(function (p) { return item(p, p.k); }).join("") + "</div>" +
          '<span class="ab-pn" aria-hidden="true">' + (i + 1) + "</span></div>";
      }));
    if (inner.length % 2) inner.push('<div class="ab-pg ab-end"><p>Далі буде…</p></div>');
    var html = '<div class="ab-pg ab-cover" data-density="hard"><div class="ab-cover-in"><span class="ab-cover-k">Фотоальбом</span>' +
        '<b class="ab-cover-t">Ліцей №2</b><span class="ab-cover-s">Підгородненської міської ради</span>' +
        '<span class="ab-cover-open">' + ICON("book") + "Відкрити</span></div></div>" +
      inner.join("") +
      '<div class="ab-pg ab-cover ab-back" data-density="hard"><div class="ab-cover-in"><span class="ab-cover-s">Ліцей №2 · Підгородне</span></div></div>';
    desk.innerHTML = '<div class="gz-fit" id="ab-fit"><div class="ab-book" id="ab-book">' + html + "</div></div>";

    if (!PF) { desk.classList.add("no-flip"); return; }
    var W = 560, H = 760, ratio = W / H, box = $("#ab-fit");
    var phone = function () { return window.matchMedia("(max-width: 768px)").matches; };
    function fit() {
      if (phone()) { box.style.maxWidth = ""; return; }
      box.style.maxWidth = Math.max(560, Math.floor((window.innerHeight - 200) * 2 * ratio)) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    var minW = phone() ? Math.ceil(desk.clientWidth / 2) + 20 : 220;
    var flip = new PF($("#ab-book"), {
      width: W, height: H, size: "stretch", minWidth: minW, maxWidth: 900, minHeight: Math.round(minW / ratio), maxHeight: Math.round(900 / ratio),
      showCover: true, usePortrait: true, mobileScrollSupport: true, maxShadowOpacity: 0.4, flippingTime: L.reduce ? 1 : 800, showPageCorners: !phone(),
      disableFlipByClick: true   /* клік по фото відкриває фото, а гортають свайпом, стрілками й кутиками */
    });
    flip.loadFromHTML($$(".ab-pg", desk));
    if (/[?&]debug=1\b/.test(location.search)) window.__abFlip = flip;

    var bar = $(".ab-bar"), num = $("#ab-num"), total = flip.getPageCount();
    bar.hidden = false;
    function status() {
      var i = flip.getCurrentPageIndex();
      var two = flip.getOrientation() === "landscape";
      num.textContent = i === 0 ? "Обкладинка" : i >= total - 1 ? "Кінець альбому" :
        (two ? "Сторінки " + i + "–" + Math.min(i + 1, total - 2) : "Сторінка " + i) + " з " + (total - 2);
      $("#ab-prev").disabled = i <= 0;
      $("#ab-next").disabled = i >= total - 1;
      desk.classList.toggle("closed", i === 0);
    }
    flip.on("flip", status);
    flip.on("init", status);
    flip.on("changeOrientation", status);
    setTimeout(status, 50);
    $("#ab-prev").addEventListener("click", function () { flip.flipPrev(); });
    $("#ab-next").addEventListener("click", function () { flip.flipNext(); });
    document.addEventListener("keydown", function (e) {
      if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "") || L.lightboxOpen()) return;
      if (e.key === "ArrowLeft") flip.flipPrev();
      if (e.key === "ArrowRight") flip.flipNext();
    });

    /* клік по фото - на весь екран (гортаються всі фото альбому); по обкладинці - відкрити */
    desk.addEventListener("click", function (e) {
      var b = e.target.closest("[data-k]");
      if (b) {
        e.stopPropagation();
        L.lightbox(photos.map(function (p) { return { src: p.src, caption: p.caption }; }), +b.getAttribute("data-k"), function () { b.focus({ preventScroll: true }); });
        return;
      }
      var c = e.target.closest(".ab-cover");
      if (c) { if (c.classList.contains("ab-back")) flip.flipPrev(); else flip.flipNext(); }
    }, true);
  }
})();
