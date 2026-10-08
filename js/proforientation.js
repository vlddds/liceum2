/* Профорієнтаційний тест (proforientation.html).
   Профілі ліцею та гуртки — у js/proforientation-config.js.
   Усе рахується на пристрої: відповіді нікуди не надсилаються, лише зберігаються в localStorage. */
(function () {
  "use strict";

  var L = window.L2, CFG = window.PROF_CONFIG;
  if (!L || !CFG) { if (window.console) console.error("Не завантажено js/common.js або js/proforientation-config.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart, reduce = L.reduce;
  var CLUBS = ((window.SITE_DATA || {}).clubs || []).map(function (c) { return c.name; });

  /* 1. ДАНІ ------------------------------------------------------------------- */
  var ORDER = ["R", "I", "A", "S", "E", "C"];
  var TYPES = {
    R: { name: "Практичний", nick: "Майстер",
      items: ["Мені подобається майструвати або ремонтувати щось руками.",
        "Я із задоволенням розбираюся, як влаштовані механізми чи прилади.",
        "Мені цікаво працювати з інструментами, технікою або обладнанням.",
        "Я радше зроблю щось практичне, ніж буду довго про це читати.",
        "Мені подобається працювати на свіжому повітрі: в саду, на природі, на будівництві.",
        "Мені цікаво збирати конструктори, моделі або електронні схеми."],
      desc: "Тобі подобається бачити результат своєї роботи — щось зроблене, полагоджене чи вирощене власними руками. " +
        "Ти краще розумієш речі, коли можеш їх торкнутися й випробувати. " +
        "Тобі комфортно в майстерні, лабораторії, на виробництві чи просто неба, де є конкретне завдання й видимий результат.",
      jobs: ["інженер-електрик", "автомеханік", "технолог виробництва", "будівельний інженер", "агроном",
        "інженер з відновлюваної енергетики", "оператор дронів для агросфери", "кухар-технолог"] },
    I: { name: "Дослідницький", nick: "Дослідник",
      items: ["Мені цікаво з'ясовувати, чому відбуваються ті чи інші явища.",
        "Я люблю розв'язувати складні задачі з математики чи фізики.",
        "Мені подобається проводити досліди та експерименти.",
        "Я з власної ініціативи читаю або дивлюся науково-популярні матеріали.",
        "Мені подобається аналізувати дані й шукати закономірності.",
        "Я довго думаю над питанням, поки не знайду відповідь."],
      desc: "Тобі цікаво докопуватися до суті: чому так відбувається і як це перевірити. " +
        "Ти любиш складні задачі, де треба подумати, а не просто зробити за інструкцією. " +
        "Тобі комфортно там, де можна досліджувати, аналізувати дані й мати час на роздуми — у лабораторії, IT, медицині чи науці.",
      jobs: ["лікар", "біолог", "хімік", "аналітик даних", "програміст", "фізик", "біоінженер", "фармацевт"] },
    A: { name: "Творчий", nick: "Творець",
      items: ["Мені подобається малювати, фотографувати або створювати дизайн.",
        "Я люблю писати тексти, історії чи вірші.",
        "Мені цікаво займатися музикою, театром або танцями.",
        "Я часто придумую нестандартні ідеї.",
        "Мені важливо, щоб результат моєї роботи був красивим і оригінальним.",
        "Я люблю створювати відео, анімацію чи власних персонажів."],
      desc: "Ти бачиш світ по-своєму і любиш створювати щось нове — образи, тексти, музику чи дизайн. " +
        "Тобі важливо, щоб у роботі була свобода й місце для власних ідей. " +
        "Комфортно тобі там, де цінують оригінальність: у студії, редакції, творчій команді чи власному проєкті.",
      jobs: ["графічний дизайнер", "UX/UI-дизайнер", "архітектор", "журналіст", "відеомонтажер", "гейм-дизайнер", "музикант", "фотограф"] },
    S: { name: "Соціальний", nick: "Помічник",
      items: ["Мені подобається пояснювати іншим те, що я сам(а) розумію.",
        "До мене часто звертаються по пораду чи підтримку.",
        "Мені хочеться допомагати людям, які опинилися в складній ситуації.",
        "Я люблю працювати в команді, а не наодинці.",
        "Мені подобається піклуватися про молодших або про тварин.",
        "Мені цікаво, що відчувають інші люди і чому вони так поводяться."],
      desc: "Тобі цікаві люди: як вони почуваються, що їм потрібно і як їм допомогти. " +
        "Ти вмієш пояснювати, підтримувати й працювати в команді. " +
        "Комфортно тобі там, де є живе спілкування й відчуття, що твоя робота комусь допомагає, — у школі, лікарні чи громадській організації.",
      jobs: ["вчитель", "психолог", "лікар-педіатр", "соціальний працівник", "реабілітолог", "HR-фахівець", "ветеринар", "тренер"] },
    E: { name: "Підприємливий", nick: "Лідер",
      items: ["Мені подобається організовувати події чи справи для інших.",
        "Я легко переконую людей у своїй думці.",
        "Мені цікаво, як заробляють гроші та як працює бізнес.",
        "Я охоче беру на себе роль лідера в групі.",
        "Мені подобається виступати перед аудиторією.",
        "Я люблю ставити амбітні цілі та досягати їх."],
      desc: "Тобі подобається запускати справи, вести за собою й переконувати. " +
        "Ти не боїшся брати відповідальність і ставити амбітні цілі. " +
        "Комфортно тобі там, де є рух, рішення й результат, який можна виміряти: у бізнесі, проєктах, організації подій чи публічній роботі.",
      jobs: ["підприємець", "менеджер проєктів", "маркетолог", "юрист", "PR-фахівець", "продакт-менеджер", "організатор подій", "дипломат"] },
    C: { name: "Систематичний", nick: "Організатор",
      items: ["Мені подобається, коли все впорядковано і лежить на своїх місцях.",
        "Я уважний(а) до деталей і помічаю помилки.",
        "Мені комфортно працювати з таблицями, списками, документами.",
        "Я люблю планувати свій час і дотримуватися плану.",
        "Мені подобається працювати за чіткими правилами та інструкціями.",
        "Я охоче веду облік: витрат, оцінок, колекцій."],
      desc: "Тобі подобається порядок, точність і зрозумілі правила. " +
        "Ти помічаєш деталі, які інші пропускають, і любиш доводити справу до кінця за планом. " +
        "Комфортно тобі там, де важлива надійність і систематичність: у фінансах, аналітиці, логістиці чи IT-тестуванні.",
      jobs: ["бухгалтер", "аудитор", "логіст", "фінансовий аналітик", "бібліотекар", "тестувальник ПЗ", "діловод", "спеціаліст з кібербезпеки"] }
  };
  var GARDNER = [
    { id: "ling", name: "Мовний", items: ["Мені легко висловлювати думки словами.", "Я люблю читати й вивчати мови."],
      tip: "Пробуй себе в дебатах, шкільній газеті чи блозі — слова можуть стати твоїм головним інструментом." },
    { id: "logic", name: "Логіко-математичний", items: ["Мені подобаються головоломки й логічні задачі.", "Я легко рахую в умі."],
      tip: "Олімпіади, програмування й логічні ігри допоможуть розвинути цю силу ще більше." },
    { id: "space", name: "Просторовий", items: ["Я добре орієнтуюся на мапі та в нових місцях.", "Я легко уявляю предмети в об'ємі."],
      tip: "Спробуй креслення, 3D-моделювання чи дизайн — тобі легко мислити об'ємом." },
    { id: "body", name: "Тілесно-руховий", items: ["Мені краще думається в русі.", "Я швидко засвоюю нові рухи у спорті чи танці."],
      tip: "Спорт, танці чи робота руками допомагають тобі вчитися — не бійся рухатися, коли думаєш." },
    { id: "music", name: "Музичний", items: ["Я легко запам'ятовую мелодії.", "Я помічаю, коли хтось фальшивить."],
      tip: "Музика може бути не лише хобі: ритм і мелодія допомагають тобі запам'ятовувати й зосереджуватися." },
    { id: "inter", name: "Міжособистісний", items: ["Я добре відчуваю настрій інших людей.", "Мені легко знаходити спільну мову з новими людьми."],
      tip: "Командні проєкти, волонтерство й наставництво — місця, де ця сила розкривається найкраще." },
    { id: "intra", name: "Внутрішньоособистісний", items: ["Я добре розумію свої емоції та їхні причини.", "Я часто аналізую свої вчинки."],
      tip: "Став собі цілі й записуй, що спрацювало: ти добре знаєш себе, і це допоможе обрати свій шлях." },
    { id: "nature", name: "Природничий", items: ["Мені цікаво спостерігати за природою.", "Я легко розрізняю рослини, тварин, мінерали."],
      tip: "Екологічні проєкти, біологія та дослідження довкілля — твоє природне середовище." }
  ];
  var SCALE = ["Зовсім не про мене", "Скоріше ні", "Частково", "Скоріше так", "Точно про мене"];
  var PER_SCREEN = 6, KEY = "l2prof-progress", KEY_RES = "l2prof-result";

  /* 2. ПОРЯДОК ТВЕРДЖЕНЬ: перемішаний, але однаковий для всіх (фіксований seed),
        і твердження одного типу ніколи не йдуть підряд ---------------------------- */
  function rng(seed) {   /* mulberry32 */
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* groups: { ключ: [твердження…] } однакової довжини. Кожен «раунд» бере по одному твердженню
     кожного ключа в перемішаному порядку; перше в раунді не збігається з останнім попереднього. */
  function interleave(groups, seed) {
    var rand = rng(seed), keys = Object.keys(groups), out = [], last = null;
    keys.forEach(function (k) { groups[k] = shuffle(groups[k], rand); });
    for (var r = 0; r < groups[keys[0]].length; r++) {
      var order = shuffle(keys, rand);
      while (order[0] === last) order = shuffle(keys, rand);
      order.forEach(function (k) { out.push(groups[k][r]); });
      last = order[order.length - 1];
    }
    return out;
  }
  var g1 = {}, g2 = {};
  ORDER.forEach(function (t) { g1[t] = TYPES[t].items.map(function (text, i) { return { id: t + (i + 1), key: t, text: text }; }); });
  GARDNER.forEach(function (g) { g2[g.id] = g.items.map(function (text, i) { return { id: "G-" + g.id + (i + 1), key: g.id, text: text }; }); });
  var PART1 = interleave(g1, 20261008), PART2 = interleave(g2, 1892);
  var ALL = PART1.concat(PART2);

  var SCREENS = [];
  [[1, PART1], [2, PART2]].forEach(function (p) {
    for (var i = 0; i < p[1].length; i += PER_SCREEN) SCREENS.push({ part: p[0], items: p[1].slice(i, i + PER_SCREEN) });
  });

  /* 3. ЗБЕРЕЖЕННЯ (лише в цьому браузері) ---------------------------------------- */
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  var state = load(KEY) || { answers: {}, screen: 0 };
  if (!state.answers) state = { answers: {}, screen: 0 };
  function answered() { return ALL.filter(function (q) { return state.answers[q.id]; }).length; }

  /* 4. КАРКАС СТОРІНКИ ------------------------------------------------------------ */
  $("#main").innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1"><div class="hero-bg" aria-hidden="true"><span class="num">?</span></div>' +
    '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
    '<span aria-current="page">Профорієнтаційний тест</span></nav>' +
    '<h1 id="h1">Профорієнтаційний тест</h1><p class="hero-sub">Дізнайся, що тобі цікаво, у чому твої сильні сторони і який профіль ліцею може підійти.</p></div></section>' +
    '<section class="sec alt pf-sec" aria-label="Тест"><div class="wrap"><div class="pf" id="pf" tabindex="-1"></div></div></section>';
  var box = $("#pf");

  function show(html, focusSel) {
    box.innerHTML = html;
    if (!reduce) restart(box, "swap");
    var top = box.getBoundingClientRect().top + window.pageYOffset - 90;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
    var f = focusSel && $(focusSel, box);
    if (f) f.focus({ preventScroll: true });
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; }
  }

  /* 5. ВСТУП ----------------------------------------------------------------------- */
  function intro() {
    var res = load(KEY_RES), n = answered(), resume = n > 0 && n < ALL.length;
    var html = '<div class="pf-card pf-intro">' +
      (res && res.riasec ? '<div class="pf-prev">' + ICON("check") + "<div><b>Твій попередній результат</b><small>" + esc(fmtDate(res.date)) +
        " · код " + esc(res.code || "") + '</small></div><div class="pf-prev-btns"><button type="button" class="btn primary" data-act="show-prev">Переглянути</button>' +
        '<button type="button" class="btn" data-act="restart">Пройти заново</button></div></div>' : "") +
      '<h2 tabindex="-1" id="pf-h">Навіщо цей тест</h2>' +
      "<p>Тест допоможе краще зрозуміти себе: що тобі по-справжньому цікаво і в чому ти сильний(-а). " +
      "За результатом ти побачиш, які професії й який профіль навчання в ліцеї можуть тобі підійти.</p>" +
      '<ul class="pf-facts">' +
      "<li>" + ICON("clock") + "<span><b>7–10 хвилин</b>, 52 короткі твердження у двох частинах</span></li>" +
      "<li>" + ICON("star") + "<span><b>Правильних відповідей немає</b> — відповідай чесно, як є, а не як «треба»</span></li>" +
      "<li>" + ICON("shield") + "<span><b>Твої відповіді нікуди не надсилаються</b> — усе рахується на твоєму пристрої</span></li>" +
      "</ul>" +
      '<div class="pf-btns">' + (resume
        ? '<button type="button" class="btn primary" data-act="resume">Продовжити (відповідей: ' + n + " з " + ALL.length + ")" + ICON("chev") + "</button>" +
          '<button type="button" class="btn" data-act="restart">Почати спочатку</button>'
        : '<button type="button" class="btn primary" data-act="start">Почати тест' + ICON("chev") + "</button>") +
      "</div></div>";
    show(html, "#pf-h");
  }

  /* 6. ЕКРАН З ТВЕРДЖЕННЯМИ -------------------------------------------------------- */
  function screen(n) {
    state.screen = n; save(KEY, state);
    var s = SCREENS[n], firstOfPart = n === 0 || SCREENS[n - 1].part !== s.part;
    var partScreens = SCREENS.filter(function (x) { return x.part === s.part; }), idx = partScreens.indexOf(s);
    var html = '<div class="pf-card">' +
      '<div class="pf-head"><span class="pf-part">Частина ' + s.part + " з 2</span>" +
      '<h2 tabindex="-1" id="pf-h">' + (s.part === 1 ? "Мої інтереси" : "Мої сильні сторони") + "</h2>" +
      (firstOfPart ? "<p>" + (s.part === 1
        ? "Наскільки кожне твердження про тебе? Думай про те, що тобі подобається робити, а не про оцінки."
        : "Тепер про те, що тобі вдається. Оціни, наскільки кожне твердження про тебе.") + "</p>" : "") +
      '<div class="pf-progress"><div class="pf-bar" role="progressbar" aria-label="Пройдено" aria-valuemin="0" aria-valuemax="' + ALL.length +
      '" aria-valuenow="0"><i></i></div><p class="pf-step" id="pf-step" aria-live="polite"></p></div></div>' +
      '<div class="pf-qs">' + s.items.map(function (q, k) {
        var v = state.answers[q.id];
        return '<fieldset class="pf-q" data-id="' + q.id + '"><legend><span class="pf-num">' + (ALL.indexOf(q) + 1) + "</span>" + esc(q.text) + "</legend>" +
          '<div class="pf-scale">' + SCALE.map(function (label, i) {
            var val = i + 1;
            return '<label class="pf-opt"><input type="radio" name="q-' + q.id + '" value="' + val + '"' + (v === val ? " checked" : "") + ">" +
              '<span class="pf-dot" aria-hidden="true">' + val + '</span><span class="sr">' + label + "</span></label>";
          }).join("") + '</div><div class="pf-ends" aria-hidden="true"><span>' + SCALE[0] + "</span><span>" + SCALE[4] + "</span></div></fieldset>";
      }).join("") + "</div>" +
      '<p class="pf-warn" id="pf-warn" role="alert" hidden></p>' +
      '<div class="pf-nav"><button type="button" class="btn" data-act="back">' + ICON("chev") + "Назад</button>" +
      '<span class="pf-count">Екран ' + (idx + 1) + " з " + partScreens.length + "</span>" +
      '<button type="button" class="btn primary" data-act="next">' + (n === SCREENS.length - 1 ? "Показати результат" : "Далі") + ICON("chev") + "</button></div>" +
      "</div>";
    show(html, "#pf-h");
    progress();
  }
  function progress() {
    var n = answered(), bar = $(".pf-bar", box);
    if (!bar) return;
    bar.setAttribute("aria-valuenow", n);
    $("i", bar).style.width = (n / ALL.length * 100) + "%";
    $("#pf-step").textContent = "Відповідей: " + n + " з " + ALL.length;
  }
  box.addEventListener("change", function (e) {
    var inp = e.target;
    if (inp.type !== "radio") return;
    var fs = inp.closest(".pf-q");
    state.answers[fs.getAttribute("data-id")] = +inp.value;
    fs.classList.remove("missing");
    save(KEY, state);
    progress();
    var w = $("#pf-warn"); if (w && !$(".pf-q.missing", box)) w.hidden = true;
  });

  function next() {
    var miss = SCREENS[state.screen].items.filter(function (q) { return !state.answers[q.id]; });
    if (miss.length) {
      $$(".pf-q", box).forEach(function (fs) { fs.classList.toggle("missing", !state.answers[fs.getAttribute("data-id")]); });
      var w = $("#pf-warn");
      w.textContent = miss.length === 1 ? "Дай відповідь ще на одне твердження." : "Дай відповідь на всі твердження на цьому екрані (залишилося: " + miss.length + ").";
      w.hidden = false;
      var first = $('.pf-q[data-id="' + miss[0].id + '"] input', box);
      first.focus();
      return;
    }
    if (state.screen < SCREENS.length - 1) screen(state.screen + 1);
    else finish();
  }

  /* 7. ПІДРАХУНОК ----------------------------------------------------------------- */
  function compute() {
    var riasec = {}, gardner = {};
    ORDER.forEach(function (t) { riasec[t] = 0; });
    GARDNER.forEach(function (g) { gardner[g.id] = 0; });
    PART1.forEach(function (q) { riasec[q.key] += state.answers[q.id] || 0; });
    PART2.forEach(function (q) { gardner[q.key] += state.answers[q.id] || 0; });
    var sorted = ORDER.slice().sort(function (a, b) { return riasec[b] - riasec[a] || ORDER.indexOf(a) - ORDER.indexOf(b); });
    return { date: new Date().toISOString(), riasec: riasec, gardner: gardner, code: sorted[0] + sorted[1] };
  }
  function finish() {
    var res = compute();
    save(KEY_RES, res);
    drop(KEY);
    state = { answers: {}, screen: 0 };
    result(res, false);
  }

  /* 8. РЕЗУЛЬТАТ ------------------------------------------------------------------ */
  function radar(sc) {
    var cx = 170, cy = 150, R = 104, n = ORDER.length;
    function pt(i, f) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f]; }
    function poly(f) { return ORDER.map(function (t, i) { return pt(i, typeof f === "function" ? f(t) : f).map(function (v) { return v.toFixed(1); }).join(","); }).join(" "); }
    var val = function (t) { return Math.max(0.04, (sc[t] - 6) / 24); };
    var svg = '<svg class="pf-radar" viewBox="0 0 340 300" role="img" aria-labelledby="pf-radar-t"><title id="pf-radar-t">Діаграма інтересів: ' +
      ORDER.map(function (t) { return TYPES[t].nick + " " + sc[t] + " з 30"; }).join(", ") + "</title>";
    [0.25, 0.5, 0.75, 1].forEach(function (f) { svg += '<polygon class="pf-grid" points="' + poly(f) + '"/>'; });
    ORDER.forEach(function (t, i) { var p = pt(i, 1); svg += '<line class="pf-axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>'; });
    svg += '<polygon class="pf-area" points="' + poly(val) + '"/>';
    ORDER.forEach(function (t, i) {
      var p = pt(i, val(t)); svg += '<circle class="pf-pt" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4"/>';
      var l = pt(i, 1.2), anchor = Math.abs(l[0] - cx) < 5 ? "middle" : l[0] > cx ? "start" : "end";
      svg += '<text class="pf-lbl" x="' + l[0].toFixed(1) + '" y="' + (l[1] + (l[1] < cy - 5 ? -2 : l[1] > cy + 5 ? 12 : 4)).toFixed(1) + '" text-anchor="' + anchor + '">' +
        esc(TYPES[t].nick) + ' <tspan class="pf-val">' + sc[t] + "</tspan></text>";
    });
    return svg + "</svg>";
  }
  function result(res, previous) {
    var sc = res.riasec, gd = res.gardner;
    var sorted = ORDER.slice().sort(function (a, b) { return sc[b] - sc[a] || ORDER.indexOf(a) - ORDER.indexOf(b); });
    var cut = sc[sorted[1]], top = sorted.filter(function (t) { return sc[t] >= cut; }).slice(0, 4);   /* топ-2, за рівності — усі рівні */
    var code = sorted[0] + sorted[1];

    var profs = CFG.profiles.map(function (p) {
      var sum = 0; p.types.forEach(function (t) { sum += sc[t] || 0; });
      return { p: p, avg: sum / p.types.length };
    }).sort(function (a, b) { return b.avg - a.avg; });
    var best = profs[0], alt = profs[1] && best.avg - profs[1].avg < (CFG.closeGap || 3) ? profs[1] : null;

    var gSorted = GARDNER.slice().sort(function (a, b) { return gd[b.id] - gd[a.id]; }), gTop = gSorted.slice(0, 3).map(function (g) { return g.id; });

    var clubs = [];
    top.forEach(function (t) { ((CFG.clubsByType || {})[t] || []).forEach(function (c) { if (CLUBS.indexOf(c) > -1 && clubs.indexOf(c) < 0) clubs.push(c); }); });

    var profBlock = function (x, also) {
      return '<div class="pf-prof' + (also ? " pf-alt" : "") + '"><span class="pf-tag">' + (also ? "Також може підійти" : "Рекомендований профіль") + "</span>" +
        "<h4>" + esc(x.p.name) + "</h4><p>" + esc(x.p.description) + "</p>" +
        '<p class="pf-why">Чому: цей профіль підходить типам ' + x.p.types.map(function (t) { return "«" + TYPES[t].nick + "»"; }).join(", ") +
        ", твій середній бал за ними — " + x.avg.toFixed(1).replace(".", ",") + " з 30.</p></div>";
    };

    var html = '<div class="pf-result" id="pf-result">' +
      '<div class="pf-card pf-res-head"><p class="pf-print-title">Профорієнтаційний тест · Ліцей №2 Підгородненської міської ради</p>' +
      '<h2 tabindex="-1" id="pf-h">' + (previous ? "Твій попередній результат" : "Твій результат") + "</h2>" +
      '<p class="pf-date">' + esc(fmtDate(res.date)) + "</p>" +
      '<div class="pf-res-grid"><div class="pf-radar-wrap">' + radar(sc) + "</div>" +
      '<div><div class="pf-code"><span>Твій код Голланда</span><b>' + esc(code) + "</b></div>" +
      '<p class="pf-small">Код Голланда — дві літери твоїх найсильніших типів інтересів: перша — головний, друга — той, що його доповнює. ' +
      "За цим кодом профорієнтологи підбирають професії, де поєднуються обидва інтереси." +
      (top.length > 2 ? " У тебе кілька типів набрали однаково, тож код може бути й іншим поєднанням цих літер." : "") + "</p>" +
      '<ul class="pf-scores">' + sorted.map(function (t) {
        return '<li class="' + (top.indexOf(t) > -1 ? "top" : "") + '"><b>' + t + "</b> " + esc(TYPES[t].nick) + " <small>" + esc(TYPES[t].name) + "</small><span>" + sc[t] + " / 30</span></li>";
      }).join("") + "</ul></div></div></div>" +

      '<div class="pf-card"><h3>Тобі найближче</h3><div class="pf-types">' + top.map(function (t) {
        return '<div class="pf-type"><span class="pf-letter" aria-hidden="true">' + t + "</span><h4>" + esc(TYPES[t].nick) + " <small>" + esc(TYPES[t].name) + " тип</small></h4>" +
          "<p>" + esc(TYPES[t].desc) + '</p><p class="pf-jobs-t">Професії, які можуть тобі підійти:</p><ul class="pf-jobs">' +
          TYPES[t].jobs.map(function (j) { return "<li>" + esc(j) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</div></div>" +

      '<div class="pf-card"><h3>Профіль навчання в ліцеї</h3>' + profBlock(best, false) + (alt ? profBlock(alt, true) : "") + "</div>" +

      '<div class="pf-card"><h3>Мої сильні сторони</h3><p class="pf-small">За теорією множинного інтелекту Говарда Гарднера. Три найсильніші підсвічено.</p>' +
      '<ul class="pf-bars">' + GARDNER.map(function (g) {
        var v = gd[g.id], isTop = gTop.indexOf(g.id) > -1;
        return '<li class="' + (isTop ? "top" : "") + '"><div class="pf-bar-row"><span class="pf-bar-name">' + esc(g.name) + "</span>" +
          '<span class="pf-bar-track" aria-hidden="true"><i style="width:' + ((v - 2) / 8 * 100).toFixed(0) + '%"></i></span><span class="pf-bar-val">' + v + " / 10</span></div>" +
          (isTop ? '<p class="pf-tip">' + esc(g.tip) + "</p>" : "") + "</li>";
      }).join("") + "</ul></div>" +

      '<div class="pf-card"><h3>Що далі</h3><ul class="pf-next">' +
      "<li>" + ICON("book") + "<div><b>Предмети НМТ, які варто розглянути</b><p>" + esc(best.p.subjects.join(", ")) +
        (alt ? " — або, для профілю «" + esc(alt.p.name) + "»: " + esc(alt.p.subjects.join(", ")) : "") + ".</p></div></li>" +
      (clubs.length ? "<li>" + ICON("star") + "<div><b>Гуртки ліцею, які варто спробувати</b><p>" + clubs.map(esc).join(", ") +
        '. <a href="index.html#clubs">Усі гуртки та секції</a></p></div></li>' : "") +
      "<li>" + ICON("chat") + "<div><b>Поговори з дорослим, якому довіряєш</b><p>Обговори результат зі шкільним психологом або класним керівником — " +
        "вони допоможуть подивитися на нього ширше й скласти план.</p></div></li></ul></div>" +

      '<p class="b-note warn pf-disclaimer">' + ICON("alert") + "<span><b>Це не вирок і не медичний чи психологічний діагноз.</b> " +
      "Інтереси змінюються з віком — тест варто пройти ще раз через рік.</span></p>" +

      '<div class="pf-btns pf-res-btns"><button type="button" class="btn primary" data-act="print">' + ICON("doc") + "Роздрукувати / зберегти PDF</button>" +
      '<button type="button" class="btn" data-act="restart">Пройти ще раз</button></div></div>';
    show(html, "#pf-h");
  }

  /* 9. КНОПКИ ---------------------------------------------------------------------- */
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "start") screen(0);
    else if (act === "resume") screen(Math.min(state.screen || 0, SCREENS.length - 1));
    else if (act === "restart") { drop(KEY); drop(KEY_RES); state = { answers: {}, screen: 0 }; screen(0); }
    else if (act === "show-prev") { var r = load(KEY_RES); if (r) result(r, true); }
    else if (act === "next") next();
    else if (act === "back") { if (state.screen > 0) screen(state.screen - 1); else intro(); }
    else if (act === "print") window.print();
  });

  intro();
})();
