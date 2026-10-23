/* Сторінка «Бланки та заяви» (forms.html).
   Як додати бланк: покладіть файл у папку docs/forms/ і допишіть рядок сюди.
     title       - назва документа
     group       - "Для батьків" | "Для учнів" | "Вступ і переведення"
     file        - шлях до файлу: "docs/forms/назва.pdf" або ".docx"
     description - одне речення: коли і навіщо цей бланк
     updated     - дата оновлення, РРРР-ММ-ДД
   Розмір файлу сайт визначає сам. Поки файлу в папці немає, кнопка неактивна з підписом «Скоро». */
window.DOCUMENTS = [
  { title: "[Заява про відсутність учня]", group: "Для батьків",
    file: "docs/forms/zayava-vidsutnist.docx",
    description: "[Коли подається і кому: уточнити]", updated: "" },
  { title: "Заява про дозвіл забирати дитину під час тривоги", group: "Для батьків",
    file: "docs/forms/zayava-tryvoga.docx",
    description: "Пишеться заздалегідь, щоб забрати дитину з ліцею під час повітряної тривоги.", updated: "" },
  { title: "[Заява на звільнення від уроків фізкультури]", group: "Для батьків",
    file: "docs/forms/zayava-fizkultura.docx",
    description: "[Коли подається і які документи додати: уточнити]", updated: "" },
  { title: "[Заява на зарахування]", group: "Вступ і переведення",
    file: "docs/forms/zayava-zarakhuvannia.pdf",
    description: "[Для вступу до 1 або 10 класу: уточнити]", updated: "" },
  { title: "[Заява на переведення]", group: "Вступ і переведення",
    file: "docs/forms/zayava-perevedennia.pdf",
    description: "[Для переведення з іншого закладу освіти: уточнити]", updated: "" }
];
