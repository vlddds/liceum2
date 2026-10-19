/* Тест кластера (profile-test.html?cluster=stem|lang|social): тільки завдання у форматі НМТ,
   поділені на розділи за предметами. Без питань про інтереси - для цього є повний тест.
   Завдання - nmt-tasks.js, кластери й профілі - clusters.js, спільні шматки - quiz-kit.js.
   Зберігається тільки в localStorage, нікуди нічого не відправляється. */
(function () {
  "use strict";

  var L = window.L2, Q = window.QUIZ, C = window.CLUSTERS, TASKS = window.NMT_TASKS || [];
  if (!L || !Q || !C) return;
  var qs = new URLSearchParams(location.search), CL = null;
  C.clusters.forEach(function (c) { if (c.id === qs.get("cluster")) CL = c; });
  if (!CL) return;   /* без кластера (або з неправильним) працює повний тест, profile-test.js */
  var $ = L.$, esc = L.esc, ICON = L.ICON, restart = L.restart, reduce = L.reduce;
  var DEBUG = qs.get("debug") === "1", PER = 8, KEY = "l2pt-nmt-" + CL.id;

  /* розділи кожного кластера: предмет і які профілі він підтримує */
  var SECTIONS = {
    stem: [["Математика", ["IT", "ENG"]], ["Інформатика", ["IT"]], ["Фізика", ["ENG"]], ["Хімія", ["BIO"]], ["Біологія", ["BIO"]]],
    lang: [["Українська мова", ["UA"]], ["Українська література", ["UA"]], ["Іноземна мова", ["FL"]]],
    social: [["Історія України", ["HIST"]], ["Географія", ["ECO"]], ["Математика", ["ECO"]]]
  }[CL.id];
  var ICONS = { "Математика": "coins", "Інформатика": "cpu", "Фізика": "star", "Хімія": "leaf", "Біологія": "heart",
    "Українська мова": "pen", "Українська література": "book", "Іноземна мова": "quote", "Історія України": "award", "Географія": "pin" };
  var NOTE = { "Інформатика": "НМТ з інформатики немає, тому ці завдання склали в ліцеї." };

  function pool(subj, grade) {
    return TASKS.filter(function (t) { return t.subject === subj && (DEBUG || !t.draft) && (grade > 9 || t.level === "basic"); });
  }
  function byId(id) { var r = null; TASKS.forEach(function (t) { if (t.id === id) r = t; }); return r; }

  var state = Q.load(KEY);
  if (!state || !state.sec) state = { grade: null, sec: {}, cur: null, queue: [] };
  function save() { Q.save(KEY, state); }

  /* каркас */
  var title = "Тест кластера «" + CL.name + "»";
  document.title = title + " · Підгородненський Ліцей №2";
  $("#main").innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1"><div class="hero-bg" aria-hidden="true"><span class="num">НМТ</span></div>' +
    '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
    '<a href="profile.html#profiles">Перехід на профільне навчання</a><span aria-hidden="true">/</span>' +
    '<span aria-current="page">' + esc(title) + "</span></nav>" +
    '<h1 id="h1">' + esc(title) + '</h1><p class="hero-sub">Перевір себе на завданнях у форматі НМТ з предметів, які в цьому кластері вивчають поглиблено: ' +
    esc(SECTIONS.map(function (s) { return s[0].toLowerCase(); }).join(", ")) + ".</p></div></section>" +
    '<section class="sec alt pf-sec pt-sec" aria-label="Тест"><div class="wrap"><div class="pf pt" id="pf" tabindex="-1"></div></div></section>';
  var box = $("#pf");
  function show(html, focusSel) {
    box.innerHTML = html;
    if (!reduce) restart(box, "swap");
    var top = box.getBoundingClientRect().top + window.pageYOffset - 90;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
    var f = focusSel && $(focusSel, box);
    if (f) f.focus({ preventScroll: true });
  }

  function score(s) {
    var sec = state.sec[s], ok = 0, n = 0;
    if (!sec) return null;
    sec.ids.forEach(function (id) { var t = byId(id); if (t && sec.ans[id] != null) { n++; if (sec.ans[id] === t.answer) ok++; } });
    return { ok: ok, n: n, all: sec.ids.length, done: sec.done };
  }
  function comment(q) {
    return q >= 0.75 ? "Чудово! Схоже, цей предмет тобі вдається." : q >= 0.5 ? "Непогано, є що підтягнути." : "Це нормально — частина цих тем ще попереду.";
  }

  /* головний екран: клас і розділи */
  function home() {
    var anyDone = SECTIONS.some(function (s) { var x = score(s[0]); return x && x.done; });
    var html = '<div class="pf-card pf-intro"><h2 tabindex="-1" id="pf-h">Перевір себе у форматі НМТ</h2>' +
      "<p>Завдання з демонстраційних варіантів НМТ від УЦОЯО. Обери розділ або пройди всі по черзі. " +
      "Після кожної відповіді побачиш правильну й коротке пояснення.</p>" +
      '<ul class="pf-facts"><li>' + ICON("shield") + "<span><b>Твої відповіді нікуди не надсилаються</b>: усе рахується на твоєму пристрої</span></li></ul>" +
      '<fieldset class="pf-q pt-group" data-id="grade"><legend>У якому ти класі?</legend><div class="pt-choices pt-row">' +
      [9, 10, 11].map(function (g) {
        return '<label class="pt-choice"><input type="radio" name="grade" value="' + g + '"' + (state.grade === g ? " checked" : "") + "><span>" + g + " клас</span></label>";
      }).join("") + '</div><p class="pf-small pt-grade-note">9 клас бачить завдання, посильні до 9 класу включно; 10–11 — ще й завдання повного НМТ.</p></fieldset>' +
      '<p class="pf-warn" id="pf-warn" role="alert" hidden>Спершу обери клас.</p></div>' +
      '<ul class="pt-secs">' + SECTIONS.map(function (s) {
        var x = score(s[0]), n = state.grade ? Math.min(PER, pool(s[0], state.grade).length) : Math.min(PER, pool(s[0], 11).length);
        return '<li class="pt-sec-card' + (x && x.done ? " done" : "") + '"><span class="ico">' + ICON(ICONS[s[0]] || "book") + "</span>" +
          "<div><b>" + esc(s[0]) + "</b><small>" + (x && x.done ? "Результат: " + x.ok + " з " + x.all : n ? n + " " + L.plural(n, "завдання", "завдання", "завдань") : "завдань поки немає") +
          (NOTE[s[0]] ? " · " + esc(NOTE[s[0]]) : "") + "</small></div>" +
          (n ? '<button type="button" class="btn' + (x && x.done ? "" : " primary") + '" data-act="sec" data-s="' + esc(s[0]) + '">' + (x && x.done ? "Ще раз" : x ? "Продовжити" : "Почати") + "</button>" : "") + "</li>";
      }).join("") + "</ul>" +
      '<div class="pf-btns"><button type="button" class="btn primary" data-act="all">Пройти всі розділи' + ICON("chev") + "</button>" +
      (anyDone ? '<button type="button" class="btn" data-act="result">Мій результат</button>' : "") + "</div>" +
      '<p class="pt-also">Хочеш порівняти всі три кластери за інтересами, оцінками й планами? <a href="profile-test.html">Повний тест</a></p>';
    show(html, "#pf-h");
  }
  function needGrade() {
    if (state.grade) return false;
    var w = $("#pf-warn"); w.hidden = false;
    var i = $('input[name="grade"]', box); if (i) i.focus();
    return true;
  }

  /* розділ */
  function startSec(s) {
    var p = Q.shuffle(pool(s, state.grade));
    if (state.grade > 9) p.sort(function (a, b) { return (b.level === "full") - (a.level === "full"); });   /* 10-11: спершу повне НМТ */
    var ids = Q.shuffle(p.slice(0, PER)).map(function (t) { return t.id; });
    state.sec[s] = { ids: ids, ans: {}, done: false };
    state.cur = { s: s, i: 0 };
    save(); task();
  }
  function resumeSec(s) {
    var sec = state.sec[s], i = 0;
    while (i < sec.ids.length - 1 && sec.ans[sec.ids[i]] != null) i++;
    state.cur = { s: s, i: i }; save(); task();
  }
  function task() {
    var s = state.cur.s, sec = state.sec[s], i = state.cur.i, t = byId(sec.ids[i]), ans = sec.ans[t.id], done = ans != null;
    var html = '<div class="pf-card pt-task"><span class="pf-part">' + esc(s) + " · завдання " + (i + 1) + " з " + sec.ids.length + "</span>" +
      '<div class="pf-progress"><div class="pf-bar" role="progressbar" aria-label="Пройдено в розділі" aria-valuemin="0" aria-valuemax="' + sec.ids.length +
      '" aria-valuenow="' + i + '"><i style="width:' + (i / sec.ids.length * 100).toFixed(1) + '%"></i></div></div>' +
      '<h2 tabindex="-1" id="pf-h" class="pt-task-q">' + t.question + "</h2>" +   /* у завданнях дозволені <sup>/<sub>/<code>, файл наш */
      (t.image ? '<img class="pt-task-img" src="' + esc(t.image) + '" alt="Рисунок до завдання">' : "") +
      '<fieldset class="pt-opts"' + (done ? " disabled" : "") + '><legend class="sr">Варіанти відповіді</legend>' + t.options.map(function (o, j) {
        var cls = done ? (j === t.answer ? " ok" : j === ans ? " bad" : "") : "";
        return '<label class="pt-opt' + cls + '"><input type="radio" name="task" value="' + j + '"' + (ans === j ? " checked" : "") + "><b>" + "АБВГД".charAt(j) + "</b><span>" + o + "</span></label>";
      }).join("") + "</fieldset>" +
      '<div class="pt-expl" aria-live="polite">' + (done ? "<p><b>" + (ans === t.answer ? "Правильно!" : "Правильна відповідь: " + "АБВГД".charAt(t.answer)) + "</b> " + t.explanation + "</p>" : "") + "</div>" +
      '<p class="pt-src">Джерело: ' + esc(t.source || "") + "</p>" +
      '<div class="pf-nav"><button type="button" class="btn" data-act="back">' + ICON("chev") + (i ? "Назад" : "До розділів") + "</button><span></span>" +
      '<button type="button" class="btn primary" data-act="next"' + (done ? "" : " disabled") + ">" + (i === sec.ids.length - 1 ? "Завершити розділ" : "Далі") + ICON("chev") + "</button></div></div>";
    show(html, "#pf-h");
  }
  function secDone() {
    var s = state.cur.s, x;
    state.sec[s].done = true;
    state.queue = (state.queue || []).filter(function (q) { return q !== s; });
    save();
    x = score(s);
    var nextS = state.queue[0];
    show('<div class="pf-card pt-secres"><span class="pf-part">Розділ завершено</span><h2 tabindex="-1" id="pf-h">' + esc(s) + ": " + x.ok + " з " + x.all + "</h2>" +
      "<p>" + comment(x.ok / x.all) + "</p>" +
      '<div class="pf-btns">' + (nextS ? '<button type="button" class="btn primary" data-act="sec" data-s="' + esc(nextS) + '">Далі: ' + esc(nextS) + ICON("chev") + "</button>" : "") +
      '<button type="button" class="btn' + (nextS ? "" : " primary") + '" data-act="result">Мій результат</button>' +
      '<button type="button" class="btn" data-act="home">До розділів</button></div></div>', "#pf-h");
  }

  /* результат: по предметах і який профіль кластера ближчий */
  function result() {
    var rows = SECTIONS.map(function (s) { var x = score(s[0]); return { s: s[0], p: s[1], x: x && x.done ? x : null }; });
    var done = rows.filter(function (r) { return r.x; });
    var prof = {};
    CL.profiles.forEach(function (p) {
      var sum = 0, n = 0;
      done.forEach(function (r) { if (r.p.indexOf(p) > -1) { sum += r.x.ok / r.x.all; n++; } });
      prof[p] = n ? Math.round(sum / n * 100) : null;
    });
    var ranked = CL.profiles.filter(function (p) { return prof[p] != null; }).sort(function (a, b) { return prof[b] - prof[a]; });
    var best = ranked[0], bp = best && C.profiles[best];
    var html = '<div class="pf-result" id="pf-result"><div class="pf-card pf-res-head"><p class="pf-print-title">' + esc(title) + " · Ліцей №2 Підгородненської міської ради</p>" +
      '<h2 tabindex="-1" id="pf-h">Твій результат</h2><p class="pf-date">' + esc(Q.fmtDate(new Date().toISOString())) + (state.grade ? " · " + state.grade + " клас" : "") + "</p>" +
      '<ul class="pf-bars pt-bars">' + rows.map(function (r) {
        var v = r.x ? Math.round(r.x.ok / r.x.all * 100) : 0;
        return '<li class="' + (r.x && v >= 75 ? "top" : "") + '"><div class="pf-bar-row"><span class="pf-bar-name">' + esc(r.s) + "</span>" +
          '<span class="pf-bar-track" aria-hidden="true"><i style="width:' + Math.max(2, v) + '%"></i></span><span class="pf-bar-val">' +
          (r.x ? r.x.ok + " з " + r.x.all : "не пройдено") + "</span></div>" + (r.x ? '<p class="pf-tip">' + comment(r.x.ok / r.x.all) + "</p>" : "") + "</li>";
      }).join("") + "</ul></div>";
    var tie = ranked.length > 1 && prof[ranked[0]] === prof[ranked[1]];   /* однаково - не вигадуємо переможця */
    if (tie) html += '<div class="pf-card"><h3>Профілі кластера однаково близькі</h3><p>За завданнями ' +
      esc(ranked.map(function (p) { return C.profiles[p].name + " — " + prof[p] + "%"; }).join(", ")) +
      '. Щоб обрати між ними, допоможе <a href="profile-test.html">повний тест</a>: він врахує ще й інтереси та плани.</p></div>';
    else if (bp) html += '<div class="pf-card"><h3>Профіль кластера, де твої сильні предмети</h3><div class="pf-prof pt-best"><span class="pf-tag">За результатами завдань · ' + prof[best] + "%</span>" +
      "<h4>" + esc(bp.name) + "</h4><p>" + esc(bp.desc) + '</p><p class="pt-kv"><b>Поглиблено:</b> ' + esc(bp.deep.join(", ")) + "</p></div>" +
      (ranked.length > 1 ? '<p class="pf-small">Інші профілі кластера: ' + ranked.slice(1).map(function (p) { return esc(C.profiles[p].name) + " — " + prof[p] + "%"; }).join("; ") + ".</p>" : "") +
      (done.length < rows.length ? '<p class="pf-small">Пройдено не всі розділи — пройди решту, щоб порівняння було точнішим.</p>' : "") + "</div>";
    html += '<div class="pf-card"><h3>Що далі</h3><ul class="pf-next">' +
      "<li>" + ICON("star") + '<div><b>Порівняй за інтересами</b><p>Оцінки — це лише частина картини. <a href="profile-test.html">Повний тест</a> врахує ще й інтереси та плани.</p></div></li>' +
      "<li>" + ICON("chat") + "<div><b>Обговори результат</b><p>З батьками, класним керівником чи вчителем предмета: вони підкажуть, що підтягнути.</p></div></li></ul></div>" +
      '<p class="b-note warn pf-disclaimer">' + ICON("alert") + "<span><b>Це тренування, а не іспит.</b> Кілька завдань не покажуть усіх твоїх знань — профіль обирай з урахуванням інтересів.</span></p>" +
      '<div class="pf-btns pf-res-btns"><button type="button" class="btn primary" data-act="print">' + ICON("doc") + "Зберегти PDF / роздрукувати</button>" +
      '<button type="button" class="btn" data-act="home">До розділів</button><button type="button" class="btn" data-act="reset">Почати заново</button></div></div>';
    show(html, "#pf-h");
  }

  box.addEventListener("change", function (e) {
    var inp = e.target;
    if (inp.name === "grade") {
      var g = +inp.value;
      if (g !== state.grade) { state.grade = g; state.sec = {}; state.queue = []; }   /* інший клас - інші завдання */
      save(); home();
      var r = $('input[name="grade"][value="' + g + '"]', box); if (r) r.focus();
    } else if (inp.name === "task" && state.cur) {
      var sec = state.sec[state.cur.s], id = sec.ids[state.cur.i];
      sec.ans[id] = +inp.value; save(); task();
      var nb = $('[data-act="next"]', box); if (nb) nb.focus();
    }
  });
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    var act = b.getAttribute("data-act");
    if (act === "sec") {
      if (needGrade()) return;
      var s = b.getAttribute("data-s"), x = state.sec[s];
      if (x && !x.done && Object.keys(x.ans).length) resumeSec(s); else startSec(s);
    } else if (act === "all") {
      if (needGrade()) return;
      state.queue = SECTIONS.map(function (s) { return s[0]; }).filter(function (s) { return pool(s, state.grade).length; });
      save(); startSec(state.queue[0]);
    } else if (act === "next") {
      if (state.cur.i < state.sec[state.cur.s].ids.length - 1) { state.cur.i++; save(); task(); } else secDone();
    } else if (act === "back") {
      if (state.cur.i > 0) { state.cur.i--; save(); task(); } else { state.queue = []; save(); home(); }
    } else if (act === "home") { state.queue = []; save(); home(); }
    else if (act === "result") result();
    else if (act === "reset") { state = { grade: state.grade, sec: {}, cur: null, queue: [] }; save(); home(); }
    else if (act === "print") window.print();
  });

  home();
})();
