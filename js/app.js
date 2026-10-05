
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

  function find(title) {
    for (var i = 0; i < INDEX.length; i++) if (INDEX[i].title === title) return INDEX[i];
    if (window.console) console.warn("Сторінку не знайдено:", title);
    return null;
  }

  var ICON_RULES = [
    [/особистого прийому|самоврядув|колектив|адміністрац|кадров|структур/i, "users"],
    [/прийом|вступ|зарахув|територі|ліцензований/i, "userplus"],
    [/режим|розклад|дзвінк|планування/i, "clock"],
    [/харчув/i, "utensils"],
    [/довіри/i, "phone"],
    [/психолог|булінг|медичн/i, "heart"],
    [/безпек|мінна/i, "shield"],
    [/підручник|бібліотек|медіатек|методичн|навчальн|програм|мова|нова українська/i, "book"],
    [/секці|гурт|олімпіад|конкурс/i, "star"],
    [/нмт|зно|дпа|моніторинг|якості/i, "award"],
    [/кошторис|фінансов/i, "coins"],
    [/вакан|професі/i, "briefcase"],
    [/історія|матеріально|доступн/i, "building"]
  ];
  function iconFor(title) {
    for (var i = 0; i < ICON_RULES.length; i++) if (ICON_RULES[i][0].test(title)) return ICON_RULES[i][1];
    return "doc";
  }
  function row(p, i) {
    return '<li style="--i:' + i + '"><a ' + ext(p.url) + '><span class="t"><span class="ico">' + ICON(iconFor(p.title)) +
      "</span><span>" + esc(p.title) + "</span></span>" + ICON("chev") + "</a></li>";
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

  /* Логотип, верхня смужка, підвал, меню й налаштування: js/common.js */
  if (CONFIG.heroPhoto) {
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

  $("#also").innerHTML = [["Графік особистого прийому громадян адміністрацією закладу", "Графік особистого прийому"],
    ["Режим роботи", "Режим роботи"]].map(function (x) {
    var p = find(x[0]); return p ? "<a " + ext(p.url) + ">" + x[1] + "</a>" : "";
  }).join("");

  $("#quick").innerHTML = D.quick.map(function (q, i) {
    var p = find(q[0]); if (!p) return "";
    return '<li style="--i:' + i + '"><a ' + ext(p.url) + '><span class="ico">' + ICON(q[2]) + "</span><span>" + esc(q[1]) + "</span></a></li>";
  }).join("");

  var F = D.feature;
  $("#feature").innerHTML =
    '<span class="tag">' + esc(F.tag) + "</span><h3>" + esc(F.title) + "</h3><p>" + esc(F.text) + "</p>" +
    '<ul class="checks">' + F.points.map(function (t, i) { return '<li style="--i:' + i + '">' + ICON("check") + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul>" +
    "<p>" + esc(F.note) + "</p>" +
    '<a class="btn primary" ' + ext(F.ctaUrl) + ">" + esc(F.ctaLabel) + "</a>";

  $("#newslist").innerHTML = D.news.map(function (n) {
    var url = n.url || (n.page ? (find(n.page) || {}).url : "");
    return "<article>" + (n.date ? "<time>" + esc(n.date) + "</time>" : "") +
      "<h3>" + esc(n.title) + "</h3><p>" + esc(n.text) + "</p>" +
      (url ? '<a class="rd" ' + ext(url) + ">" + esc(n.label || "Читати далі") + "</a>" : "") + "</article>";
  }).join("");

  $("#tiles").innerHTML = D.helpTiles.map(function (t) {
    var p = find(t[0]); if (!p) return "";
    return '<a class="tile" ' + ext(p.url) + '><span class="ico">' + ICON(t[2]) + "</span><b>" + esc(t[0]) + '</b><span class="d">' + esc(t[1]) + "</span></a>";
  }).join("");

  $("#publist").innerHTML = pages.trans.map(row).join("");

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

  var tabsEl = $("#tabs"), panelEl = $("#tabpanel"), listEl = $("#tablist"), names = Object.keys(D.audience), cur = 0;
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
    listEl.innerHTML = D.audience[names[i]].map(function (t, k) { var p = find(t); return p ? row(p, k) : ""; }).join("");
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

  /* 5. ПОШУК --------------------------------------------------------------- */
  var input = $("#q"), sform = $("#sform"), list = $("#results"), status = $("#status"),
      sicon = $(".si", sform), active = -1, current = [];
  var norm = function (s) { return s.toLowerCase().replace(/ё/g, "е").replace(/[’ʼ]/g, "'"); };

  /* Пошук по всьому сайту: текст розділових сторінок (js/sections/*.js), документи, вчителі.
     Файли розділів підключені в index.html і записують себе в window.SECTIONS. */
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
  [["calendar.html", "Календар подій", "канікули свята дати семестр"], ["schedule.html", "Розклад уроків", "дзвінки уроки клас"],
   ["albums.html", "Фотоальбоми", "фото галерея"], ["menu.html", "Меню їдальні", "меню обід їдальня харчування страви"], ["faq.html", "Часті питання", "питання відповіді допомога"]].forEach(function (x) {
    if (!seen[x[0]]) INDEX.push({ title: x[1], kw: x[2], group: "Корисне", url: x[0] });
  });

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
    if (!current.length && norm(q) === "bunny") {
      list.innerHTML = '<li class="none">🐰 Ви знайшли кролика! На сайті сховано ще одну пасхалку — пошукайте.</li>';
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

  /* Пасхалка: напишіть у пошуку «bunny» — з'явиться кролик, який стрибає за вказівником.
     Прибрати: Esc або ще раз «bunny». */
  var bunnyShown = false, B = null;
  function bunnyCheck() {
    var isBunny = norm(input.value.trim()) === "bunny";
    if (isBunny && !bunnyShown) { if (B) bunnyLeave(); else bunnyStart(); }
    bunnyShown = isBunny;
  }
  var BW = 80, BH = 67;   /* розмір кролика, px */
  function bunnyStart() {
    var el = document.createElement("div");
    el.className = "bunny"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<svg viewBox="0 0 120 100"><g>' +
        '<ellipse cx="72" cy="22" rx="7" ry="18" transform="rotate(-22 72 22)" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="72" cy="22" rx="3" ry="12" transform="rotate(-22 72 22)" fill="#ffb3c7"/>' +
        '<ellipse cx="86" cy="19" rx="7" ry="18" transform="rotate(-6 86 19)" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="86" cy="19" rx="3" ry="12" transform="rotate(-6 86 19)" fill="#ffb3c7"/>' +
        '<circle cx="22" cy="70" r="9" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="58" cy="70" rx="36" ry="24" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<circle cx="80" cy="50" r="20" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<circle cx="86" cy="46" r="3.2" fill="#16213a"/><circle cx="87.2" cy="44.8" r="1" fill="#fff"/>' +
        '<ellipse cx="98" cy="53" rx="3" ry="2.3" fill="#ff7aa2"/>' +
        '<circle cx="84" cy="56" r="4" fill="#ffb3c7" opacity=".6"/>' +
        '<ellipse cx="44" cy="92" rx="12" ry="5" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
        '<ellipse cx="76" cy="92" rx="9" ry="4.5" fill="#fff" stroke="#8a93a6" stroke-width="2.5"/>' +
      "</g></svg>";
    document.body.appendChild(el);
    var r = input.getBoundingClientRect();
    B = { el: el, dir: 1, leaving: false,
          x: Math.max(BW / 2, Math.min(r.left + 60, innerWidth - BW / 2)), y: Math.max(BH + 10, Math.min(r.bottom + 90, innerHeight - 8)) };
    B.tx = B.x; B.ty = B.y;
    place(B.x, B.y, 0);
    status.textContent = "Пасхалка: кролик стрибає за вказівником. Esc — прибрати.";
    hop();
  }
  function place(x, y, rot) {
    B.el.style.transform = "translate(" + (x - BW / 2) + "px," + (y - BH) + "px) scaleX(" + B.dir + ") rotate(" + rot + "deg)";
  }
  function bunnyTarget(px, py) {
    if (!B || B.leaving) return;
    var side = px < B.x ? 1 : -1;   /* сідає збоку від вказівника, з того боку, звідки прийшов */
    B.tx = Math.max(BW / 2, Math.min(innerWidth - BW / 2, px + side * 55));
    B.ty = Math.max(BH, Math.min(innerHeight - 6, py + 34));
  }
  function bunnyLeave() {
    if (!B) return;
    B.leaving = true; B.tx = innerWidth + 140; B.ty = B.y;
    status.textContent = "";
  }
  function hop() {
    if (!B) return;
    var dx = B.tx - B.x, dy = B.ty - B.y, d = Math.sqrt(dx * dx + dy * dy);
    if (B.leaving && B.x > innerWidth + 60) { B.el.remove(); B = null; return; }
    if (d < 14) { setTimeout(hop, 160); return; }
    if (Math.abs(dx) > 4) B.dir = dx < 0 ? -1 : 1;
    var step = Math.min(d, reduce ? 60 : 120), x0 = B.x, y0 = B.y,
        x1 = x0 + dx / d * step, y1 = y0 + dy / d * step,
        dur = reduce ? 260 : 380, h = reduce ? 0 : 20 + step * 0.2, t0 = null;
    B.el.classList.remove("land");
    requestAnimationFrame(function frame(now) {
      if (!B) return;
      if (t0 === null) t0 = now;
      var t = Math.min(1, (now - t0) / dur), arc = Math.sin(Math.PI * t);
      place(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - arc * h, reduce ? 0 : -8 * arc);
      if (t < 1) { requestAnimationFrame(frame); return; }
      B.x = x1; B.y = y1;
      if (!reduce) { var el = B.el; el.classList.add("land"); setTimeout(function () { el.classList.remove("land"); }, 130); }
      setTimeout(hop, reduce ? 30 : 90);
    });
  }
  document.addEventListener("pointermove", function (e) { bunnyTarget(e.clientX, e.clientY); });
  document.addEventListener("pointerdown", function (e) { bunnyTarget(e.clientX, e.clientY); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && B) bunnyLeave(); });
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
    /* порожньо або нічого не знайдено: «струшуємо» форму */
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
  $$(".nav li:not(.nav-search) a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
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
  mark(".sec-head"); mark(".tabs"); mark("#tabpanel");
  mark(".feature"); mark("#newslist article", 0.1);
  mark(".phone", 0.1); mark(".tile", 0.08);
  mark("#publist li", 0.04, 8); mark("details.grp", 0.08);
  mark(".contact > div"); mark(".map-frame");
  mark(".club-filters"); mark(".club", 0.06, 6); mark(".rv-top"); mark(".rv", 0.08); mark(".gal");
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
