function rgba(hex, alpha = 1) {
  if (!hex || typeof hex !== "string") return `rgba(212,168,67,${alpha})`;
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value)) return `rgba(212,168,67,${alpha})`;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
function updateMapSignals(stages) {
  const progressLabel = byId("map-progress-k");
  const progressValue = byId("map-progress-v");
  const legendTitle = byId("map-legend-title");
  const activeLabel = byId("legend-active-label");
  const doneLabel = byId("legend-done-label");
  const lockedLabel = byId("legend-locked-label");
  if (!progressLabel || !progressValue) return;
  const done = stages.filter((st) => isStageCompleted(G.path, st.id)).length;
  const next = stages.find((st) => !isStageCompleted(G.path, st.id)) || stages[stages.length - 1];
  progressLabel.textContent = isAR()
    ? `تقدّم المراحل • الحالية ${next.id}`
    : `Stage Progress • Current ${next.id}`;
  progressValue.textContent = `${done}/${stages.length}`;
  byId("map-progress-badge").title = next.title[G.lang];
  if (legendTitle) legendTitle.textContent = isAR() ? "إشارات الخريطة" : "Map Signals";
  if (activeLabel) activeLabel.textContent = isAR() ? "المرحلة الحالية" : "Current stage";
  if (doneLabel) doneLabel.textContent = isAR() ? "مرحلة مكتملة" : "Completed stage";
  if (lockedLabel) lockedLabel.textContent = isAR() ? "مرحلة مغلقة" : "Locked stage";
}
function renderMap() {
  updateHUD();
  byId("map-title").textContent = activePath().name[G.lang];
  const svg = byId("mapSvg");
  svg.innerHTML = "";
  const sts = activeStages();
  const desiredMapYOffset = -48;
  const topSafePadding = 10;
  let mapYOffset = desiredMapYOffset;
  if (sts.length) {
    let minBaseY = Infinity;
    sts.forEach((st) => {
      /* Include active pulse radius and top badge space when calculating safe top padding. */
      minBaseY = Math.min(minBaseY, st.y - 62);
    });
    for (let i = 0; i < sts.length - 1; i++) {
      const a = sts[i];
      const b = sts[i + 1];
      const lift = 86 + Math.abs(a.y - b.y) * 0.2;
      minBaseY = Math.min(minBaseY, a.y - lift - 6);
    }
    mapYOffset = Math.max(desiredMapYOffset, topSafePadding - minBaseY);
  }
  updateMapSignals(sts);
  const NS = "http://www.w3.org/2000/svg",
    el = (t) => document.createElementNS(NS, t),
    set = (n, a) => {
      for (const k in a) n.setAttribute(k, a[k]);
      return n;
    };
  const defs = el("defs");
  const glow = el("filter");
  glow.id = "map-glow";
  glow.innerHTML =
    '<feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
  defs.appendChild(glow);
  const soft = el("filter");
  soft.id = "map-soft";
  soft.innerHTML =
    '<feGaussianBlur stdDeviation="1.8" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>';
  defs.appendChild(soft);
  const routeReady = el("linearGradient");
  set(routeReady, { id: "route-ready", x1: "0", y1: "0", x2: "1", y2: "0" });
  routeReady.innerHTML =
    '<stop offset="0%" stop-color="rgba(187,201,228,.24)"/><stop offset="100%" stop-color="rgba(233,208,146,.45)"/>';
  defs.appendChild(routeReady);
  const routeDone = el("linearGradient");
  set(routeDone, { id: "route-done", x1: "0", y1: "0", x2: "1", y2: "0" });
  routeDone.innerHTML =
    '<stop offset="0%" stop-color="rgba(248,232,176,.92)"/><stop offset="100%" stop-color="rgba(230,197,120,.7)"/>';
  defs.appendChild(routeDone);
  svg.appendChild(defs);

  for (let i = 0; i < sts.length - 1; i++) {
    const a = sts[i];
    const b = sts[i + 1];
    const ay = a.y + mapYOffset;
    const by = b.y + mapYOffset;
    const done = isStageCompleted(G.path, a.id);
    const unlocked = b.id <= G.unlocked[G.path];
    const c1x = (a.x + b.x) / 2;
    const c2x = c1x;
    const lift = 86 + Math.abs(a.y - b.y) * 0.2;
    const d = `M${a.x},${ay} C${c1x},${ay - lift} ${c2x},${by + lift} ${b.x},${by}`;
    svg.appendChild(set(el("path"), {
      d,
      fill: "none",
      stroke: "rgba(0,0,0,.38)",
      "stroke-width": 11,
      "stroke-linecap": "round",
    }));
    svg.appendChild(set(el("path"), {
      d,
      fill: "none",
      stroke: done ? "url(#route-done)" : unlocked ? "url(#route-ready)" : "rgba(72,74,108,.42)",
      "stroke-width": done ? 3.6 : 3,
      "stroke-linecap": "round",
      "stroke-dasharray": done ? "" : "7 8",
      opacity: done ? 1 : unlocked ? 0.74 : 0.74,
    }));
  }

  sts.forEach((st) => {
    const done = isStageCompleted(G.path, st.id);
    const locked = st.id > G.unlocked[G.path];
    const active = st.id === G.unlocked[G.path] && !done;
    const accent = st.eraColor || activePath().color;
    const g = el("g");
    set(g, { transform: `translate(${st.x},${st.y + mapYOffset})` });
    if (!locked) {
      g.style.cursor = "pointer";
      g.addEventListener("click", () => openPopup(st));
      g.addEventListener("mouseenter", (e) => showTip(st, e));
      g.addEventListener("mousemove", (e) => showTip(st, e));
      g.addEventListener("mouseleave", hideTip);
    }

    if (active) {
      [58].forEach((r) => {
        const pulse = el("circle");
        set(pulse, {
          cx: 0,
          cy: 0,
          r,
          fill: "none",
          stroke: rgba(accent, 0.34),
          "stroke-width": 1.2,
          filter: "url(#map-soft)",
        });
        const anim = el("animate");
        set(anim, {
          attributeName: "opacity",
          values: "0.55;0.16;0.55",
          dur: "2.4s",
          repeatCount: "indefinite",
        });
        pulse.appendChild(anim);
        g.appendChild(pulse);
      });
    }

    const shadow = el("ellipse");
    set(shadow, {
      cx: 0,
      cy: 8,
      rx: 30,
      ry: 10,
      fill: "rgba(0,0,0,.36)",
    });
    g.appendChild(shadow);
    const outer = el("circle");
    set(outer, {
      cx: 0,
      cy: 0,
      r: 27,
      fill: locked
        ? "rgba(11,14,26,.95)"
        : done
          ? "rgba(9,23,18,.95)"
          : "rgba(8,13,26,.95)",
      stroke: locked ? "rgba(114,89,162,.45)" : done ? "#34d399" : rgba(accent, 0.86),
      "stroke-width": 2.4,
    });
    if (active) outer.setAttribute("filter", "url(#map-glow)");
    g.appendChild(outer);
    const inner = el("circle");
    set(inner, {
      cx: 0,
      cy: 0,
      r: 20,
      fill: locked ? "rgba(28,20,40,.45)" : done ? "rgba(14,54,38,.55)" : rgba(accent, 0.14),
      stroke: locked ? "rgba(162,132,210,.3)" : rgba(accent, 0.34),
      "stroke-width": 1,
    });
    g.appendChild(inner);
    const icon = el("text");
    set(icon, {
      x: 0,
      y: 9,
      "text-anchor": "middle",
      "font-size": locked ? 16 : 22,
      filter: "url(#map-soft)",
    });
    icon.textContent = locked ? "🔒" : st.icon;
    g.appendChild(icon);

    const numberBadge = el("circle");
    set(numberBadge, {
      cx: -24,
      cy: -24,
      r: 11,
      fill: locked ? "rgba(92,72,132,.55)" : rgba(accent, 0.96),
      stroke: "rgba(255,255,255,.2)",
      "stroke-width": 1,
    });
    g.appendChild(numberBadge);
    const numberText = el("text");
    set(numberText, {
      x: -24,
      y: -20,
      "text-anchor": "middle",
      "font-size": 9,
      fill: "#070f18",
      "font-weight": "bold",
    });
    numberText.textContent = st.id;
    g.appendChild(numberText);

    if (done) {
      const checkBadge = el("circle");
      set(checkBadge, {
        cx: 24,
        cy: -24,
        r: 11.5,
        fill: "rgba(7,28,19,.95)",
        stroke: "#34d399",
        "stroke-width": 1.5,
      });
      g.appendChild(checkBadge);
      const checkText = el("text");
      set(checkText, {
        x: 24,
        y: -19,
        "text-anchor": "middle",
        "font-size": 11,
        fill: "#6ee7b7",
        "font-weight": "900",
      });
      checkText.textContent = "✓";
      g.appendChild(checkText);
    }

    const labelText = st.title[G.lang];
    const labelWidth = Math.max(94, Math.min(220, 30 + labelText.length * (isAR() ? 6.7 : 6.2)));
    const overflowLeft = Math.max(0, labelWidth / 2 + 14 - st.x);
    const overflowRight = Math.max(0, st.x + labelWidth / 2 + 14 - 1200);
    const labelX = overflowLeft - overflowRight;
    const label = el("rect");
    set(label, {
      x: labelX - labelWidth / 2,
      y: 42,
      width: labelWidth,
      height: 20,
      rx: 10,
      ry: 10,
      fill: locked
        ? "rgba(24,19,38,.66)"
        : active
          ? rgba(accent, 0.2)
          : "rgba(9,14,28,.65)",
      stroke: locked ? "rgba(114,89,162,.4)" : rgba(accent, active ? 0.46 : 0.24),
      "stroke-width": 1,
    });
    g.appendChild(label);
    const name = el("text");
    set(name, {
      x: labelX,
      y: 56,
      "text-anchor": "middle",
      "font-size": 9.6,
      "font-weight": 700,
      fill: locked
        ? "rgba(176,154,214,.7)"
        : active
          ? "rgba(255,245,217,.96)"
          : "rgba(255,255,255,.9)",
    });
    name.textContent = labelText;
    g.appendChild(name);

    svg.appendChild(g);
  });
}
function showTip(st, e) {
  const state = st.id > G.unlocked[G.path]
    ? t().locked
    : isStageCompleted(G.path, st.id)
      ? t().complete
      : t().available;
  byId("tt-state").textContent = state;
  byId("tt-name").textContent = st.title[G.lang];
  byId("tt-meta").textContent =
    `${st.eraLabel[G.lang]} • ⭐ ${G.stars[G.path][st.id] || 0} • ${st.steps.length} ${isAR() ? "خطوات" : "steps"}`;
  const tt = byId("tooltip");
  tt.classList.add("on");
  const pad = 14;
  const rect = tt.getBoundingClientRect();
  let x = e.clientX + 16;
  let y = e.clientY - rect.height - 14;
  if (x + rect.width > innerWidth - pad) x = innerWidth - rect.width - pad;
  if (x < pad) x = pad;
  if (y < pad) y = Math.min(innerHeight - rect.height - pad, e.clientY + 14);
  tt.style.left = `${x}px`;
  tt.style.top = `${y}px`;
}
function hideTip() {
  byId("tooltip").classList.remove("on");
}
function showToast(icon, head, text) {
  byId("toast-i").textContent = icon;
  byId("toast-t1").textContent = head;
  byId("toast-t2").textContent = text;
  const e = byId("toast");
  e.classList.add("on");
  setTimeout(() => e.classList.remove("on"), 2600);
}
function showAchievement(icon, head, text) {
  byId("achievement-i").textContent = icon;
  byId("achievement-t1").textContent = head;
  byId("achievement-t2").textContent = text;
  const e = byId("achievement");
  e.classList.add("on");
  setTimeout(() => e.classList.remove("on"), 3200);
}
function floatXP(text) {
  const div = document.createElement("div");
  div.style.cssText =
    "position:fixed;z-index:4000;left:50%;top:56%;transform:translate(-50%,0);font-size:24px;font-weight:900;color:var(--gold);text-shadow:0 0 18px rgba(212,168,67,.4);pointer-events:none;transition:all 1s ease;";
  div.textContent = text;
  document.body.appendChild(div);
  requestAnimationFrame(() => {
    div.style.transform = "translate(-50%,-90px)";
    div.style.opacity = "0";
  });
  setTimeout(() => div.remove(), 1000);
}
function addFXBurst(color) {
  const canvas = byId("fx"),
    ctx = canvas.getContext("2d"),
    parts = [...Array(20)].map(() => ({
      x: canvas.width / 2,
      y: canvas.height * 0.55,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 5 + 2,
      life: 1,
    }));
  const start = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.life -= 0.025;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (now - start < 500) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}
