/* Завдання у форматі НМТ для тесту на вибір профілю (profile-test.html).
   Як додавати - в NMT-TASKS.md (лежить локально, не на сайті). Коротко:
   - тільки з офіційних джерел УЦОЯО (testportal.gov.ua), source - обов'язково;
   - тільки з однією правильною відповіддю; answer - номер правильного варіанта, рахуючи з 0;
   - level: "basic" - посильне до 9 класу включно, "full" - повне НМТ;
   - draft: true - чернетка, видно тільки з ?debug=1;
   - у question / options / explanation можна прості формули: x<sup>2</sup>, H<sub>2</sub>O;
     складні - картинкою в img/nmt/ і шлях у image. */
window.NMT_TASKS = [
  {
    id: "draft-math-01",
    subject: "Математика",
    profiles: ["IT", "ENG", "ECO"],
    level: "basic",
    question: "ЗАГЛУШКА. Обчисліть значення виразу 2<sup>3</sup> + 4 · 5.",
    options: ["28", "60", "30", "48", "40"],
    answer: 0,
    explanation: "Спершу степінь і множення: 2<sup>3</sup> = 8, 4 · 5 = 20, разом 28.",
    source: "Приклад-заглушка, замінити завданням з testportal.gov.ua",
    draft: true
  },
  {
    id: "draft-bio-01",
    subject: "Біологія",
    profiles: ["BIO"],
    level: "basic",
    question: "ЗАГЛУШКА. Який орган людини перекачує кров?",
    options: ["Легені", "Печінка", "Серце", "Нирки", "Шлунок"],
    answer: 2,
    explanation: "Серце — м'язовий орган, який своїми скороченнями рухає кров по судинах.",
    source: "Приклад-заглушка, замінити завданням з testportal.gov.ua",
    draft: true
  }
];
