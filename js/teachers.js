/* ==========================================================================
   Педагогічний колектив: дані для teachers.html


   {
     name: "Шевченко Олена Петрівна",
     role: "Вчитель початкових класів",
     photo: "img/teachers/shevchenko.jpg",   // шлях до фото (краще вертикальне, ~600×750)
     post: "Голова МО",                      // посада / додаткові обов'язки (показується на картці)
     category: "Вища категорія",             // кваліфікаційна категорія
     title: "Старший вчитель",               // педагогічне звання
     experience: "18 років",                 // педагогічний стаж
     education: "ДНУ ім. О. Гончара, 2006",  // освіта
     about: "Кредо/лозунг",   // новий абзац: \n
     projects: ["Проєкт 1", "Проєкт 2"]      // проєкти, виконані в ліцеї (список у вікні педагога)
   }

   retired: true у групи — вона не рахується в загальній кількості педагогів.
   ========================================================================== */

window.TEACHERS = (function () {
  "use strict";

  var groups = [
    { id: "pochatkova", title: "Початкова школа", icon: "abc",
      desc: "Вчителі 1–4 класів, які закладають основу навчання за програмою НУШ.",
      people: [
        { name: "Москалюк Катерина Олександрівна", role: "Вчитель початкових класів", photo: "img/teachers/MoskalukKateryna.JPG" },
        { name: "Лапа Лариса Леонідівна", role: "Вчитель початкових класів", photo: "img/teachers/LapaLarysa.JPG" },
        { name: "Воробєй Тетяна Євгеніївна", role: "Вчитель початкових класів", photo: "img/teachers/VorobeyTatyan.JPG" },
        { name: "Булах Валентина Миколаївна", role: "Вчитель початкових класів", photo: "img/teachers/BulahValentyna.JPG" },
        { name: "Рикованова Анна Володимирівна", role: "Вчитель початкових класів", photo: "img/teachers/RykovanovaAnna.JPG" },
        { name: "Булах Ірина Павлівна", role: "Вчитель початкових класів", photo: "img/teachers/BulahIryna.JPG" },
        { name: "Олійник Інна Львівна", role: "Вчитель початкових класів", photo: "img/teachers/OliynykInna.JPG" },
        { name: "Боднянська Марина Ігорівна", role: "Вчитель початкових класів", photo: "img/teachers/BiodnyanskaMaryna.JPG" },
        { name: "Старишко Ольга Іванівна", role: "Вчитель початкових класів", photo: "img/teachers/StaryshkoOlha.JPG" },
        /*{ name: "Піщета Наталія Владиславівна", role: "Вчитель початкових класів", post: "Голова МО", photo: "" },*/
        { name: "Кудінова Олена Миколаївна", role: "Вчитель початкових класів", photo: "img/teachers/KudinovaOlena.JPG" },
        { name: "Поливяна Алла Анатоліївна", role: "Вчитель початкових класів", photo: "img/teachers/PolyvyanaAlla.JPG" },
        /*{ name: "Ступак Наталія Пилипівна", role: "Вчитель початкових класів", photo: "" },*/
        { name: "Вітер Тамара Євгеніївна", role: "Вчитель початкових класів", post: "Декретна відпустка", photo: "img/teachers/ViterTamara.JPG" }
      ] },

    { id: "ukrainska", title: "Українська мова та література", icon: "pen",
      desc: "Методичне об'єднання вчителів української мови та літератури.",
      people: [
        { name: "Дуб Любов Анатоліївна", role: "Вчитель української мови та літератури", post: "Голова МО", photo: "img/teachers/DubLyubov.JPG" },
        { name: "Терехова Наталія Миколаївна", role: "Вчитель української мови та літератури", post: "Заступник директора з НВР", photo: "img/teachers/TerehovaNatalya.JPG" },
        { name: "Хоменко Людмила Степанівна", role: "Вчитель української мови", post: "Заступник директора з НВР", photo: "img/teachers/KhomenkoLudmila.JPG" },
        { name: "Погребна Юлія Сергіївна", role: "Вчитель української мови та літератури", post: "Педагог-організатор", photo: "img/teachers/YakovetsYuliya.JPG" },
        /*{ name: "Ткаченко Тамара Григорівна", role: "Вчитель української мови та літератури", post: "Сумісник", photo: "" },*/
        { name: "Шаповал Наталія Володимирівна", role: "Вчитель української мови та літератури", photo: "img/teachers/ShapovalNatalya.JPG" },
        { name: "Грецький Ярослав Сергійович", role: "Вчитель української мови та літератури", photo: "img/teachers/YaroslavGretskiy.JPG" }
      ] },

    { id: "zarubizhna", title: "Зарубіжна література", icon: "book",
      desc: "Вчителі зарубіжної літератури.",
      people: [
        { name: "Піскун Наталія Миколаївна", role: "Вчитель зарубіжної літератури", photo: "" },
        { name: "Шарова Катерина Миколаївна", role: "Вчитель зарубіжної літератури", photo: "img/teachers/SharovaKateryna.JPG" }
      ] },

    { id: "angliyska", title: "Англійська мова", icon: "chat",
      desc: "Вчителі англійської мови.",
      people: [
        { name: "Гошкодеря Олена Вікторівна", role: "Вчитель англійської мови", post: "Директор", photo: "img/teachers/GoshkoderyaOlena.JPG" },
        { name: "Овсеєва Вікторія Олександрівна", role: "Вчитель англійської мови", photo: "img/teachers/OvseevaViktoviya.JPG" },
        { name: "Коваль Яна Анатоліївна", role: "Вчитель англійської мови", photo: "img/teachers/KovalYanna.JPG" },
        { name: "Співак Тетяна Яківна", role: "Вчитель англійської мови", photo: "" },
        { name: "Пихаленко Юлія Анатоліївна", role: "Вчитель англійської мови", photo: "img/teachers/PykhalenkoYuliya.JPG" }
      ] },

    { id: "pryrodnychi", title: "Природничо-географічні науки", icon: "leaf",
      desc: "Біологія, хімія, географія, основи здоров'я та природничі дисципліни.",
      people: [
        { name: "Бондар Віктор Григорович", role: "Вчитель географії", photo: "img/teachers/BondarViktor.JPG" },
        { name: "Кретова Анна Миколаївна", role: "Вчитель географії, основ здоров'я, природознавства", photo: "img/teachers/KretovaAnna.JPG" },
        { name: "Лебідь Олег Сергійович", role: "Вчитель хімії", photo: "img/teachers/LebidOleg.JPG" },
        { name: "Михайленко Ніна Адамівна", role: "Вчитель біології, екології", photo: "img/teachers/MykhaylenkoNina.JPG" },
        { name: "Малиновська Юлія Миколаївна", role: "Вчитель біології, ЗБД", photo: "img/teachers/MalynovskaYuliya.JPG" },
        { name: "Михайленко Яна Валеріївна", role: "Вчитель фінансової грамотності, ЗБД", photo: "img/teachers/MykhaylenkoYana.JPG" }
      ] },

    { id: "fizmat", title: "Фізико-математичний цикл", icon: "calc",
      desc: "Математика, фізика та інформатика.",
      people: [
        { name: "Каліберда Світлана Анатоліївна", role: "Вчитель фізики", photo: "img/teachers/KaliberdaSvitlana.JPG" },
        { name: "Полях Валентина Іванівна", role: "Вчитель фізики", photo: "img/teachers/PolyahValentina.JPG" },
        { name: "Книш Лідія Іванівна", role: "Вчитель математики", photo: "img/teachers/KnyshLidya.JPG" },
        { name: "Потебенько Оксана Володимирівна", role: "Вчитель математики", post: "Голова МО", photo: "img/teachers/PotebenkoOksana.JPG" },
        { name: "Островська Ніна Володимирівна", role: "Вчитель математики", photo: "img/teachers/OstrovskaNina.JPG" },
        { name: "Плис Світлана Андріївна", role: "Вчитель математики", photo: "" },
        { name: "Баранович Олеся Володимирівна", role: "Вчитель математики", photo: "img/teachers/BaranovichOlesya.JPG" },
       /* { name: "Запорожець Ольга Миколаївна", role: "Вчитель інформатики", post: "Сумісник", photo: "" },*/
        { name: "Суравцова Олена Анатоліївна", role: "Вчитель інформатики", photo: "img/teachers/SuravtsovaOlena.JPG" },
        { name: "Сидоров Владислав Іванович", role: "Вчитель інформатики", photo: "img/teachers/SydorovVladyslav.JPG" }
      ] },

    { id: "humanitarni", title: "Суспільно-гуманітарний та художньо-естетичний цикли", icon: "palette",
      desc: "Історія, громадянська освіта, мистецтво, музика, трудове навчання.",
      people: [
        { name: "Хочу-Джу Тетяна Миколаївна", role: "Вчитель образотворчого мистецтва", photo: "img/teachers/TatyanaMykolaivna.JPG" },
        { name: "Царенко Олександр Олександрович", role: "Вчитель історії", photo: "img/teachers/TsarenkOleksandr.JPG" },
        { name: "Шпанько Людмила Володимирівна", role: "Вчитель історії, громадянської освіти", photo: "img/teachers/ShpankoLudmila.JPG" },
        /*{ name: "Коваль Людмила Андріївна", role: "Вчитель музичного мистецтва", photo: "" },*/
        { name: "Бессалова Інна Миколаївна", role: "Вчитель трудового навчання", photo: "img/teachers/BessalovaInna.JPG" }
      ] },

    { id: "fizkultura", title: "Фізична культура та курс «Захист Вітчизни»", icon: "shield",
      desc: "Вчителі фізичної культури та предмета «Захист України».",
      people: [
        { name: "Щитовський Анатолій Іванович", role: "Вчитель фізичної культури", photo: "img/teachers/SchitovskyiAnatoliy.JPG" },
        { name: "Білоус Юлія Валеріївна", role: "Вчитель фізичної культури", photo: "img/teachers/BilousYuliya.JPG" },
        { name: "Ігнатенко Давид Сергійович", role: "Вчитель фізичної культури", photo: "img/teachers/IgnatenkoDavid.JPG" },
        { name: "Басан Сергій Вячеславович", role: "Вчитель курсу «Захист України»", photo: "" }
      ] },

    { id: "asystenty", title: "Асистенти вчителів", icon: "heart",
      desc: "Асистенти, які супроводжують дітей з особливими освітніми потребами в інклюзивних класах.",
      people: [
        /*{ name: "Демчук Ольга Олегівна", role: "Асистент учителя початкових класів", photo: "" },*/
        { name: "Лісна Марина Сергіївна", role: "Асистент учителя", photo: "img/teachers/LysnaMaryna.JPG" },
        { name: "Доманська Ірина Анатоліївна", role: "Асистент учителя", photo: "img/teachers/DomanskaIryna.JPG" },
        { name: "Носов Євген Вячеславович", role: "Асистент учителя початкових класів", photo: "img/teachers/NosovEvgen.JPG" },
        { name: "Воробєй Марія Андріївна", role: "Асистент учителя початкових класів", photo: "img/teachers/VorobeyMaryna.JPG" }
      ] },

    { id: "organizator", title: "Викладач-організатор", icon: "users",
      desc: "Організовує позакласне життя ліцею: свята, конкурси, проєкти й учнівське самоврядування.",
      people: [
        { name: "Харьков Вадим Сергійович", role: "Викладач-організатор", photo: "img/teachers/KharkovVadim.JPG",
          projects: [
            "День вчителя — Постановка та курування виступу для вчителів",
            "L2 comunity — Самоврядування студентів через чат бот",
            "Олімпійський тиждень — Організація цікавих конкурсів для дітей",
          ] }
      ] },

    { id: "vidpochynok", title: "Вчителі на заслуженому відпочинку", icon: "award", retired: true,
      desc: "Педагоги, які віддали ліцею багато років праці. Дякуємо вам!",
      people: [
        { name: "Бабенко Аліна Миколаївна", role: "Вчитель початкових класів", photo: "" },
        { name: "Біла Тамара Миколаївна", role: "Вчитель технологій", photo: "" },
        { name: "Войтенко Ганна Іванівна", role: "Вчитель української мови та літератури", photo: "" },
        { name: "Лебідь Валентина Олексіївна", role: "Вчитель історії, правознавства, громадянської освіти", photo: "" },
        { name: "Карпенко Ніна Петрівна", role: "Вчитель фізичної культури", photo: "" },
        { name: "Філатов Володимир Миколайович", role: "Вчитель фізичної культури, курсу «Захист України»", photo: "" },
        { name: "Дебельоргова Людмила Валеріївна", role: "Вчитель історії", photo: "" },
        { name: "Синельникова Любов Никифорівна", role: "Вчитель математики", photo: "" },
        { name: "Кузьменко Тетяна Костянтинівна", role: "Вчитель математики", photo: "" },
        { name: "Коваль Валентина Володимирівна", role: "Вчитель біології", photo: "" },
        { name: "Ганжа Тетяна Андріївна", role: "Вчитель початкових класів", photo: "" },
        { name: "Мануйленко Валентина Олексіївна", role: "Вчитель хімії", photo: "" }
      ] }
  ];

  return { groups: groups };
})();
