/* ==========================================================================
   Блоки вмісту для розділових сторінок і архіву. Підключається після js/common.js.
   window.L2B.render(blocks)  → HTML;  події (галереї, відео) обробляються тут самі.

   Типи блоків (поле type):
     text     { text }                          абзаци, новий абзац — \n
     heading  { text }                          підзаголовок
     list     { items: [..] }                   список
     steps    { items: [..] }                   нумерований список
     docs     { items: [{ title, url, date, group }] }   документи (групуються за group)
     links    { items: [{ title, url, text }] }           корисні сайти
     cards    { items: [{ icon, title, text, url }] }     картки
     people   { items: [{ name, role, photo, phone, email, hours }] }
     phones   { items: [{ title, phone, alt, note }] }    телефони (натискаються)
     stats    { items: [{ value, label }] }                великі числа
     facts    { items: [{ label, value }] }                «назва — значення»
     table    { head: [..], rows: [[..], ..] }
     note     { text, tone: "info" | "warn" }             виділене повідомлення
     button   { title, url, text }                         кнопка-перехід
     gallery  { items: ["img/…jpg", …] }                  фото (натискаються — перегляд на весь екран);
                                                            порожній рядок "" — заготовка під фото
     videos   { items: [{ title, yt }] }                   відео YouTube (yt — код відео)
     feed     { items: [[вид, …], …] }                     стрічка «як на старій сторінці»:
                ["h", текст] ["p", текст, [[підпис, url], …]] ["li", текст] ["img", шлях]
                ["file", назва, url] ["video", назва, кодYouTube] ["link", текст, url]
     news     {}                                           усі новини з js/data.js
     faq      { items: [{ q, a, url, link }] }             питання-відповіді, що розгортаються
   ========================================================================== */
