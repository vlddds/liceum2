/* Шкільна газета - підшивка (blog.html): свіжий номер великою карткою,
   нижче всі обкладинки за навчальними роками. Дані - data/gazeta.json через js/gazeta-common.js. */
(function () {
  "use strict";

  var L = window.L2, G = window.L2G;
  if (!L || !G) { if (window.console) console.error("Не завантажено js/common.js або js/gazeta-common.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, plural = L.plural;
  var main = $("#main");

  function cover(x, big) {
    return '<span class="gz-cover' + (big ? " big" : "") + '"><img src="' + esc(x.cover) + '" alt="" loading="' + (big ? "eager" : "lazy") + '" decoding="async"></span>';
  }
  var join = G.joinUrl
    ? '<a class="btn primary" href="' + esc(G.joinUrl) + '" target="_blank" rel="noopener">' + ICON("send") + 'Хочу в редакцію<span class="sr"> (відкриється Telegram)</span></a>' : "";

  main.innerHTML =
    '<section class="hero t-hero on-dark" aria-labelledby="h1">' +
      '<div class="hero-bg" aria-hidden="true"><span class="num"></span></div>' +
      '<div class="wrap hero-in"><nav class="crumbs" aria-label="Ви тут"><a href="index.html">Головна</a><span aria-hidden="true">/</span>' +
        '<a href="news.html">Новини</a><span aria-hidden="true">/</span><span aria-current="page">Шкільна газета</span></nav>' +
        '<h1 id="h1">' + esc(G.name) + "</h1>" +
        '<p class="hero-sub">Шкільна газета Ліцею №2: новини, репортажі, інтерв\'ю й історії з життя ліцею. Гортайте онлайн або завантажуйте PDF.</p>' +
      "</div></section>" +
    '<div class="sec gz-sec"><div class="wrap" id="gz-body"><div class="gz-skel" aria-hidden="true"></div></div></div>';

  var body = $("#gz-body");
  G.load().then(function (issues) {
    var joinBox = '<div class="bl-send"><div><h2>Хочеш у редакцію?</h2><p>Любиш писати, фотографувати, верстати чи брати інтерв\'ю? Долучайся до редакції шкільної газети: напиши нам, і ми розповімо, з чого почати.</p></div>' + join + "</div>";
    if (!issues.length) {
      body.innerHTML = '<div class="gz-empty"><span class="gz-empty-ic" aria-hidden="true">' + ICON("pen") + '</span><h2>Перший номер уже готується</h2>' +
        "<p>Редакція працює над першим випуском. Щойно він вийде, тут з'явиться обкладинка, і газету можна буде гортати просто на сайті.</p></div>" + joinBox;
      return;
    }
    var first = issues[0], rest = issues.slice(1);
    var years = [];
    rest.forEach(function (x) {
      var y = years.filter(function (g) { return g.y === x.schoolYear; })[0];
      if (!y) years.push(y = { y: x.schoolYear || "", items: [] });
      y.items.push(x);
    });
    body.innerHTML =
      '<article class="gz-fresh" aria-labelledby="gz-fresh-h">' +
        '<a class="gz-fresh-pic" href="' + esc(G.readUrl(first)) + '" tabindex="-1" aria-hidden="true">' + cover(first, true) + "</a>" +
        '<div class="gz-fresh-txt"><span class="gz-tag">Свіжий номер' + (first.draft ? " · тестовий" : "") + "</span>" +
          '<h2 id="gz-fresh-h">№' + esc(first.number) + " — " + esc(first.title) + "</h2>" +
          '<p class="gz-meta">' + esc(G.month(first)) + (first.pages ? " · " + first.pages + " " + plural(first.pages, "сторінка", "сторінки", "сторінок") : "") + "</p>" +
          '<div class="gz-acts"><a class="btn primary" href="' + esc(G.readUrl(first)) + '">' + ICON("book") + "Читати</a>" +
            (G.downloadUrl(first) ? '<a class="btn" href="' + esc(G.downloadUrl(first)) + '"' + (/^https?:/.test(G.downloadUrl(first)) ? ' target="_blank" rel="noopener"' : " download") + ">" + ICON("doc") + "Завантажити PDF</a>" : "") + "</div>" +
        "</div></article>" +
      years.map(function (g, i) {
        return '<section class="gz-year" aria-labelledby="gz-y' + i + '"><h2 id="gz-y' + i + '">' + esc(g.y ? g.y + " навчальний рік" : "Інші випуски") + "</h2>" +
          '<ul class="gz-grid">' + g.items.map(function (x) {
            return '<li><a class="gz-item" href="' + esc(G.readUrl(x)) + '">' + cover(x) +
              '<span class="gz-item-t"><b>№' + esc(x.number) + " — " + esc(x.title) + "</b><small>" + esc(G.month(x)) + "</small></span></a></li>";
          }).join("") + "</ul></section>";
      }).join("") + joinBox;
  });
})();
