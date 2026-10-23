/* головна: урок/перерва, меню на сьогодні, кластери, гуртки, відгуки, фотокарусель і фото внизу.
   дані: data.js, schedule.js (дзвінки), menu.js, clusters.js.
   підключати після common.js і перед app.js, бо app.js додає анімацію появи */
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

  /* що зараз: урок, перерва, до початку, уроки закінчились, вихідний. дзвінки - з schedule.js */
  (function () {
    var box = $("#now"), S = window.SCHEDULE, b = S && S.bells && S.bells.length ? S.bells : null;
    if (!box) return;
    function mins(t) { var p = String(t).split(":"); return +p[0] * 60 + +p[1]; }
    function hm(n) { return n + " " + plural(n, "хвилина", "хвилини", "хвилин"); }
    function view(dot, label, big, text, pct) {
      return '<span class="h-now-l"><i class="h-dot ' + dot + '" aria-hidden="true"></i>' + label + "</span>" +
        '<b class="h-now-big">' + big + "</b><span class=\"h-now-t\">" + text + "</span>" +
        (pct != null ? '<span class="h-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span>' : "") +
        '<span class="h-now-links"><a href="schedule.html">Розклад уроків →</a><a href="schedule.html#sch-bells">Дзвінки →</a></span>';
    }
    function tick() {
      var now = new Date(), wd = (now.getDay() + 6) % 7, m = now.getHours() * 60 + now.getMinutes(), html = "";
      if (!b) html = view("off", "Розклад дзвінків", "Дзвінки", "Розклад дзвінків ще не додано.", null);
      else if (wd > 4) html = view("off", "Сьогодні вихідний", "Вихідний", "Гарного відпочинку! Уроки — з понеділка, перший о " + b[0][0] + ".", null);
      else if (m < mins(b[0][0])) html = view("wait", "До початку уроків", hm(mins(b[0][0]) - m), "Перший урок о " + b[0][0] + ".", null);
      else if (m >= mins(b[b.length - 1][1])) html = view("off", "Уроки закінчились", "На сьогодні все", "Останній дзвінок був о " + b[b.length - 1][1] + ".", null);
      else for (var i = 0; i < b.length; i++) {
        var st = mins(b[i][0]), en = mins(b[i][1]);
        if (m >= st && m < en) { html = view("on", "Зараз іде урок", (i + 1) + "-й урок", "До перерви — " + hm(en - m), Math.round((m - st) / (en - st) * 100)); break; }
        if (i + 1 < b.length && m >= en && m < mins(b[i + 1][0])) {
          var nx = mins(b[i + 1][0]);
          html = view("wait", "Зараз перерва", "Перерва", (i + 2) + "-й урок о " + b[i + 1][0] + " — через " + hm(nx - m), Math.round((m - en) / (nx - en) * 100));
          break;
        }
      }
      box.innerHTML = html;
    }
    tick();
    setInterval(tick, 30000);
  })();

  /* лічильник до канікул (data/countdowns.js): найближча подія для всіх,
     подія для 11-х (НМТ) - другим рядком. нема майбутніх подій - блок прихований */
  (function () {
    var box = $("#countdown"), list = window.COUNTDOWNS;
    if (!box || !Array.isArray(list)) return;
    var MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
    var t = new Date(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    function next(aud) {
      return list.map(function (e) {
        var p = String(e.date || "").split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
        return { e: e, d: d, n: Math.round((d - today) / 864e5) };
      }).filter(function (x) { return x.e.title && !isNaN(x.n) && x.n >= 0 && (x.e.audience || "all") === aud; })
        .sort(function (a, b) { return a.n - b.n; })[0];
    }
    function days(n) { return n + " " + plural(n, "день", "дні", "днів"); }
    var main = next("all"), grad = next("11");
    if (!main) { main = grad; grad = null; }
    if (!main) return;
    var html = '<span class="h-count-ic">' + ICON("calendar") + "</span>";
    if (main.n === 0) html += '<span class="h-count-main"><b class="h-count-big">Сьогодні: ' + esc(main.e.title) + ' <span aria-hidden="true">🎉</span></b></span>';
    else html += '<span class="h-count-main"><span class="h-count-t">До події «' + esc(main.e.title) + "» · " + main.d.getDate() + " " + MONTHS[main.d.getMonth()] + "</span>" +
      '<b class="h-count-big">' + days(main.n) + "</b></span>";
    if (grad) html += '<span class="h-count-sub"><span class="h-count-tag">11 клас</span>' +
      (grad.n === 0 ? "Сьогодні: " + esc(grad.e.title) : "До " + esc(grad.e.title) + ": <b>" + days(grad.n) + "</b>") + "</span>";
    box.innerHTML = html;
    box.hidden = false;
  })();

  /* меню на сьогодні: головна страва дня з menu.js (у вихідні - на понеділок) */
  (function () {
    var M = window.MENU, el = $("#menu-dish");
    if (!el || !M || !M.weeks || !M.weeks.length) return;
    var now = new Date(), wd = (now.getDay() + 6) % 7, wi = 0;
    if (M.weeks.length > 1 && M.cycleStart) {   /* так само, як на сторінці меню */
      var p = M.cycleStart.split("-"), start = new Date(+p[0], +p[1] - 1, +p[2]);
      var weeks = Math.floor((now - start) / (7 * 864e5)) + (wd > 4 ? 1 : 0);
      wi = ((weeks % M.weeks.length) + M.weeks.length) % M.weeks.length;
    }
    var day = M.weeks[wi].days[wd > 4 ? 0 : wd] || [];
    var main = day.filter(function (x) { return /курк|куряч|шніцел|м'яс|котлет|тефтел|гуляш|риб|минтай|хек|фріттат|омлет|запіканк|сирник/i.test(x[0]); })[0] || day[0];
    if (main) el.textContent = (wd > 4 ? "У понеділок: " : "Сьогодні: ") + main[0];
  })();

  /* три кластери (js/clusters.js) */
  (function () {
    var C = window.CLUSTERS, list = $("#cl-list"), facts = $("#cl-facts");
    if (!C || !list) { var sec = $("#clusters"); if (sec) sec.hidden = true; return; }
    list.innerHTML = C.clusters.map(function (c, i) {
      var n = c.profiles.length;
      return '<div class="h-cl h-cl-' + esc(c.id) + '"><div class="h-cl-top"><h3>' + esc(c.name) + "</h3><span>" + n + " " + plural(n, "профіль", "профілі", "профілів") + "</span></div>" +
        '<ul class="h-cl-list">' + c.profiles.map(function (id) { return "<li>" + esc(C.profiles[id].name) + "</li>"; }).join("") + "</ul>" +
        '<p class="h-cl-deep"><b>Поглиблено:</b> ' + esc(c.deep) + "</p>" +
        '<a class="h-cl-btn" href="profile-test.html?cluster=' + esc(c.id) + '" aria-label="Тест кластера ' + esc(c.name) + '">Тест кластера →</a></div>';
    }).join("");
    facts.innerHTML = (C.facts || []).map(function (f) { return "<li><b>" + esc(f[0]) + "</b><span>" + esc(f[1]) + "</span></li>"; }).join("");
  })();

  /* гуртки */
  var clubs = D.clubs || [], filters = $("#club-filters"), clubList = $("#clubs-list"), curCat = "";
  var cats = [""].concat((D.clubCats || []).filter(function (c) {
    return clubs.some(function (x) { return x.cat === c; });
  }));

  filters.innerHTML = cats.length > 2 ? cats.map(function (c) {
    var n = c ? clubs.filter(function (x) { return x.cat === c; }).length : clubs.length;
    return '<button type="button" class="chip" aria-pressed="' + (c ? "false" : "true") + '" data-cat="' + esc(c) + '">' +
      esc(c || "Усі") + "<span>" + n + "</span></button>";
  }).join("") : "";

  /* частинки для анімацій гуртків (fx в data.js, стилі в style.css) */
  var FX_BITS = { dance: ["♪", "♫", "♪"], sing: ["♪", "♫", "♬"], paint: ["", "", ""], robot: ["0", "1", "0"],
                  eco: [ICON("leaf"), ICON("leaf"), ICON("leaf")], chess: ["♞"] };
  function fxBits(fx) {
    var b = FX_BITS[fx];
    return b ? '<span class="fx-bits" aria-hidden="true">' + b.map(function (x) { return "<i>" + x + "</i>"; }).join("") + "</span>" : "";
  }
  function clubCard(c, i) {
    var meta = [["user", "Керівник", c.leader], ["clock", "Розклад", c.time], ["pin", "Де проходить", c.place]]
      .filter(function (m) { return m[2]; });
    return '<li class="club' + (c.fx ? " fx-" + esc(c.fx) : "") + '" style="--i:' + i + '">' +
      '<div class="club-top">' + (c.grades ? '<span class="club-grades">' + esc(c.grades) + "</span>" : "") +
      '<span class="ico">' + ICON(c.icon || "star") + fxBits(c.fx) + "</span></div>" +
      "<h3>" + esc(c.name) + "</h3>" +
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
    if (clubRail) clubRail.reset();
  }
  var clubRail = null;
  filters.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b || b.getAttribute("aria-pressed") === "true") return;
    curCat = b.getAttribute("data-cat");
    $$(".chip", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    renderClubs(true);
  });
  renderClubs(false);
  clubRail = L.rail(clubList, $("#clubs-prev"), $("#clubs-next"));   /* гуртки в один ряд, стрілки по боках */

  /* відгуки (тільки перевірені) */
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

  /* схвалені в гугл-таблиці відгуки самі додаються зверху */
  /* відповідь таблиці тримаємо в sessionStorage 1 хв (зняли галочку - за хвилину зникне),
     якщо 8 с нема відповіді - показуємо збережене або просто текст */
  var feed = CONFIG.reviewEndpoint || CONFIG.formEndpoint;
  var RV_KEY = "l2reviews", RV_TTL = 60 * 1000, RV_TIMEOUT = 8000, base = reviews;
  function addFeed(list) {
    if (!Array.isArray(list)) return;
    var have = {};
    base.forEach(function (r) { have[(r.name || "") + "|" + (r.text || "")] = 1; });
    /* замінюємо список повністю, а не докидаємо, інакше зняті відгуки не зникнуть */
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

  /* форма відгуку */
  var rvForm = $("#rv-form"), rvSent = $("#rv-sent"), rvText = $("#rv-text");
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
  $("#rv-done").addEventListener("click", function () { rvReset(); $("#rv-name").focus(); });

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
      btn.classList.remove("loading"); lbl.textContent = "Надіслати відгук";
      $("#rv-sent-text").textContent = viaMail
        ? "Відкрилась ваша поштова програма: залишилось лише надіслати лист."
        : "Нам важлива ваша думка.";
      rvForm.hidden = true; rvSent.hidden = false; $("#rv-done").focus();
    }
    /* бот заповнив приховане поле - робимо вигляд, що все ок, і нічого не шлемо */
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

  /* фотокарусель і перегляд на весь екран */
  var photos = D.photos || [], track = $("#gal-track"), dots = $("#gal-dots"), gal = $("#gal");
  if (!photos.length) { $("#hero-gal").hidden = true; $("#gallery").hidden = true; return; }

  var photoHTML = L.photoHTML;
  /* фото в каруселі не обрізаємо: кадр показується цілком, а вільне місце - те саме фото розмите */
  track.innerHTML = photos.map(function (p, i) {
    return '<li class="gal-slide" aria-roledescription="слайд" aria-label="' + (i + 1) + " з " + photos.length + '">' +
      '<button type="button" class="gal-item" data-k="' + i + '" aria-label="Відкрити фото: ' + esc(p.caption || "фото " + (i + 1)) + '">' +
      (p.src ? '<span class="gal-blur" style="background-image:url(' + esc(p.src) + ')" aria-hidden="true"></span>' : "") +
      photoHTML(p, i, i === 0 ? "high" : true) + (p.caption ? '<span class="gal-cap">' + esc(p.caption) + "</span>" : "") + "</button></li>";
  }).join("");
  dots.innerHTML = photos.map(function (p, i) {
    return '<button type="button" data-k="' + i + '" aria-label="Фото ' + (i + 1) + '"></button>';
  }).join("");

  var slides = $$(".gal-slide", track), cur = 0;
  function nearest() {
    var x = track.scrollLeft, best = 0, d = Infinity;
    slides.forEach(function (s, i) { var dd = Math.abs(s.offsetLeft - slides[0].offsetLeft - x); if (dd < d) { d = dd; best = i; } });
    /* докрутили до кінця - активний останній */
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
    /* деякі браузери не вміють плавно скролити, тоді просто стрибаємо */
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

  /* автопрокрутка раз на 5 с, стоп, коли мишка/фокус на каруселі або її не видно */
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

  /* "Життя ліцею у фото": перші 7 фото сіткою, клік - на весь екран (гортаються всі) */
  $("#h-photos").innerHTML = photos.slice(0, 7).map(function (p, i) {
    return '<li><button type="button" class="gal-item" data-k="' + i + '" aria-label="Відкрити фото на весь екран: ' + esc(p.caption || "фото " + (i + 1)) + '">' +
      photoHTML(p, i, true) + (p.caption ? '<span class="gal-cap">' + esc(p.caption) + "</span>" : "") + "</button></li>";
  }).join("");
  $("#h-photos").addEventListener("click", function (e) {
    var b = e.target.closest(".gal-item");
    if (!b) return;
    L.lightbox(photos, +b.getAttribute("data-k"), function (at) {
      var x = $('#h-photos .gal-item[data-k="' + at + '"]') || b; x.focus({ preventScroll: true });
    });
  });

  /* на весь екран, а після закриття карусель стає на те саме фото */
  track.addEventListener("click", function (e) {
    var b = e.target.closest(".gal-item");
    if (!b) return;
    L.lightbox(photos, +b.getAttribute("data-k"), function (at) {
      go(at);
      var x = track.querySelector('.gal-item[data-k="' + at + '"]'); if (x) x.focus({ preventScroll: true });
    });
  });
})();
