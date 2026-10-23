
(function () {
  "use strict";

  var D = window.SITE_DATA;
  if (!D) { if (window.console) console.error("Не завантажено js/data.js"); return; }
  var CONFIG = D.config;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches);
  var isWeb = function (h) { return /^https?:/i.test(h); };
  var webBase = false;
  var mailto = "mailto:" + CONFIG.email;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function slug(t) {
    return t.toLowerCase().replace(/[«»"“”?!,;:'’ʼ()]/g, "").replace(/\./g, "-")
      .replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  function ICON(id) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function tgt(url) { return isWeb(url) ? CONFIG.linkTarget : "_self"; }
  function ext(url) { return 'href="' + esc(url) + '" target="' + tgt(url) + '"' + (isWeb(url) ? ' rel="noopener"' : ""); }
  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function toPage(p) {
    return { title: p.label || p.title, kw: p.kw, group: p.group,
      url: p.url || "#all" };
  }
  var pages = {};
  Object.keys(D.pages).forEach(function (k) { pages[k] = D.pages[k].map(toPage); });
  var INDEX = [].concat(pages.about, pages.teachers, pages.edu, pages.trans, pages.upb, pages.services, pages.archives);
  /* окремі сторінки, яких нема в D.pages: теж у пошук (і для плиток, що шукають сторінку за назвою) */
  INDEX.push({ title: "Безпека та укриття", group: "Батькам", url: "safety.html",
    kw: "безпека тривога повітряна тривога укриття сховище бомбосховище евакуація забрати дитину черговий адміністратор 112 116 111" });
  INDEX.push({ title: "Бланки та заяви", group: "Батькам", url: "forms.html",
    kw: "бланк бланки заява заяви зразок зразки документи завантажити відсутність учня довідка зарахування переведення вступ" });
  INDEX.push({ title: "Наші простори", group: "Про ліцей", url: "spaces.html",
    kw: "простори кабінети кабінет фотоекскурсія екскурсія фото лабораторія інформатика хімія біологія бібліотека спортзал актова зала їдальня stem" });
  INDEX.push({ title: "Перший раз у 5 клас", group: "Батькам", url: "grade5.html",
    kw: "5 клас п'ятий клас п'ятикласник п'ятикласники адаптація перехід з початкової школи що купити до школи пам'ятка батькам класний керівник" });

  function find(title) {
    for (var i = 0; i < INDEX.length; i++) if (INDEX[i].title === title) return INDEX[i];
    if (window.console) console.warn("Сторінку не знайдено:", title);
    return null;
  }

  if (CONFIG.notice && CONFIG.notice.text) {
    $("#notice").hidden = false;
    $("#notice-text").textContent = CONFIG.notice.text;
    if (CONFIG.notice.url) {
      var nl = $("#notice-link"); nl.hidden = false; nl.href = CONFIG.notice.url;
      nl.textContent = CONFIG.notice.label || "Докладніше";
    }
    $("#notice-x").addEventListener("click", function () { $("#notice").hidden = true; });
  }

  /* шапка, підвал і меню - в common.js */
  if (CONFIG.heroPhoto && $(".hero-bg")) {
    var hb = $(".hero-bg");
    hb.classList.add("has-photo");
    hb.style.setProperty("--photo", 'url("' + encodeURI(CONFIG.heroPhoto) + '")');
  }

  $("#c-addr").textContent = CONFIG.address;
  $("#c-mail").href = mailto; $("#c-mail").textContent = CONFIG.email;
  $("#c-fb").href = CONFIG.facebook;
  $("#c-write").href = mailto;
  $("#c-route").href = "https://www.google.com/maps/search/?api=1&query=" + CONFIG.lat + "," + CONFIG.lng;
  $("#map").src = "https://maps.google.com/maps?q=" + CONFIG.lat + "," + CONFIG.lng + "&z=16&output=embed";
  $("#news-all").href = "news.html";
  if ($("#msg-mail")) { $("#msg-mail").href = mailto; $("#msg-mail").textContent = "або напишіть на " + CONFIG.email; }

  $("#also").innerHTML = [["Графік особистого прийому громадян адміністрацією закладу", "Графік особистого прийому"],
    ["Режим роботи", "Режим роботи"]].map(function (x) {
    var p = find(x[0]); return p ? "<a " + ext(p.url) + ">" + x[1] + "</a>" : "";
  }).join("");

  $("#quick").innerHTML = D.quick.map(function (q, i) {
    var p = find(q[0]); if (!p) return "";
    return '<li style="--i:' + i + '"><a ' + ext(p.url) + '><span class="ico">' + ICON(q[2]) + "</span><span>" + esc(q[1]) + "</span></a></li>";
  }).join("");

  /* велика картка - "Важливо" з data.js (feature), поруч - короткі новини */
  var F = D.feature;
  $("#feature").innerHTML =
    '<div class="ph feature-ph" aria-hidden="true">' + ICON("shield") + "</div>" +
    '<div class="feature-body"><span class="h-meta">' + esc(F.tag) + "</span><h3>" + esc(F.title) + "</h3><p>" + esc(F.text) + "</p>" +
    '<ul class="checks">' + F.points.map(function (t, i) { return '<li style="--i:' + i + '">' + ICON("check") + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul>" +
    '<p class="feature-note">' + esc(F.note) + "</p>" +
    '<a class="h-btn" ' + ext(F.ctaUrl) + ">" + esc(F.ctaLabel) + " →</a></div>";

  $("#newslist").innerHTML = D.news.map(function (n) {
    var url = n.url || (n.page ? (find(n.page) || {}).url : "");
    return '<article><div class="ph news-ph" aria-hidden="true">' + ICON("doc") + "</div><div>" +
      '<span class="h-meta">' + esc([n.date, "Новини"].filter(Boolean).join(" · ")) + "</span>" +
      "<h3>" + esc(n.title) + "</h3><p>" + esc(n.text) + "</p>" +
      (url ? '<a class="rd" ' + ext(url) + ">" + esc(n.label || "Читати") + " →</a>" : "") + "</div></article>";
  }).join("");

  $("#tiles").innerHTML = D.helpTiles.map(function (t) {
    var p = find(t[0]); if (!p) return "";
    return '<a class="tile" ' + ext(p.url) + '><span class="ico">' + ICON(t[2]) + '</span><span><b>' + esc(t[0]) + '</b><span class="d">' + esc(t[1]) + "</span></span>" + ICON("chev") + "</a>";
  }).join("");

  var PUB_SHORT = { statute: "Установчі документи", structure: "Структура й управління", staff: "Кадровий склад", programs: "Освітні програми",
    "annual-plan": "Річний план", "annual-report": "Річний звіт", quality: "Якість освіти", capacity: "Кількість учнів",
    equipment: "Матеріальна база", admission: "Правила прийому", territory: "Територія обслуговування", vacancies: "Вакансії",
    budget: "Кошторис", finance: "Фінансовий звіт" };
  $("#publist").innerHTML = pages.trans.map(function (p) {
    var k = (p.url.split("#")[1] || ""), short = PUB_SHORT[k] || p.title;
    return '<li><a ' + ext(p.url) + (short !== p.title ? ' title="' + esc(p.title) + '"' : "") + ">" + esc(short) + "</a></li>";
  }).join("");

  /* усі розділи: плитки головних сторінок, а під ними - всі сторінки за групами */
  $("#all-tiles").innerHTML = [["about.html", "Все про заклад"], ["news.html", "Новини"], ["calendar.html", "Календар подій"],
    ["schedule.html", "Розклад уроків і дзвінків"], ["menu.html", "Меню їдальні"], ["teachers.html", "Педагогічний колектив"],
    ["education.html", "Освітній процес"], ["profile.html", "Профільне навчання"], ["upbringing.html", "Виховна робота"],
    ["services.html", "Сервіси та служби"], ["faq.html", "Часті питання"], ["albums.html", "Фотоальбоми"],
    ["archive.html", "Архів новин"], ["public.html", "Публічна інформація"], ["profile-test.html", "Тест на вибір профілю"],
    ["proforientation.html", "Профорієнтаційний тест"], ["safety.html", "Безпека та укриття"], ["forms.html", "Бланки та заяви"], ["grade5.html", "Перший раз у 5 клас"], ["spaces.html", "Наші простори"]].map(function (x) {
    return '<li><a href="' + x[0] + '"><span>' + esc(x[1]) + "</span>" + ICON("chev") + "</a></li>";
  }).join("");

  function group(title, items, subItems, afterTitle) {
    var li = items.map(function (p) {
      var s = "<li><a " + ext(p.url) + ">" + esc(p.title) + "</a></li>";
      if (subItems && p.title === afterTitle) {
        s += subItems.map(function (q) { return '<li class="sub"><a ' + ext(q.url) + ">" + esc(q.title) + "</a></li>"; }).join("");
      }
      return s;
    }).join("");
    return '<details class="grp"><summary>' + esc(title) + ICON("chev") + "</summary><ul>" + li + "</ul></details>";
  }
  $("#sitemap").innerHTML =
    group("Все про заклад", pages.about, pages.teachers, "Педагогічний колектив") +
    group("Освітній процес", pages.edu) +
    group("Виховна робота", pages.upb) +
    group("Сервіси та служби", pages.services) +
    group("Архіви", pages.archives);

  var ORDER_TABS = ["Учням", "Батькам", "Вчителям"];
  var tabsEl = $("#tabs"), panelEl = $("#tabpanel"), listEl = $("#tablist"), prevEl = $("#tiles-prev"), nextEl = $("#tiles-next"), cur = 0;
  var names = Object.keys(D.audience).sort(function (a, b) {
    var x = ORDER_TABS.indexOf(a), y = ORDER_TABS.indexOf(b);
    return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
  });
  function tile(p, k) {
    return '<li style="--i:' + k + '"><a ' + ext(p.url) + '><span class="h-num" aria-hidden="true">' + (k < 9 ? "0" : "") + (k + 1) + "</span>" +
      '<span class="h-tile-t"><b>' + esc(p.title) + "</b><small>" + esc(p.group || "") + "</small></span></a></li>";
  }
  var tilesRail = window.L2.rail(listEl, prevEl, nextEl);   /* плитки в один ряд, стрілки по боках */
  var pill = document.createElement("span");
  pill.className = "tab-pill"; pill.setAttribute("aria-hidden", "true");
  tabsEl.appendChild(pill);

  function movePill() {
    var b = $("#tab-" + cur);
    if (!b) return;
    pill.style.width = b.offsetWidth + "px";
    pill.style.height = b.offsetHeight + "px";
    pill.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)";
  }
  function showTab(i, animate) {
    cur = i;
    names.forEach(function (n, k) {
      var b = $("#tab-" + k);
      b.setAttribute("aria-selected", k === i ? "true" : "false");
      b.tabIndex = k === i ? 0 : -1;
    });
    panelEl.setAttribute("aria-labelledby", "tab-" + i);
    var found = D.audience[names[i]].map(find).filter(Boolean);
    listEl.innerHTML = found.map(tile).join("");
    tilesRail.reset();
    if (animate && !reduce) restart(listEl, "swap");
    movePill();
  }
  names.forEach(function (n, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tab"; b.id = "tab-" + i; b.textContent = n;
    b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "tabpanel");
    b.addEventListener("click", function () { if (i !== cur) showTab(i, true); });
    b.addEventListener("keydown", function (e) {
      var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!k) return;
      var j = (i + k + names.length) % names.length;
      showTab(j, true); $("#tab-" + j).focus(); e.preventDefault();
    });
    tabsEl.appendChild(b);
  });
  showTab(0, false);
  requestAnimationFrame(function () { movePill(); pill.classList.add("ready"); });
  window.addEventListener("resize", movePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  /* 5. пошук */
  var input = $("#q"), sform = $("#sform"), list = $("#results"), status = $("#status"),
      sicon = $(".si", sform), active = -1, current = [];
  var norm = function (s) { return s.toLowerCase().replace(/ё/g, "е").replace(/[’ʼ]/g, "'"); };

  /* шукаємо по всьому сайту: тексти розділів (sections/*.js), документи, вчителі.
     файли розділів підключені в index.html і самі записуються в window.SECTIONS */
  var seen = {};
  INDEX.forEach(function (i) { seen[i.url] = 1; });
  function flat(b) {
    var out = [b.text || "", b.title || "", b.q || "", b.a || ""];
    (b.items || []).forEach(function (x) {
      if (typeof x === "string") out.push(x);
      else if (Array.isArray(x)) out.push(x.join(" "));
      else out.push([x.title, x.text, x.q, x.a, x.name, x.role, x.label, x.value, x.phone].filter(Boolean).join(" "));
    });
    (b.rows || []).forEach(function (r) { out.push(r.join(" ")); });
    return out.join(" ");
  }
  var SEC = window.SECTIONS || {};
  Object.keys(SEC).forEach(function (page) {
    var S = SEC[page];
    (S.items || []).forEach(function (it) {
      var url = it.href || page + ".html#" + it.id;
      if (!seen[url]) {
        INDEX.push({ title: it.title, kw: (it.sub || "") + " " + (it.blocks || []).map(flat).join(" "), group: S.title, url: url });
        seen[url] = 1;
      }
      (it.blocks || []).forEach(function (b) {
        if (b.type !== "docs") return;
        b.items.forEach(function (d) {
          if (d.url && !seen[d.url]) { INDEX.push({ title: d.title, kw: it.title, group: "Документ · " + S.title, url: d.url }); seen[d.url] = 1; }
        });
      });
    });
  });
  if (window.TEACHERS) window.TEACHERS.groups.forEach(function (g) {
    g.people.forEach(function (p) {
      if (p.name) INDEX.push({ title: p.name, kw: [p.role, p.post, g.title, "вчитель педагог"].filter(Boolean).join(" "), group: "Педагогічний колектив", url: "teachers.html#" + g.id });
    });
  });
  [["calendar.html", "Календар подій", "канікули свята дати семестр"], ["schedule.html", "Розклад уроків", "дзвінки уроки клас"], ["profile.html", "Перехід на профільне навчання", "профільна школа профіль 10 клас 2027 академічний ліцей робоча група засідання опитування stem реформа"],
   ["albums.html", "Фотоальбоми", "фото галерея"], ["menu.html", "Меню їдальні", "меню обід їдальня харчування страви"], ["faq.html", "Часті питання", "питання відповіді допомога"],
   ["news.html#life", "Життя ліцею", "фейсбук facebook фото свята конкурси досягнення події стрічка"]].forEach(function (x) {
    if (!seen[x[0]]) INDEX.push({ title: x[1], kw: x[2], group: "Корисне", url: x[0] });
  });
  /* профтест: посилання є тільки на сторінці профільного навчання і тут */
  INDEX.push({ title: "Профорієнтаційний тест", group: "Учням", url: "proforientation.html",
    kw: "профорієнтація професія професії тест вибір професії профіль профільна освіта академічний ліцей " +
        "голланд інтереси інтелекти гарднер ким стати кар'єра" });
  INDEX.push({ title: "Тест на вибір профілю", group: "Учням", url: "profile-test.html",
    kw: "тест профілю профільний тест кластер профіль вибір профілю академічний ліцей stem стем філологія нмт предмет на вибір " +
        "10 клас 11 клас 9 клас it інженерний медицина економічний історико-правовий журналістика іноземна" });

  INDEX.forEach(function (i) { i.t = norm(i.title); i.hay = norm(i.title + " " + i.kw + " " + i.group); });

  function search(q) {
    var tokens = norm(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    var out = [];
    INDEX.forEach(function (i) {
      var score = 0;
      for (var k = 0; k < tokens.length; k++) {
        var t = tokens[k];
        if (i.t.indexOf(t) === 0) score += 3;
        else if (i.t.indexOf(" " + t) > -1) score += 2;
        else if (i.hay.indexOf(t) > -1) score += 1;
        else return;
      }
      out.push({ i: i, s: score });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, 8).map(function (x) { return x.i; });
  }
  function hl(title, tokens) {
    if (!tokens.length) return esc(title);
    var re = new RegExp("(" + tokens.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "gi");
    return title.split(re).map(function (part, i) { return i % 2 ? "<mark>" + esc(part) + "</mark>" : esc(part); }).join("");
  }
  function setActive(n) {
    active = n;
    var opts = $$("li[role=option]", list);
    opts.forEach(function (o, k) { o.setAttribute("aria-selected", k === n ? "true" : "false"); });
    if (n >= 0 && opts[n]) { input.setAttribute("aria-activedescendant", opts[n].id); opts[n].scrollIntoView({ block: "nearest" }); }
    else input.removeAttribute("aria-activedescendant");
  }
  function closeList() { list.hidden = true; input.setAttribute("aria-expanded", "false"); setActive(-1); }
  function render() {
    var q = input.value.trim(), tokens = norm(q).split(/\s+/).filter(Boolean), head = "";
    if (!q) {
      current = D.quick.map(function (x) { return find(x[0]); }).filter(Boolean);
      head = '<li class="head" role="presentation">Популярне</li>';
      status.textContent = "";
    } else {
      current = search(q);
      status.textContent = current.length ? "Знайдено результатів: " + current.length : "Нічого не знайдено";
    }
    if (!current.length && PET.test(norm(q))) {
      list.innerHTML = '<li class="none">🐱 Ви знайшли кішку! Натисніть на неї — і буде лазер. На сайті сховано ще одну пасхалку — пошукайте.</li>';
    } else if (!current.length) {
      list.innerHTML = '<li class="none">Нічого не знайдено. Спробуйте інше слово або <a href="' + mailto + '">напишіть нам</a>.</li>';
    } else {
      list.innerHTML = head + current.map(function (p, k) {
        return '<li role="option" id="opt-' + k + '" aria-selected="false" style="--i:' + k + '"><a ' + ext(p.url) + "><span>" + hl(p.title, tokens) + "</span><small>" + esc(p.group) + "</small></a></li>";
      }).join("");
    }
    list.hidden = false; input.setAttribute("aria-expanded", "true"); active = -1;
  }
  function syncText() { sform.classList.toggle("has-text", input.value.length > 0); }

  input.addEventListener("input", function () {
    syncText(); render();
    if (!reduce) restart(sicon, "bump");
    bunnyCheck();
  });

  /* пасхалка: пишеш "кіт" (або bunny, як раніше) і вилазить кішка (сама кішка в common.js), стерли - ховається */
  var bunnyShown = false, PET = /^(bunny|cat|кіт|кішка|киця|котик)$/;
  function bunnyCheck() {
    var isBunny = PET.test(norm(input.value.trim()));
    if (isBunny && !bunnyShown) {
      var r = input.getBoundingClientRect();
      window.L2.bunny.toggle(r.left + 60, r.bottom + 90);
    }
    bunnyShown = isBunny;
  }
  input.addEventListener("focus", function () { stopTyping(); render(); });
  input.addEventListener("blur", function () { if (!input.value) startTyping(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (current.length) setActive((active + 1) % current.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (current.length) setActive((active - 1 + current.length) % current.length); }
    else if (e.key === "Escape") { closeList(); }
  });
  $("#clear").addEventListener("click", function () {
    input.value = ""; syncText(); input.focus(); render();
  });
  sform.addEventListener("submit", function (e) {
    e.preventDefault();
    if (CONFIG.secretWord && norm(input.value.trim()) === norm(CONFIG.secretWord)) {
      input.value = ""; syncText(); closeList(); input.blur(); window.L2.openGame(); return;
    }
    var p = input.value.trim() ? current[active >= 0 ? active : 0] : null;
    if (p) { window.open(p.url, tgt(p.url)); return; }
    /* нічого не знайшли - трусимо форму */
    restart(sform, "shake"); input.focus();
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".search")) closeList(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) { e.preventDefault(); focusSearch(); }
  });
  function focusSearch() {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    setTimeout(function () { input.focus(); }, reduce ? 0 : 250);
  }
  if (location.hash === "#search") setTimeout(function () { input.focus(); }, 60);

  var PH = D.placeholders || [], phTimer = null, phI = 0, phJ = 0, phDel = false, STATIC_PH = "Що ви шукаєте?";
  function typeTick() {
    var w = PH[phI], delay = 55;
    if (!phDel) {
      phJ++; input.placeholder = w.slice(0, phJ);
      if (phJ === w.length) { phDel = true; delay = 1600; }
    } else {
      phJ--; input.placeholder = w.slice(0, phJ) || " ";
      delay = 28;
      if (phJ === 0) { phDel = false; phI = (phI + 1) % PH.length; delay = 400; }
    }
    phTimer = setTimeout(typeTick, delay);
  }
  function startTyping() {
    if (reduce || !PH.length || phTimer) return;
    phTimer = setTimeout(typeTick, 600);
  }
  function stopTyping() {
    clearTimeout(phTimer); phTimer = null; phJ = 0; phDel = false;
    input.placeholder = STATIC_PH;
  }
  input.placeholder = STATIC_PH;
  startTyping();

  var cform = $("#cform"), sent = $("#sent");
  var RULES = {
    name: { el: $("#f-name"), msg: "Вкажіть, будь ласка, ім'я",
      ok: function (v) { return v.trim().length >= 2; } },
    contact: { el: $("#f-contact"), msg: "Вкажіть пошту або телефон, щоб ми могли відповісти",
      ok: function (v) { v = v.trim(); return /^\S+@\S+\.\S+$/.test(v) || v.replace(/\D/g, "").length >= 9; } },
    msg: { el: $("#f-msg"), msg: "Напишіть хоча б кілька слів (від 10 символів)",
      ok: function (v) { return v.trim().length >= 10; } }
  };
  function setState(key, state) {
    var r = RULES[key], f = r.el.closest(".field");
    f.classList.toggle("valid", state === "valid");
    f.classList.toggle("invalid", state === "invalid");
    r.el.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");
    $(".err", f).textContent = state === "invalid" ? r.msg : "";
  }
  function check(key) {
    var r = RULES[key], v = r.el.value;
    if (!v.trim()) { setState(key, "invalid"); return false; }
    var ok = r.ok(v); setState(key, ok ? "valid" : "invalid"); return ok;
  }
  Object.keys(RULES).forEach(function (key) {
    var el = RULES[key].el, touched = false;
    el.addEventListener("blur", function () { if (el.value) { touched = true; check(key); } });
    el.addEventListener("input", function () {
      if (touched || el.closest(".field").classList.contains("invalid")) check(key);
    });
  });
  var counter = $("#f-count");
  RULES.msg.el.addEventListener("input", function () { counter.textContent = RULES.msg.el.value.length + "/600"; });

  function showSent() {
    cform.hidden = true; sent.hidden = false;
    $("#sent-mail").href = mailto;
    sent.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }
  cform.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = null;
    Object.keys(RULES).forEach(function (k) { if (!check(k) && !bad) bad = k; });
    if (bad) { RULES[bad].el.focus(); return; }

    var btn = $("button[type=submit]", cform), lbl = $(".lbl", btn);
    var data = { name: RULES.name.el.value.trim(), contact: RULES.contact.el.value.trim(), message: RULES.msg.el.value.trim() };
    btn.classList.add("loading"); lbl.textContent = "Надсилаємо";

    function done() { btn.classList.remove("loading"); lbl.textContent = "Надіслати"; showSent(); }
    function viaMail() {
      var subject = "Звернення з сайту ліцею від " + data.name;
      var body = data.message + "\n\n" + data.name + "\nКонтакт для відповіді: " + data.contact;
      var a = document.createElement("a");
      a.href = mailto + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(done, 700);
    }
    if (CONFIG.formEndpoint) {
      window.L2.postForm(CONFIG.formEndpoint, data)
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
        .catch(viaMail);
    } else {
      viaMail();
    }
  });
  $("#sent-again").addEventListener("click", function () {
    cform.reset(); counter.textContent = "0/600";
    Object.keys(RULES).forEach(function (k) { setState(k, ""); });
    sent.hidden = true; cform.hidden = false; RULES.name.el.focus();
  });

  var header = $(".site-header"), menuBtn = $("#menu-btn");

  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    e.preventDefault();
    if (header.classList.contains("open")) menuBtn.click();
    if (id === "search") { focusSearch(); return; }
    var target = id ? document.getElementById(id) : document.body;
    if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  var links = {};
  $$('.nav li:not(.nav-search) > a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
          links[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(links).forEach(function (k) { var s = document.getElementById(k); if (s) io.observe(s); });
  }

  function mark(sel, step, max) {
    $$(sel).forEach(function (el, i) {
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", (Math.min(i, max || 6) * (step || 0.07)).toFixed(2) + "s");
    });
  }
  mark(".h-sec .h-head"); mark("#tabpanel"); mark(".h-cl", 0.08); mark(".h-facts li", 0.06);
  mark(".feature"); mark("#newslist article", 0.1);
  mark(".h-clubs-intro"); mark(".club", 0.06, 6);
  mark(".h-help"); mark(".h-public"); mark(".h-alltiles li", 0.03, 10); mark("details.grp", 0.06);
  mark(".rv", 0.08); mark(".h-rv-card"); mark(".h-find"); mark(".h-msg"); mark(".h-photos li", 0.06);
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

})();
