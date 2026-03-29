function renderMap() {
  updateHUD();
  byId("map-title").textContent = activePath().name[G.lang];
  const svg = byId("mapSvg");
  svg.innerHTML = "";
  const NS = "http://www.w3.org/2000/svg",
    el = (t) => document.createElementNS(NS, t),
    set = (n, a) => {
      for (const k in a) n.setAttribute(k, a[k]);
      return n;
    };
  const defs = el("defs");
  const glow = el("filter");
  glow.id = "gl";
  glow.innerHTML =
    '<feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
  defs.appendChild(glow);
  svg.appendChild(defs);
  const sts = activeStages();
  for (let i = 0; i < sts.length - 1; i++) {
    const a = sts[i],
      b = sts[i + 1],
      done = G.completed[G.path].includes(a.id),
      avail = a.id <= G.unlocked[G.path],
      c1x = (a.x + b.x) / 2,
      c2x = (a.x + b.x) / 2;
    const d = `M${a.x},${a.y} C${c1x},${a.y - 80} ${c2x},${b.y + 80} ${b.x},${b.y}`;
    svg.appendChild(
      set(el("path"), {
        d,
        fill: "none",
        stroke: "rgba(0,0,0,.52)",
        "stroke-width": 13,
        "stroke-linecap": "round",
      }),
    );
    svg.appendChild(
      set(el("path"), {
        d,
        fill: "none",
        stroke: done
          ? "rgba(212,168,67,.7)"
          : avail
            ? "rgba(120,90,18,.4)"
            : "rgba(40,42,70,.35)",
        "stroke-width": done ? 5 : 4,
        "stroke-dasharray": done ? "" : "10,10",
        "stroke-linecap": "round",
      }),
    );
    if (done)
      svg.appendChild(
        set(el("path"), {
          d,
          fill: "none",
          stroke: "rgba(252,235,140,.5)",
          "stroke-width": 2.1,
          "stroke-linecap": "round",
        }),
      );
  }
  sts.forEach((st) => {
    const done = G.completed[G.path].includes(st.id),
      locked = st.id > G.unlocked[G.path],
      active = st.id === G.unlocked[G.path] && !done,
      g = el("g");
    set(g, { transform: `translate(${st.x},${st.y})` });
    if (!locked) {
      g.style.cursor = "pointer";
      g.addEventListener("click", () => openPopup(st));
      g.addEventListener("mouseenter", (e) => showTip(st, e));
      g.addEventListener("mouseleave", hideTip);
    }
    if (active) {
      [46, 62, 78].forEach((r, j) => {
        const c = el("circle");
        set(c, {
          cx: 0,
          cy: 0,
          r,
          fill: "none",
          stroke: activePath().color,
          "stroke-width": j === 0 ? 1.6 : 0.9,
          opacity: 0.55 - j * 0.12,
        });
        g.appendChild(c);
        const anim = el("animate");
        set(anim, {
          attributeName: "opacity",
          values: "0.7;0.08;0.7",
          dur: 1.9 + j * 0.35 + "s",
          repeatCount: "indefinite",
        });
        c.appendChild(anim);
      });
    }
    const shadow = el("circle");
    set(shadow, { cx: 2, cy: 4, r: 30, fill: "rgba(0,0,0,.55)" });
    g.appendChild(shadow);
    const base = el("circle");
    set(base, {
      cx: 0,
      cy: 0,
      r: 28,
      fill: locked
        ? "rgba(10,12,24,.96)"
        : done
          ? "rgba(9,24,16,.95)"
          : "rgba(10,14,28,.95)",
      stroke: locked
        ? "rgba(60,45,90,.45)"
        : done
          ? "#10b981"
          : activePath().color,
      "stroke-width": done ? 2.8 : 3,
    });
    if (active) base.setAttribute("filter", "url(#gl)");
    g.appendChild(base);
    const icon = el("text");
    set(icon, {
      x: 0,
      y: 9,
      "text-anchor": "middle",
      "font-size": locked ? 16 : 22,
    });
    icon.textContent = locked ? "🔒" : st.icon;
    g.appendChild(icon);
    const badge = el("circle");
    set(badge, {
      cx: -23,
      cy: -23,
      r: 11,
      fill: locked ? "rgba(70,58,112,.4)" : activePath().color,
    });
    g.appendChild(badge);
    const badgeText = el("text");
    set(badgeText, {
      x: -23,
      y: -19,
      "text-anchor": "middle",
      "font-size": 9,
      fill: "#071019",
      "font-weight": "bold",
    });
    badgeText.textContent = st.id;
    g.appendChild(badgeText);
    if (done) {
      const doneB = el("circle");
      set(doneB, {
        cx: 23,
        cy: -23,
        r: 12,
        fill: "rgba(8,24,14,.95)",
        stroke: "#10b981",
        "stroke-width": 1.5,
      });
      g.appendChild(doneB);
      const doneT = el("text");
      set(doneT, {
        x: 23,
        y: -18,
        "text-anchor": "middle",
        "font-size": 11,
        fill: "#52b788",
        "font-weight": "bold",
      });
      doneT.textContent = "✓";
      g.appendChild(doneT);
    }
    const name = el("text");
    set(name, {
      x: 0,
      y: 52,
      "text-anchor": "middle",
      "font-size": 10,
      "font-weight": 800,
      fill: locked
        ? "rgba(110,96,145,.52)"
        : active
          ? activePath().color
          : "rgba(255,255,255,.92)",
    });
    name.textContent = st.title[G.lang];
    g.appendChild(name);
    svg.appendChild(g);
  });
}
function showTip(st, e) {
  byId("tt-state").textContent =
    st.id > G.unlocked[G.path]
      ? t().locked
      : G.completed[G.path].includes(st.id)
        ? t().complete
        : t().available;
  byId("tt-name").textContent = st.title[G.lang];
  byId("tt-meta").textContent =
    `${st.eraLabel[G.lang]} • ⭐ ${G.stars[G.path][st.id] || 0}`;
  const tt = byId("tooltip");
  tt.style.left = e.clientX + 12 + "px";
  tt.style.top = e.clientY - 52 + "px";
  tt.classList.add("on");
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
function demoAchievements() {
  showAchievement(
    "🏅",
    t().achievement,
    isAR() ? "هذه مجرد معاينة" : "This is a preview",
  );
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
function beep(freq = 0.0, duration = 0.05, type = "sine") {
  if (!G.sound) return;
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + duration,
    );
    o.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}
