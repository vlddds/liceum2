/* Шкільна газета: спільне для підшивки, читалки, головної й пошуку.
   window.L2G.load() - випуски з data/gazeta.json (нові зверху), L2G.loadIndex() - текст сторінок для пошуку.
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

  window.L2G = {
    name: real(C.name) ? C.name : "Шкільна газета",
    joinUrl: real(C.joinUrl) ? C.joinUrl : "",
    debug: debug,
    load: function () {
      if (!issuesP) issuesP = getJSON("data/gazeta.json").then(function (d) {
        return (d.issues || []).filter(function (x) { return x && x.id && (debug || !x.draft); })
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
    label: function (issue) { return "№" + issue.number + " · " + issue.title; },
    /* звідки читалка бере PDF: тестовий - з репозиторію, справжній - з Google Диска через API (так дозволено CORS) */
    pdfUrl: function (issue) {
      if (issue.localPdf) return issue.localPdf;
      if (!issue.driveFileId || !real(C.apiKey)) return "";
      return "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(issue.driveFileId) + "?alt=media&key=" + encodeURIComponent(C.apiKey);
    },
    downloadUrl: function (issue) {
      if (issue.localPdf) return issue.localPdf;
      return issue.driveFileId ? "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(issue.driveFileId) : issue.pdf || "";
    },
    viewUrl: function (issue) { return issue.localPdf || issue.pdf || ""; },
    readUrl: function (issue, page) {
      return "post.html?id=" + encodeURIComponent(issue.id) + (debug ? "&debug=1" : "") + (page > 1 ? "#page=" + page : "");
    },
    /* посилання «Поділитися»: сторінка з прев'ю (обкладинка в соцмережах), вона одразу веде в читалку */
    shareUrl: function (issue, page) {
      var base = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
      return issue.draft ? base + window.L2G.readUrl(issue, page) : base + "gazeta/" + encodeURIComponent(issue.id) + "/" + (page > 1 ? "#page=" + page : "");
    }
  };
  function pad(n) { return String(n).padStart(3, "0"); }
})();
