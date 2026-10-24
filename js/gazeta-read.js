/* Шкільна газета - читалка (post.html?id=<випуск>#page=N).
   PDF малює PDF.js, гортання - StPageFlip (обидві бібліотеки лежать у vendor/, без CDN).
   ПК: розворот на дві сторінки (обкладинка окремо), телефон (≤768px): одна сторінка, свайп, «Збільшити».
   Сторінки малюються ліниво: поточний розворот ± 1, чіткість під екран (не більше 2×). */
import * as pdfjs from "../vendor/pdfjs/pdf.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("../vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;

const L = window.L2, G = window.L2G, PF = window.St && window.St.PageFlip;
const $ = L.$, esc = L.esc, ICON = L.ICON, plural = L.plural;
const main = $("#main");
const phone = () => window.matchMedia("(max-width: 768px)").matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function frame(issue, inner) {
  return '<section class="gz-top" aria-labelledby="h1"><div class="wrap">' +
    '<nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
      '<a href="blog.html' + (G.debug ? "?debug=1" : "") + '">Шкільна газета</a>' + (issue ? '<span aria-hidden="true">/</span><span aria-current="page">№' + esc(issue.number) + "</span>" : "") + "</nav>" +
    inner + "</div></section>";
}
function fail(issue, text) {
  const link = issue && G.viewUrl(issue), stage = $("#gz-stage");
  stage.innerHTML = '<div class="gz-err" role="alert"><p>' + esc(text) + "</p>" +
    (link ? '<a class="btn primary" href="' + esc(link) + '" target="_blank" rel="noopener">' + ICON("doc") + "Відкрити PDF</a>" : "") + "</div>";
  $(".gz-bar").hidden = true;
}

