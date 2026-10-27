/* Фотоальбоми, нові зверху.
   Фото: в gallery замість "" пишемо шлях, напр. "img/albums/first-bell-2025/1.jpg".
   Новий альбом = копія пункту з іншим id, назвою і датою. */
window.SECTION = (function () {
  function slots(n) { var a = []; for (var i = 0; i < n; i++) a.push(""); return a; }
  /* перший альбом збирається сам з фото головної сторінки (photos у js/data.js): додали туди - з'явилось і тут */
  var home = ((window.SITE_DATA || {}).photos || []).filter(function (p) { return p && p.src; });

  return {
    title: "Фотоальбоми",
    lead: "Життя ліцею у фото: свята, змагання, уроки та шкільні події. Натисніть на фото, щоб переглянути його на весь екран.",
    num: "",
    items: [].concat(home.length ? [
      { id: "life", title: "Життя ліцею у фото", short: "Життя ліцею", icon: "image", open: true,
        sub: "ті самі, що на головній",
        blocks: [ { type: "gallery", items: home.map(function (p) { return { src: p.src, caption: p.caption }; }) } ] }
    ] : [], [
      { id: "titans-2026", title: "Жива книга «Книга — це вікно, через яке видно душу»", short: "Жива книга", icon: "book",
        sub: "23 квітня · проєкт #ТИТАНИ_UA",
        blocks: [ { type: "gallery", items: slots(8) }, { type: "button", title: "Про подію", url: "news.html#titans" } ] },
      { id: "first-bell-2025", title: "Свято Першого дзвоника 2025", short: "Перший дзвоник 2025", icon: "star",
        sub: "1 вересня 2025",
        blocks: [ { type: "gallery", items: slots(8) } ] },
      { id: "run-2025", title: "Забіг «Шаную воїнів — біжу за Героїв України»", short: "Забіг за Героїв", icon: "flag",
        sub: "30 серпня 2025",
        blocks: [ { type: "gallery", items: slots(6) }, { type: "button", title: "Про подію", url: "news.html#run-for-heroes" } ] },
      { id: "nush", title: "Нова українська школа: початкові класи", short: "НУШ", icon: "abc",
        blocks: [ { type: "gallery", items: slots(12) } ] },
      { id: "school", title: "Наш ліцей", short: "Наш ліцей", icon: "building",
        sub: "Будівля, класи, бібліотека, спортзал",
        blocks: [ { type: "gallery", items: slots(8) } ] }
    ])
  };
})();

/* для пошуку на головній, не чіпати */
(window.SECTIONS = window.SECTIONS || {}).albums = window.SECTION;
