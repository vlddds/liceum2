/* Тест на вибір профілю (profile-test.html), повний режим. Продовження профтесту Голланда.
   З ?cluster=... сторінку бере на себе cluster-quiz.js (завдання НМТ за предметами).
   Профілі й кластери - clusters.js, завдання НМТ - nmt-tasks.js, спільні шматки - quiz-kit.js.
   Режими: повний (без параметра) і кластер (?cluster=stem|lang|social).
   ?debug=1 - видно чернетки завдань НМТ, а &today=2026-10-15 підміняє сьогоднішню дату.
   Нічого нікуди не відправляється, прогрес і результат - тільки в localStorage. */
(function () {
  "use strict";

  var L = window.L2, Q = window.QUIZ, C = window.CLUSTERS;
  if (!L || !Q || !C) { if (window.console) console.error("Не завантажено js/common.js, js/quiz-kit.js або js/clusters.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart, reduce = L.reduce;
  var PROFS = C.profiles, ORDER = ["IT", "ENG", "BIO", "FL", "UA", "HIST", "ECO"];

  /* режим і налагодження */
  var qs = new URLSearchParams(location.search);
  var CL = null;
  C.clusters.forEach(function (c) { if (c.id === qs.get("cluster")) CL = c; });
  if (CL) return;   /* тест кластера (лише завдання НМТ за предметами) - в cluster-quiz.js */
  var MODE = CL ? CL.id : "full", P = CL ? CL.profiles : ORDER;
  var DEBUG = qs.get("debug") === "1";
  function today() {
    var t = DEBUG && qs.get("today") ? new Date(qs.get("today") + "T12:00:00") : new Date();
    return isNaN(t) ? new Date() : t;
  }
  var KEY = "l2pt-progress-" + MODE, KEY_RES = "l2pt-result-" + MODE, HOLLAND = "l2prof-result";
  var PER_SCREEN = 6, GAP = 7;

  /* блок 1: інтереси. t - коротко, для пояснення в результаті */
  var INTERESTS = {
    IT: [["Мені подобається розв'язувати задачі, де треба знайти закономірність.", "пошук закономірностей"],
      ["Мені цікаво програмувати або розбиратися, як працюють програми й сайти.", "програмування"],
      ["Я охоче беруся за олімпіадні чи логічні задачі.", "логічні задачі"]],
    ENG: [["Мені цікаво, як працюють двигуни, електрика, різні пристрої.", "техніка й електрика"],
      ["Я люблю досліди з фізики та вимірювання.", "досліди з фізики"],
      ["Мені було б цікаво конструювати роботів, механізми чи будівлі.", "конструювання"]],
    BIO: [["Мені цікаво, як влаштований організм людини.", "організм людини"],
      ["Мені подобаються досліди з хімії чи спостереження за живою природою.", "хімія й жива природа"],
      ["Я думаю про професію лікаря, фармацевта, біолога чи еколога.", "медичні й біологічні професії"]],
    FL: [["Мені подобається вивчати іноземні мови.", "іноземні мови"],
      ["Я дивлюся відео, серіали чи читаю іноземною мовою з власної ініціативи.", "відео й книжки іноземною"],
      ["Мені хотілося б працювати перекладачем, у міжнародній компанії або за кордоном.", "робота з іноземними мовами"]],
    UA: [["Я із задоволенням читаю книжки, не лише за програмою.", "читання"],
      ["Мені подобається писати тексти: твори, есе, пости.", "писати тексти"],
      ["Мені було б цікаво вести блог, працювати в медіа чи журналістиці.", "медіа й журналістика"]],
    HIST: [["Мені цікаво розбиратися, чому відбувалися історичні події.", "історія"],
      ["Я люблю дискутувати й відстоювати свою думку аргументами.", "дискусії"],
      ["Мені цікаво, як працюють закони, суди й держава.", "закони й держава"]],
    ECO: [["Мені цікаво, як працює бізнес і звідки беруться гроші.", "бізнес і гроші"],
      ["Я хотів(ла) би колись мати власну справу.", "власна справа"],
      ["Мені подобається планувати бюджет або рахувати, що вигідніше.", "планування бюджету"]]
  };
  /* блок 2: предмети. low - як писати в реченні, pl - множина ("даються") */
  var SUBJECTS = [
    { id: "math", name: "Алгебра і геометрія", low: "алгебра й геометрія", pl: true, w: { IT: 1, ENG: 1, ECO: 0.5 } },
    { id: "inf", name: "Інформатика", low: "інформатика", w: { IT: 1 } },
    { id: "phys", name: "Фізика", low: "фізика", w: { ENG: 1 } },
    { id: "chem", name: "Хімія", low: "хімія", w: { BIO: 1 } },
    { id: "bio", name: "Біологія", low: "біологія", w: { BIO: 1 } },
    { id: "geo", name: "Географія", low: "географія", w: { ECO: 0.5, BIO: 0.5 } },
    { id: "ualang", name: "Українська мова", low: "українська мова", w: { UA: 1 } },
    { id: "ualit", name: "Українська література", low: "українська література", w: { UA: 1 } },
    { id: "fl", name: "Іноземна мова", low: "іноземна мова", w: { FL: 1 } },
    { id: "hist", name: "Історія", low: "історія", w: { HIST: 1 } },
    { id: "law", name: "Правознавство", low: "правознавство", w: { HIST: 1 } }
  ];
  var GRADE_LABELS = ["Дуже важко", "Важкувато", "Середньо", "Легко", "Дуже легко"];
  /* блок 3: плани */
  var NMT = [
    { id: "fl", name: "Іноземна мова", acc: "іноземну мову", subj: "fl", w: { FL: 1 } },
    { id: "bio", name: "Біологія", acc: "біологію", subj: "bio", w: { BIO: 1 } },
    { id: "chem", name: "Хімія", acc: "хімію", subj: "chem", w: { BIO: 1 } },
    { id: "phys", name: "Фізика", acc: "фізику", subj: "phys", w: { ENG: 1, IT: 0.5 } },
    { id: "lit", name: "Українська література", acc: "українську літературу", subj: "ualit", w: { UA: 1 } },
    { id: "geo", name: "Географія", acc: "географію", subj: "geo", w: { ECO: 1 } },
    { id: "none", name: "Ще не знаю", w: {} }
  ];
  var CAREERS = [
    { id: "it", name: "IT і програмування", p: "IT" },
    { id: "eng", name: "Інженерія, будівництво, енергетика", p: "ENG" },
    { id: "med", name: "Медицина, фармація, біологія", p: "BIO" },
    { id: "fl", name: "Переклад, міжнародні відносини", p: "FL" },
    { id: "media", name: "Журналістика, медіа, філологія", p: "UA" },
    { id: "law", name: "Право, історія, політика", p: "HIST" },
    { id: "eco", name: "Економіка, бізнес, фінанси", p: "ECO" },
    { id: "none", name: "Ще не знаю" }
  ];
  /* бонус за результат тесту Голланда */
  var HOLLAND_MAP = { I: ["IT", "ENG", "BIO"], R: ["ENG"], C: ["IT", "ECO"], A: ["UA", "FL"], S: ["FL", "UA", "HIST"], E: ["ECO", "HIST"] };

  function inMode(w) { return Object.keys(w).some(function (p) { return P.indexOf(p) > -1; }); }
  function clusterOf(p) { var r = null; C.clusters.forEach(function (c) { if (c.profiles.indexOf(p) > -1) r = c; }); return r; }
  function list(arr) { return arr.length < 2 ? arr.join("") : arr.slice(0, -1).join(", ") + " і " + arr[arr.length - 1]; }
  function pct(v) { return Math.round(v) + "%"; }

  /* твердження блоку 1 (тільки профілі режиму), перемішані з фіксованим seed */
  var ITEMS = Q.shuffle([].concat.apply([], P.map(function (p) {
    return INTERESTS[p].map(function (x, i) { return { id: p + (i + 1), p: p, text: x[0], t: x[1] }; });
  })), Q.rng(2027));
  var SUBJ = SUBJECTS.filter(function (s) { return inMode(s.w); });

  var BASE = [{ k: "start" }];
  for (var i = 0; i < ITEMS.length; i += PER_SCREEN) BASE.push({ k: "int", items: ITEMS.slice(i, i + PER_SCREEN) });
  for (i = 0; i < SUBJ.length; i += PER_SCREEN) BASE.push({ k: "subj", items: SUBJ.slice(i, i + PER_SCREEN) });
  BASE.push({ k: "plans" });

  function fresh() { return { grade: null, cur: null, a: {}, s: {}, nmt: null, car: [], tasks: null, ta: {}, step: 0 }; }
  var state = Q.load(KEY);
  if (!state || !state.a) state = fresh();
  function steps() {
    return state.tasks && state.tasks.length ? BASE.concat([{ k: "nmt" }], state.tasks.map(function (id) { return { k: "task", id: id }; })) : BASE;
  }
  function taskById(id) { var r = null; (window.NMT_TASKS || []).forEach(function (t) { if (t.id === id) r = t; }); return r; }

  /* каркас */
  var title = CL ? "Тест кластера «" + CL.name + "»" : "Тест на вибір профілю";
  $("#main").innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1"><div class="hero-bg" aria-hidden="true"><span class="num">7</span></div>' +
    '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
    '<a href="profile.html">Перехід на профільне навчання</a><span aria-hidden="true">/</span>' +
    '<span aria-current="page">' + esc(title) + "</span></nav>" +
    '<h1 id="h1">' + esc(title) + '</h1><p class="hero-sub">' + (CL
      ? "Який профіль кластера тобі ближчий: " + esc(list(CL.profiles.map(function (p) { return PROFS[p].name; }))) + "."
      : "Інтереси, оцінки й плани — і тест підкаже, який із 7 профілів ліцею тобі ближчий.") + "</p></div></section>" +
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

  /* вступ */
  function intro() {
    var res = Q.load(KEY_RES), started = state.step > 0 || state.grade;
    var html = '<div class="pf-card pf-intro">' +
      (res ? '<div class="pf-prev">' + ICON("check") + "<div><b>Твій попередній результат</b><small>" + esc(Q.fmtDate(res.date)) + " · " +
        esc(PROFS[analyze(res).best].name) + '</small></div><div class="pf-prev-btns"><button type="button" class="btn primary" data-act="show-prev">Переглянути</button>' +
        '<button type="button" class="btn" data-act="restart">Пройти заново</button></div></div>' : "") +
      '<h2 tabindex="-1" id="pf-h">' + (CL ? esc(title) + ": який профіль тобі ближчий" : "Який профіль тобі ближчий") + "</h2>" +
      "<p>" + (CL ? "Профілі кластера: " + esc(list(CL.profiles.map(function (p) { return PROFS[p].name; }))) + ". "
        : "Тест порівняє всі три кластери й сім профілів ліцею. ") +
      "Ти відповіси, що тобі цікаво, які предмети вдаються і які в тебе плани.</p>" +
      '<ul class="pf-facts">' +
      "<li>" + ICON("clock") + "<span><b>" + (CL ? "4–5 хвилин" : "Близько 10 хвилин") + "</b>, три короткі блоки й необов'язкові завдання НМТ</span></li>" +
      "<li>" + ICON("star") + "<span><b>Правильних відповідей немає</b>: відповідай чесно, як є</span></li>" +
      "<li>" + ICON("shield") + "<span><b>Твої відповіді нікуди не надсилаються</b>: усе рахується на твоєму пристрої</span></li>" +
      "</ul>" +
      (Q.load(HOLLAND) ? "" : '<p class="pt-hint">' + ICON("alert") + '<span>Ще не проходив(ла) тест інтересів? <a href="proforientation.html">Почни з нього</a> — так результат буде точнішим.</span></p>') +
      '<div class="pf-btns">' + (started
        ? '<button type="button" class="btn primary" data-act="resume">Продовжити' + ICON("chev") + "</button>" +
          '<button type="button" class="btn" data-act="restart">Почати спочатку</button>'
        : '<button type="button" class="btn primary" data-act="start">Почати тест' + ICON("chev") + "</button>") +
      "</div></div>";
    show(html, "#pf-h");
  }

  /* шапка екрана з прогресом */
  function head(part, h, text) {
    var n = Math.min(state.step, BASE.length), total = BASE.length;
    return '<div class="pf-card"><div class="pf-head"><span class="pf-part">' + esc(part) + "</span>" +
      '<h2 tabindex="-1" id="pf-h">' + esc(h) + "</h2>" + (text ? "<p>" + esc(text) + "</p>" : "") +
      '<div class="pf-progress"><div class="pf-bar" role="progressbar" aria-label="Пройдено" aria-valuemin="0" aria-valuemax="' + total +
      '" aria-valuenow="' + n + '"><i style="width:' + (n / total * 100).toFixed(1) + '%"></i></div>' +
      '<p class="pf-step" aria-live="polite">' + (state.step < BASE.length ? "Екран " + (state.step + 1) + " з " + total : "Додатковий блок") + "</p></div></div></div>";
  }
  function nav(nextLabel) {
    return '<p class="pf-warn" id="pf-warn" role="alert" hidden></p>' +
      '<div class="pf-nav"><button type="button" class="btn" data-act="back">' + ICON("chev") + "Назад</button><span></span>" +
      '<button type="button" class="btn primary" data-act="next">' + esc(nextLabel || "Далі") + ICON("chev") + "</button></div>";
  }
  function choice(type, name, value, label, checked, extra) {
    return '<label class="pt-choice"><input type="' + type + '" name="' + name + '" value="' + esc(value) + '"' + (checked ? " checked" : "") + (extra || "") +
      "><span>" + esc(label) + "</span></label>";
  }

  function screen(n) {
    var st = steps();
    n = Math.max(0, Math.min(n, st.length - 1));
    state.step = n; Q.save(KEY, state);
    var s = st[n], html;
    if (s.k === "start") {
      html = head("Початок", "Про тебе") +
        '<fieldset class="pf-q pt-group" data-id="grade"><legend>У якому ти класі?</legend><div class="pt-choices pt-row">' +
        [9, 10, 11].map(function (g) { return choice("radio", "grade", g, g + " клас", state.grade === g); }).join("") + "</div></fieldset>" +
        '<fieldset class="pf-q pt-group" data-id="cur"' + (state.grade > 9 ? "" : " hidden") + "><legend>Який профіль ти зараз вивчаєш?</legend><div class=\"pt-choices\">" +
        ORDER.map(function (p) { return choice("radio", "cur", p, PROFS[p].name, state.cur === p); }).join("") +
        choice("radio", "cur", "none", "Не знаю / інше", state.cur === "none") + "</div></fieldset>" + nav();
    } else if (s.k === "int") {
      html = head("Блок 1 з 3", "Що мені цікаво", "Наскільки кожне твердження про тебе? Думай про те, що подобається, а не про оцінки.") +
        '<div class="pf-qs">' + s.items.map(function (q) { return Q.scale({ id: q.id, text: q.text, value: state.a[q.id], num: ITEMS.indexOf(q) + 1 }); }).join("") + "</div>" + nav();
    } else if (s.k === "subj") {
      html = head("Блок 2 з 3", "Що мені вдається", "Наскільки легко тобі дається предмет? Якщо не вивчаєш його — так і познач.") +
        '<div class="pf-qs">' + s.items.map(function (x) {
          return Q.scale({ id: "s-" + x.id, text: x.name, value: state.s[x.id], labels: GRADE_LABELS, na: "Не вивчаю / важко сказати" });
        }).join("") + "</div>" + nav();
    } else if (s.k === "plans") {
      html = head("Блок 3 з 3", "Мої плани") +
        '<fieldset class="pf-q pt-group" data-id="nmt"><legend>Який предмет на вибір ти, найімовірніше, складатимеш на НМТ?</legend><div class="pt-choices">' +
        NMT.map(function (o) { return choice("radio", "nmt", o.id, o.name, state.nmt === o.id); }).join("") + "</div></fieldset>" +
        '<fieldset class="pf-q pt-group" data-id="car"><legend>Ким бачиш себе після школи? <small>До 2 варіантів</small></legend><div class="pt-choices">' +
        CAREERS.map(function (o) { return choice("checkbox", "car", o.id, o.name, state.car.indexOf(o.id) > -1); }).join("") + "</div></fieldset>" +
        nav(pickTasks().length ? "Далі" : "Показати результат");
    } else if (s.k === "nmt") {
      var nine = state.grade === 9;
      html = '<div class="pf-card"><span class="pf-part">Додатковий блок</span><h2 tabindex="-1" id="pf-h">' + (nine ? "Спробуй предмет на смак" : "Перевір себе у форматі НМТ") + "</h2>" +
        "<p>" + state.tasks.length + " " + L.plural(state.tasks.length, "завдання", "завдання", "завдань") + " з предметів профілів, які тобі найближчі. " +
        "На результат профілю вони не впливають" + (nine ? "" : ", але допоможуть з порадою щодо предмета НМТ") + ". Можна пропустити.</p>" +
        '<div class="pf-btns"><button type="button" class="btn primary" data-act="next">Почати' + ICON("chev") + "</button>" +
        '<button type="button" class="btn" data-act="skip">Пропустити</button></div></div>';
    } else {
      var t = taskById(s.id), ans = state.ta[s.id], done = ans != null, k = state.tasks.indexOf(s.id);
      html = '<div class="pf-card pt-task"><span class="pf-part">' + esc(t.subject) + " · завдання " + (k + 1) + " з " + state.tasks.length + "</span>" +
        '<h2 tabindex="-1" id="pf-h" class="pt-task-q">' + t.question + "</h2>" +   /* у завданнях дозволені <sup>/<sub>, файл наш */
        (t.image ? '<img class="pt-task-img" src="' + esc(t.image) + '" alt="Рисунок до завдання">' : "") +
        '<fieldset class="pt-opts"' + (done ? " disabled" : "") + '><legend class="sr">Варіанти відповіді</legend>' + t.options.map(function (o, j) {
          var cls = done ? (j === t.answer ? " ok" : j === ans ? " bad" : "") : "";
          return '<label class="pt-opt' + cls + '"><input type="radio" name="task" value="' + j + '"' + (ans === j ? " checked" : "") + '><b>' + "АБВГД".charAt(j) + "</b><span>" + o + "</span></label>";
        }).join("") + "</fieldset>" +
        '<div class="pt-expl" aria-live="polite">' + (done ? "<p><b>" + (ans === t.answer ? "Правильно!" : "Правильна відповідь: " + "АБВГД".charAt(t.answer)) + "</b> " + t.explanation + "</p>" : "") + "</div>" +
        '<p class="pt-src">Джерело: ' + esc(t.source || "") + "</p>" +
        '<div class="pf-nav"><button type="button" class="btn" data-act="back">' + ICON("chev") + "Назад</button><span></span>" +
        '<button type="button" class="btn primary" data-act="next"' + (done ? "" : " disabled") + ">" + (k === state.tasks.length - 1 ? "Показати результат" : "Далі") + ICON("chev") + "</button></div></div>";
    }
    show(html, "#pf-h");
  }

  /* відповіді */
  box.addEventListener("change", function (e) {
    var inp = e.target, fs = inp.closest(".pf-q, .pt-opts");
    if (!fs) return;
    var id = fs.getAttribute("data-id");
    if (inp.name === "grade") {
      state.grade = +inp.value;
      if (state.grade === 9) state.cur = null;
      $('[data-id="cur"]', box).hidden = state.grade === 9;
    } else if (inp.name === "cur") state.cur = inp.value;
    else if (inp.name === "nmt") state.nmt = inp.value;
    else if (inp.name === "car") {
      var v = inp.value;
      if (inp.checked) {
        if (v === "none") state.car = ["none"];
        else { state.car = state.car.filter(function (x) { return x !== "none"; }).concat(v); if (state.car.length > 2) state.car.shift(); }
      } else state.car = state.car.filter(function (x) { return x !== v; });
      $$('input[name="car"]', box).forEach(function (c) { c.checked = state.car.indexOf(c.value) > -1; });
    } else if (inp.name === "task") {
      var tid = steps()[state.step].id;
      state.ta[tid] = +inp.value;
      Q.save(KEY, state);
      screen(state.step);
      var nb = $('[data-act="next"]', box); if (nb) nb.focus();
      return;
    } else if (id && id.indexOf("s-") === 0) state.s[id.slice(2)] = +inp.value;
    else if (id) state.a[id] = +inp.value;
    if (fs.classList) fs.classList.remove("missing");
    Q.save(KEY, state);
    var w = $("#pf-warn"); if (w && !$(".pf-q.missing", box)) w.hidden = true;
  });

  function missing() {
    var s = steps()[state.step], miss = [];
    if (s.k === "start") { if (!state.grade) miss.push("grade"); if (state.grade > 9 && !state.cur) miss.push("cur"); }
    else if (s.k === "int") s.items.forEach(function (q) { if (!state.a[q.id]) miss.push(q.id); });
    else if (s.k === "subj") s.items.forEach(function (x) { if (state.s[x.id] == null) miss.push("s-" + x.id); });
    else if (s.k === "plans") { if (!state.nmt) miss.push("nmt"); if (!state.car.length) miss.push("car"); }
    return miss;
  }
  function next() {
    var miss = missing(), s = steps()[state.step];
    if (miss.length) {
      $$(".pf-q", box).forEach(function (fs) { fs.classList.toggle("missing", miss.indexOf(fs.getAttribute("data-id")) > -1); });
      var w = $("#pf-warn");
      w.textContent = miss.length === 1 ? "Дай відповідь ще на одне питання." : "Дай відповідь на всі питання на цьому екрані (залишилося: " + miss.length + ").";
      w.hidden = false;
      var first = $('.pf-q[data-id="' + miss[0] + '"] input', box);
      if (first) first.focus();
      return;
    }
    if (s.k === "plans") {
      state.tasks = pickTasks().map(function (t) { return t.id; });
      state.ta = {};
      if (!state.tasks.length) return finish();
    }
    if (state.step < steps().length - 1) screen(state.step + 1);
    else finish();
  }

  /* завдання НМТ: з предметів двох найближчих профілів (у кластері - з його профілів) */
  function pickTasks() {
    var all = (window.NMT_TASKS || []).filter(function (t) { return (DEBUG || !t.draft) && (state.grade > 9 || t.level === "basic"); });
    var a = analyze(state), want = CL ? P : a.ranked.slice(0, 2);
    var pool = Q.shuffle(all.filter(function (t) { return (t.profiles || []).some(function (p) { return want.indexOf(p) > -1; }); }));
    if (state.grade > 9) pool.sort(function (x, y) { return (y.level === "full") - (x.level === "full"); });
    return pool.slice(0, 6);
  }

  function finish() {
    var res = { date: today().toISOString(), grade: state.grade, cur: state.cur, a: state.a, s: state.s, nmt: state.nmt, car: state.car,
      tasks: state.tasks || [], ta: state.ta || {} };
    Q.save(KEY_RES, res);
    Q.drop(KEY);
    state = fresh();
    result(res, false);
  }

  /* підрахунок: інтерес 45%, успішність 35%, плани 20%, плюс до 5 балів за тест Голланда */
  function analyze(r) {
    var holland = Q.load(HOLLAND), sc = {}, parts = {};
    P.forEach(function (p) {
      var it = ITEMS.filter(function (q) { return q.p === p && r.a[q.id]; }), I = null, G = null, Pl = null;
      if (it.length) I = (it.reduce(function (s, q) { return s + r.a[q.id]; }, 0) / it.length - 1) / 4 * 100;
      var gw = 0, gs = 0;
      SUBJ.forEach(function (x) { var v = r.s[x.id], w = x.w[p] || 0; if (v > 0 && w) { gw += w; gs += w * (v - 1) / 4; } });
      if (gw) G = gs / gw * 100;
      var pp = [], nmt = NMT.filter(function (o) { return o.id === r.nmt; })[0];
      if (nmt && nmt.id !== "none") pp.push(nmt.w[p] || 0);
      var car = (r.car || []).filter(function (c) { return c !== "none"; });
      if (car.length) pp.push(car.some(function (c) { return CAREERS.filter(function (o) { return o.id === c; })[0].p === p; }) ? 1 : 0);
      if (pp.length) Pl = pp.reduce(function (s, v) { return s + v; }, 0) / pp.length * 100;
      var wI = 0.45, wG = 0.35, wP = 0.2;
      if (G === null) { wI += wG; wG = 0; }
      if (Pl === null) { wI += wP; wP = 0; }
      var s = (I || 0) * wI + (G || 0) * wG + (Pl || 0) * wP, bonus = 0;
      if (holland && holland.riasec) Object.keys(HOLLAND_MAP).forEach(function (t) {
        if (HOLLAND_MAP[t].indexOf(p) > -1) bonus = Math.max(bonus, 5 * Math.max(0, (holland.riasec[t] - 6) / 24));
      });
      sc[p] = Math.max(0, Math.min(100, Math.round(s + bonus)));
      parts[p] = { I: I, G: G, P: Pl };
    });
    var ranked = P.slice().sort(function (x, y) { return sc[y] - sc[x] || ORDER.indexOf(x) - ORDER.indexOf(y); });
    var best = ranked[0], cl = {};
    C.clusters.forEach(function (c) { var m = 0; c.profiles.forEach(function (p) { if (sc[p] != null) m = Math.max(m, sc[p]); }); cl[c.id] = m; });
    var allA = ITEMS.map(function (q) { return r.a[q.id]; }).filter(Boolean);
    return { sc: sc, parts: parts, ranked: ranked, best: best, cl: cl,
      intAvg: allA.length ? allA.reduce(function (s, v) { return s + v; }, 0) / allA.length : 0,
      flat: sc[ranked[0]] - sc[ranked[ranked.length - 1]] < 3 };   /* усі профілі майже однакові - лідера немає */
  }

  /* пояснення з відповідей: "Тобі цікаво: організм людини й хімія, біологія дається легко, і ти плануєш складати біологію на НМТ" */
  function explain(r, p) {
    var out = [];
    var likes = ITEMS.filter(function (q) { return q.p === p && r.a[q.id] >= 4; }).sort(function (x, y) { return r.a[y.id] - r.a[x.id]; }).slice(0, 2);
    if (likes.length) out.push("тобі цікаво: " + list(likes.map(function (q) { return q.t; })));
    var easy = SUBJ.filter(function (x) { return (x.w[p] || 0) >= 1 && r.s[x.id] >= 4; });
    if (easy.length) out.push(list(easy.map(function (x) { return x.low; })) + (easy.length > 1 || easy[0].pl ? " даються" : " дається") + " легко");
    var nmt = NMT.filter(function (o) { return o.id === r.nmt; })[0];
    if (nmt && (nmt.w[p] || 0) >= 1) out.push("ти плануєш складати " + nmt.acc + " на НМТ");
    var car = CAREERS.filter(function (o) { return o.p === p && (r.car || []).indexOf(o.id) > -1; })[0];
    if (car) out.push("бачиш себе в напрямі «" + (/^[A-Z]{2}/.test(car.name) ? car.name : car.name.toLowerCase()) + "»");
    if (!out.length) return "За твоїми відповідями цей профіль трохи випереджає інші, хоча яскравого лідера немає.";
    var s = out.length > 1 ? out.slice(0, -1).join(", ") + ", і " + out[out.length - 1] : out[0];
    return s.charAt(0).toUpperCase() + s.slice(1) + ".";
  }

  /* завдання НМТ: скільки правильно з кожного предмета */
  function taskStats(r) {
    var by = {};
    (r.tasks || []).forEach(function (id) {
      var t = taskById(id); if (!t || r.ta[id] == null) return;
      by[t.subject] = by[t.subject] || { ok: 0, n: 0 };
      by[t.subject].n++; if (r.ta[id] === t.answer) by[t.subject].ok++;
    });
    return by;
  }
  /* предмет НМТ на вибір для 10-11: збіг профілю, оцінка з предмета, пробні завдання */
  /* наскільки предмет НМТ підходить профілю: з блоку 3 або з рекомендованих у clusters.js (там, де свого предмета нема, як в історико-правового) */
  function nmtRel(o, p) { return Math.max(o.w[p] || 0, (PROFS[p].nmt || []).indexOf(o.name.toLowerCase()) > -1 ? 0.8 : 0); }
  function nmtAdvice(r, a, stats) {
    return NMT.filter(function (o) { return o.id !== "none" && P.some(function (p) { return nmtRel(o, p); }); }).map(function (o) {
      var prof = 0, profP = null;
      P.forEach(function (p) { var w = nmtRel(o, p); if (w && (profP === null || w * a.sc[p] > prof)) { prof = w * a.sc[p]; profP = p; } });
      var parts = [[0.6, prof]], why = ["пов'язана з профілем «" + PROFS[profP].name + "» (збіг " + a.sc[profP] + "%)"];
      var g = r.s[o.subj];
      if (g > 0) { parts.push([0.3, (g - 1) / 4 * 100]); if (g >= 4) why.push("тобі легко дається (" + g + " з 5)"); }
      var st = stats[o.name];
      if (st) { parts.push([0.1, st.ok / st.n * 100]); why.push("у пробних завданнях " + st.ok + " з " + st.n); }
      var planned = r.nmt === o.id;
      if (planned) why.push("ти й так плануєш її складати");
      var wsum = parts.reduce(function (s, x) { return s + x[0]; }, 0);
      return { o: o, v: parts.reduce(function (s, x) { return s + x[0] * x[1]; }, 0) / wsum + (planned ? 5 : 0), why: why };
    }).sort(function (x, y) { return y.v - x.v; }).slice(0, 2);
  }

  /* кругова діаграма відсотка (svg) */
  function ring(v, label) {
    var r = 15.9155, len = Math.max(0, Math.min(100, v));
    return '<svg class="pt-ring" viewBox="0 0 42 42" role="img" aria-label="' + esc(label) + ": збіг " + v + '%"><circle class="pt-ring-bg" cx="21" cy="21" r="' + r + '"/>' +
      '<circle class="pt-ring-v" cx="21" cy="21" r="' + r + '" stroke-dasharray="' + len + " " + (100 - len) + '" stroke-dashoffset="25"/>' +
      '<text x="21" y="23.5" text-anchor="middle">' + v + "%</text></svg>";
  }
  function bars(r, a, profs) {
    return '<ul class="pf-bars pt-bars">' + profs.map(function (p) {
      var v = a.sc[p];
      return '<li class="' + (p === a.best && !a.flat ? "top" : "") + '"><div class="pf-bar-row"><span class="pf-bar-name">' + esc(PROFS[p].name) + "</span>" +
        '<span class="pf-bar-track" aria-hidden="true"><i style="width:' + Math.max(2, v) + '%"></i></span><span class="pf-bar-val">Збіг: ' + v + "%</span></div></li>";
    }).join("") + "</ul>";
  }

  var CL_COLORS = { stem: "var(--pr-c1)", lang: "var(--pr-c3)", social: "var(--pr-c7)" };

  function result(r, previous) {
    var a = analyze(r), best = a.best, bp = PROFS[best], bcl = clusterOf(best), stats = taskStats(r);
    var senior = r.grade > 9 && r.cur && r.cur !== "none";
    var html = '<div class="pf-result" id="pf-result">' +
      '<div class="pf-card pf-res-head"><p class="pf-print-title">' + esc(title) + " · Ліцей №2 Підгородненської міської ради</p>" +
      '<h2 tabindex="-1" id="pf-h">' + (previous ? "Твій попередній результат" : "Твій результат") + "</h2>" +
      '<p class="pf-date">' + esc(Q.fmtDate(r.date)) + " · " + r.grade + " клас" + (senior ? " · зараз: " + esc(PROFS[r.cur].name) : "") + "</p></div>";

    /* 10-11 клас: поточний профіль проти найкращого */
    if (senior) {
      var msg, cur = r.cur;
      if (P.indexOf(cur) < 0) msg = "Твій профіль «" + PROFS[cur].name + "» — з іншого кластера, тож у цьому тесті його не порівняти. Пройди повний тест, щоб побачити всі сім профілів.";
      else if (cur === best || a.sc[best] - a.sc[cur] < GAP) msg = "Твій вибір профілю добре збігається з твоїми інтересами та сильними сторонами 👍";
      else if (clusterOf(cur) === bcl) msg = "Тобі ще близький профіль «" + bp.name + "» — він у тому ж кластері, тож напрям правильний. Ці предмети можна поглибити через факультативи чи гуртки.";
      else msg = "Тест показує, що тобі може бути ближчий профіль «" + bp.name + "». Це не означає, що вибір хибний — обговори з класним керівником або психологом.";
      var m = today().getMonth();
      html += '<div class="pf-card pt-cur"><h3>Твій профіль і твої інтереси</h3><p>' + esc(msg) + "</p>" +
        (P.indexOf(cur) > -1 ? '<p class="pf-small">Твій профіль: збіг ' + a.sc[cur] + "%. Найвищий: «" + esc(bp.name) + "», " + a.sc[best] + "%.</p>" : "") +
        (r.grade === 10 && m >= 8 && m <= 11 ? '<p class="pt-remind">' + ICON("clock") + "<span>Нагадуємо: профіль можна змінити в І семестрі 10 класу.</span></p>" : "") + "</div>";
    }

    /* повний режим: кластери */
    if (!CL) {
      var bestCl = a.flat ? null : C.clusters.slice().sort(function (x, y) { return a.cl[y.id] - a.cl[x.id]; })[0].id;
      html += '<div class="pf-card"><h3>Кластери</h3><div class="pt-clusters">' + C.clusters.map(function (c) {
        return '<div class="pt-cl' + (c.id === bestCl ? " top" : "") + '" style="--c:' + CL_COLORS[c.id] + '"><span class="ico">' + ICON(c.icon) + "</span>" +
          "<b>" + esc(c.name) + "</b>" + ring(a.cl[c.id], c.name) + (c.id === bestCl ? '<span class="pt-cl-tag">Найближчий</span>' : "") + "</div>";
      }).join("") + "</div></div>";
    }

    /* профілі кластера і найкращий */
    var shownP = CL ? P : bcl.profiles;
    if (a.flat) html += '<div class="pf-card pt-flat"><h3>Яскравого лідера поки немає</h3>' +
      "<p>Усі профілі набрали майже однаково (" + a.sc[best] + "%). Це нормально: інтереси ще формуються.</p>" +
      '<ul class="pf-next"><li>' + ICON("star") + "<div><p>Пригадай, яких уроків чекаєш найбільше і що робиш із задоволенням поза школою.</p></div></li>" +
      "<li>" + ICON("doc") + '<div><p><a href="proforientation.html">Тест інтересів (Голланда)</a> допоможе подивитися на себе з іншого боку.</p></div></li>' +
      "<li>" + ICON("chat") + "<div><p>Поговори зі шкільним психологом або класним керівником.</p></div></li></ul>" +
      '<h4>Усі профілі</h4>' + bars(r, a, P) + "</div>";
    else html += '<div class="pf-card"><h3>' + (CL ? "Профілі кластера «" + esc(CL.name) + "»" : "Профілі кластера «" + esc(bcl.name) + "»") + "</h3>" + bars(r, a, shownP) +
      '<div class="pf-prof pt-best"><span class="pf-tag">Тобі найближче · збіг ' + a.sc[best] + "%</span><h4>" + esc(bp.name) + "</h4>" +
      "<p>" + esc(explain(r, best)) + "</p><p>" + esc(bp.desc) + "</p>" +
      '<p class="pt-kv"><b>Поглиблено:</b> ' + esc(bp.deep.join(", ")) + '</p><p class="pt-kv"><b>Після школи:</b> ' + esc(bp.after.join(", ")) + "</p></div>";
    if (!CL && !a.flat) {
      var also = ORDER.filter(function (p) { return clusterOf(p) !== bcl && a.sc[best] - a.sc[p] < GAP; });
      if (also.length) html += '<p class="pt-also"><b>Також тобі може підійти:</b> ' + also.map(function (p) { return esc(PROFS[p].name) + " (" + a.sc[p] + "%)"; }).join(", ") + "</p>";
    }
    if (!a.flat) html += "</div>";

    /* режим кластера: якщо кластер не близький */
    if (CL) html += '<div class="pf-card pt-other">' + (a.intAvg < 2.5
      ? "<p><b>Схоже, цей кластер тобі не дуже близький.</b> Спробуй повний тест — він порівняє всі три.</p>"
      : "<p>Хочеш побачити, як цей кластер виглядає поруч з іншими?</p>") +
      '<a class="btn' + (a.intAvg < 2.5 ? " primary" : "") + '" href="profile-test.html">Порівняти з іншими кластерами → повний тест</a></div>';

    /* підказки */
    var tips = [], pb = a.parts[best];
    if (pb.I >= 70 && pb.G !== null && pb.G <= 45) tips.push("Тобі цікаво, хоча предмети поки даються непросто. Це нормально: поглиблене навчання якраз допомагає підтягнутися.");
    /* тільки профілі зі "своїм" предметом (вага 1), інакше економічний "вдається" через саму математику з вагою 0.5 */
    var strong = P.filter(function (p) {
      return a.parts[p].G !== null && a.parts[p].G >= 75 && a.parts[p].I <= 40 && SUBJ.some(function (x) { return x.w[p] >= 1 && r.s[x.id] > 0; });
    })[0];
    if (strong) tips.push("Предмети профілю «" + PROFS[strong].name + "» тобі добре вдаються — можливо, варто придивитися уважніше.");
    if (tips.length) html += '<div class="pf-card"><h3>Підказки</h3><ul class="pf-next">' + tips.map(function (t) { return "<li>" + ICON("star") + "<div><p>" + esc(t) + "</p></div></li>"; }).join("") + "</ul></div>";

    /* 10-11: предмет НМТ */
    if (r.grade > 9) {
      var adv = nmtAdvice(r, a, stats);
      if (adv.length) html += '<div class="pf-card"><h3>Предмет на вибір для НМТ</h3><ul class="pf-next">' + adv.map(function (x) {
        return "<li>" + ICON("book") + "<div><b>" + esc(x.o.name) + "</b><p>" + esc(x.why.join("; ")) + ".</p></div></li>";
      }).join("") + '</ul><p class="pf-small">Обов\'язкові предмети НМТ — українська мова, математика й історія України; тут — четвертий, на вибір.</p></div>';
    }

    /* пробні завдання */
    var subj = Object.keys(stats);
    if (subj.length) html += '<div class="pf-card"><h3>Спробував(ла) предмети</h3><ul class="pf-next">' + subj.map(function (k) {
      var x = stats[k], q = x.ok / x.n;
      var c = q >= 0.67 ? "Чудово! Схоже, цей предмет тобі вдається." : q <= 0.34 ? "Це нормально — частина цих тем ще попереду." : "Непогано, є що підтягнути.";
      return "<li>" + ICON("check") + "<div><b>" + esc(k) + ": " + x.ok + " з " + x.n + "</b><p>" + c + "</p></div></li>";
    }).join("") + "</ul></div>";

    /* факти, що далі, застереження */
    html += '<div class="pf-card"><h3>Варто знати</h3><ul class="pf-next">' +
      "<li>" + ICON("clock") + "<div><p>" + esc(C.change) + ".</p></div></li>" +
      "<li>" + ICON("users") + "<div><p>" + esc(C.minGroup) + ".</p></div></li></ul></div>" +
      '<div class="pf-card"><h3>Що далі</h3><ul class="pf-next">' +
      "<li>" + ICON("chat") + "<div><b>Обговори результат</b><p>З батьками, класним керівником і шкільним психологом — вони допоможуть подивитися ширше.</p></div></li>" +
      "<li>" + ICON("doc") + '<div><b>Дізнайся більше</b><p><a href="profile.html#profiles">Кластери й профілі ліцею</a>' +
      (Q.load(HOLLAND) ? "" : ' · <a href="proforientation.html">Тест інтересів (Голланда)</a>') + "</p></div></li></ul></div>" +
      '<p class="b-note warn pf-disclaimer">' + ICON("alert") + "<span><b>Це підказка, а не рішення.</b> Остаточний вибір — за тобою і твоєю родиною.</span></p>" +
      '<div class="pf-btns pf-res-btns"><button type="button" class="btn primary" data-act="print">' + ICON("doc") + "Зберегти PDF / роздрукувати</button>" +
      '<button type="button" class="btn" data-act="restart">Пройти ще раз</button></div></div>';
    show(html, "#pf-h");
  }

  /* кнопки */
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    var act = b.getAttribute("data-act");
    if (act === "start") screen(0);
    else if (act === "resume") screen(state.step || 0);
    else if (act === "restart") { Q.drop(KEY); Q.drop(KEY_RES); state = fresh(); screen(0); }
    else if (act === "show-prev") { var r = Q.load(KEY_RES); if (r) result(r, true); }
    else if (act === "next") next();
    else if (act === "skip") finish();
    else if (act === "back") { if (state.step > 0) screen(state.step - 1); else intro(); }
    else if (act === "print") window.print();
  });

  /* для перевірки з консолі: window.__pt */
  if (DEBUG) window.__pt = { analyze: analyze, result: result, state: function () { return state; }, ITEMS: ITEMS, SUBJ: SUBJ, P: P };

  intro();
})();