function confetti() {
  for (let i = 0; i < 52; i++) {
    const c = document.createElement("div"),
      colors = [
        "#d4a843",
        "#f5d96a",
        "#52b788",
        "#9b59b6",
        "#ff6b6b",
        "#60a5fa",
      ];
    c.style.cssText = `position:fixed;z-index:3500;left:${8 + Math.random() * 84}%;top:-20px;width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};pointer-events:none;opacity:.9;transition:transform ${1.8 + Math.random() * 1.2}s ease, opacity ${1.8 + Math.random() * 1.2}s ease;`;
    document.body.appendChild(c);
    requestAnimationFrame(() => {
      c.style.transform = `translate(${Math.random() * 140 - 70}px, ${innerHeight + 80}px) rotate(${Math.random() * 720}deg)`;
      c.style.opacity = "0";
    });
    setTimeout(() => c.remove(), 3200);
  }
}
function resizeCanvases() {
  byId("bg").width = innerWidth;
  byId("bg").height = innerHeight;
  byId("fx").width = innerWidth;
  byId("fx").height = innerHeight;
}
const bgState = { stars: [] };
function initBG() {
  resizeCanvases();
  bgState.stars = [...Array(Math.min(280, Math.floor(innerWidth * 0.18)))].map(
    () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight * 0.65,
      r: Math.random() * 1.6 + 0.2,
      a: Math.random() * 0.55 + 0.06,
      da: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
    }),
  );
}
function drawBG() {
  const c = byId("bg"),
    x = c.getContext("2d");
  x.clearRect(0, 0, c.width, c.height);
  const g = x.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "#081326");
  g.addColorStop(0.55, "#050b18");
  g.addColorStop(1, "#120d08");
  x.fillStyle = g;
  x.fillRect(0, 0, c.width, c.height);
  bgState.stars.forEach((s) => {
    s.a += s.da;
    if (s.a < 0.06 || s.a > 0.6) s.da *= -1;
    x.globalAlpha = s.a;
    x.fillStyle = "#fff";
    x.beginPath();
    x.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    x.fill();
  });
  x.globalAlpha = 1;
  x.fillStyle = "rgba(245,224,128,.04)";
  x.beginPath();
  x.arc(c.width * 0.82, c.height * 0.14, 52, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#fdf3d0";
  x.beginPath();
  x.arc(c.width * 0.82, c.height * 0.14, 32, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#081326";
  x.beginPath();
  x.arc(c.width * 0.835, c.height * 0.125, 29, 0, Math.PI * 2);
  x.fill();
  const dunes = [
    { y: c.height * 0.64, amp: 26, col: "#0b1322" },
    { y: c.height * 0.75, amp: 32, col: "#101016" },
    { y: c.height * 0.86, amp: 36, col: "#1a0f08" },
  ];
  dunes.forEach((d, k) => {
    x.beginPath();
    x.moveTo(0, d.y);
    for (let px = 0; px <= c.width; px += 40) {
      x.quadraticCurveTo(
        px + 20,
        d.y + Math.sin(px / 110 + performance.now() / 2200 + k * 1.3) * d.amp,
        px + 40,
        d.y +
          Math.sin((px + 40) / 110 + performance.now() / 2200 + k * 1.3) *
            d.amp,
      );
    }
    x.lineTo(c.width, c.height);
    x.lineTo(0, c.height);
    x.closePath();
    x.fillStyle = d.col;
    x.fill();
  });
  requestAnimationFrame(drawBG);
}
let audioCtx;
let audioResumePromise = null;
let audioGesturePrimed = false;
function getAudioCtx() {
  if (!audioCtx) {
    const AudioAPI = window.AudioContext || window.webkitAudioContext;
    if (!AudioAPI) return null;
    audioCtx = new AudioAPI();
  }
  return audioCtx;
}
function ensureAudioReady() {
  const ctx = getAudioCtx();
  if (!ctx) return Promise.resolve(null);
  if (ctx.state === "running") return Promise.resolve(ctx);
  if (!audioResumePromise) {
    audioResumePromise = ctx.resume()
      .then(() => ctx)
      .catch(() => ctx)
      .finally(() => {
        audioResumePromise = null;
      });
  }
  return audioResumePromise;
}
function primeAudioOnGesture() {
  if (audioGesturePrimed) return;
  audioGesturePrimed = true;
  const unlock = () => {
    ensureAudioReady();
    removeEventListener("pointerdown", unlock, true);
    removeEventListener("touchstart", unlock, true);
    removeEventListener("keydown", unlock, true);
  };
  addEventListener("pointerdown", unlock, true);
  addEventListener("touchstart", unlock, true);
  addEventListener("keydown", unlock, true);
}
function playTone(ctx, freq, duration, type) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const now = ctx.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(Math.max(40, freq), now);
  g.gain.setValueAtTime(0.001, now);
  g.gain.exponentialRampToValueAtTime(0.042, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(now);
  o.stop(now + duration + 0.012);
}
function beep(freq = 0.0, duration = 0.05, type = "sine") {
  if (!G.sound) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state !== "running") {
      ensureAudioReady().then((readyCtx) => {
        if (!readyCtx || readyCtx.state !== "running" || !G.sound) return;
        playTone(readyCtx, freq, duration, type);
      });
      return;
    }
    playTone(ctx, freq, duration, type);
  } catch (e) {}
}
