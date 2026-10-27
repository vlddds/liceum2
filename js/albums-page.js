/* Фотоальбом ліцею (albums.html): одна книга, яку відкривають і гортають (StPageFlip, як газета).
   Фото збираються самі з усього сайту - нічого руками в альбом класти не треба:
     - аркуш «Фото» в гугл-таблиці сайту: посилання на фото, папки Диска чи альбоми Google Фото з підписами;
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
  var TILT = [-1.4, 0.9, -0.6, 1.2, -1, 0.5, -0.3, 1.1];   /* легкий нахил, щоб було живо, але рівно */

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
  /* дані з гугл-таблиці сайту (той самий скрипт, що й для відгуків): кеш 2 хв, чекаємо не довше 6 с.
     action=life - «Життя ліцею» (той самий запит і кеш, що на сторінці новин), action=photos - аркуш «Фото» */
  function fromSheet(action, key) {
    var C = D.config || {}, feed = C.lifeEndpoint || C.reviewEndpoint || C.formEndpoint || "";
    if (!feed || !/script\.google\.com/.test(feed) || !window.fetch) return Promise.resolve([]);
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key) || "null"); } catch (e) {}
    if (cached && Date.now() - cached.t < 2 * 60 * 1000) return Promise.resolve(cached.list || []);
    return Promise.race([
      fetch(feed + (feed.indexOf("?") > -1 ? "&" : "?") + "action=" + action).then(function (r) { if (!r.ok) throw 0; return r.json(); }),
      new Promise(function (_, no) { setTimeout(no, 6000); })
    ]).then(function (list) {
      if (!Array.isArray(list)) throw 0;   /* старий скрипт без action=photos віддає {ok:true} */
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), list: list })); } catch (e) {}
      return list;
    }).catch(function () { return cached && cached.list ? cached.list : []; });
  }
  var NOT_PHOTO = /youtube\.com|youtu\.be|photos\.app\.goo\.gl|photos\.google\.com|drive\.google\.com\/(drive\/)?(u\/\d+\/)?folders/i;

  /* 2. вид фото. Нічого не обрізаємо: і полароїд, і надруковане фото показують кадр у його пропорціях.
     Звичайні кадри (від 3:4 до 4:3, разом з квадратними) - полароїд з білою рамкою й підписом знизу;
     дуже широкі (16:9, панорами) - надруковане фото на дві клітинки, дуже високі - на дві клітинки вниз.
     Розміри фото з сайту знаємо (js/img-sizes.js), а для фото з Диска/Google Фото спершу вантажимо
     крихітну мініатюру й дивимось на неї. Не вдалось дізнатись - надруковане широке: так нічого не обріжеться. */
  function shape(p, r) {
    p.ratio = r || 1.5;
    p.kind = p.ratio >= 0.7 && p.ratio <= 1.45 ? "pol" : p.ratio > 1.45 ? "wide" : "tall";
    return p;
  }
  function small(src) {
    /* мініатюра Диска: та сама адреса з меншим розміром; Google Фото (lh3): параметр розміру після «=» */
    if (/drive\.google\.com\/thumbnail/.test(src)) return src.replace(/([?&]sz=)w\d+/, "$1w120");
    if (/googleusercontent\.com\//.test(src)) return src.replace(/=[^/=]*$/, "") + "=w120";
    return src;
  }
  function measure(p) {
    var s = SIZES[p.src];
    if (s) return Promise.resolve(shape(p, s[0] / s[1]));
    return new Promise(function (ok) {
      var im = new Image(), done = function (r) { if (!im._d) { im._d = 1; ok(shape(p, r)); } };
      im.referrerPolicy = "no-referrer";
      im.onload = function () { done(im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 0); };
      im.onerror = function () { done(0); };
      setTimeout(function () { done(0); }, 5000);
      im.src = small(p.src);
    });
  }

  /* 3. розкладка по сторінках. ПК - альбомні сторінки (8:7, щоб розворот був вищим), сітка 3×2; телефон - книжкові, 2×2 (інакше фото надто дрібні).
     полароїд - 1 клітинка, широке фото - 2 поруч, високе - 2 одна над одною.
     Розставляємо по клітинках самі (а не як вирішить браузер): якщо наступне фото не влазить,
     беремо найближче, що влазить (до 8 фото вперед), щоб не лишалось порожніх місць. */
  var GRID = window.matchMedia("(max-width: 768px)").matches ? { cols: 2, rows: 2, W: 600, H: 800 } : { cols: 3, rows: 2, W: 800, H: 700 };
  function span(p) { return p.kind === "wide" ? [1, 2] : p.kind === "tall" ? [2, 1] : [1, 1]; }   /* [рядки, колонки] */
  function place(pg, p) {
    var sz = span(p);
    for (var r = 0; r + sz[0] <= GRID.rows; r++) {
      for (var c = 0; c + sz[1] <= GRID.cols; c++) {
        var free = true;
        for (var y = r; y < r + sz[0] && free; y++) for (var x = c; x < c + sz[1]; x++) if (pg.taken[y * GRID.cols + x]) { free = false; break; }
        if (!free) continue;
        for (y = r; y < r + sz[0]; y++) for (x = c; x < c + sz[1]; x++) pg.taken[y * GRID.cols + x] = 1;
        pg.items.push({ p: p, r: r + 1, c: c + 1, rs: sz[0], cs: sz[1] });
        return true;
      }
    }
    return false;
  }
  function paginate(list) {
    var queue = list.slice(), pages = [], cells = GRID.cols * GRID.rows;
    while (queue.length) {
      var pg = { items: [], taken: [] };
      for (var i = 0; i < queue.length && i < 8 && pg.items.length < cells; i++) {
        if (place(pg, queue[i])) { queue.splice(i, 1); i--; }
      }
      if (!pg.items.length) place(pg, queue.shift());   /* на всяк випадок, щоб не зациклитись */
      pages.push(pg);
    }
    return pages;
  }

  function item(p, i) {
    var tilt = TILT[i % TILT.length], cap = esc(p.caption);
    var img = '<img src="' + esc(p.src) + '" alt="' + cap + '"' + L.imgSize(p.src) + ' loading="lazy" decoding="async" draggable="false"' +
      (/^https?:/i.test(p.src) ? ' referrerpolicy="no-referrer"' : "") + ">";   /* Google Фото без цього не віддає картинку */
    if (p.kind === "pol") {
      /* рамку полароїда беремо одного з трьох форматів (3:4, квадрат, 4:3) - так полароїди в ряду однакові, а зайве по краях трохи обрізається */
      var pr = [0.75, 1, 4 / 3].reduce(function (a, b) { return Math.abs(b - p.ratio) < Math.abs(a - p.ratio) ? b : a; });
      return '<button type="button" class="ph pol" data-k="' + p.k + '" style="--tilt:' + tilt + "deg;--r:" + pr.toFixed(3) + '" title="' + cap + '" aria-label="Відкрити фото: ' + cap + '">' +
        '<span class="ph-img">' + img + "</span>" + (p.caption ? '<span class="ph-cap' + (p.caption.length > 55 ? " long xlong" : p.caption.length > 28 ? " long" : "") + '" aria-hidden="true"><span>' + cap + "</span></span>" : "") + "</button>";
    }
    return '<figure class="ph print ' + p.kind + '" style="--tilt:' + (tilt * 0.5).toFixed(2) + 'deg">' +
      '<button type="button" class="ph-btn" data-k="' + p.k + '" aria-label="Відкрити фото: ' + cap + '"><span class="ph-img" style="aspect-ratio:' + p.ratio.toFixed(3) + '">' + img +
      '<i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i></span></button>' +
      (p.caption ? '<figcaption class="ph-note' + (p.caption.length > 45 ? " long" : "") + '">' + cap + "</figcaption>" : "") + "</figure>";
  }

  /* 4. сторінка */
  var main = $("#main");
  main.innerHTML =
    '<section class="ab-top" aria-labelledby="h1"><div class="wrap">' +
      '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span><span aria-current="page">Фотоальбом</span></nav>' +
      '<h1 id="h1">Фотоальбом ліцею</h1>' +
      '<p class="gz-meta" id="ab-count">Збираємо фото…</p>' +
    "</div></section>" +
    '<div class="wrap ab-wrap"><div class="ab-desk" id="ab-desk"><div class="gz-skel-book" aria-hidden="true"><i></i><i></i></div></div></div>';
  document.title = "Фотоальбом · Підгородненський Ліцей №2";

  fromSite();
  Promise.all([fromSheet("photos", "l2photos"), fromSheet("life", "l2life")]).then(function (res) {
    /* спершу аркуш «Фото», далі дописи «Життя ліцею», далі фото з самого сайту */
    var site = photos.splice(0, photos.length), posts = res[1];
    seen = {};
    res[0].forEach(function (p) { if (p && p.src && !NOT_PHOTO.test(p.src)) add(p.src, p.caption, "sheet"); });
    posts.forEach(function (post) {
      (post.photos || []).forEach(function (u) { if (!NOT_PHOTO.test(u)) add(u, post.title, "life"); });
    });
    site.forEach(function (p) { add(p.src, p.caption, p.from); });
    photos.forEach(function (p, k) { p.k = k; });
    Promise.all(photos.map(measure)).then(build);
  });

  function build() {
    var desk = $("#ab-desk"), n = photos.length;
    $("#ab-count").textContent = n ? n + " " + plural(n, "фото", "фото", "фото") + " · натисніть на обкладинку, щоб відкрити" : "Фото скоро з'являться";
    var pages = paginate(photos);
    /* після обкладинки - форзац; у PageFlip з обкладинкою кількість сторінок має бути парною */
    var inner = ['<div class="ab-pg ab-fly"><p class="ab-fly-t">Ліцей №2<br>Підгородне</p><p class="ab-fly-s">Тут живуть наші свята, уроки, перемоги й просто гарні дні.</p></div>']
      .concat(pages.map(function (pg, i) {
        return '<div class="ab-pg"><div class="ab-grid" style="--cols:' + GRID.cols + ";--rows:" + GRID.rows + '">' + pg.items.map(function (x) {
            return '<div class="ab-cell" style="grid-area:' + x.r + " / " + x.c + " / span " + x.rs + " / span " + x.cs + '">' + item(x.p, x.p.k) + "</div>";
          }).join("") + "</div>" +
          '<span class="ab-pn" aria-hidden="true">' + (i + 1) + "</span></div>";
      }));
    /* остання сторінка перед задньою обкладинкою; сторінок усередині має бути парно - якщо ні, перед нею чистий аркуш */
    var last = '<div class="ab-pg ab-end"><div class="ab-end-in"><p class="ab-end-t">Це ще не кінець…</p>' +
      '<p class="ab-end-s">Скоро тут будуть нові спогади</p><span class="ab-end-heart" aria-hidden="true">♡</span></div></div>';
    if (inner.length % 2 === 0) inner.push('<div class="ab-pg"></div>');
    inner.push(last);
    var html = '<div class="ab-pg ab-cover" data-density="hard"><div class="ab-cover-in"><span class="ab-cover-k">Фотоальбом</span>' +
        '<b class="ab-cover-t">Ліцей №2</b><span class="ab-cover-s">Підгородненської міської ради</span>' +
        '<span class="ab-cover-open">' + ICON("book") + "Відкрити</span></div></div>" +
      inner.join("") +
      '<div class="ab-pg ab-cover ab-back" data-density="hard"><div class="ab-cover-in"><span class="ab-cover-s">Ліцей №2 · Підгородне</span></div></div>';
    /* гортання: великі стрілки по боках столу, номер сторінки - рукописом під книгою */
    desk.innerHTML = '<div class="gz-fit" id="ab-fit"><div class="ab-book" id="ab-book">' + html + "</div></div>" +
      '<button class="ab-arrow prev" id="ab-prev" type="button" aria-label="Попередня сторінка" hidden>' + ICON("chev") + "</button>" +
      '<button class="ab-arrow next" id="ab-next" type="button" aria-label="Наступна сторінка" hidden>' + ICON("chev") + "</button>" +
      '<p class="ab-num" id="ab-num" aria-live="polite"></p>';

    if (!PF) { desk.classList.add("no-flip"); return; }
    var W = GRID.W, H = GRID.H, ratio = W / H, box = $("#ab-fit");
    var phone = function () { return window.matchMedia("(max-width: 768px)").matches; };
    function fit() {
      if (phone()) { box.style.maxWidth = ""; return; }
      box.style.maxWidth = Math.max(640, Math.floor((window.innerHeight - 130) * 2 * ratio)) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    var minW = phone() ? Math.ceil(desk.clientWidth / 2) + 20 : 220;
    var flip = new PF($("#ab-book"), {
      width: W, height: H, size: "stretch", minWidth: minW, maxWidth: 1200, minHeight: Math.round(minW / ratio), maxHeight: Math.round(1200 / ratio),
      showCover: true, usePortrait: true, mobileScrollSupport: true, maxShadowOpacity: 0.4, flippingTime: L.reduce ? 1 : 800, showPageCorners: !phone(),
      disableFlipByClick: true   /* клік по фото відкриває фото, а гортають свайпом, стрілками й кутиками */
    });
    flip.loadFromHTML($$(".ab-pg", desk));
    if (/[?&]debug=1\b/.test(location.search)) window.__abFlip = flip;

    var num = $("#ab-num"), total = flip.getPageCount();
    $("#ab-prev").hidden = $("#ab-next").hidden = false;
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