(function () {
  "use strict";

  var L = window.L2, D = window.SITE_DATA;
  if (!L) return;
  var esc = L.esc, ICON = L.ICON;

  function paras(t) { return String(t || "").split(/\n+/).filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }
  function host(u) { var m = /^https?:\/\/(?:www\.)?([^\/?#]+)/i.exec(u || ""); return m ? m[1] : ""; }
  function kind(u, title) {
    if (/\.(mp4|mov|avi)$/i.test(title || "")) return "Відео";
    if (/drive\.google|docs\.google/.test(u)) return "Drive";
    if (/zakon\.rada/.test(u)) return "Закон";
    var m = /\.([a-z0-9]{2,4})(?:[?#]|$)/i.exec(u || "");
    return m ? m[1].toUpperCase() : "";
  }

  /* Галереї реєструються тут, щоб по кліку відкрити перегляд на весь екран */
  var GAL = [];
  function gallery(srcs, caption) {
    var g = GAL.push(srcs.map(function (s) { return { src: s, caption: caption || "" }; })) - 1;
    return '<ul class="b-gallery' + (srcs.length === 1 ? " one" : "") + '">' + srcs.map(function (s, i) {
      return '<li><button type="button" class="b-ph" data-g="' + g + '" data-i="' + i + '" aria-label="Відкрити фото ' + (i + 1) + '">' +
        L.photoHTML(s ? { src: s } : null, i, true) + "</button></li>";
    }).join("") + "</ul>";
  }
  function video(title, yt) {
    return '<div class="b-yt"><button type="button" class="yt" data-yt="' + esc(yt) + '" aria-label="Відтворити відео: ' + esc(title) + '">' +
      '<img src="https://i.ytimg.com/vi/' + esc(yt) + '/hqdefault.jpg" alt="" loading="lazy" decoding="async">' +
      '<span class="yt-play" aria-hidden="true"></span></button><span class="yt-t">' + esc(title) + "</span></div>";
  }
  function doc(d) {
    var x = kind(d.url, d.title);
    if (!d.url) return '<li><span class="doc-link off">' + ICON("doc") + "<span>" + esc(d.title) + "<small>Документ скоро з'явиться</small></span></span></li>";
    return '<li><a class="doc-link" href="' + esc(d.url) + '">' + ICON(x === "Відео" ? "image" : "doc") + "<span>" + esc(d.title) +
      (d.date ? "<small>" + esc(d.date) + "</small>" : "") + "</span>" +
      (x ? '<em class="doc-ext">' + esc(x) + "</em>" : "") + ICON("chev") + "</a></li>";
  }

  var R = {
    heading: function (b) { return '<h4 class="acc-sub">' + esc(b.text) + "</h4>"; },
    text: function (b) { return '<div class="b-text">' + paras(b.text) + "</div>"; },
    list: function (b) { return '<ul class="rule-sub b-list">' + b.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; },
    steps: function (b) { return '<ol class="rule-list b-steps">' + b.items.map(function (x) { return "<li><p>" + esc(x) + "</p></li>"; }).join("") + "</ol>"; },
    note: function (b) {
      return '<p class="b-note ' + (b.tone || "info") + '">' + ICON(b.tone === "warn" ? "alert" : "check") + "<span>" + esc(b.text) + "</span></p>";
    },
    docs: function (b) {
      var groups = [], by = {};
      b.items.forEach(function (d) { var g = d.group || ""; if (!by[g]) { by[g] = []; groups.push(g); } by[g].push(d); });
      return groups.map(function (g) {
        return '<div class="doc-group">' + (g ? "<h3>" + esc(g) + "</h3>" : "") + '<ul class="doc-list">' + by[g].map(doc).join("") + "</ul></div>";
      }).join("");
    },
    links: function (b) {
      return '<ul class="b-links">' + b.items.map(function (l) {
        return '<li><a href="' + esc(l.url) + '"><span class="b-lk-t">' + esc(l.title) + "</span>" +
          (l.text ? "<small>" + esc(l.text) + "</small>" : "") + '<span class="b-lk-h">' + ICON("route") + esc(host(l.url) || "на цьому сайті") + "</span></a></li>";
      }).join("") + "</ul>";
    },
    cards: function (b) {
      return '<ul class="org-bodies b-cards">' + b.items.map(function (c) {
        var inner = '<span class="ico">' + ICON(c.icon || "star") + "</span><div><b>" + esc(c.title) + "</b>" + (c.text ? "<p>" + esc(c.text) + "</p>" : "") + "</div>";
        return "<li>" + (c.url ? '<a href="' + esc(c.url) + '">' + inner + "</a>" : inner) + "</li>";
      }).join("") + "</ul>";
    },
    people: function (b) {
      return '<ul class="b-people">' + b.items.map(function (p) {
        var w = (p.name || "").trim().split(/\s+/), ini = ((w[0] || "").charAt(0) + (w[1] || "").charAt(0)).toUpperCase();
        return '<li><span class="t-ph">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="" loading="lazy" decoding="async">' : '<span class="t-ini">' + esc(ini) + "</span>") + "</span>" +
          '<div><span class="adm-pos">' + esc(p.role || "") + "</span><b>" + esc(p.name) + "</b>" +
          (p.hours ? "<small>" + ICON("clock") + esc(p.hours) + "</small>" : "") +
          (p.phone ? '<a href="tel:' + esc(p.phone.replace(/[^\d+]/g, "")) + '">' + ICON("phone") + esc(p.phone) + "</a>" : "") +
          (p.email ? '<a href="mailto:' + esc(p.email) + '">' + ICON("mail") + esc(p.email) + "</a>" : "") + "</div></li>";
      }).join("") + "</ul>";
    },
    phones: function (b) {
      return '<ul class="b-phones">' + b.items.map(function (p) {
        return '<li><a class="phone" href="tel:' + esc(p.phone.replace(/[^\d+]/g, "")) + '"><strong>' + esc(p.phone) + "</strong><span>" +
          "<b>" + esc(p.title) + "</b>" + (p.alt ? "<small>або " + esc(p.alt) + "</small>" : "") + (p.note ? "<small>" + esc(p.note) + "</small>" : "") + "</span></a></li>";
      }).join("") + "</ul>";
    },
    stats: function (b) {
      return '<ul class="b-stats">' + b.items.map(function (s) { return "<li><b>" + esc(s.value) + "</b><span>" + esc(s.label) + "</span></li>"; }).join("") + "</ul>";
    },
    facts: function (b) {
      return '<dl class="b-facts">' + b.items.map(function (f) { return "<div><dt>" + esc(f.label) + "</dt><dd>" + esc(f.value) + "</dd></div>"; }).join("") + "</dl>";
    },
    table: function (b) {
      return '<div class="b-table"><table><thead><tr>' + b.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + b.rows.map(function (r) {
          return "<tr>" + r.map(function (c, i) { return (i ? "<td>" : '<th scope="row">') + esc(c) + (i ? "</td>" : "</th>"); }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
    },
    button: function (b) {
      return '<div class="b-button">' + (b.text ? "<p>" + esc(b.text) + "</p>" : "") +
        '<a class="btn primary" href="' + esc(b.url) + '">' + esc(b.title) + ICON("chev") + "</a></div>";
    },
    gallery: function (b) { return gallery(b.items, b.caption); },
    videos: function (b) { return '<div class="b-yts">' + b.items.map(function (v) { return video(v.title, v.yt); }).join("") + "</div>"; },
    feed: function (b) {
      var out = [], i = 0, it = b.items;
      function run(kindName) { var r = []; while (i < it.length && it[i][0] === kindName) r.push(it[i++]); return r; }
      while (i < it.length) {
        var k = it[i][0];
        if (k === "img") out.push(gallery(run("img").map(function (x) { return x[1]; }), b.caption));
        else if (k === "li") out.push('<ul class="rule-sub b-list">' + run("li").map(function (x) { return "<li>" + esc(x[1]) + "</li>"; }).join("") + "</ul>");
        else if (k === "file") out.push('<ul class="doc-list">' + run("file").map(function (x) { return doc({ title: x[1], url: x[2] }); }).join("") + "</ul>");
        else if (k === "video") out.push('<div class="b-yts">' + run("video").map(function (x) { return video(x[1], x[2]); }).join("") + "</div>");
        else if (k === "link") out.push(R.links({ items: run("link").map(function (x) { return { title: x[1], url: x[2] }; }) }));
        else if (k === "h") { out.push('<h4 class="acc-sub">' + esc(it[i][1]) + "</h4>"); i++; }
        else {
          var p = it[i++], links = p[2] || [];
          out.push('<p class="f-p">' + esc(p[1]) + (links.length ? " " + links.map(function (l) {
            return '<a class="f-link" href="' + esc(l[1]) + '">' + esc(l[0]) + "</a>";
          }).join(" ") : "") + "</p>");
        }
      }
      return '<div class="b-feed">' + out.join("") + "</div>";
    },
    faq: function (b) {
      return '<div class="b-faq">' + b.items.map(function (f) {
        return '<details class="faq"><summary>' + esc(f.q) + ICON("chev") + '</summary><div class="faq-a">' + paras(f.a) +
          (f.url ? '<a class="more" href="' + esc(f.url) + '">' + esc(f.link || "Докладніше") + "</a>" : "") + "</div></details>";
      }).join("") + "</div>";
    },
    news: function () {
      var news = (D && D.news) || [];
      if (!news.length) return '<p class="empty-note">Новин поки немає.</p>';
      return '<ul class="b-news">' + news.map(function (n) {
        return "<li><article>" + (n.date ? "<time>" + esc(n.date) + "</time>" : "") + "<h4>" + esc(n.title) + "</h4>" +
          "<p>" + esc(n.text) + "</p>" + (n.url ? '<a class="more" href="' + esc(n.url) + '">' + esc(n.label || "Читати далі") + "</a>" : "") + "</article></li>";
      }).join("") + "</ul>";
    }
  };

  function render(blocks) {
    return (blocks || []).map(function (b) {
      var f = R[b.type];
      if (!f && window.console) console.warn("Невідомий тип блоку:", b.type);
      return f ? f(b) : "";
    }).join("");
  }

  /* Кліки: фото → перегляд на весь екран; відео → вбудований плеєр YouTube */
  document.addEventListener("click", function (e) {
    var ph = e.target.closest(".b-ph");
    if (ph) { L.lightbox(GAL[+ph.getAttribute("data-g")], +ph.getAttribute("data-i"), function () { ph.focus(); }); return; }
    var yt = e.target.closest(".yt");
    if (yt) {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(yt.getAttribute("data-yt")) + "?autoplay=1&rel=0";
      f.title = yt.getAttribute("aria-label").replace(/^Відтворити відео: /, "");
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.setAttribute("allowfullscreen", "");
      f.className = "yt-frame";
      yt.replaceWith(f);
    }
  });

  window.L2B = { render: render };
})();