const id = (/[?&]id=([^&#]+)/.exec(location.search) || [])[1];
G.load().then((issues) => {
  const issue = issues.filter((x) => x.id === (id && decodeURIComponent(id)))[0];
  if (!issue) {
    main.innerHTML = frame(null, '<h1 id="h1">Випуск не знайдено</h1><p class="gz-meta">Можливо, посилання застаріло.</p><p><a class="btn" href="blog.html">← До всіх випусків</a></p>');
    document.title = "Випуск не знайдено · Підгородненський Ліцей №2";
    return;
  }
  open(issue);
});

function open(issue) {
  document.title = G.name + " №" + issue.number + " — " + issue.title + " · Підгородненський Ліцей №2";
  const dl = G.downloadUrl(issue);
  main.innerHTML = frame(issue,
      '<h1 id="h1">' + esc(G.name) + " №" + esc(issue.number) + " — " + esc(issue.title) + "</h1>" +
      '<p class="gz-meta">' + esc(G.month(issue)) + (issue.pages ? " · " + issue.pages + " " + plural(issue.pages, "сторінка", "сторінки", "сторінок") : "") + (issue.draft ? " · тестовий випуск" : "") + "</p>") +
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
        (dl ? '<a class="gz-btn" href="' + esc(dl) + '"' + (issue.localPdf ? " download" : ' target="_blank" rel="noopener"') + ' aria-label="Завантажити PDF">' + ICON("doc") + '<span class="gz-lbl">PDF</span></a>' : "") +
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
    G.loadIndex().then((pages) => {
      const mine = pages.filter((p) => p.id === issue.id);
      $("#gz-text-in").innerHTML = mine.length
        ? mine.map((p) => '<section><h2>Сторінка ' + p.page + "</h2><p>" + esc(p.text) + "</p></section>").join("")
        : '<p class="gz-meta">Текстової версії для цього випуску немає (можливо, сторінки - лише картинки). Спробуйте <a href="' + esc(G.viewUrl(issue)) + '" target="_blank" rel="noopener">відкрити PDF</a>.</p>';
    });
  });

  const url = G.pdfUrl(issue);
  if (!url) { fail(issue, "Читалку ще не налаштовано (немає ключа Google API), але газету можна відкрити на Google Диску."); return; }
  if (!PF) { fail(issue, "Не вдалося завантажити гортання сторінок. Відкрийте PDF напряму."); return; }
  pdfjs.getDocument({ url, isEvalSupported: false }).promise
    .then((pdf) => Promise.all([pdf, pdf.getPage(1), sized($("#gz-stage"))]))
    .then(([pdf, p1]) => book(issue, pdf, p1.getViewport({ scale: 1 })))
    .catch((e) => { if (window.console) console.error(e); fail(issue, "Не вдалося відкрити газету. Перевірте інтернет або відкрийте PDF напряму."); });
}

/* чекаємо, доки місце під книгу отримає ширину (вкладка у фоні, ще не розкладена сторінка) */
function sized(el) {
  return new Promise((ok) => {
    if (el.clientWidth) return ok();
    if (!("ResizeObserver" in window)) return setTimeout(ok, 300);
    const ro = new ResizeObserver(() => { if (el.clientWidth) { ro.disconnect(); ok(); } });
    ro.observe(el);
  });
}

function book(issue, pdf, vp) {
  const n = pdf.numPages, stage = $("#gz-stage");
  stage.innerHTML = '<div class="gz-fit" id="gz-fit"><div class="gz-book" id="gz-book">' + Array.from({ length: n }, (_, i) =>
    '<div class="gz-page' + (i === 0 || i === n - 1 ? " hard" : "") + '" data-density="' + (i === 0 || i === n - 1 ? "hard" : "soft") + '" data-n="' + (i + 1) + '">' +
      '<div class="gz-pg-skel" aria-hidden="true"></div><canvas aria-label="Сторінка ' + (i + 1) + '"></canvas></div>').join("") + "</div></div>";

  /* розворот разом із панеллю має вміщатися у висоту екрана: обмежуємо ширину обгортки
     (стилі самої книги бібліотека переписує) */
  const bookBox = $("#gz-fit");
  function fit() {
    if (phone()) { bookBox.style.maxWidth = ""; return; }
    const room = (document.fullscreenElement ? window.innerHeight - 110 : window.innerHeight - 190);
    bookBox.style.maxWidth = Math.max(480, Math.floor(room * 2 * vp.width / vp.height)) + "px";
  }
  fit();
  window.addEventListener("resize", fit);
  document.addEventListener("fullscreenchange", fit);
  const start = Math.min(Math.max(+((/#page=(\d+)/.exec(location.hash) || [])[1] || 1), 1), n) - 1;
  /* телефон: дві сторінки не вміщаються, тож мінімальна ширина сторінки - півекрана, і бібліотека сама показує одну */
  const minW = phone() ? Math.ceil(stage.clientWidth / 2) + 20 : 220;
  const flip = new PF($("#gz-book"), {
    width: Math.round(vp.width), height: Math.round(vp.height), size: "stretch",
    minWidth: minW, maxWidth: 1100, minHeight: Math.round(minW * vp.height / vp.width), maxHeight: Math.round(1100 * vp.height / vp.width),
    showCover: true, usePortrait: true, startPage: start, mobileScrollSupport: true, maxShadowOpacity: 0.35,
    flippingTime: L.reduce ? 1 : 700, showPageCorners: !phone()
  });
  const pages = Array.prototype.slice.call(stage.querySelectorAll(".gz-page"));
  flip.loadFromHTML(pages);
  if (G.debug) window.__gzFlip = flip;   /* для перевірки з консолі, лише з ?debug=1 */

  /* малюємо сторінку під теперішній розмір книги (а не самої сторінки: невидимі сторінки бібліотека ховає,
     а наступний розворот хочемо намалювати заздалегідь); збільшилась (на весь екран) - перемальовуємо */
  const drawn = {}, bookEl = $("#gz-book");
  function pageWidth() {
    const b = bookEl.querySelector(".stf__block") || bookEl;
    return (b.clientWidth || stage.clientWidth) / (flip.getOrientation() === "landscape" ? 2 : 1);
  }
  function draw(i) {
    const el = pages[i];
    if (!el) return;
    const w = Math.round(pageWidth() * DPR);
    if (!w || drawn[i] >= w * 0.8) return;
    drawn[i] = w;
    pdf.getPage(i + 1).then((pg) => {
      const v = pg.getViewport({ scale: w / pg.getViewport({ scale: 1 }).width });
      const c = el.querySelector("canvas"), off = document.createElement("canvas");
      off.width = Math.round(v.width); off.height = Math.round(v.height);
      return pg.render({ canvasContext: off.getContext("2d"), viewport: v }).promise.then(() => {
        c.width = off.width; c.height = off.height;
        c.getContext("2d").drawImage(off, 0, 0);
        el.classList.add("ready");
      });
    }).catch(() => { drawn[i] = 0; });
  }
  function around() {
    const cur = flip.getCurrentPageIndex();
    for (let i = cur - 2; i <= cur + 3; i++) draw(i);
  }

  const num = $("#gz-num");
  function status() {
    const cur = flip.getCurrentPageIndex(), two = flip.getOrientation() === "landscape" && cur > 0 && cur < n - 1;
    const a = cur + 1, b = two ? Math.min(cur + 2, n) : a;
    num.textContent = (b > a ? "Сторінки " + a + "–" + b : "Сторінка " + a) + " з " + n;
    $("#gz-prev").disabled = cur <= 0;
    $("#gz-next").disabled = cur >= n - (two ? 2 : 1);
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search + (a > 1 ? "#page=" + a : ""));
    thumbsMark(cur);
    around();
  }
  flip.on("flip", status);
  flip.on("changeOrientation", () => { Object.keys(drawn).forEach((k) => { drawn[k] = 0; }); status(); });
  flip.on("init", status);
  setTimeout(status, 50);
  window.addEventListener("resize", () => setTimeout(around, 200));

  $("#gz-prev").addEventListener("click", () => flip.flipPrev());
  $("#gz-next").addEventListener("click", () => flip.flipNext());
  document.addEventListener("keydown", (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "") || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); flip.flipPrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); flip.flipNext(); }
  });

  /* мініатюри: малюються, лише коли їх видно */
  const tb = $("#gz-thumbs-b"), panel = $("#gz-thumbs"), list = $("#gz-thumbs-list");
  list.innerHTML = Array.from({ length: n }, (_, i) =>
    '<li><button type="button" data-i="' + i + '" aria-label="Сторінка ' + (i + 1) + '"><canvas width="1" height="1"></canvas><span>' + (i + 1) + "</span></button></li>").join("");
  const tio = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    tio.unobserve(e.target);
    const i = +e.target.getAttribute("data-i"), c = e.target.querySelector("canvas");
    pdf.getPage(i + 1).then((pg) => {
      const v = pg.getViewport({ scale: (96 * DPR) / pg.getViewport({ scale: 1 }).width });
      c.width = Math.round(v.width); c.height = Math.round(v.height);
      return pg.render({ canvasContext: c.getContext("2d"), viewport: v }).promise;
    });
  }), { root: panel }) : null;
  tb.addEventListener("click", () => {
    const show = panel.hidden;
    panel.hidden = !show;
    tb.setAttribute("aria-expanded", show ? "true" : "false");
    if (show && tio) list.querySelectorAll("button").forEach((b) => tio.observe(b));
  });
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { flip.turnToPage(+b.getAttribute("data-i")); status(); }
  });
  function thumbsMark(cur) {
    list.querySelectorAll("button").forEach((b) => {
      const on = +b.getAttribute("data-i") === cur;
      b.toggleAttribute("aria-current", on);
      if (on && !panel.hidden) b.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  /* на весь екран */
  const reader = $("#gz-reader"), full = $("#gz-full");
  if (!reader.requestFullscreen) full.hidden = true;
  full.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else reader.requestFullscreen().catch(() => {});
  });
  document.addEventListener("fullscreenchange", () => {
    const on = document.fullscreenElement === reader;
    full.setAttribute("aria-label", on ? "Вийти з повного екрана" : "На весь екран");
    full.querySelector(".gz-lbl").textContent = on ? "Вийти" : "На весь екран";
    setTimeout(around, 300);
  });

  /* поділитися: посилання на поточну сторінку */
  const toast = $("#gz-toast");
  let tt = 0;
  function say(t) { toast.textContent = t; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 2500); }
  $("#gz-share").addEventListener("click", () => {
    const link = G.shareUrl(issue, flip.getCurrentPageIndex() + 1);
    const done = () => say("Посилання скопійовано");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, () => window.prompt("Скопіюйте посилання:", link));
    else window.prompt("Скопіюйте посилання:", link);
  });

  /* телефон: «Збільшити» - сторінка на весь екран, з прокруткою й збільшенням пальцями */
  $("#gz-zoom-b").addEventListener("click", () => zoom(pdf, flip.getCurrentPageIndex()));
}

