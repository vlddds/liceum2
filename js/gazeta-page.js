/* Шкільна газета - підшивка (blog.html): номери стоять на «прилавку», як у газетному кіоску,
   по полиці на навчальний рік, свіжий номер першим. Клік по обкладинці - читалка,
   не вміщаються на полицю - гортаємо стрілками (L2.rail, як гуртки на головній).
   Дані - data/gazeta.json через js/gazeta-common.js. */
(function () {
  "use strict";

  var L = window.L2, G = window.L2G;
  if (!L || !G) { if (window.console) console.error("Не завантажено js/common.js або js/gazeta-common.js"); return; }
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, plural = L.plural;
  var main = $("#main");

  function mag(x, fresh, i) {
    return '<li class="gz-mag" style="--tilt:' + (i % 3 === 0 ? -1.6 : i % 3 === 1 ? 1.2 : -0.6) + 'deg">' +
      '<a href="' + esc(G.readUrl(x)) + '" aria-label="Читати №' + esc(x.number) + " — " + esc(x.title) + ", " + esc(G.month(x)) + '">' +
        '<span class="gz-cover"><img src="' + esc(x.cover) + '" alt="" loading="' + (i < 4 ? "eager" : "lazy") + '" decoding="async">' +
          (fresh ? '<span class="gz-fresh-tag">Свіжий' + (x.draft ? " · тест" : "") + "</span>" : "") + "</span>" +
        '<span class="gz-mag-t" aria-hidden="true"><b>№' + esc(x.number) + " — " + esc(x.title) + "</b><small>" + esc(G.month(x)) +
          (x.pages ? " · " + x.pages + " с." : "") + "</small></span>" +
      "</a></li>";
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
    $("#h1").textContent = G.name;
    var joinBox = '<div class="bl-send"><div><h2>Хочеш у редакцію?</h2><p>Любиш писати, фотографувати, верстати чи брати інтерв\'ю? Долучайся до редакції шкільної газети: напиши нам, і ми розповімо, з чого почати.</p></div>' + join + "</div>";
    if (!issues.length) {
      body.innerHTML = '<div class="gz-empty"><span class="gz-empty-ic" aria-hidden="true">' + ICON("pen") + '</span><h2>Перший номер уже готується</h2>' +
        "<p>Редакція працює над першим випуском. Щойно він вийде, тут з'явиться обкладинка, і газету можна буде гортати просто на сайті.</p></div>" + joinBox;
      return;
    }
    var first = issues[0], years = [];
    issues.forEach(function (x) {
      var y = years.filter(function (g) { return g.y === x.schoolYear; })[0];
      if (!y) years.push(y = { y: x.schoolYear || "", items: [] });
      y.items.push(x);
    });
    body.innerHTML = years.map(function (g, i) {
        return '<section class="gz-stand" aria-labelledby="gz-y' + i + '"><h2 id="gz-y' + i + '">' + esc(g.y ? g.y + " навчальний рік" : "Інші випуски") +
            '<small>' + g.items.length + " " + plural(g.items.length, "номер", "номери", "номерів") + "</small></h2>" +
          '<div class="gz-shelf">' +
            '<button class="gz-arrow prev" type="button" aria-label="Попередні номери" disabled>' + ICON("chev") + "</button>" +
            '<ul class="gz-rack">' + g.items.map(function (x, k) { return mag(x, x === first, k); }).join("") + "</ul>" +
            '<button class="gz-arrow next" type="button" aria-label="Наступні номери">' + ICON("chev") + "</button>" +
          "</div></section>";
      }).join("") +
      '<p class="gz-hint">Натисніть на обкладинку, щоб читати номер. Усередині сторінки гортаються, як у справжній газеті.</p>' + joinBox;
    $$(".gz-shelf", body).forEach(function (s) { L.rail($(".gz-rack", s), $(".gz-arrow.prev", s), $(".gz-arrow.next", s)); });
  });
})();
