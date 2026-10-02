/* ==========================================================================
   Календар подій: дані для calendar.html

   Подія: { date: "РРРР-ММ-ДД", end: "РРРР-ММ-ДД" (для кількох днів, необов'язково),
            title: "назва", type: "school" | "vacation" | "holiday" | "exam" | "memorial",
            url: "посилання (необов'язково)" }
   Порядок подій не важливий: календар сам їх відсортує.
   ========================================================================== */
window.CALENDAR = (function () {
  "use strict";

  var types = {
    school:   { label: "Події ліцею",        color: "var(--fill)" },
    vacation: { label: "Канікули",           color: "#2FA36B" },
    holiday:  { label: "Свята",              color: "var(--sun)" },
    memorial: { label: "Дні пам'яті",        color: "#8A94A8" },
    exam:     { label: "Атестація, НМТ, ДПА", color: "#D9534F" }
  };

  var events = [
    /* 2026/2027 навчальний рік. Дати семестрів і канікул додайте, коли їх затвердять. */
    { date: "2026-09-01", title: "Початок 2026/2027 навчального року", type: "school" },
    { date: "2026-10-01", title: "День захисників і захисниць України", type: "holiday" },
    { date: "2026-10-02", title: "Святкування Дня вчителя в ліцеї", type: "school" },
    { date: "2026-10-04", title: "День працівників освіти", type: "holiday" },
    { date: "2026-11-09", title: "День української писемності та мови", type: "holiday" },
    { date: "2026-11-21", title: "День Гідності та Свободи", type: "memorial" },
    { date: "2026-11-28", title: "День пам'яті жертв голодоморів", type: "memorial" },
    { date: "2026-12-06", title: "День Збройних Сил України", type: "holiday" },
    { date: "2026-12-25", title: "Різдво Христове", type: "holiday" },
    { date: "2027-01-01", title: "Новий рік", type: "holiday" },
    { date: "2027-01-22", title: "День Соборності України", type: "holiday" },
    { date: "2027-02-20", title: "День Героїв Небесної Сотні", type: "memorial" },
    { date: "2027-03-09", title: "День народження Тараса Шевченка", type: "holiday" },
    { date: "2027-05-20", title: "День вишиванки", type: "holiday" },
    { date: "2027-06-28", title: "День Конституції України", type: "holiday" },
    { date: "2027-08-24", title: "День Незалежності України", type: "holiday" },

    /* 2025/2026 навчальний рік (з розділу «Режим роботи») */
    { date: "2025-09-01", title: "Свято Першого дзвоника, початок І семестру", type: "school", url: "news.html#first-bell" },
    { date: "2025-10-01", title: "День захисників і захисниць України", type: "holiday" },
    { date: "2025-10-05", title: "День працівників освіти", type: "school" },
    { date: "2025-10-27", end: "2025-11-02", title: "Осінні канікули", type: "vacation" },
    { date: "2025-11-09", title: "День української писемності та мови", type: "holiday" },
    { date: "2025-11-21", title: "День Гідності та Свободи", type: "memorial" },
    { date: "2025-11-22", title: "День пам'яті жертв голодоморів", type: "memorial" },
    { date: "2025-12-06", title: "День Збройних Сил України", type: "holiday" },
    { date: "2025-12-25", title: "Різдво Христове", type: "holiday" },
    { date: "2025-12-26", title: "Завершення І семестру", type: "school" },
    { date: "2025-12-29", end: "2026-01-11", title: "Зимові канікули", type: "vacation" },
    { date: "2026-01-12", title: "Початок ІІ семестру", type: "school" },
    { date: "2026-01-22", title: "День Соборності України", type: "holiday" },
    { date: "2026-02-20", title: "День Героїв Небесної Сотні", type: "memorial" },
    { date: "2026-03-09", title: "День народження Тараса Шевченка", type: "holiday" },
    { date: "2026-03-23", end: "2026-03-29", title: "Весняні канікули", type: "vacation" },
    { date: "2026-04-27", end: "2026-05-18", title: "Прийом документів на конкурс на посаду директора", type: "school", url: "news.html#director-contest" },
    { date: "2026-05-21", title: "День вишиванки", type: "holiday" },
    { date: "2026-05-29", title: "Завершення ІІ семестру", type: "school" },
    { date: "2026-06-25", title: "Конкурс на посаду директора ліцею", type: "school", url: "news.html#director-contest" },
    { date: "2026-06-28", title: "День Конституції України", type: "holiday" },
    { date: "2026-08-24", title: "День Незалежності України", type: "holiday" }
  ];

  return { types: types, events: events };
})();
