/* «Сервіси та служби» (services.html): харчування, бібліотека, психолог, медсестра, корисні посилання.
   Як заповнювати блоки — див. js/blocks.js. Документ на Google Drive: drive("ID файлу"). */
window.SECTION = (function () {
  var useful = (window.SITE_DATA && window.SITE_DATA.useful) || [];
  function drive(id) { return "https://drive.google.com/file/d/" + id + "/view"; }

  return {
    title: "Сервіси та служби",
    lead: "Харчування, бібліотека й підручники, психологічна служба, медичний кабінет і корисні посилання.",
    num: "",
    items: [
      { id: "food", title: "Організація харчування", short: "Харчування", icon: "utensils", open: true,
        blocks: [
          { type: "text", text: "Харчування учнів організовано відповідно до чинних норм і санітарного регламенту. Нижче — нормативні документи та технологічні карти страв." },
          { type: "docs", items: [
            { title: "Технологічні карти на страви та вироби", url: "https://drive.google.com/file/d/1BeT59Yqs2Wxvz7AgY5iiUSRPxh2f-00d/view" }
          ] },
          { type: "links", items: [
            { title: "Норми та порядок організації харчування", url: "https://zakon.rada.gov.ua/laws/show/305-2021-%D0%BF#Text", text: "Постанова КМУ № 305" },
            { title: "Санітарний регламент для закладів ЗСО", url: "https://zakon.rada.gov.ua/laws/show/z1111-20#Text" },
            { title: "Проєкт «Знаїмо»", url: "https://znaimo.gov.ua/", text: "Усе про здорове харчування" }
          ] }
        ] },

      { id: "menu", title: "Меню їдальні на тиждень", short: "Меню", icon: "utensils", href: "menu.html",
        sub: "Страви на кожен день і вихід порцій (меню — у файлі js/menu.js)" },

      { id: "library", title: "Бібліотека", short: "Бібліотека", icon: "book",
        blocks: [
          { type: "people", items: [
            { name: "Рогова Людмила Іванівна", role: "Завідувачка бібліотеки" },
            { name: "Войтенко Альона Петрівна", role: "Бібліотекар" }
          ] },
          { type: "button", title: "Замовлення підручників", url: "#textbooks", text: "Результати вибору підручників за роками" }
        ] },

      { id: "mediateka", title: "Медіатека", short: "Медіатека", icon: "image",
        sub: "Плани та заходи бібліотеки",
        blocks: [
          { type: "docs", items: [
            { title: "Місячник шкільної бібліотеки 2025–2026", url: drive("1lmimPLUi_ow9rN7JGLihVTTlTQdkYH6X") },
            { title: "Місячник шкільної бібліотеки 2024–2025", url: drive("1ZzGsLZluEjXHRlrHujnREvywxs-92sJM") },
            { title: "Місячник шкільної бібліотеки 2023–2024", url: drive("1_vo7r9ipRVmL4PmkTzJdgAk-bbrOp_or") },
            { title: "План реалізації Стратегії розвитку читання", url: drive("1eyOxOhl75qroEe2jrrIKVmwGJu086WvS") },
            { title: "План Всеукраїнського тижня дитячої та юнацької книги", url: drive("1dggA2diVuG612Ul0xAh2ORJjsKFn1pdO") },
            { title: "План", url: drive("1dcnYUuILoNbOInywD2o-zlDUoEKK-x2B") },
            { title: "Тиждень книги 2023: план", url: drive("13gmOrxejaGjBgPbbMeKaFOtv25daxP26") },
            { title: "Тиждень книги 2021", url: drive("1gmzqjpD5m5hnWYakvWl-pO0dNZwVkcxi") }
          ] }
        ] },

      { id: "textbooks", title: "Замовлення підручників", short: "Підручники", icon: "book",
        blocks: [
          { type: "docs", items: [
            { group: "2026", title: "Протокол педради про конкурсний відбір підручників", url: "https://drive.google.com/file/d/1guyVrfUdIydYlB73wltBtjFGC64h-0kZ/view?usp=sharing" },
            { group: "2026", title: "Результати вибору підручників для 4 класу", url: "https://drive.google.com/file/d/1wzPXcAl3yqRxGJfUdEaNnVY6IxTXIWEF/view?usp=sharing" },
            { group: "2026", title: "Результати вибору підручників для 6 класу", url: "https://drive.google.com/file/d/1FQqLq5objPOs2bsvVrfLlrltc-dMlobk/view?usp=sharing" },
            { group: "2026", title: "Результати вибору підручників для 7 класу", url: "https://drive.google.com/file/d/157C6awCsbYHq5uihiE7r3ZxbXqPBx02W/view?usp=sharing" },
            { group: "2026", title: "Результати вибору підручників для 9 класу", url: "https://drive.google.com/file/d/1qDg_49xpjlDy4XoA3zZbeZdbXrI_qOxH/view" },
            { group: "2025", title: "Протокол педради про вибір підручників для 1–2 класів", url: "https://drive.google.com/file/d/1jvclfxi25hsxFnOPK9KgsquOZHCnJnHO/view" },
            { group: "2025", title: "Результати вибору підручників для 1 класу", url: "https://drive.google.com/file/d/1hZ-3xyA-AtTR8cfe_38ehePkKB2awABo/view" },
            { group: "2025", title: "Результати вибору підручників для 2 класу", url: "https://drive.google.com/file/d/1jalXav1JOtrliw98asWJcS0sXQ5k-hfv/view" },
            { group: "2025", title: "Результати вибору підручників для 3 класу", url: "https://drive.google.com/file/d/1c5YNLh2u3_SfFR9jS4KMfBpyDUrbTyTM/view?usp=sharing" },
            { group: "2025", title: "Результати вибору підручників для 8 класу", url: "https://drive.google.com/file/d/1rZq0ZPYM0dBNfyRsHd-ZLCoe7XVl3_HE/view?usp=sharing" },
            { group: "2024", title: "Протокол педради про вибір підручників для 2 класів", url: "https://drive.google.com/file/d/1gM4-sPHYKh-G9ckazhJtYKQRpckAApLR/view?usp=sharing" },
            { group: "2024", title: "Вибір підручників для 2 класу", url: "https://drive.google.com/file/d/1xSKTtPFkMjldY_cE7PAz5h77dOvwIs-k/view?usp=sharing" },
            { group: "2024", title: "Протокол педради про вибір підручників для 7 класів", url: "https://drive.google.com/file/d/16sjs9hNY_k9llH0spKOOjC6Ru8ZbMZm3/view?usp=sharing" },
            { group: "2024", title: "Вибір підручників для 7 класу", url: "https://drive.google.com/file/d/1sSsqy6Bi7DSJ9ijy_Va6gQmh3AYg204G/view?usp=sharing" },
            { group: "2024", title: "Вибір підручників для 11 класу (1)", url: "https://drive.google.com/file/d/1xUB3z0THa1lg9A6KY79ndjO-NnxNf4Rf/view" },
            { group: "2024", title: "Вибір підручників для 11 класу (2)", url: "https://drive.google.com/file/d/1RjcvznZbUD_QQCWnxNtJ5ZVGmU3sawHb/view" },
            { group: "2023", title: "Протокол педради про вибір підручників для 1 класів", url: "https://drive.google.com/file/d/1tDJrVKvftfz412RU8YWhyY3bwk0Gw_Lq/view?usp=sharing" },
            { group: "2023", title: "Протокол щодо вибору підручників і посібників для 1 класу", url: "https://drive.google.com/file/d/1bV3wX4eLvWnLYqJyrp8RHaWoPVkOJh58/view" },
            { group: "2023", title: "Вибір підручників для 1 класу", url: "https://drive.google.com/file/d/196zHkqsx1u97EFLt3iUhruhKtua-KDRb/view?usp=sharing" },
            { group: "2023", title: "Протокол про вибір підручників для 6 класу", url: "https://drive.google.com/file/d/1l5nEi4VTfZ8LqQeY7LK2BoVIYPVOzfUI/view?usp=sharing" },
            { group: "2023", title: "Протокол про вибір підручників для 10 класу", url: "https://drive.google.com/file/d/1llN7M3llzBP2Ig7H58Pb3hAHjDqGVvtV/view?usp=sharing" },
            { group: "2020–2022", title: "Вибір підручників для 5 класу (2022)", url: "https://drive.google.com/file/d/19ZJkXUs49c0bP38nY4sDBx91qr9vJMh1/view" },
            { group: "2020–2022", title: "Вибір підручників для 9 класу (2022)", url: "https://drive.google.com/file/d/11S4tqy56htqpy_qtjLDhKkv_gCsBqamE/view" },
            { group: "2020–2022", title: "Вибір підручників для 4 класу (2021)", url: "https://drive.google.com/file/d/112LAP_mlT3-OX5xu9XP6aV_Z4q-3yOVK/view" },
            { group: "2020–2022", title: "Вибір підручників для 8 класу (2021)", url: "https://drive.google.com/file/d/1F_rTDJ3jfrwrLK-dZ3TeA1Mh7Ok_jw6n/view" },
            { group: "2020–2022", title: "Відбір підручників для 3 класу (2020)", url: "https://drive.google.com/file/d/1p6iQ2gtFMezGqOLCsA9x6AaF0q12Y8zh/view" },
            { group: "2020–2022", title: "Відбір підручників для 7 класу (2020)", url: "https://drive.google.com/file/d/1A-4CteiCHSWDW3SUjbPPJMb3lxji_Tgm/view" },
            { group: "Загальне", title: "Інформація про забезпечення підручниками учнів та вчителів", url: "https://drive.google.com/file/d/1fvqwDqhXrYQMTpBs2OoDCdqiV02KrFZV/view" }
          ] }
        ] },

      { id: "psychology", title: "Психологічна служба", short: "Психолог", icon: "heart",
        sub: "Підтримка для учнів і батьків",
        blocks: [
          { type: "text", text: "Шкільний психолог допомагає учням, батькам і вчителям: консультує, підтримує в складних ситуаціях, допомагає з адаптацією та стосунками в колективі. Звернутися можна особисто або через класного керівника." },
          { type: "people", items: [
            { name: "Прізвище Ім'я По батькові", role: "Практичний психолог", hours: "" }
          ] },
          { type: "heading", text: "Гарячі лінії психологічної допомоги" },
          { type: "gallery", items: [""] },
          { type: "heading", text: "Корисні ресурси для батьків" },
          { type: "links", items: [
            { title: "Ресурси з позитивного батьківства", url: "https://parents.nostress.org.ua/resourses" },
            { title: "Матеріали для довірливих стосунків у родині", url: "https://spilnoteka.org/catalog/batkam-ta-opikunam/", text: "Спільнотека" },
            { title: "Онлайн-курси для батьків", url: "https://parents.nostress.org.ua/online-courses" }
          ] },
          { type: "button", title: "Лінії довіри", url: "upbringing.html#hotlines", text: "Безкоштовні гарячі лінії для дітей і батьків" }
        ] },

      { id: "nurse", title: "Медичний кабінет", short: "Медсестра", icon: "heart",
        blocks: [
          { type: "people", items: [
            { name: "Стародубцева Людмила Григорівна", role: "Медична сестра", hours: "" }
          ] },
          { type: "links", items: [
            { title: "5 речей про коронавірус, які потрібно знати батькам", url: "https://mon.gov.ua/ua/news/5-rechej-pro-koronavirus-yaki-potribno-znati-batkam-mon-ta-moz-dayut-rozyasnennya", text: "Роз'яснення МОН та МОЗ" },
            { title: "6 способів підтримки дітей під час спалаху COVID-19", url: "https://www.unicef.org/ukraine/%D1%96%D1%81%D1%82%D0%BE%D1%80%D1%96%D1%97/6-%D1%81%D0%BF%D0%BE%D1%81%D0%BE%D0%B1%D1%96%D0%B2-%D0%BF%D1%96%D0%B4%D1%82%D1%80%D0%B8%D0%BC%D0%BA%D0%B8-%D0%B4%D1%96%D1%82%D0%B5%D0%B9-%D0%BF%D1%96%D0%B4-%D1%87%D0%B0%D1%81-%D1%81%D0%BF%D0%B0%D0%BB%D0%B0%D1%85%D1%83-%D0%BA%D0%BE%D1%80%D0%BE%D0%BD%D0%B0%D0%B2%D1%96%D1%80%D1%83%D1%81%D1%83-covid-19", text: "UNICEF" }
          ] },
          { type: "gallery", items: [""] },
          { type: "videos", items: [
            { title: "Як захиститися від коронавірусу", yt: "EmMD0qkUFPs" },
            { title: "Про коронавірус", yt: "2NOzH9dopyI" }
          ] }
        ] },

      { id: "links", title: "Корисні посилання", short: "Корисні посилання", icon: "route",
        blocks: [
          { type: "links", items: useful.map(function (u) { return { title: u[0], url: u[1] }; }) },
          { type: "heading", text: "Цифрова грамотність" },
          { type: "gallery", items: ["", "", ""] },
          { type: "docs", items: [ { title: "Місяць цифрової грамотності 2025", url: drive("1hBo31DVivYsquJ01Vanv--kjmnufbwip") } ] }
        ] },

      { id: "contacts", title: "Наші координати", short: "Контакти", icon: "pin", href: "index.html#contacts",
        sub: "Адреса, пошта, карта й форма зворотного зв'язку" }
    ]
  };
})();

/* Реєстр для пошуку по сайту на головній (не змінюйте) */
(window.SECTIONS = window.SECTIONS || {}).services = window.SECTION;
