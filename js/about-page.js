/* Сторінка «Все про заклад» (about.html). Дані: js/about.js */
(function () {
  "use strict";

  var A = window.ABOUT, L = window.L2;
  if (!A || !L) { if (window.console) console.error("Не завантажено js/common.js або js/about.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart, plural = L.plural, reduce = L.reduce;

  var DAYS = ["", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця"];
  var DAYS_S = ["", "Пн", "Вт", "Ср", "Чт", "Пт"];
  function shortName(n) {
    var w = n.trim().split(/\s+/);
    return w[0] + (w[1] ? " " + w[1].charAt(0) + "." : "") + (w[2] ? " " + w[2].charAt(0) + "." : "");
  }
  function initials(n) {
    var w = n.trim().split(/\s+/);
    return (w[0].charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase();
  }
  function paras(t) { return String(t || "").split(/\n+/).filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }

  /* 1. ІСТОРІЯ ---------------------------------------------------------------- */
  var H = A.history, age = new Date().getFullYear() - H.founded;
  $("#a-num").textContent = H.founded;
  $("#h-intro").innerHTML = paras(H.intro);
  $("#h-age").innerHTML = "<b>" + age + "</b><span>" + plural(age, "рік", "роки", "років") + " історії</span><small>з " + H.founded + " року</small>";
  $("#h-line").innerHTML = H.milestones.map(function (m, i) {
    return '<li style="--i:' + i + '"><span class="tl-year">' + esc(m.year) + '</span><span class="tl-dot" aria-hidden="true"></span>' +
      "<b>" + esc(m.title) + "</b>" + (m.text ? "<p>" + esc(m.text) + "</p>" : "") + "</li>";
  }).join("");
  $("#h-dirs").innerHTML = H.directors.map(function (d) {
    return '<li' + (d.current ? ' class="now"' : "") + '><span class="ico">' + ICON("user") + "</span><span><b>" + esc(d.name) + "</b>" +
      "<small>" + esc(d.years) + (d.current ? " · чинний директор" : "") + "</small></span></li>";
  }).join("");

  /* 2. АКОРДЕОН ----------------------------------------------------------------- */
  var acc = $("#acc");
  function setPanel(item, open, animate) {
    var btn = $(".acc-head", item);
    if (!btn) return;
    item.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (!animate) { item.classList.add("instant"); requestAnimationFrame(function () { item.classList.remove("instant"); }); }
  }
  acc.addEventListener("click", function (e) {
    var btn = e.target.closest(".acc-head");
    if (!btn) return;
    var item = btn.closest(".acc-item"), open = !item.classList.contains("open");
    setPanel(item, open, true);
    if (open && history.replaceState) history.replaceState(null, "", "#" + item.id);
  });

  /* 2.1 Адміністрація + графік прийому */
  $("#adm-count").textContent = A.admin.length + " " + plural(A.admin.length, "особа", "особи", "осіб");
  $("#adm-grid").innerHTML = A.admin.map(function (p, i) {
    var rec = (p.reception || []).map(function (r) {
      return '<li><span class="rec-d">' + DAYS_S[r.day] + "</span>" + esc(r.time) + "</li>";
    }).join("");
    var contacts = (p.phone ? '<a href="tel:' + esc(p.phone.replace(/[^\d+]/g, "")) + '">' + ICON("phone") + esc(p.phone) + "</a>" : "") +
      (p.email ? '<a href="mailto:' + esc(p.email) + '">' + ICON("mail") + esc(p.email) + "</a>" : "");
    return '<li class="adm' + (i === 0 ? " lead" : "") + '">' +
      '<span class="t-ph">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy">' : '<span class="t-ini">' + esc(initials(p.name)) + "</span>") + "</span>" +
      '<div class="adm-body"><span class="adm-pos">' + esc(p.position) + "</span><h4>" + esc(p.name) + "</h4>" +
      (p.subject ? '<span class="adm-sub">' + esc(p.subject) + "</span>" : "") +
      (contacts ? '<div class="adm-contacts">' + contacts + "</div>" : "") +
      (rec ? '<div class="adm-rec"><span>' + ICON("clock") + 'Особистий прийом</span><ul>' + rec + "</ul></div>" : "") +
      "</div></li>";
  }).join("");

  var today = new Date().getDay();   /* 0 = неділя … 6 = субота */
  var week = [1, 2, 3, 4, 5].map(function (d) {
    var slots = [];
    A.admin.forEach(function (p) {
      (p.reception || []).forEach(function (r) { if (r.day === d) slots.push({ p: p, time: r.time }); });
    });
    slots.sort(function (a, b) { return a.time < b.time ? -1 : 1; });
    return { d: d, slots: slots };
  });
  $("#rec-week").innerHTML = week.map(function (w) {
    var isToday = w.d === today;
    return '<li class="rec-day' + (isToday ? " today" : "") + (w.slots.length ? "" : " empty") + '">' +
      '<div class="rec-h"><b>' + DAYS[w.d] + "</b>" + (isToday ? '<span class="rec-now">Сьогодні</span>' : "") + "</div>" +
      (w.slots.length ? w.slots.map(function (s) {
        return '<div class="rec-slot"><span class="rec-time">' + ICON("clock") + esc(s.time) + "</span><b>" + esc(shortName(s.p.name)) +
          "</b><small>" + esc(s.p.position) + "</small></div>";
      }).join("") : '<div class="rec-none">Прийому немає</div>') + "</li>";
  }).join("");
  var todaySlots = (week[today - 1] || { slots: [] }).slots;
  $("#rec-today").innerHTML = todaySlots.length
    ? ICON("check") + "<span>Сьогодні приймає: <b>" + todaySlots.map(function (s) { return esc(shortName(s.p.name)) + " (" + esc(s.time) + ")"; }).join(", ") + "</b></span>"
    : ICON("clock") + "<span>Сьогодні особистого прийому немає. Графік на тиждень нижче.</span>";
  $("#rec-note").innerHTML = esc(A.receptionNote || "") +
    (A.receptionDoc ? ' <a class="more" href="' + esc(A.receptionDoc) + '">Графік прийому (PDF)</a>' : "");
  $("#rec-mail").href = L.mailto + "?subject=" + encodeURIComponent("Запис на особистий прийом");

  /* 2.2 Педагогічний колектив: кількість з js/teachers.js, якщо він підключений */
  if (window.TEACHERS) {
    var n = 0; window.TEACHERS.groups.forEach(function (g) { n += g.people.length; });
    $("#ped-count").textContent = n + " " + plural(n, "педагог", "педагоги", "педагогів") + " · " +
      window.TEACHERS.groups.length + " " + plural(window.TEACHERS.groups.length, "напрям", "напрями", "напрямів");
  }

  /* 2.3 Структура управління */
  var S = A.structure;
  function node(x, cls) { return '<div class="org-node ' + (cls || "") + '"><b>' + esc(x.title) + "</b>" + (x.text ? "<small>" + esc(x.text) + "</small>" : "") + "</div>"; }
  $("#org").innerHTML =
    '<div class="org-row' + (S.top.length > 1 ? " merge" : "") + '" style="--n:' + S.top.length + '">' + S.top.map(function (x) { return node(x, "top"); }).join("") + "</div>" +
    '<div class="org-link" aria-hidden="true"></div>' +
    '<div class="org-row">' + node(S.head, "head") + "</div>" +
    '<div class="org-link" aria-hidden="true"></div>' +
    '<div class="org-row branch" style="--n:' + S.deputies.length + '">' + S.deputies.map(function (x) { return node(x); }).join("") + "</div>";
  $("#org-bodies").innerHTML = S.bodies.map(function (b) {
    return '<li><span class="ico">' + ICON(b.icon || "users") + "</span><div><b>" + esc(b.title) + "</b><p>" + esc(b.text) + "</p></div></li>";
  }).join("");
  $("#org-docs").innerHTML = (S.docs || []).map(function (d) {
    return d.url ? '<a class="doc-link" href="' + esc(d.url) + '">' + ICON("doc") + "<span>" + esc(d.title) + "</span>" + ICON("chev") + "</a>"
      : '<span class="doc-link off">' + ICON("doc") + "<span>" + esc(d.title) + "<small>Документ скоро з'явиться</small></span></span>";
  }).join("");

  /* 2.4 Учнівське самоврядування */
  var G = A.selfGov;
  $("#sg-intro").innerHTML = paras(G.intro);
  $("#sg-leader").innerHTML = '<span class="ico">' + ICON("award") + "</span><div><small>" + esc(G.leader.title) + "</small><b" +
    (G.leader.name ? "" : ' class="is-ph"') + ">" + esc(G.leader.name || "Прізвище Ім'я") + "</b>" +
    (G.leader.note ? "<span>" + esc(G.leader.note) + "</span>" : "") + "</div>";
  $("#sg-list").innerHTML = G.committees.map(function (c, i) {
    return '<li style="--i:' + i + '"><span class="ico">' + ICON(c.icon || "star") + "</span><b>" + esc(c.title) + "</b><p>" + esc(c.text) + "</p></li>";
  }).join("");

  /* 2.5 Правила: вкладки-розділи */
  var rTabs = $("#rules-tabs"), rBody = $("#rules-body"), curRule = 0;
  var total = 0;
  A.rules.forEach(function (r) { total += r.items.length; });
  $("#rules-count").textContent = A.rules.length + " " + plural(A.rules.length, "розділ", "розділи", "розділів") + " · " + total + " " + plural(total, "пункт", "пункти", "пунктів");
  rTabs.innerHTML = A.rules.map(function (r, i) {
    return '<button type="button" class="chip" role="tab" id="rt-' + r.id + '" aria-controls="rules-body" aria-selected="' + (i ? "false" : "true") +
      '" aria-pressed="' + (i ? "false" : "true") + '" tabindex="' + (i ? -1 : 0) + '">' + ICON(r.icon || "doc") + esc(r.title) + "<span>" + r.items.length + "</span></button>";
  }).join("");
  function item(x) {
    if (typeof x === "string") return "<li><p>" + esc(x) + "</p></li>";
    return "<li><p>" + esc(x.text) + '</p><ul class="rule-sub">' + x.list.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></li>";
  }
  function showRule(i, animate) {
    curRule = i;
    $$(".chip", rTabs).forEach(function (b, k) {
      b.setAttribute("aria-selected", k === i ? "true" : "false");
      b.setAttribute("aria-pressed", k === i ? "true" : "false");
      b.tabIndex = k === i ? 0 : -1;
    });
    rBody.setAttribute("aria-labelledby", "rt-" + A.rules[i].id);
    rBody.innerHTML = '<ol class="rule-list">' + A.rules[i].items.map(item).join("") + "</ol>";
    if (animate && !reduce) restart(rBody, "swap");
  }
  rTabs.addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) showRule($$(".chip", rTabs).indexOf(b), true); });
  rTabs.addEventListener("keydown", function (e) {
    var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!k) return;
    var j = (curRule + k + A.rules.length) % A.rules.length;
    showRule(j, true); $$(".chip", rTabs)[j].focus(); e.preventDefault();
  });
  showRule(0, false);

  /* Друк правил: усі розділи на окремому аркуші */
  var rp = document.createElement("div");
  rp.className = "rules-printable";
  rp.innerHTML = "<h1>Правила внутрішньошкільного розпорядку та поведінки учнів</h1><p>Ліцей №2 Підгородненської міської ради</p>" +
    A.rules.map(function (r, i) {
      return "<h2>" + ["I", "II", "III", "IV", "V"][i] + ". " + esc(r.title) + '</h2><ol class="rule-list">' + r.items.map(item).join("") + "</ol>";
    }).join("");
  document.body.appendChild(rp);
  $("#rules-print").addEventListener("click", function () { document.body.classList.add("rules-printing"); window.print(); });
  window.addEventListener("afterprint", function () { document.body.classList.remove("rules-printing"); });

  /* 3. ПЕРЕХІД ЗА АДРЕСОЮ: about.html#structure відкриває потрібний пункт ----------- */
  var ALIAS = { reception: "administration" };
  function fromHash(scroll) {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = document.getElementById(ALIAS[id] || id);
    if (target && target.classList.contains("acc-item")) {
      setPanel(target, true, false);
      if (scroll) {
        var to = id === "reception" ? $("#reception") : target;
        setTimeout(function () { to.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 60);
      }
    }
  }
  fromHash(true);
  window.addEventListener("hashchange", function () { fromHash(true); });

  /* Внутрішні посилання на цій сторінці (#history, #structure …) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1), t = document.getElementById(ALIAS[id] || id);
    if (!t) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    fromHash(true);
    if (!t.classList.contains("acc-item")) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  /* 4. ПОЯВА ПРИ ПРОКРУТЦІ --------------------------------------------------------- */
  var reveal = $$(".sec-head, .h-grid > *, .timeline, .acc-item");
  reveal.forEach(function (el, i) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (Math.min(i % 6, 5) * 0.07).toFixed(2) + "s"); });
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { threshold: 0.08 });
    reveal.forEach(function (el) { ro.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }
})();
