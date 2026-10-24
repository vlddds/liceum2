/* Шкільна газета: спільне для підшивки, читалки, головної й пошуку.
   window.L2G.load() - випуски з data/gazeta.json (нові зверху), L2G.loadIndex() - текст сторінок для пошуку.
   Сторінки - картинки gazeta/<id>/p-N.jpg (мініатюри t-N.jpg), їх готує робот; сам PDF лежить на Google Диску.
   Тестові випуски (draft: true) видно лише з ?debug=1 в адресі. */
(function () {
  "use strict";

  var C = window.GAZETA_CONFIG || {};
  var MONTHS = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];
  var debug = /[?&]debug=1\b/.test(location.search);
  var real = function (s) { return s && String(s).charAt(0) !== "["; };
  var issuesP = null, indexP = null;

  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function pad(n) { return String(n).padStart(3, "0"); }

  window.L2G = {
    name: real(C.name) ? C.name : "Шкільна газета",
    joinUrl: real(C.joinUrl) ? C.joinUrl : "",
    debug: debug,
    load: function () {
      if (!issuesP) issuesP = getJSON("data/gazeta.json").then(function (d) {
        return (d.issues || []).filter(function (x) { return x && x.id && x.pages && (debug || !x.draft); })
          .sort(function (a, b) { return (b.date + pad(b.number)).localeCompare(a.date + pad(a.number)); });
      }).catch(function () { return []; });
      return issuesP;
    },
    loadIndex: function () {
      if (!indexP) indexP = Promise.all([getJSON("data/gazeta-index.json").catch(function () { return { pages: [] }; }), window.L2G.load()])
        .then(function (r) {
          var ok = {};
          r[1].forEach(function (x) { ok[x.id] = x; });
          return (r[0].pages || []).filter(function (p) { return ok[p.id]; }).map(function (p) { p.issue = ok[p.id]; return p; });
        });
      return indexP;
    },
    month: function (issue) {
      var m = +String(issue.date).slice(5, 7), y = String(issue.date).slice(0, 4);
      return (MONTHS[m - 1] || "") + " " + y;
    },
    page: function (issue, n) { return issue.base + "p-" + n + ".jpg"; },
    thumb: function (issue, n) { return issue.base + "t-" + n + ".jpg"; },
    downloadUrl: function (issue) { return issue.download || issue.pdf || ""; },
    viewUrl: function (issue) { return issue.pdf || issue.download || ""; },
    readUrl: function (issue, page) {
      return "post.html?id=" + encodeURIComponent(issue.id) + (debug ? "&debug=1" : "") + (page > 1 ? "#page=" + page : "");
    },
    /* посилання «Поділитися»: сторінка з прев'ю (обкладинка в соцмережах), вона одразу веде в читалку */
    shareUrl: function (issue, page) {
      var base = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
      return issue.draft ? base + window.L2G.readUrl(issue, page) : base + "gazeta/" + encodeURIComponent(issue.id) + "/" + (page > 1 ? "#page=" + page : "");
    }
  };
})();
