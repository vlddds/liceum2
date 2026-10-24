/* Шкільна газета: налаштування (blog.html - підшивка, post.html?id=… - читалка).
   Самі випуски сайт бере з data/gazeta.json - його заповнює робот (.github/workflows/gazeta.yml),
   руками туди нічого писати не треба.
     name    - назва газети (на сторінках і в прев'ю посилань)
     apiKey  - ключ Google API, щоб читалка могла відкрити PDF з Диска. Ключ не секретний,
               але обмежте його: лише Google Drive API і лише сайт vlddds.github.io (див. GAZETA-SETUP.md)
     joinUrl - куди писати, щоб долучитися до редакції ("" - без кнопки)
   Усе в [квадратних дужках] - заглушки. */
window.GAZETA_CONFIG = {
  name: "[Назва газети]",
  apiKey: "[API-ключ Google]",
  joinUrl: "https://t.me/l2communitybot"
};
