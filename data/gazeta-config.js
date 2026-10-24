/* Шкільна газета: налаштування (blog.html - підшивка, post.html?id=… - читалка).
   Самі випуски сайт бере з data/gazeta.json - його заповнює робот (.github/workflows/gazeta.yml)
   з папки Google Drive «Газета — опублікувати». Руками в data/gazeta.json нічого писати не треба.
     name            - назва газети (на сторінках і в прев'ю посилань)
     publishFolderId - ID папки «Газета — опублікувати» (частина адреси після folders/).
                       Папка має бути відкрита «Усім, хто має посилання → Читач»
     joinUrl         - куди писати, щоб долучитися до редакції ("" - без кнопки)
   Усе в [квадратних дужках] - заглушки. */
window.GAZETA_CONFIG = {
  name: "[Назва газети]",
  publishFolderId: "1o_HVK7CI6m9d6lQWqQRO_ZDy7jSF2zLj",
  joinUrl: "https://t.me/l2communitybot"
};
