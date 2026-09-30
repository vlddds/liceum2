/* Пасхалка: міні-гра «Лови дванадцятки».
   Завантажується лише після секретного коду (див. js/common.js, розділ 5). */
(function () {
  "use strict";

  var L = window.L2, $ = L.$, ICON = L.ICON;
  var BEST_KEY = "l2game-best", GOOD = [10, 11, 12], BAD = [1, 2, 3];

  /* Вікно гри створюємо один раз */
  var dlg = document.createElement("dialog");
  dlg.className = "game";
  dlg.setAttribute("aria-label", "Міні-гра «Лови дванадцятки»");
  dlg.innerHTML =
    '<button class="t-x" type="button" id="g-x" aria-label="Закрити гру">' + ICON("close") + "</button>" +
    '<div class="game-hud"><span>Бали <b id="g-score">0</b></span><span class="game-lives" id="g-lives"></span>' +
    '<span>Рекорд <b id="g-best">0</b></span></div>' +
    '<div class="game-stage"><canvas id="g-cv"></canvas>' +
    '<div class="game-screen" id="g-screen">' +
      '<span class="game-badge">Секретний рівень</span>' +
      '<h2 id="g-title">Лови дванадцятки!</h2>' +
      '<p id="g-text">Лови щоденником оцінки <b>10, 11 і 12</b>. Від <b class="bad">1, 2 і 3</b> тікай: вони забирають життя. ' +
      'Керуй стрілками ← →, мишкою або пальцем.</p>' +
      '<button class="btn primary" type="button" id="g-go">Почати гру</button>' +
    "</div></div>";
  document.body.appendChild(dlg);

  var INTRO = $("#g-text", dlg).innerHTML;
  var cv = $("#g-cv", dlg), ctx = cv.getContext("2d"), screen = $("#g-screen", dlg);
  var W = 0, H = 0, dpr = 1, running = false, last = 0, raf = 0;
  var st, keys = {}, best = 0, C = {};
  try { best = +localStorage.getItem(BEST_KEY) || 0; } catch (e) {}

  function colors() {
    var cs = getComputedStyle(document.documentElement);
    ["--surface", "--paper", "--ink", "--muted", "--sun", "--bad", "--fill", "--line", "--ok"].forEach(function (k) {
      C[k.slice(2)] = cs.getPropertyValue(k).trim();
    });
  }
  function size() {
    var r = cv.parentNode.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (st) st.px = Math.min(Math.max(st.px, st.pw / 2), W - st.pw / 2);
  }

  function reset() {
    st = { score: 0, lives: 3, t: 0, spawn: 0, items: [], pops: [], pw: Math.max(78, Math.min(110, W * 0.2)), px: W / 2, tx: null, hurt: 0 };
    hud();
  }
  function hud() {
    $("#g-score", dlg).textContent = st.score;
    $("#g-best", dlg).textContent = best;
    var h = "";
    for (var i = 0; i < 3; i++) h += '<svg class="ic' + (i < st.lives ? "" : " off") + '" aria-hidden="true"><use href="#i-heart"/></svg>';
    $("#g-lives", dlg).innerHTML = h + '<span class="sr">Життів: ' + st.lives + "</span>";
  }

  function spawn() {
    var bonus = Math.random() < 0.04, good = bonus || Math.random() < 0.68;
    var val = bonus ? "★" : good ? GOOD[Math.floor(Math.random() * 3)] : BAD[Math.floor(Math.random() * 3)];
    var r = bonus ? 20 : 22;
    st.items.push({ x: r + Math.random() * (W - r * 2), y: -r, r: r, val: val, good: good, bonus: bonus,
      v: (110 + st.t * 5) * (0.85 + Math.random() * 0.35), rot: 0, spin: (Math.random() - 0.5) * 2 });
  }

  function step(dt) {
    st.t += dt;
    /* керування */
    var speed = Math.max(380, W * 0.9);
    if (keys.left) st.px -= speed * dt;
    if (keys.right) st.px += speed * dt;
    if (st.tx !== null) st.px += (st.tx - st.px) * Math.min(1, dt * 14);
    st.px = Math.min(Math.max(st.px, st.pw / 2), W - st.pw / 2);

    /* поява оцінок: що довше граєш, то частіше й швидше */
    st.spawn -= dt;
    if (st.spawn <= 0) { spawn(); st.spawn = Math.max(0.32, 0.95 - st.t * 0.012); }

    var py = H - 34;
    for (var i = st.items.length - 1; i >= 0; i--) {
      var it = st.items[i];
      it.y += it.v * dt; it.rot += it.spin * dt;
      var caught = it.y + it.r >= py && it.y - it.r <= py + 18 && Math.abs(it.x - st.px) <= st.pw / 2 + it.r * 0.6;
      if (caught) {
        st.items.splice(i, 1);
        if (it.bonus) { st.score += 50; pop(it.x, py, "+50", C.sun); if (st.lives < 3) st.lives++; }
        else if (it.good) { st.score += it.val; pop(it.x, py, "+" + it.val, C.ok); }
        else { st.lives--; st.hurt = 0.35; pop(it.x, py, "−♥", C.bad); if (navigator.vibrate) navigator.vibrate(60); }
        hud();
        if (st.lives <= 0) { over(); return; }
      } else if (it.y - it.r > H) {
        st.items.splice(i, 1);
      }
    }
    for (var k = st.pops.length - 1; k >= 0; k--) {
      var p = st.pops[k]; p.t += dt; p.y -= 40 * dt;
      if (p.t > 0.8) st.pops.splice(k, 1);
    }
    st.hurt = Math.max(0, st.hurt - dt);
  }
  function pop(x, y, text, color) { st.pops.push({ x: x, y: y - 20, text: text, color: color, t: 0 }); }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    /* зошит у клітинку */
    ctx.strokeStyle = C.line; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = 24; gx < W; gx += 24) { ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); }
    for (var gy = 24; gy < H; gy += 24) { ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); }
    ctx.stroke(); ctx.globalAlpha = 1;
    if (st.hurt > 0) { ctx.fillStyle = C.bad; ctx.globalAlpha = st.hurt * 0.4; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

    /* оцінки */
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    st.items.forEach(function (it) {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot * 0.3);
      ctx.beginPath(); ctx.arc(0, 0, it.r, 0, Math.PI * 2);
      ctx.fillStyle = it.bonus ? C.sun : it.good ? C.fill : C.surface; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = it.bonus ? C.sun : it.good ? C.sun : C.bad; ctx.stroke();
      ctx.fillStyle = it.bonus ? "#2A1E00" : it.good ? "#fff" : C.bad;
      ctx.font = "700 " + (it.bonus ? 22 : 18) + "px Literata, Georgia, serif";
      ctx.fillText(String(it.val), 0, 1);
      ctx.restore();
    });

    /* щоденник */
    var py = H - 34, x = st.px - st.pw / 2;
    rr(x, py, st.pw, 22, 6); ctx.fillStyle = C.fill; ctx.fill();
    ctx.fillStyle = C.sun; ctx.fillRect(x + 10, py, 8, 22);
    ctx.fillStyle = "#fff"; ctx.font = "600 11px Onest, system-ui, sans-serif";
    ctx.fillText("ЩОДЕННИК", st.px + 6, py + 11.5);

    st.pops.forEach(function (p) {
      ctx.globalAlpha = 1 - p.t / 0.8; ctx.fillStyle = p.color;
      ctx.font = "700 18px Literata, Georgia, serif"; ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    step(dt);
    if (running) draw();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    colors(); size(); reset();
    screen.hidden = true; running = true; last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    cv.focus();
  }
  function over() {
    running = false; draw();
    var record = st.score > best;
    if (record) { best = st.score; try { localStorage.setItem(BEST_KEY, best); } catch (e) {} }
    hud();
    $("#g-title", dlg).textContent = record ? "Новий рекорд!" : "Гру завершено";
    $("#g-text", dlg).innerHTML = "Ти набрав <b>" + st.score + "</b> " + L.plural(st.score, "бал", "бали", "балів") +
      (record ? ". Це найкращий результат на цьому пристрої!" : ". Рекорд: <b>" + best + "</b>.");
    $("#g-go", dlg).textContent = "Грати ще";
    screen.hidden = false; $("#g-go", dlg).focus();
  }
  function pauseGame() {
    if (!running) return;
    running = false;
    $("#g-title", dlg).textContent = "Пауза";
    $("#g-text", dlg).textContent = "Натисни, щоб продовжити.";
    $("#g-go", dlg).textContent = "Продовжити";
    $("#g-go", dlg).dataset.resume = "1";
    screen.hidden = false;
  }

  $("#g-go", dlg).addEventListener("click", function () {
    var b = this;
    if (b.dataset.resume) { delete b.dataset.resume; screen.hidden = true; running = true; last = performance.now(); raf = requestAnimationFrame(loop); cv.focus(); return; }
    start();
  });
  $("#g-x", dlg).addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("close", function () { running = false; cancelAnimationFrame(raf); keys = {}; });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  dlg.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || e.code === "KeyA") { keys.left = true; st && (st.tx = null); e.preventDefault(); }
    else if (k === "ArrowRight" || e.code === "KeyD") { keys.right = true; st && (st.tx = null); e.preventDefault(); }
    else if ((k === " " || k === "p" || e.code === "KeyP") && running) { pauseGame(); e.preventDefault(); }
  });
  dlg.addEventListener("keyup", function (e) {
    if (e.key === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if (e.key === "ArrowRight" || e.code === "KeyD") keys.right = false;
  });
  function pointer(e) {
    if (!running) return;
    var r = cv.getBoundingClientRect();
    st.tx = e.clientX - r.left;
  }
  cv.addEventListener("pointermove", pointer);
  cv.addEventListener("pointerdown", function (e) { pointer(e); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); });
  cv.tabIndex = 0;
  window.addEventListener("resize", function () { if (dlg.open) { size(); if (st) draw(); } });
  document.addEventListener("visibilitychange", function () { if (document.hidden) pauseGame(); });

  window.L2Game = {
    open: function () {
      if (dlg.open) return;
      $("#g-title", dlg).textContent = "Лови дванадцятки!";
      $("#g-text", dlg).innerHTML = INTRO;
      $("#g-go", dlg).textContent = "Почати гру";
      delete $("#g-go", dlg).dataset.resume;
      screen.hidden = false;
      dlg.showModal();
      colors(); size(); reset(); draw();
      $("#g-go", dlg).focus();
    }
  };
})();
