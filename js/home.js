/* Головна: гуртки, відгуки, фотокарусель. Дані: js/data.js (clubs, reviews, photos).
   Підключається після js/common.js і перед js/app.js (той додає анімацію появи). */
(function () {
  "use strict";

  var D = window.SITE_DATA, L = window.L2;
  if (!D || !L) return;
  var CONFIG = D.config, $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart,
      plural = L.plural, reduce = L.reduce;

  function stars(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += '<svg class="ic' + (i <= n ? "" : " off") + '" aria-hidden="true"><use href="#i-star"/></svg>';
    return s;
  }

  /* 1. ГУРТКИ ---------------------------------------------------------------- */
  var clubs = D.clubs || [], filters = $("#club-filters"), clubList = $("#clubs-list"), curCat = "";
  var cats = [""].concat((D.clubCats || []).filter(function (c) {
    return clubs.some(function (x) { return x.cat === c; });
  }));

  filters.innerHTML = cats.length > 2 ? cats.map(function (c) {
    var n = c ? clubs.filter(function (x) { return x.cat === c; }).length : clubs.length;
    return '<button type="button" class="chip" aria-pressed="' + (c ? "false" : "true") + '" data-cat="' + esc(c) + '">' +
      esc(c || "Усі") + "<span>" + n + "</span></button>";
  }).join("") : "";

  function clubCard(c, i) {
    var meta = [["user", "Керівник", c.leader], ["users", "Класи", c.grades], ["clock", "Розклад", c.time], ["pin", "Де проходить", c.place]]
      .filter(function (m) { return m[2]; });
    return '<li class="club' + (c.fx ? " fx-" + esc(c.fx) : "") + '" style="--i:' + i + '">' +
      '<div class="club-top"><span class="ico">' + ICON(c.icon || "star") +
      (c.fx === "dance" ? '<span class="dance-notes" aria-hidden="true"><i>♪</i><i>♫</i><i>♪</i></span>' : "") +
      "</span><div><h3>" + esc(c.name) + "</h3>" +
      (c.cat ? '<span class="club-cat">' + esc(c.cat) + "</span>" : "") + "</div></div>" +
      (c.desc ? "<p>" + esc(c.desc) + "</p>" : "") +
      '<dl class="club-meta">' + meta.map(function (m) {
        return '<div title="' + m[1] + '"><dt>' + ICON(m[0]) + '<span class="sr">' + m[1] + "</span></dt><dd>" + esc(m[2]) + "</dd></div>";
      }).join("") + "</dl></li>";
  }
  function renderClubs(animate) {
    var list = clubs.filter(function (c) { return !curCat || c.cat === curCat; });
    clubList.innerHTML = list.length ? list.map(clubCard).join("")
      : '<li class="empty-note">Інформація про гуртки з\'явиться згодом.</li>';
    if (animate && !reduce) restart(clubList, "swap");
  }
  filters.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b || b.getAttribute("aria-pressed") === "true") return;
    curCat = b.getAttribute("data-cat");
    $$(".chip", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    renderClubs(true);
  });
  renderClubs(false);

  /* 2. ВІДГУКИ (на сайті лише перевірені, з data.js) ---------------------------- */
  var reviews = D.reviews || [], rvList = $("#rv-list"), rvMore = $("#rv-more"), PAGE = 6, shown = PAGE;

  function summary() {
    var rated = reviews.filter(function (r) { return r.rating; });
    if (!rated.length) { $("#rv-sum").innerHTML = ""; return; }
    var avg = rated.reduce(function (a, r) { return a + (+r.rating); }, 0) / rated.length;
    $("#rv-sum").innerHTML = '<b>' + avg.toFixed(1).replace(".", ",") + '</b><span class="rv-stars" aria-hidden="true">' +
      stars(Math.round(avg)) + "</span><small>" + reviews.length + " " + plural(reviews.length, "відгук", "відгуки", "відгуків") + "</small>" +
      '<span class="sr">Середня оцінка ' + avg.toFixed(1) + " з 5</span>";
  }
  summary();

  /* Схвалені в Google-таблиці відгуки (див. tools/google-apps-script.gs) додаються зверху автоматично */
  /* Відповідь таблиці кешується в sessionStorage на 1 хв (зняли галочку — відгук зникне протягом хвилини);
     запит обривається через 8 с; якщо таблиця не відповіла — показуємо збережену раніше копію або запасний текст. */
  var feed = CONFIG.reviewEndpoint || CONFIG.formEndpoint;
  var RV_KEY = "l2reviews", RV_TTL = 60 * 1000, RV_TIMEOUT = 8000, base = reviews;
  function addFeed(list) {
    if (!Array.isArray(list)) return;
    var have = {};
    base.forEach(function (r) { have[(r.name || "") + "|" + (r.text || "")] = 1; });
    /* список із таблиці замінює попередній (а не додається), тож зняті відгуки зникають */
    reviews = list.filter(function (r) { return r && r.text && !have[(r.name || "") + "|" + r.text]; }).concat(base);
    summary(); renderReviews();
  }
  function rvNote(text) {
    var n = $("#rv-note");
    if (!n) { n = document.createElement("p"); n.id = "rv-note"; n.className = "rv-note"; rvList.parentNode.insertBefore(n, rvList.nextSibling); }
    n.textContent = text;
  }
  if (feed && /script\.google\.com/.test(feed) && window.fetch) {
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(RV_KEY) || "null"); } catch (e) {}
    if (cached && Date.now() - cached.t < RV_TTL) addFeed(cached.list);
    else {
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, RV_TIMEOUT);
      Promise.race([
        fetch(feed + (feed.indexOf("?") > -1 ? "&" : "?") + "action=reviews", ctrl ? { signal: ctrl.signal } : {})
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }),
        new Promise(function (_, no) { setTimeout(function () { no(new Error("timeout")); }, RV_TIMEOUT + 100); })
      ]).then(function (list) {
        clearTimeout(timer);
        try { sessionStorage.setItem(RV_KEY, JSON.stringify({ t: Date.now(), list: list })); } catch (e) {}
        addFeed(list);
      }).catch(function () {
        clearTimeout(timer);
        if (cached && cached.list) addFeed(cached.list);
        rvNote(cached && cached.list
          ? "Не вдалося оновити відгуки — показуємо збережені раніше."
          : "Нові відгуки зараз не завантажились. Спробуйте оновити сторінку трохи пізніше.");
      });
    }
  }

  function rvCard(r, i) {
    var long = (r.text || "").length > 260;
    return '<li class="rv' + (long ? " long" : "") + '" style="--i:' + (i % PAGE) + '">' +
      '<svg class="ic rv-q" aria-hidden="true"><use href="#i-quote"/></svg>' +
      (r.rating ? '<span class="rv-stars" role="img" aria-label="Оцінка ' + r.rating + ' з 5">' + stars(r.rating) + "</span>" : "") +
      '<blockquote><p>' + esc(r.text || "") + "</p></blockquote>" +
      (long ? '<button type="button" class="rv-toggle" aria-expanded="false">Читати повністю</button>' : "") +
      '<div class="rv-by"><span class="rv-av" aria-hidden="true">' + esc((r.name || "?").trim().charAt(0).toUpperCase()) + "</span>" +
      "<span><b>" + esc(r.name || "Анонім") + "</b><small>" + esc([r.who, r.date].filter(Boolean).join(" · ")) + "</small></span></div></li>";
  }
  function renderReviews() {
    rvList.innerHTML = reviews.length ? reviews.slice(0, shown).map(rvCard).join("")
      : '<li class="empty-note">Поки що відгуків немає. Будьте першим!</li>';
    rvMore.hidden = shown >= reviews.length;
  }
  rvMore.addEventListener("click", function () {
    var from = shown; shown += PAGE; renderReviews();
    var first = rvList.children[from]; if (first) first.querySelector("blockquote").setAttribute("tabindex", "-1");
  });
  rvList.addEventListener("click", function (e) {
    var t = e.target.closest(".rv-toggle");
    if (!t) return;
    var open = t.closest(".rv").classList.toggle("open");
    t.setAttribute("aria-expanded", open ? "true" : "false");
    t.textContent = open ? "Згорнути" : "Читати повністю";
  });
  renderReviews();

  /* Форма відгуку */
  var rvDlg = $("#rv-dlg"), rvForm = $("#rv-form"), rvSent = $("#rv-sent"), rvText = $("#rv-text");
  var WHO = ["Батьки", "Учень / учениця", "Випускник", "Вчитель", "Інше"];
  $("#rv-who").innerHTML = WHO.map(function (w, i) {
    return '<label class="chip"><input type="radio" name="who" value="' + esc(w) + '"' + (i ? "" : " checked") + "><span>" + esc(w) + "</span></label>";
  }).join("");
  $("#rv-stars").innerHTML = [5, 4, 3, 2, 1].map(function (n) {
    return '<input type="radio" name="rating" id="rv-r' + n + '" value="' + n + '"><label for="rv-r' + n + '" title="' + n + ' з 5">' +
      '<svg class="ic" aria-hidden="true"><use href="#i-star"/></svg><span class="sr">' + n + " з 5</span></label>";
  }).join("");

  var RV = {
    name: { el: $("#rv-name"), msg: "Вкажіть, будь ласка, ім'я", ok: function (v) { return v.trim().length >= 2; } },
    text: { el: rvText, msg: "Напишіть трохи більше (від 20 символів)", ok: function (v) { return v.trim().length >= 20; } }
  };
  function rvCheck(k) {
    var r = RV[k], f = r.el.closest(".field"), ok = r.ok(r.el.value);
    f.classList.toggle("invalid", !ok); f.classList.toggle("valid", ok);
    r.el.setAttribute("aria-invalid", ok ? "false" : "true");
    $(".err", f).textContent = ok ? "" : r.msg;
    return ok;
  }
  Object.keys(RV).forEach(function (k) {
    RV[k].el.addEventListener("input", function () { if (RV[k].el.closest(".field").classList.contains("invalid")) rvCheck(k); });
    RV[k].el.addEventListener("blur", function () { if (RV[k].el.value) rvCheck(k); });
  });
  rvText.addEventListener("input", function () { $("#rv-count").textContent = rvText.value.length + "/1000"; });

  function rvReset() {
    rvForm.reset(); $("#rv-count").textContent = "0/1000";
    $$(".field", rvForm).forEach(function (f) { f.classList.remove("valid", "invalid"); $(".err", f).textContent = ""; });
    rvForm.hidden = false; rvSent.hidden = true;
  }
  $("#rv-open").addEventListener("click", function () {
    if (rvSent.hidden === false) rvReset();
    rvDlg.showModal(); rvDlg.scrollTop = 0; $("#rv-name").focus();
  });
  function rvClose() { rvDlg.close(); }
  $("#rv-x").addEventListener("click", rvClose);
  $("#rv-done").addEventListener("click", function () { rvClose(); rvReset(); });
  rvDlg.addEventListener("click", function (e) { if (e.target === rvDlg) rvClose(); });
  rvDlg.addEventListener("close", function () { $("#rv-open").focus(); });

  rvForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = null;
    Object.keys(RV).forEach(function (k) { if (!rvCheck(k) && !bad) bad = k; });
    if (bad) { RV[bad].el.focus(); return; }

    var btn = $("button[type=submit]", rvForm), lbl = $(".lbl", btn);
    var who = $("input[name=who]:checked", rvForm), rate = $("input[name=rating]:checked", rvForm);
    var data = { type: "review", name: RV.name.el.value.trim(), who: who ? who.value : "",
      rating: rate ? +rate.value : "", text: rvText.value.trim() };
    function done(viaMail) {
      btn.classList.remove("loading"); lbl.textContent = "Надіслати";
      $("#rv-sent-text").textContent = viaMail
        ? "Відкрилась ваша поштова програма: надішліть лист, і після перевірки відгук з'явиться на сайті."
        : "Він з'явиться на сайті після перевірки адміністрацією.";
      rvForm.hidden = true; rvSent.hidden = false; $("#rv-done").focus();
    }
    /* Бот заповнив приховане поле: робимо вигляд, що все гаразд, і нічого не надсилаємо */
    if ($("#rv-hp").value) { done(false); return; }

    btn.classList.add("loading"); lbl.textContent = "Надсилаємо";

    function viaMail() {
      var body = data.text + "\n\n" + data.name + (data.who ? " (" + data.who + ")" : "") +
        (data.rating ? "\nОцінка: " + data.rating + " з 5" : "");
      var a = document.createElement("a");
      a.href = L.mailto + "?subject=" + encodeURIComponent("Відгук на сайт ліцею від " + data.name) + "&body=" + encodeURIComponent(body);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { done(true); }, 600);
    }
    var endpoint = CONFIG.reviewEndpoint || CONFIG.formEndpoint;
    if (endpoint) {
      L.postForm(endpoint, data)
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(false); })
        .catch(viaMail);
    } else {
      viaMail();
    }
  });

  /* 3. ФОТОКАРУСЕЛЬ + ПЕРЕГЛЯД НА ВЕСЬ ЕКРАН ---------------------------------- */
  var photos = D.photos || [], track = $("#gal-track"), dots = $("#gal-dots"), gal = $("#gal");
  if (!photos.length) { $("#gallery").hidden = true; return; }

  var photoHTML = L.photoHTML;
  track.innerHTML = photos.map(function (p, i) {
    return '<li class="gal-slide" aria-roledescription="слайд" aria-label="' + (i + 1) + " з " + photos.length + '">' +
      '<button type="button" class="gal-item" data-k="' + i + '" aria-label="Відкрити фото: ' + esc(p.caption || "фото " + (i + 1)) + '">' +
      photoHTML(p, i, i === 0 ? "high" : true) + (p.caption ? '<span class="gal-cap">' + esc(p.caption) + "</span>" : "") + "</button></li>";
  }).join("");
  dots.innerHTML = photos.map(function (p, i) {
    return '<button type="button" data-k="' + i + '" aria-label="Фото ' + (i + 1) + '"></button>';
  }).join("");

  var slides = $$(".gal-slide", track), cur = 0;
  function nearest() {
    var x = track.scrollLeft, best = 0, d = Infinity;
    slides.forEach(function (s, i) { var dd = Math.abs(s.offsetLeft - slides[0].offsetLeft - x); if (dd < d) { d = dd; best = i; } });
    /* дійшли до кінця стрічки: активний останній */
    if (x + track.clientWidth >= track.scrollWidth - 4) best = slides.length - 1;
    return best;
  }
  function paintDots() {
    cur = nearest();
    $$("button", dots).forEach(function (b, i) { b.setAttribute("aria-current", i === cur ? "true" : "false"); });
    $("#gal-prev").disabled = track.scrollLeft <= 2;
    $("#gal-next").disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var start = track.scrollLeft, target = slides[i].offsetLeft - slides[0].offsetLeft;
    track.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
    /* Деякі браузери ігнорують плавну прокрутку — тоді перескакуємо одразу */
    if (!reduce) setTimeout(function () {
      if (Math.abs(track.scrollLeft - target) > 2 && Math.abs(track.scrollLeft - start) < 2) track.scrollTo({ left: target, behavior: "auto" });
      paintDots();
    }, 700);
    if (reduce) paintDots();
  }
  var raf = 0;
  track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(paintDots); }, { passive: true });
  window.addEventListener("resize", paintDots);
  $("#gal-prev").addEventListener("click", function () { go(nearest() - 1); });
  $("#gal-next").addEventListener("click", function () { go(nearest() + 1); });
  dots.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) go(+b.getAttribute("data-k")); });
  paintDots();

  /* Автопрокрутка: кожні 5 с, пауза коли курсор/фокус на каруселі або її не видно */
  var hold = false, visible = false, holdTimer = null;
  function pause(ms) { hold = true; clearTimeout(holdTimer); if (ms) holdTimer = setTimeout(function () { hold = false; }, ms); }
  gal.addEventListener("mouseenter", function () { pause(); });
  gal.addEventListener("mouseleave", function () { hold = false; });
  gal.addEventListener("focusin", function () { pause(); });
  gal.addEventListener("focusout", function () { hold = false; });
  gal.addEventListener("touchstart", function () { pause(8000); }, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.4 }).observe(gal);
  }
  if (!reduce) {
    setInterval(function () {
      if (hold || !visible || document.hidden || L.lightboxOpen()) return;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      go(atEnd ? 0 : cur + 1);
    }, 5000);
  }

  /* Перегляд на весь екран (js/common.js); після закриття карусель стає на те саме фото */
  track.addEventListener("click", function (e) {
    var b = e.target.closest(".gal-item");
    if (!b) return;
    L.lightbox(photos, +b.getAttribute("data-k"), function (at) {
      go(at);
      var x = track.querySelector('.gal-item[data-k="' + at + '"]'); if (x) x.focus({ preventScroll: true });
    });
  });
})();
