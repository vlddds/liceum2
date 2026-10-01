/* «Освітній процес» (education.html). Як заповнювати блоки — див. опис на початку js/blocks.js.
   Документ на Google Drive: drive("ID файлу"); у галереях "" — заготовка під фото. */
window.SECTION = (function () {
  function drive(id) { return "https://drive.google.com/file/d/" + id + "/view"; }
  function gdoc(id) { return "https://docs.google.com/document/d/" + id + "/edit"; }

  return {
    title: "Освітній процес",
    lead: "Режим роботи, навчальні плани й програми, НУШ, дистанційне навчання, олімпіади, НМТ і ДПА.",
    num: "8:30",
    items: [
      { id: "language", title: "Мова освітнього процесу", short: "Мова навчання", icon: "chat",
        blocks: [
          { type: "note", text: "Освітній процес у Підгородненському ліцеї №2 здійснюється українською мовою." }
        ] },

      { id: "schedule", title: "Режим роботи", short: "Режим роботи", icon: "clock", open: true,
        sub: "Розклад дзвінків, уроків, канікули",
        blocks: [
          { type: "stats", items: [
            { value: "5 днів", label: "навчальний тиждень, одна зміна" },
            { value: "8:30", label: "початок занять" },
            { value: "35 хв", label: "урок у 1 класі" },
            { value: "40 хв", label: "урок у 2–11 класах" }
          ] },
          { type: "heading", text: "Розклад уроків та дзвінків" },
          { type: "docs", items: [
            { title: "Розклад дзвінків", url: drive("1penDQMrCRt17GJZfTr_t0yvsWMNNU2WR") },
            { title: "Розклад уроків 1–4 класів", url: drive("120VuvySu7cP8BC-kAZX41rDx_co8jzFq") },
            { title: "Розклад уроків 5–11 класів", url: drive("1ZdoUxiQVfWPx4Z-EJaQ7j01V_9jS1-Yj") },
            { title: "Розклад уроків педагогічного колективу", url: drive("1AqPbFzLcDhTbchec0yGIKbB7YSB5kolA") }
          ] },
          { type: "heading", text: "Структура 2025/2026 навчального року" },
          { type: "facts", items: [
            { label: "І семестр", value: "01 вересня – 26 грудня 2025" },
            { label: "ІІ семестр", value: "12 січня – 29 травня 2026" },
            { label: "Осінні канікули", value: "27 жовтня – 02 листопада 2025" },
            { label: "Зимові канікули", value: "29 грудня 2025 – 11 січня 2026" },
            { label: "Весняні канікули", value: "23 – 29 березня 2026" }
          ] },
          { type: "button", title: "Розклад уроків за класами", url: "schedule.html", text: "Що зараз: урок чи перерва, розклад на день і тиждень" }
        ] },

      { id: "schedule-archive", title: "Режим роботи: попередні роки", short: "Попередні роки", icon: "archive",
        sub: "2020/2021 – 2024/2025 н.р.",
        blocks: [
          { type: "heading", text: "2024/2025 навчальний рік" },
          { type: "facts", items: [
            { label: "І семестр", value: "02 вересня – 27 грудня 2024" },
            { label: "ІІ семестр", value: "13 січня – 30 травня 2025" },
            { label: "Осінні канікули", value: "28 жовтня – 03 листопада 2024" },
            { label: "Зимові канікули", value: "30 грудня 2024 – 12 січня 2025" },
            { label: "Весняні канікули", value: "24 – 30 березня 2025" },
            { label: "Тривалість уроків", value: "1 клас — 35 хв, 2–11 класи — 40 хв" }
          ] },
          { type: "docs", items: [
            { title: "Розклад дзвінків", url: gdoc("1Zk3uEzeNLoWwc3pXU8CBQlrub9hfljRu") },
            { title: "Розклад уроків 1–4 класів", url: drive("1xHQkPjGRWLd4ASlgsr4kmahHAzkdk4vk") },
            { title: "Розклад уроків 5–11 класів", url: drive("1SBosUUiQ-Y6qBT7Mb0zK4wEL-7XobdMX") }
          ] },
          { type: "heading", text: "2023/2024 навчальний рік" },
          { type: "facts", items: [
            { label: "І семестр", value: "01 вересня – 29 грудня 2023" },
            { label: "ІІ семестр", value: "15 січня – 31 травня 2024" },
            { label: "Осінні канікули", value: "28 жовтня – 05 листопада 2023" },
            { label: "Зимові канікули", value: "30 грудня 2023 – 14 січня 2024" },
            { label: "Весняні канікули", value: "25 – 31 березня 2024" },
            { label: "01.06.24 – 28.06.24", value: "ДПА, подолання освітніх втрат, індивідуальні консультації" },
            { label: "Тривалість уроків", value: "1 клас — 35 хв, 2–4 класи — 40 хв, 5–11 класи — 45 хв" }
          ] },
          { type: "docs", items: [
            { title: "Розклад дзвінків", url: gdoc("1Zk3uEzeNLoWwc3pXU8CBQlrub9hfljRu") },
            { title: "Розклад уроків 1–4 класів", url: drive("1Nj5g9ValoqZQ0CK8Ax2lKryWUu4L0DiD") },
            { title: "Розклад уроків 5–11 класів", url: drive("1sggedv5cOrfpPcVKqBbFF-_CC95-yRh1") }
          ] },
          { type: "heading", text: "2022/2023 навчальний рік" },
          { type: "facts", items: [
            { label: "І семестр", value: "01 вересня – 23 грудня 2022" },
            { label: "ІІ семестр", value: "30 січня – 21 червня 2023" },
            { label: "Осінні канікули", value: "24 – 30 жовтня 2022" },
            { label: "Зимові канікули", value: "24 грудня 2022 – 29 січня 2023" },
            { label: "Весняні канікули", value: "27 березня – 02 квітня 2023" },
            { label: "Літні канікули", value: "22 червня – 31 серпня 2023" },
            { label: "Тривалість уроків", value: "1 клас — 35 хв, 2–4 класи — 40 хв, 5–11 класи — 45 хв" }
          ] },
          { type: "heading", text: "2021/2022 навчальний рік" },
          { type: "docs", items: [
            { title: "Режим роботи 2021–2022", url: drive("1dwFwZ7iEMpTgBgpa2pmUZN1EMaLd9bG-") },
            { title: "Режим роботи школи", url: drive("1tq2CnTpvR6TzHX_VLp13MfIgIQfkCw5_") },
            { title: "Розклад дзвінків 1–4 класів", url: drive("1mt0X_cLpVOk1-E-IBJVr9RGOV4nBQJ-H") },
            { title: "Розклад уроків 1–4 класів", url: drive("1kTopAcSCYwqAXdtEZs-JFy2g-hLLh-wO") },
            { title: "Розклад дзвінків 5–11 класів", url: drive("1_9eGP2K92kX4y716dF4g6lcEggvEZrfe") },
            { title: "Розклад уроків 5–11 класів (І семестр)", url: drive("1OUk7lgFXo4C2RcmIdiNyI5-L61c_-mLk") },
            { title: "Режим роботи ГПД", url: drive("1MATZWNZ3SECCv3AdRTs79LGYCZx-S6Ay") }
          ] },
          { type: "heading", text: "2020/2021 навчальний рік" },
          { type: "docs", items: [
            { title: "Розклад дзвінків 1–4 класів", url: drive("1qRQFEGEcYXDgr2ft-Kr2aK3d6RVWVsVT") },
            { title: "Розклад уроків 1–4 класів", url: drive("1r2Y5YM3hrizjSSZzvW3RyJ47awFlDtyv") },
            { title: "Розклад дзвінків 5–11 класів", url: drive("1J-tILr4de0u-ToPt5ZNpmUdD54ayMlib") },
            { title: "Розклад уроків 5–11 класів і педколективу (І семестр)", url: drive("1xZoTzW-ozGZF6iIPKqpUaNYniXU9e7OG") },
            { title: "Розклад уроків 5–11 класів і педколективу (ІІ семестр)", url: drive("1JShkK64OYaflqMHKpqg-ZebyFPFbfbEo") },
            { title: "Режим ГПД", url: drive("1YmuIBsjPxZYsN5ODtwjrt_cCZVX4OYqv") }
          ] }
        ] },

      { id: "plan", title: "Навчальний план та освітні програми", short: "Навчальний план", icon: "book",
        blocks: [
          { type: "docs", items: [
            { group: "2021/2022 н.р.", title: "Навчальний план 2021–2022 н.р.", url: drive("1JliuSGmfbhiN3uH7HTKk3PP2-GJAizIX") },
            { group: "2021/2022 н.р.", title: "Освітня програма ЗЗСО І ступеня", url: drive("1vyLkP5w2LBERmiyXYrh96BsncsAEWFPW") },
            { group: "2021/2022 н.р.", title: "Освітня програма ЗЗСО ІІ ступеня", url: drive("18t3Rc5kQFkNHiJGrR629T6Uttz9SjnAr") },
            { group: "2021/2022 н.р.", title: "Освітня програма ЗЗСО ІІІ ступеня", url: drive("1F4xRKFALWSincWT3f9xyJ6g00RqZiwdf") },
            { group: "2019/2020 н.р.", title: "Навчальний план 2019–2020 н.р.", url: drive("17V-Gfe1ZVNqJzWbc0caUtTS3zxxQN3Br") },
            { group: "2019/2020 н.р.", title: "Освітня програма ЗЗСО І ступеня", url: drive("1yrexRmZ1Nu6G8dLTogMDS0prtP54k3tk") },
            { group: "2019/2020 н.р.", title: "Освітня програма ЗЗСО ІІ ступеня", url: drive("19gTyh7whD7ooA2SZEnG2QqyC89TY2cw8") },
            { group: "2019/2020 н.р.", title: "Освітня програма ЗЗСО ІІІ ступеня", url: drive("1KYB9k52YejK1TbOHc9xdyrbX0eQ_7sX4") }
          ] }
        ] },

      { id: "nush", title: "Нова українська школа", short: "НУШ", icon: "abc",
        blocks: [
          { type: "text", text: "Педагогічний колектив початкової школи успішно та результативно працює за програмою О. Савченко у НУШ з 2018 року." },
          { type: "gallery", items: ["", "", "", "", "", ""] },
          { type: "docs", items: [
            { title: "Звіт про ОДМ 1.2", url: drive("1Mzzam2hJqjylAvPo1LUvoerlgGp2wg9i") },
            { title: "ОДМ 1 (Полив'яна А. А.)", url: drive("1MijyW0kMb_vKkWn1e41aB2IsWS43R9Vt") },
            { title: "Відео ОДМ.mp4", url: drive("15aNeo0hFy2L5vUCSjW2AnM-nGPdD-rLY") }
          ] }
        ] },

      { id: "distance", title: "Дистанційне навчання", short: "Дистанційне навчання", icon: "cpu",
        blocks: [
          { type: "text", text: "Санітарний регламент для закладів загальної середньої освіти, який набув чинності з 1 січня 2021 року, обмежує час безперервної роботи з технічними засобами навчання, зокрема комп'ютерами, планшетами, іншими гаджетами. Водночас тривалість навчальних занять, визначена ст. 10 Закону України «Про повну загальну середню освіту», лишається незмінною." },
          { type: "table", head: ["Клас", "Безперервна робота з ТЗН"], rows: [
            ["1 клас", "не більше 10 хвилин"],
            ["2–4 класи", "не більше 15 хвилин"],
            ["5–7 класи", "не більше 20 хвилин"],
            ["8–9 класи", "20–25 хвилин"],
            ["10–11 (12) класи", "на 1-й годині занять — до 30 хвилин, на 2-й — 20 хвилин"],
            ["10–11 (12) класи, здвоєні заняття", "не більше 25–30 хв на першому та 15–20 хв на другому"]
          ] },
          { type: "note", text: "Тривалість навчальних занять зберігається: 35 хвилин для 1 класу, 40 хвилин для 2–4 класів, 45 хвилин для 5–12 класів. Обмежується лише час безперервної роботи з комп'ютером для уникнення ризиків для здоров'я." },
          { type: "videos", items: [
            { title: "Вебінар «Організація дистанційного навчання за допомогою Google Класу»", yt: "-Qw970G0aYs" },
            { title: "Правила онлайн-уроку", yt: "drGgyQtCU8A" }
          ] },
          { type: "links", items: [
            { title: "E-School LMS", url: "https://lms.e-school.net.ua/", text: "Платформа дистанційного навчання" },
            { title: "Добірка ресурсів за класами, предметами й темами", url: "https://umity.in.ua/resources/", text: "Відео, дидактичні матеріали, тести" },
            { title: "20 освітніх онлайн-платформ для дистанційного навчання", url: "https://educationpakhomova.blogspot.com/2021/10/20.html" }
          ] }
        ] },

      { id: "clubs", title: "Секції та гуртки", short: "Гуртки", icon: "star",
        sub: "Графік роботи гуртків та секцій",
        blocks: [
          { type: "docs", items: [
            { title: "Розклад гуртків", url: drive("1CDl8IVHClzQ8sg4Fuvw1FT7m-fqnj2_T") },
            { title: "Розклад гуртків (попередній)", url: drive("1xiRaZAuiMOqQoNL8Tjz0Fw8oUvG550fU") }
          ] },
          { type: "button", title: "Усі гуртки", url: "index.html#clubs", text: "Опис гуртків, керівники й розклад — на головній сторінці" }
        ] },

      { id: "monitoring", title: "Результати моніторингу якості освіти", short: "Моніторинг", icon: "award",
        blocks: [
          { type: "heading", text: "Перспективний план контролю за станом викладання предметів" },
          { type: "table", head: ["Навчальний рік", "Предмети"], rows: [
            ["2019/2020", "Історія, географія, фізика, захист Вітчизни"],
            ["2020/2021", "Біологія, хімія, зарубіжна література"],
            ["2021/2022", "Математика, музичне мистецтво, ГПД"],
            ["2022/2023", "Українська мова та література, іноземна мова, образотворче мистецтво"],
            ["2023/2024", "Фізична культура, трудове навчання, початкова школа"]
          ] },
          { type: "docs", items: [
            { title: "Наказ за результатами навчання 4 класів за рік", url: drive("1Z8mQh65cw0ZoSXrUnVxS0r9fF0y1BBet") },
            { title: "Наказ щодо техніки читання у 4 класах", url: drive("1Fc_kJMkbwXE9aBFO9cMGsILHJ2ygR-0X") }
          ] },
          { type: "videos", items: [ { title: "Освітній процес у Підгородненській ЗОШ №2", yt: "o-TdEIiYuME" } ] }
        ] },

      { id: "method", title: "Методичний кабінет", short: "Методичний кабінет", icon: "users",
        blocks: [
          { type: "cards", items: [
            { icon: "star", title: "Науково-методична тема 2020–2023 н.р.", text: "«Педагогічні стратегії розвитку самоефективності здобувачів освіти різного шкільного віку»" },
            { icon: "book", title: "Науково-методична тема 2019–2020 н.р.", text: "«Створення гуманістичного освітнього середовища навчального закладу як чинник успішної соціалізації учнів»" }
          ] },
          { type: "heading", text: "Структура методичної роботи" },
          { type: "gallery", items: [""] }
        ] },

      { id: "olympiads", title: "Олімпіади, конкурси", short: "Олімпіади", icon: "award",
        blocks: [
          { type: "docs", items: [
            { title: "Олімпіади 2020–2021", url: drive("1VR0-fW9gny9Q1Z9tg6oywUeckukQDcsZ") },
            { title: "Моніторинг результатів олімпіад", url: drive("1VjI4jyRjXBqWPqVAY0Q5K5RnEe8Rl58H") },
            { title: "Результати участі в предметних олімпіадах", url: drive("1xRPEplFUmIkzGJy6rH0eFMxeIPGprD76") }
          ] }
        ] },

      { id: "achievements", title: "Досягнення учнів", short: "Досягнення", icon: "award",
        sub: "Переможці олімпіад, конкурсів і змагань",
        blocks: [
          { type: "text", text: "Ми пишаємося нашими учнями! Тут зібрані перемоги в олімпіадах, конкурсах і спортивних змаганнях. Щоб додати досягнення, скопіюйте картку в js/sections/education.js (пункт achievements)." },
          { type: "cards", items: [
            { icon: "award", title: "Поздняков Дмитро", text: "Срібний призер Чемпіонату світу з джиу-джитсу" },
            { icon: "star", title: "Прізвище Ім'я", text: "Досягнення (олімпіада, конкурс, змагання) і рік" },
            { icon: "star", title: "Прізвище Ім'я", text: "Досягнення (олімпіада, конкурс, змагання) і рік" }
          ] },
          { type: "gallery", items: ["", "", ""] },
          { type: "heading", text: "Наші випускники" },
          { type: "text", text: "Розкажіть про випускників ліцею, якими пишається школа: де вони навчаються і чого досягли." }
        ] },

      { id: "nmt", title: "НМТ 2025–2026", short: "НМТ", icon: "pen",
        sub: "Реєстрація та підготовка до тестування",
        blocks: [
          { type: "button", title: "Реєстрація на НМТ", url: "https://dneprtest.dp.ua/nmt-zno/ryestracziya-dlya-skladannya-nmt-2024/", text: "Дніпропетровський регіональний центр оцінювання якості освіти" },
          { type: "heading", text: "Основне про НМТ" },
          { type: "gallery", items: [""] },
          { type: "heading", text: "Дистанційна підготовка до НМТ" },
          { type: "links", items: [
            { title: "Підготовка до НМТ", url: "https://testportal.gov.ua/pidgotovka-do-nmt-2026/", text: "Офіційна інформація УЦОЯО" },
            { title: "Програми підготовки до НМТ", url: "https://testportal.gov.ua/programy-nmt/" },
            { title: "Онлайн-тестувальник", url: "http://lv.testportal.gov.ua:8080/" },
            { title: "Тренажери НМТ на платформі iLearn", url: "https://ilearn.org.ua/" },
            { title: "Демонстраційний варіант НМТ-2024", url: "https://testportal.gov.ua/demonstratsijni-varianty-nmt-2024/" },
            { title: "Підготовка до НМТ (Дніпропетровський РЦОЯО)", url: "https://dneprtest.dp.ua/nmt-zno/pidgotovka-do-nmt-2/" },
            { title: "Безкоштовна підготовка вступників до НМТ онлайн", url: "https://osvitoria.media/opinions/nmt-2023-yak-bezkoshtovno-pidgotuvatysya-do-testu/", text: "Освіторія" },
            { title: "Онлайн-підготовка до ЗНО під час карантину", url: "https://www.youtube.com/playlist?list=PLFVSJgZgf7h-wuKXo4MQzr-u99XJciOwH" },
            { title: "Онлайн-уроки від СТС для підготовки до ЗНО", url: "https://www.youtube.com/playlist?list=PLyT_XyxqVtn_xMFGNN61niu9YaFDSvdBP" },
            { title: "#Відкритийурок2020 на телеканалі «Київ»", url: "https://www.youtube.com/results?search_query=%23%D0%92%D1%96%D0%B4%D0%BA%D1%80%D0%B8%D1%82%D0%B8%D0%B9%D1%83%D1%80%D0%BE%D0%BA2020" }
          ] },
          { type: "button", title: "Архів НМТ і ЗНО", url: "archive.html", text: "Матеріали НМТ/ЗНО попередніх років" }
        ] },

      { id: "dpa", title: "Державна підсумкова атестація (ДПА)", short: "ДПА", icon: "check",
        blocks: [
          { type: "links", items: [
            { title: "Порядок проведення ДПА", url: "http://osvita.ua/legislation/Ser_osv/63274/", text: "Наказ МОН № 1369 від 07.12.2018" },
            { title: "Про звільнення від ДПА", url: "https://zakon.rada.gov.ua/laws/show/z0288-13#Text" },
            { title: "Наказ МОН щодо звільнення від ДПА у 2022/2023 н.р.", url: "https://mon.gov.ua/ua/news/nakaz-mon-shodo-zvilnennya-vid-prohodzhennya-dpa-u-20222023-navchalnomu-roci-nadislano-do-minyustu", text: "Міністерство освіти і науки України" }
          ] },
          { type: "button", title: "Архів ДПА", url: "archive.html", text: "Документи ДПА попередніх років" }
        ] }
    ]
  };
})();

/* Реєстр для пошуку по сайту на головній (не змінюйте) */
(window.SECTIONS = window.SECTIONS || {}).education = window.SECTION;
