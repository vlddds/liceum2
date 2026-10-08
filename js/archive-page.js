/* сторінка архіву, дані в archive.js */
(function () {
  "use strict";

  var AR = window.ARCHIVE, L = window.L2;
  if (!AR || !L) { if (window.console) console.error("Не завантажено js/common.js або js/archive.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, restart = L.restart, plural = L.plural, reduce = L.reduce;

  /* з ?preview видно і приховані роки, щоб глянути перед публікацією */
  var preview = /[?&]preview\b/.test(location.search);
  var years = AR.years.filter(function (y) { return y.show || preview; });
  if (preview) $("#ar-preview").hidden = false;

  var nPost = 0, nDoc = 0;
  years.forEach(function (y) {
    nPost += (y.posts || []).length + y.events.length;
    nDoc += y.docs.length;
    (y.posts || []).forEach(function (p) {
      (p.blocks || []).forEach(function (b) { if (b.type === "docs") nDoc += b.items.length; });
    });
  });
  $("#ar-stats").innerHTML = years.length ? [
    [years.length, plural(years.length, "навчальний рік", "навчальні роки", "навчальних років")],
    [nPost, plural(nPost, "розділ", "розділи", "розділів")],
    [nDoc, plural(nDoc, "документ і відео", "документи й відео", "документів і відео")]
  ].map(function (s) { return "<li><b>" + s[0] + "</b> " + s[1] + "</li>"; }).join("") : "";

  if (!years.length) {
    $("#ar-empty").hidden = false;
    $("#ar-body").hidden = true;
    return;
  }
  $("#ar-num").textContent = years[years.length - 1].title.split("/")[0];

  /* вкладки з роками */
  var tabsEl = $("#ar-tabs"), panel = $("#ar-panel"), cur = 0;
  var pill = document.createElement("span");
  pill.className = "tab-pill"; pill.setAttribute("aria-hidden", "true");
  tabsEl.appendChild(pill);
  years.forEach(function (y, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tab"; b.id = "yt-" + i; b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", "ar-panel");
    b.innerHTML = esc(y.title) + (y.show ? "" : ' <small class="hid">приховано</small>');
    b.addEventListener("click", function () { if (i !== cur) show(i, true); });
    b.addEventListener("keydown", function (e) {
      var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!k) return;
      var j = (i + k + years.length) % years.length;
      show(j, true); $("#yt-" + j).focus(); e.preventDefault();
    });
    tabsEl.appendChild(b);
  });
  function movePill() {
    var b = $("#yt-" + cur);
    if (!b) return;
    pill.style.width = b.offsetWidth + "px"; pill.style.height = b.offsetHeight + "px";
    pill.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)";
  }
  window.addEventListener("resize", movePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  /* що всередині року: події з фото і документи */
  function ext(url) {
    if (/drive\.google|docs\.google/.test(url)) return "Google";
    var m = /\.([a-z0-9]{2,4})(?:[?#]|$)/i.exec(url || "");
    return m ? m[1].toUpperCase() : "";
  }
  function evCard(e, k) {
    var ph = e.photos || [], cover = ph[0];
    return '<li class="ev" style="--i:' + k + '"><button type="button" class="ev-open" data-k="' + k + '"' + (ph.length ? "" : " disabled") +
      ' aria-label="' + esc(e.title) + (ph.length ? ": переглянути " + ph.length + " фото" : "") + '">' +
      '<span class="ev-cover' + (ph.length > 1 ? " stack" : "") + '">' + L.photoHTML(cover, -1, true) +
      (ph.length ? '<span class="ev-count">' + ICON("image") + ph.length + "</span>" : "") + "</span>" +
      '<span class="ev-body">' + (e.date ? "<time>" + esc(e.date) + "</time>" : "") + "<b>" + esc(e.title) + "</b>" +
      (e.text ? "<p>" + esc(e.text) + "</p>" : "") + "</span></button></li>";
  }
  function docRow(d) {
    var x = ext(d.url);
    return d.url
      ? '<li><a class="doc-link" href="' + esc(d.url) + '">' + ICON("doc") + "<span>" + esc(d.title) +
        (d.date ? "<small>" + esc(d.date) + "</small>" : "") + "</span>" + (x ? '<em class="doc-ext">' + esc(x) + "</em>" : "") + ICON("chev") + "</a></li>"
      : '<li><span class="doc-link off">' + ICON("doc") + "<span>" + esc(d.title) + "<small>Документ скоро з'явиться</small></span></span></li>";
  }

  function show(i, animate) {
    cur = i;
    var y = years[i];
    years.forEach(function (_, k) {
      var b = $("#yt-" + k);
      b.setAttribute("aria-selected", k === i ? "true" : "false");
      b.tabIndex = k === i ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", "yt-" + i);

    var cats = [], byCat = {};
    y.docs.forEach(function (d) {
      var c = d.cat || "Документи";
      if (!byCat[c]) { byCat[c] = []; cats.push(c); }
      byCat[c].push(d);
    });

    var posts = y.posts || [], hasPosts = posts.length > 0;
    panel.innerHTML =
      (hasPosts ? '<div class="ar-block"><div class="ar-h"><h2>' + ICON("archive") + "Записи за " + esc(y.title) + " н.р.</h2><span>" + posts.length + "</span></div>" +
        '<div class="acc">' + posts.map(function (p) {
          return '<div class="acc-item' + (p.open ? " open" : "") + '" id="ap-' + esc(p.id) + '"><h3><button class="acc-head" type="button" aria-expanded="' + (p.open ? "true" : "false") + '">' +
            '<span class="ico">' + ICON(p.icon || "doc") + '</span><span class="acc-t">' + esc(p.title) + "<small>" + esc(p.sub || "") + "</small></span>" +
            '<svg class="ic acc-chev" aria-hidden="true"><use href="#i-chev"/></svg></button></h3>' +
            '<div class="acc-body" role="region"><div class="acc-in"><div class="acc-pad">' + window.L2B.render(p.blocks) + "</div></div></div></div>";
        }).join("") + "</div></div>" : "") +
      (y.events.length || !hasPosts ? '<div class="ar-block"><div class="ar-h"><h2>' + ICON("image") + "Події та фото</h2><span>" + y.events.length + "</span></div>" +
      (y.events.length ? '<ul class="ev-grid">' + y.events.map(evCard).join("") + "</ul>"
        : '<p class="empty-note">Фото подій за ' + esc(y.title) + " н.р. ще не додано.</p>") + "</div>" : "") +
      (y.docs.length || !hasPosts ? '<div class="ar-block"><div class="ar-h"><h2>' + ICON("doc") + "Документи</h2><span>" + y.docs.length + "</span></div>" +
      (y.docs.length ? cats.map(function (c) {
        return '<div class="doc-group">' + (cats.length > 1 || c !== "Документи" ? "<h3>" + esc(c) + "</h3>" : "") +
          '<ul class="doc-list">' + byCat[c].map(docRow).join("") + "</ul></div>";
      }).join("") : '<p class="empty-note">Документів за ' + esc(y.title) + " н.р. ще немає.</p>") + "</div>" : "");
    $$("a[href^='http']", panel).forEach(function (a) { a.target = "_blank"; a.rel = "noopener"; });

    if (animate && !reduce) restart(panel, "swap");
    movePill();
    if (history.replaceState) history.replaceState(null, "", location.search + "#" + y.id);
  }

  panel.addEventListener("click", function (e) {
    var h = e.target.closest(".acc-head");
    if (h) {
      var it = h.closest(".acc-item"), open = !it.classList.contains("open");
      it.classList.toggle("open", open); h.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
    var b = e.target.closest(".ev-open");
    if (!b) return;
    var ev = years[cur].events[+b.getAttribute("data-k")];
    L.lightbox(ev.photos.map(function (p) { return { src: p.src, caption: p.caption || ev.title }; }), 0, function () { b.focus(); });
  });

  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    for (var i = 0; i < years.length; i++) if (years[i].id === id) return i;
    return 0;
  }
  show(fromHash(), false);
  requestAnimationFrame(function () { movePill(); pill.classList.add("ready"); });
  window.addEventListener("hashchange", function () { show(fromHash(), true); });

  var reveal = [$("#ar-tabs"), panel];
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
