/* Шкільна газета - читалка (post.html?id=<випуск>#page=N).
   Сторінки - готові картинки gazeta/<id>/p-N.jpg (їх робить робот з PDF), гортання - StPageFlip (vendor/, без CDN).
   ПК: розворот на дві сторінки (обкладинка окремо), телефон (≤768px): одна сторінка, свайп, «Збільшити».
   Картинки вантажаться ліниво: поточний розворот ± 1. */
(function () {
  "use strict";

  var L = window.L2, G = window.L2G, PF = window.St && window.St.PageFlip;
  if (!L || !G) { if (window.console) console.error("Не завантажено js/common.js або js/gazeta-common.js"); return; }
  var $ = L.$, esc = L.esc, ICON = L.ICON, plural = L.plural;
  var main = $("#main");
  function phone() { return window.matchMedia("(max-width: 768px)").matches; }

  function frame(issue, inner) {
    return '<section class="gz-top" aria-labelledby="h1"><div class="wrap">' +
      '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
        '<a href="blog.html' + (G.debug ? "?debug=1" : "") + '">Шкільна газета</a>' + (issue ? '<span aria-hidden="true">/</span><span aria-current="page">№' + esc(issue.number) + "</span>" : "") + "</nav>" +
      inner + "</div></section>";
  }
  function fail(issue, text) {
    var link = G.viewUrl(issue);
    $("#gz-stage").innerHTML = '<div class="gz-err" role="alert"><p>' + esc(text) + "</p>" +
      (link ? '<a class="btn primary" href="' + esc(link) + '" target="_blank" rel="noopener">' + ICON("doc") + "Відкрити PDF</a>" : "") + "</div>";
    $(".gz-bar").hidden = true;
  }

  var id = (/[?&]id=([^&#]+)/.exec(location.search) || [])[1];
  G.load().then(function (issues) {
    var issue = issues.filter(function (x) { return x.id === (id && decodeURIComponent(id)); })[0];
    if (!issue) {
      main.innerHTML = frame(null, '<h1 id="h1">Випуск не знайдено</h1><p class="gz-meta">Можливо, посилання застаріло.</p><p><a class="btn" href="blog.html">← До всіх випусків</a></p>');
      document.title = "Випуск не знайдено · Підгородненський Ліцей №2";
      return;
    }
    open(issue);
  });

  function open(issue) {
    document.title = G.name + " №" + issue.number + " — " + issue.title + " · Підгородненський Ліцей №2";
    var dl = G.downloadUrl(issue);
    main.innerHTML = frame(issue,
        '<h1 id="h1">' + esc(G.name) + " №" + esc(issue.number) + " — " + esc(issue.title) + "</h1>" +
        '<p class="gz-meta">' + esc(G.month(issue)) + " · " + issue.pages + " " + plural(issue.pages, "сторінка", "сторінки", "сторінок") + (issue.draft ? " · тестовий випуск" : "") + "</p>") +
      '<div class="wrap gz-wrap"><div class="gz-reader" id="gz-reader">' +
        '<div class="gz-stage" id="gz-stage"><div class="gz-skel-book" aria-hidden="true"><i></i><i></i></div><p class="sr" role="status">Завантажуємо газету…</p></div>' +
        '<div class="gz-bar" role="toolbar" aria-label="Керування газетою">' +
          '<button class="gz-btn" id="gz-prev" type="button" aria-label="Попередня сторінка">' + ICON("chev") + "</button>" +
          '<span class="gz-num" id="gz-num" aria-live="polite">Сторінка 1</span>' +
          '<button class="gz-btn" id="gz-next" type="button" aria-label="Наступна сторінка">' + ICON("chev") + "</button>" +
          '<span class="gz-tools">' +
          '<button class="gz-btn" id="gz-thumbs-b" type="button" aria-expanded="false" aria-controls="gz-thumbs" aria-label="Мініатюри сторінок">' + ICON("image") + '<span class="gz-lbl">Сторінки</span></button>' +
          '<button class="gz-btn gz-zoom-b" id="gz-zoom-b" type="button" aria-label="Збільшити сторінку">' + ICON("search") + '<span class="gz-lbl">Збільшити</span></button>' +
          '<button class="gz-btn" id="gz-full" type="button" aria-label="На весь екран">' + ICON("up") + '<span class="gz-lbl">На весь екран</span></button>' +
          (dl ? '<a class="gz-btn" href="' + esc(dl) + '"' + (/^https?:/.test(dl) ? ' target="_blank" rel="noopener"' : " download") + ' aria-label="Завантажити PDF">' + ICON("doc") + '<span class="gz-lbl">PDF</span></a>' : "") +
          '<button class="gz-btn" id="gz-share" type="button" aria-label="Поділитися: скопіювати посилання на цю сторінку">' + ICON("send") + '<span class="gz-lbl">Поділитися</span></button>' +
        "</span></div>" +
        '<div class="gz-thumbs" id="gz-thumbs" hidden><ul id="gz-thumbs-list"></ul></div>' +
        '<p class="gz-toast" id="gz-toast" role="status" aria-live="polite"></p>' +
      "</div>" +
      '<details class="gz-text" id="gz-text"><summary>Текстова версія' + ICON("chev") + '</summary><div class="gz-text-in" id="gz-text-in"><p class="gz-meta">Завантажуємо текст…</p></div></details>' +
      '<p class="gz-back"><a class="btn" href="blog.html' + (G.debug ? "?debug=1" : "") + '">← До всіх випусків</a></p></div>';

    /* текстова версія: для екранних читачів і слабкого інтернету */
    $("#gz-text").addEventListener("toggle", function once() {
      $("#gz-text").removeEventListener("toggle", once);
      G.loadIndex().then(function (pages) {
        var mine = pages.filter(function (p) { return p.id === issue.id; });
        $("#gz-text-in").innerHTML = mine.length
          ? mine.map(function (p) { return "<section><h2>Сторінка " + p.page + "</h2><p>" + esc(p.text) + "</p></section>"; }).join("")
          : '<p class="gz-meta">Текстової версії для цього випуску немає (можливо, сторінки зроблені картинками). Спробуйте <a href="' + esc(G.viewUrl(issue)) + '" target="_blank" rel="noopener">відкрити PDF</a>.</p>';
      });
    });

    if (!PF) { fail(issue, "Не вдалося завантажити гортання сторінок. Відкрийте PDF напряму."); return; }
    sized($("#gz-stage"), function () { book(issue); });
  }

  /* чекаємо, доки місце під книгу отримає ширину (вкладка у фоні, ще не розкладена сторінка) */
  function sized(el, go) {
    if (el.clientWidth || !("ResizeObserver" in window)) { go(); return; }
    var ro = new ResizeObserver(function () { if (el.clientWidth) { ro.disconnect(); go(); } });
    ro.observe(el);
  }

  function book(issue) {
    var n = issue.pages, ratio = issue.ratio || 0.7071, stage = $("#gz-stage"), W = 1000, H = Math.round(W / ratio);
    var html = "";
    for (var i = 0; i < n; i++) {
      var hard = i === 0 || i === n - 1;
      html += '<div class="gz-page' + (hard ? " hard" : "") + '" data-density="' + (hard ? "hard" : "soft") + '" data-n="' + (i + 1) + '">' +
        '<div class="gz-pg-skel" aria-hidden="true"></div><img alt="Сторінка ' + (i + 1) + '" decoding="async" draggable="false"></div>';
    }
    stage.innerHTML = '<div class="gz-fit" id="gz-fit"><div class="gz-book" id="gz-book">' + html + "</div></div>";

    /* розворот разом із панеллю має вміщатися у висоту екрана: обмежуємо ширину обгортки
       (стилі самої книги бібліотека переписує) */
    var box = $("#gz-fit");
    function fit() {
      if (phone()) { box.style.maxWidth = ""; return; }
      var room = document.fullscreenElement ? window.innerHeight - 110 : window.innerHeight - 190;
      box.style.maxWidth = Math.max(480, Math.floor(room * 2 * ratio)) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("fullscreenchange", fit);

    var start = Math.min(Math.max(+((/#page=(\d+)/.exec(location.hash) || [])[1] || 1), 1), n) - 1;
    /* телефон: дві сторінки не вміщаються, тож мінімальна ширина сторінки - півекрана, і бібліотека сама показує одну */
    var minW = phone() ? Math.ceil(stage.clientWidth / 2) + 20 : 220;
    var flip = new PF($("#gz-book"), {
      width: W, height: H, size: "stretch",
      minWidth: minW, maxWidth: 1100, minHeight: Math.round(minW / ratio), maxHeight: Math.round(1100 / ratio),
      showCover: true, usePortrait: true, startPage: start, mobileScrollSupport: true, maxShadowOpacity: 0.35,
      flippingTime: L.reduce ? 1 : 700, showPageCorners: !phone()
    });
    var pages = Array.prototype.slice.call(stage.querySelectorAll(".gz-page"));
    flip.loadFromHTML(pages);
    if (G.debug) window.__gzFlip = flip;   /* для перевірки з консолі, лише з ?debug=1 */

    /* картинки сторінок: поточний розворот ± 1 */
    function load(i) {
      var el = pages[i];
      if (!el) return;
      var img = el.querySelector("img");
      if (img.getAttribute("src")) return;
      img.onload = function () { el.classList.add("ready"); };
      img.onerror = function () { el.classList.add("broken"); };
      img.src = G.page(issue, i + 1);
    }
    function around() {
      var cur = flip.getCurrentPageIndex();
      for (var i = cur - 2; i <= cur + 3; i++) load(i);
    }

    var num = $("#gz-num");
    function status() {
      var cur = flip.getCurrentPageIndex(), two = flip.getOrientation() === "landscape" && cur > 0 && cur < n - 1;
      var a = cur + 1, b = two ? Math.min(cur + 2, n) : a;
      num.textContent = (b > a ? "Сторінки " + a + "–" + b : "Сторінка " + a) + " з " + n;
      $("#gz-prev").disabled = cur <= 0;
      $("#gz-next").disabled = cur >= n - (two ? 2 : 1);
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search + (a > 1 ? "#page=" + a : ""));
      thumbsMark(cur);
      around();
    }
    flip.on("flip", status);
    flip.on("changeOrientation", status);
    flip.on("init", status);
    setTimeout(status, 50);

    $("#gz-prev").addEventListener("click", function () { flip.flipPrev(); });
    $("#gz-next").addEventListener("click", function () { flip.flipNext(); });
    document.addEventListener("keydown", function (e) {
      if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "") || e.altKey || e.ctrlKey || e.metaKey || document.querySelector("dialog[open]")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); flip.flipPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); flip.flipNext(); }
    });

    /* мініатюри (браузер вантажить їх сам, коли панель відкрили й їх видно) */
    var tb = $("#gz-thumbs-b"), panel = $("#gz-thumbs"), list = $("#gz-thumbs-list"), thumbs = "";
    for (var k = 0; k < n; k++) {
      thumbs += '<li><button type="button" data-i="' + k + '" aria-label="Сторінка ' + (k + 1) + '"><img src="' + esc(G.thumb(issue, k + 1)) + '" alt="" loading="lazy" decoding="async"><span>' + (k + 1) + "</span></button></li>";
    }
    list.innerHTML = thumbs;
    tb.addEventListener("click", function () {
      var show = panel.hidden;
      panel.hidden = !show;
      tb.setAttribute("aria-expanded", show ? "true" : "false");
      if (show) thumbsMark(flip.getCurrentPageIndex());
    });
    list.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) { flip.turnToPage(+b.getAttribute("data-i")); status(); }
    });
    function thumbsMark(cur) {
      Array.prototype.forEach.call(list.querySelectorAll("button"), function (b) {
        var on = +b.getAttribute("data-i") === cur;
        b.toggleAttribute("aria-current", on);
        if (on && !panel.hidden) b.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }

    /* на весь екран */
    var reader = $("#gz-reader"), full = $("#gz-full");
    if (!reader.requestFullscreen) full.hidden = true;
    full.addEventListener("click", function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else reader.requestFullscreen().catch(function () {});
    });
    document.addEventListener("fullscreenchange", function () {
      var on = document.fullscreenElement === reader;
      full.setAttribute("aria-label", on ? "Вийти з повного екрана" : "На весь екран");
      full.querySelector(".gz-lbl").textContent = on ? "Вийти" : "На весь екран";
    });

    /* поділитися: посилання на поточну сторінку */
    var toast = $("#gz-toast"), tt = 0;
    function say(t) { toast.textContent = t; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("on"); }, 2500); }
    $("#gz-share").addEventListener("click", function () {
      var link = G.shareUrl(issue, flip.getCurrentPageIndex() + 1);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function () { say("Посилання скопійовано"); }, function () { window.prompt("Скопіюйте посилання:", link); });
      } else window.prompt("Скопіюйте посилання:", link);
    });

    /* телефон: «Збільшити» - сторінка на весь екран, з прокруткою й збільшенням пальцями */
    $("#gz-zoom-b").addEventListener("click", function () { zoom(issue, flip.getCurrentPageIndex()); });
  }

  function zoom(issue, i) {
    var dlg = document.createElement("dialog"), scale = 1;
    dlg.className = "gz-zoom";
    dlg.setAttribute("aria-label", "Сторінка " + (i + 1) + ", збільшено");
    dlg.innerHTML = '<div class="gz-zoom-bar"><button type="button" class="gz-btn" data-z="-" aria-label="Зменшити">−</button>' +
      '<button type="button" class="gz-btn" data-z="+" aria-label="Збільшити">+</button><span class="gz-sp"></span>' +
      '<button type="button" class="gz-btn" data-z="x" aria-label="Закрити">' + ICON("close") + "</button></div>" +
      '<div class="gz-zoom-in"><img src="' + esc(G.page(issue, i + 1)) + '" alt="Сторінка ' + (i + 1) + '"></div>';
    document.body.appendChild(dlg);
    dlg.showModal();
    var img = dlg.querySelector("img");
    dlg.addEventListener("click", function (e) {
      var b = e.target.closest("[data-z]");
      if (!b) return;
      var z = b.getAttribute("data-z");
      if (z === "x") { shut(); return; }
      scale = Math.min(Math.max(scale + (z === "+" ? 0.5 : -0.5), 1), 3);
      img.style.width = scale * 100 + "%";
    });
    /* закриваємо і хрестиком, і Esc (тоді браузер сам закриває діалог і шле close) */
    function shut() {
      if (!dlg.isConnected) return;
      if (dlg.open) dlg.close();
      dlg.remove();
      $("#gz-zoom-b").focus();
    }
    dlg.addEventListener("close", shut);
  }
})();
