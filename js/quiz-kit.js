/* спільне для тестів (профтест Голланда і тест на вибір профілю):
   збереження в localStorage, перемішування з фіксованим seed, шкала 1-5, дата, анонімна статистика */
(function () {
  "use strict";
  var esc = window.L2 ? window.L2.esc : function (s) { return String(s); };

  function rng(seed) {   /* mulberry32 */
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    var a = arr.slice();
    rand = rand || Math.random;
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* зберігаємо тільки в цьому браузері; в приватному режимі може не вийти - тоді просто без збереження */
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; }
  }

  var SCALE = ["Зовсім не про мене", "Скоріше ні", "Частково", "Скоріше так", "Точно про мене"];
  /* одне твердження зі шкалою (radio-група з підписами для зчитувачів екрана)
     o: { id, text, value, num, labels (5 підписів), ends (підписи по краях), na (текст кнопки "не враховувати") } */
  function scale(o) {
    var labels = o.labels || SCALE, ends = o.ends || [labels[0], labels[4]];
    return '<fieldset class="pf-q" data-id="' + esc(o.id) + '"><legend>' + (o.num ? '<span class="pf-num">' + o.num + "</span>" : "") + esc(o.text) + "</legend>" +
      '<div class="pf-scale">' + labels.map(function (label, i) {
        var val = i + 1;
        return '<label class="pf-opt"><input type="radio" name="q-' + esc(o.id) + '" value="' + val + '"' + (o.value === val ? " checked" : "") + ">" +
          '<span class="pf-dot" aria-hidden="true">' + val + '</span><span class="sr">' + esc(label) + "</span></label>";
      }).join("") + '</div><div class="pf-ends" aria-hidden="true"><span>' + esc(ends[0]) + "</span><span>" + esc(ends[1]) + "</span></div>" +
      (o.na ? '<label class="pf-na"><input type="radio" name="q-' + esc(o.id) + '" value="0"' + (o.value === 0 ? " checked" : "") + "><span>" + esc(o.na) + "</span></label>" : "") +
      "</fieldset>";
  }

  /* анонімна статистика для ліцею: результат (клас і бали, без імені) іде в гугл-таблицю сайту.
     Тихо: якщо не вийшло - учень нічого не помітить. З localhost і з ?debug=1 не шлемо, щоб не смітити в таблиці */
  function send(data) {
    var C = (window.SITE_DATA || {}).config || {}, url = C.formEndpoint || "";
    if (!url || !window.L2 || !window.fetch || /[?&]debug=1/.test(location.search) || /^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
    data.type = "test";
    data.id = Math.random().toString(36).slice(2, 10);
    window.L2.postForm(url, data).catch(function () {});
  }
  var PRIVACY = "<b>Результати анонімні</b>: у статистику ліцею потрапляють лише клас і бали, без імені";

  window.QUIZ = { rng: rng, shuffle: shuffle, load: load, save: save, drop: drop, fmtDate: fmtDate, SCALE: SCALE, scale: scale, send: send, PRIVACY: PRIVACY };
})();