function zoom(pdf, i) {
  const dlg = document.createElement("dialog");
  dlg.className = "gz-zoom";
  dlg.setAttribute("aria-label", "Сторінка " + (i + 1) + ", збільшено");
  dlg.innerHTML = '<div class="gz-zoom-bar"><button type="button" class="gz-btn" data-z="-" aria-label="Зменшити">−</button>' +
    '<button type="button" class="gz-btn" data-z="+" aria-label="Збільшити">+</button><span class="gz-sp"></span>' +
    '<button type="button" class="gz-btn" data-z="x" aria-label="Закрити">' + ICON("close") + "</button></div>" +
    '<div class="gz-zoom-in"><canvas></canvas></div>';
  document.body.appendChild(dlg);
  dlg.showModal();
  const c = dlg.querySelector("canvas");
  let scale = 1;
  pdf.getPage(i + 1).then((pg) => {
    const w = Math.min(window.innerWidth * 2.5, 2400);
    const v = pg.getViewport({ scale: w / pg.getViewport({ scale: 1 }).width });
    c.width = Math.round(v.width); c.height = Math.round(v.height);
    return pg.render({ canvasContext: c.getContext("2d"), viewport: v }).promise;
  });
  dlg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-z]");
    if (!b) return;
    const z = b.getAttribute("data-z");
    if (z === "x") { shut(); return; }
    scale = Math.min(Math.max(scale + (z === "+" ? 0.5 : -0.5), 1), 3);
    c.style.width = scale * 100 + "%";
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
