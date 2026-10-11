/* новини: дві вкладки - "Новини" (як було) і "Життя ліцею" (стрічка з фейсбука).
   підключати після section-page.js. news.html#life одразу відкриває другу вкладку.
   стрічка вантажиться тільки по кнопці, до того на фейсбук нічого не йде */
(function () {
  "use strict";

  var L = window.L2, D = window.SITE_DATA;
  var sec = document.querySelector(".sp-sec .wrap");
  if (!L || !D || !sec) return;
  var $ = L.$, $$ = L.$$, esc = L.esc, ICON = L.ICON, reduce = L.reduce;
  var FB = D.config.FACEBOOK_PAGE_URL || D.config.facebook || "";
  var isGroup = /facebook\.com\/groups\//i.test(FB);

  /* обгортаємо все, що вже намалював section-page.js, у першу вкладку */
  var newsPanel = document.createElement("div");
  newsPanel.id = "panel-news"; newsPanel.className = "nt-panel";
  newsPanel.setAttribute("role", "tabpanel"); newsPanel.setAttribute("aria-labelledby", "tab-news"); newsPanel.tabIndex = -1;
  newsPanel.innerHTML = '<p class="nt-lead">Офіційні оголошення та важливі події ліцею</p>';
  while (sec.firstChild) newsPanel.appendChild(sec.firstChild);

  var lifePanel = document.createElement("div");
  lifePanel.id = "panel-life"; lifePanel.className = "nt-panel"; lifePanel.hidden = true;
  lifePanel.setAttribute("role", "tabpanel"); lifePanel.setAttribute("aria-labelledby", "tab-life"); lifePanel.tabIndex = -1;
  lifePanel.innerHTML = '<p class="nt-lead">Свята, конкурси, досягнення та будні — з нашої сторінки у Facebook</p>' +
    '<div class="fb-box" id="fb-box">' + (isGroup || !FB
      ? '<div class="fb-ph">' + ICON("fb") + "<p><b>Стрічка у Facebook</b>Найсвіжіші фото й події ліцею ми публікуємо у Facebook.</p>" +
        (FB ? '<a class="btn primary" href="' + esc(FB) + '" target="_blank" rel="noopener">Відкрити у Facebook' + ICON("chev") + "</a>" : "") + "</div>"
      : '<div class="fb-ph">' + ICON("fb") + "<p><b>Стрічка нашої сторінки у Facebook</b>" +
        "Стрічка вантажиться з Facebook, тому зʼявиться лише після натискання. Facebook може зберегти свої файли cookie.</p>" +
        '<button class="btn primary" id="fb-load" type="button">Показати стрічку</button></div>') +
    "</div>" +
    (FB ? '<p class="fb-alt"><a href="' + esc(FB) + '" target="_blank" rel="noopener">Не відображається? Відкрити сторінку у Facebook</a></p>' : "");

  var tabs = document.createElement("div");
  tabs.className = "nt-tabs"; tabs.setAttribute("role", "tablist"); tabs.setAttribute("aria-label", "Новини та життя ліцею");
  tabs.innerHTML =
    '<button type="button" role="tab" id="tab-news" aria-controls="panel-news" aria-selected="true">' + ICON("doc") + "Новини</button>" +
    '<button type="button" role="tab" id="tab-life" aria-controls="panel-life" aria-selected="false" tabindex="-1">' + ICON("image") + "Життя ліцею</button>";

  sec.appendChild(tabs); sec.appendChild(newsPanel); sec.appendChild(lifePanel);
  var btns = $$('[role="tab"]', tabs), panels = [newsPanel, lifePanel];

  function select(i, focus, push) {
    btns.forEach(function (b, k) {
      b.setAttribute("aria-selected", k === i ? "true" : "false");
      b.tabIndex = k === i ? 0 : -1;
      panels[k].hidden = k !== i;
    });
    tabs.style.setProperty("--x", i * 100 + "%");
    if (focus) btns[i].focus();
    if (push && history.replaceState) history.replaceState(null, "", i === 1 ? "#life" : location.pathname + location.search);
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest('[role="tab"]');
    if (b) select(btns.indexOf(b), false, true);
  });
  /* стрілки, Home, End - як у звичайних вкладках */
  tabs.addEventListener("keydown", function (e) {
    var i = btns.indexOf(document.activeElement), n = btns.length, to = -1;
    if (i < 0) return;
    if (e.key === "ArrowRight") to = (i + 1) % n;
    else if (e.key === "ArrowLeft") to = (i - 1 + n) % n;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = n - 1;
    if (to < 0) return;
    e.preventDefault(); select(to, true, true);
  });

  /* #life - друга вкладка; якщо в адресі якась новина - перша (її відкриє section-page.js) */
  function fromHash() {
    var h = location.hash.slice(1);
    if (h === "life") { select(1, false, false); sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
    else if (h && document.getElementById(h) && newsPanel.contains(document.getElementById(h))) select(0, false, false);
  }
  fromHash();
  window.addEventListener("hashchange", fromHash);
  /* посилання з шапки сторінки на окремі новини теж повертають першу вкладку */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var t = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
    if (t && newsPanel.contains(t)) select(0, false, false);
  }, true);

  /* стрічка фейсбука: iframe, без їхнього великого скрипта */
  var load = $("#fb-load");
  if (load) load.addEventListener("click", function () {
    var box = $("#fb-box"), cw = box.clientWidth, w = cw ? Math.max(180, Math.min(500, Math.floor(cw - 18))) : 500;   /* 500 - максимум, який дає фейсбук */
    var src = "https://www.facebook.com/plugins/page.php?href=" + encodeURIComponent(FB) +
      "&tabs=timeline&width=" + w + "&height=900&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&locale=uk_UA";
    box.innerHTML = '<div class="fb-frame"><iframe title="Стрічка ліцею у Facebook" src="' + src + '" width="' + w + '" height="900" ' +
      'style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen ' +
      'allow="clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe></div>';
  });
})();
