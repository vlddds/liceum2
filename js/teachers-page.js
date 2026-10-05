/* Сторінка «Педагогічний колектив» (teachers.html). Дані: js/teachers.js */
(function () {
  "use strict";

  var D = window.SITE_DATA, T = window.TEACHERS;
  if (!D || !T || !window.L2) { if (window.console) console.error("Не завантажено js/data.js, js/common.js або js/teachers.js"); return; }
  var L = window.L2, $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart,
      plural = L.plural, reduce = L.reduce;

  /* Шапка, підвал, меню й налаштування: js/common.js */

  /* 2. ДАНІ ------------------------------------------------------------------ */
  var GROUPS = T.groups, PH_NAME = "Прізвище Ім'я По батькові", total = 0;
  var norm = function (s) { return String(s || "").toLowerCase().replace(/[’ʼ`]/g, "'"); };
  GROUPS.forEach(function (g) {
    g.people.forEach(function (p) {
      p.name = p.name || ""; p._g = g; if (!g.retired && !g.extra) total++;
      p.hay = norm([p.name, p.role, p.post, p.category, p.title, p.education, g.title].concat(p.projects || []).join(" "));
    });
  });

  $("#t-num").textContent = total;
  var dirs = GROUPS.filter(function (g) { return !g.retired && !g.extra; }).length;
  $("#t-stats").innerHTML =
    "<li><b>" + total + "</b> " + plural(total, "педагог", "педагоги", "педагогів") + "</li>" +
    "<li><b>" + dirs + "</b> " + plural(dirs, "напрям", "напрями", "напрямів") + "</li>";

  /* 3. НАПРЯМИ ---------------------------------------------------------------- */
  var side = $("#t-side"), pick = $("#t-pick"), groupsEl = $("#t-groups"), grid = $("#t-grid"),
      empty = $("#t-empty"), status = $("#t-status"), q = $("#t-q"),
      mobile = window.matchMedia ? matchMedia("(max-width:899px)") : { matches: false },
      cur = 0, list = [];

  groupsEl.innerHTML = GROUPS.map(function (g, i) {
    return '<li><button type="button" class="t-g" data-i="' + i + '"><span class="ico">' + ICON(g.icon) +
      '</span><span class="t-g-name">' + esc(g.title) + '</span><span class="t-n">' + g.people.length + "</span></button></li>";
  }).join("");

  function setHead(icon, title, desc) {
    $("#t-ico").innerHTML = ICON(icon);
    $("#t-title").textContent = title;
    $("#t-desc").textContent = desc;
    $("#t-pick-ico").innerHTML = ICON(icon);
    $("#t-pick-name").textContent = title;
  }
  function setOpen(open) {
    side.classList.toggle("open", open);
    pick.setAttribute("aria-expanded", open ? "true" : "false");
  }
  pick.addEventListener("click", function () { setOpen(!side.classList.contains("open")); });

  function select(i, animate) {
    cur = i;
    var g = GROUPS[i];
    $$(".t-g", groupsEl).forEach(function (b, k) {
      if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    setHead(g.icon, g.title, g.desc || "");
    show(g.people, false, animate);
    if (history.replaceState) history.replaceState(null, "", "#" + g.id);
  }

  groupsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".t-g");
    if (!b) return;
    if (q.value) { q.value = ""; }
    select(+b.getAttribute("data-i"), true);
    if (mobile.matches) {
      setOpen(false);
      $("#t-main").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  });

  /* 4. КАРТКИ ----------------------------------------------------------------- */
  function initials(name) {
    var w = name.trim().split(/\s+/);
    return (w[0].charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase();
  }
  function photo(p) {
    if (p.photo) return '<img src="' + esc(p.photo) + '" alt=""' + L.imgSize(p.photo) + ' loading="lazy" decoding="async">';
    return p.name.trim() ? '<span class="t-ini">' + esc(initials(p.name)) + "</span>" : ICON("user");
  }
  function card(p, k, withGroup) {
    var named = !!p.name.trim();
    return '<li style="--i:' + Math.min(k, 14) + '"><button type="button" class="t-card" data-k="' + k + '">' +
      '<span class="t-ph">' + photo(p) + "</span>" +
      '<span class="t-body"><b' + (named ? "" : ' class="is-ph"') + ">" + esc(named ? p.name : PH_NAME) + "</b>" +
      '<span class="t-role">' + esc(p.role || "") + "</span>" +
      (withGroup ? '<span class="t-grp">' + esc(p._g.title) + "</span>" : "") +
      (p.post || p.category ? '<span class="t-badge">' + esc(p.post || p.category) + "</span>" : "") +
      "</span></button></li>";
  }
  function show(arr, withGroup, animate) {
    list = arr;
    grid.innerHTML = arr.map(function (p, k) { return card(p, k, withGroup); }).join("");
    empty.hidden = arr.length > 0;
    if (animate && !reduce) restart(grid, "swap");
  }

  /* Фото не завантажилось: показуємо заглушку замість «битої» картинки */
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (img.tagName === "IMG" && img.parentNode && img.parentNode.classList.contains("t-ph")) {
      img.parentNode.innerHTML = ICON("user");
    }
  }, true);

  grid.addEventListener("click", function (e) {
    var c = e.target.closest(".t-card");
    if (c) open(+c.getAttribute("data-k"), c);
  });

  /* 5. ПОШУК ------------------------------------------------------------------ */
  q.addEventListener("input", function () {
    var tokens = norm(q.value.trim()).split(/\s+/).filter(Boolean);
    if (!tokens.length) { select(cur, true); status.textContent = ""; return; }
    var found = [];
    GROUPS.forEach(function (g) {
      g.people.forEach(function (p) {
        if (tokens.every(function (t) { return p.hay.indexOf(t) > -1; })) found.push(p);
      });
    });
    $$(".t-g", groupsEl).forEach(function (b) { b.removeAttribute("aria-current"); });
    setHead("search", "Результати пошуку",
      found.length ? "Знайдено: " + found.length + " " + plural(found.length, "педагог", "педагоги", "педагогів") : "");
    show(found, true, true);
    status.textContent = found.length ? "Знайдено результатів: " + found.length : "Нічого не знайдено";
  });
  q.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && q.value) { q.value = ""; select(cur, true); }
  });

  /* 6. ВІКНО З ІНФОРМАЦІЄЮ ПРО ПЕДАГОГА ---------------------------------------- */
  var dlg = $("#t-dlg"), at = 0, opener = null;
  var FIELDS = [["post", "Посада"], ["category", "Кваліфікаційна категорія"], ["title", "Педагогічне звання"],
    ["experience", "Педагогічний стаж"], ["education", "Освіта"]];

  function fill(k) {
    at = k;
    var p = list[k], named = !!p.name.trim();
    $("#d-ph").innerHTML = photo(p);
    $("#d-grp").textContent = p._g.title;
    $("#d-name").textContent = named ? p.name : PH_NAME;
    $("#d-name").classList.toggle("is-ph", !named);
    $("#d-role").textContent = p.role || "";
    var rows = FIELDS.filter(function (f) { return p[f[0]]; });
    $("#d-dl").innerHTML = rows.map(function (f) { return "<div><dt>" + f[1] + "</dt><dd>" + esc(p[f[0]]) + "</dd></div>"; }).join("");
    $("#d-dl").hidden = !rows.length;
    $("#d-about").innerHTML = p.about
      ? p.about.split(/\n+/).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("")
      : rows.length || (p.projects && p.projects.length) ? "" : '<p class="t-soon">Докладна інформація про педагога з\'явиться згодом.</p>';
    if (p.projects && p.projects.length) {
      $("#d-about").innerHTML += '<h3 class="t-proj-h">Проєкти в ліцеї</h3><ul class="t-proj">' +
        p.projects.map(function (t) { return "<li>" + ICON("award") + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul>";
    }
    $("#d-pos").textContent = (k + 1) + " з " + list.length;
    $("#d-prev").disabled = k === 0;
    $("#d-next").disabled = k === list.length - 1;
    dlg.scrollTop = 0;
    if (!reduce) restart($(".t-dlg-in", dlg), "swap");
  }
  function open(k, from) {
    opener = from || null;
    fill(k);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    $("#d-x").focus({ preventScroll: true });
    dlg.scrollTop = 0;
  }
  function close() {
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
  }
  dlg.addEventListener("close", function () {
    var c = grid.querySelector('.t-card[data-k="' + at + '"]') || opener;
    if (c) c.focus();
  });
  $("#d-x").addEventListener("click", close);
  $("#d-prev").addEventListener("click", function () { if (at > 0) fill(at - 1); });
  $("#d-next").addEventListener("click", function () { if (at < list.length - 1) fill(at + 1); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" && at > 0) fill(at - 1);
    else if (e.key === "ArrowRight" && at < list.length - 1) fill(at + 1);
  });

  /* 7. СТАРТ: напрям з адреси (teachers.html#fizmat) ---------------------------- */
  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].id === id) return i;
    return 0;
  }
  select(fromHash(), false);
  window.addEventListener("hashchange", function () { q.value = ""; select(fromHash(), true); });

  var reveal = [$("#t-side"), $("#t-main")];
  reveal.forEach(function (el, i) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (i * 0.1) + "s"); });
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { threshold: 0.05 });
    reveal.forEach(function (el) { ro.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }

})();
