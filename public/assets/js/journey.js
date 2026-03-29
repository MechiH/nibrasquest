function showPaths() {
  renderPaths();
  screen("paths");
}
function startJourney() {
  showPaths();
}
const STAGE_TIMELINE = {
  prophet: {
    1: { ar: "قبل 610م", en: "Before 610 CE" },
    2: { ar: "570م", en: "570 CE" },
    3: { ar: "610م", en: "610 CE" },
    4: { ar: "622 - 632م", en: "622-632 CE" },
  },
  principles: {
    1: { ar: "اليوم 1", en: "Day 1" },
    2: { ar: "اليوم 7", en: "Day 7" },
    3: { ar: "اليوم 14", en: "Day 14" },
  },
  faith: {
    1: { ar: "الأسبوع 1", en: "Week 1" },
    2: { ar: "الأسبوع 2", en: "Week 2" },
    3: { ar: "الأسبوع 3", en: "Week 3" },
  },
  grammar: {
    1: { ar: "المستوى 1", en: "Level 1" },
    2: { ar: "المستوى 2", en: "Level 2" },
    3: { ar: "المستوى 3", en: "Level 3" },
  },
};
function stageDateLabel(st) {
  return (
    STAGE_TIMELINE[activePath().id]?.[st.id]?.[G.lang] ||
    (isAR() ? `المرحلة ${st.id}` : `Stage ${st.id}`)
  );
}
function stageThemeKey(st) {
  if (["makkah", "core", "intro", "sentence", "foundation"].includes(st.era))
    return "origin";
  if (
    ["revelation", "pillars", "beliefs", "i3rab", "middle"].includes(st.era)
  )
    return "rise";
  return "legacy";
}
function applyStoryTheme() {
  const card = document.querySelector("#story .story-card");
  if (!card || !activeStage) return;
  card.setAttribute("data-theme", stageThemeKey(activeStage));
}
function renderPaths() {
  ensureState();
  const allPaths = Object.values(PATHS);
  const getPathStats = (path) => {
    const done = (G.completed[path.id] || []).length;
    const total = path.stages.length;
    const stars = Object.values(G.stars[path.id] || {}).reduce((a, b) => a + b, 0);
    const nextStage = Math.min(total, G.unlocked[path.id] || 1);
    return {
      done,
      total,
      stars,
      nextStage,
      progress: total ? done / total : 0,
    };
  };
  const lp = byId("level-picker");
  lp.innerHTML = "";
  LEVELS.forEach((l) => {
    const b = document.createElement("button");
    b.className = "level-pill" + (G.levelStart === l ? " active" : "");
    b.textContent = levelName(l);
    b.onclick = () => {
      G.levelStart = l;
      renderPaths();
      save();
    };
    lp.appendChild(b);
  });
  const totalStages = allPaths.reduce((acc, path) => acc + path.stages.length, 0);
  const completedStages = allPaths.reduce(
    (acc, path) => acc + (G.completed[path.id] || []).length,
    0,
  );
  const progressPct = totalStages
    ? Math.round((completedStages / totalStages) * 100)
    : 0;
  const dashboard = byId("paths-dashboard");
  dashboard.innerHTML = `
    <div class="path-dash-card glass">
      <div class="path-dash-k">${t().level}</div>
      <div class="path-dash-v">LV ${G.level}</div>
    </div>
    <div class="path-dash-card glass">
      <div class="path-dash-k">⭐ ${isAR() ? "نجوم" : "Stars"}</div>
      <div class="path-dash-v">${G.totalStars}</div>
    </div>
    <div class="path-dash-card glass">
      <div class="path-dash-k">${t().pathsCompleted}</div>
      <div class="path-dash-v">${completedStages}/${totalStages}</div>
    </div>
    <div class="path-dash-card glass">
      <div class="path-dash-k">${t().pathsProgress}</div>
      <div class="path-dash-v">${progressPct}%</div>
    </div>
  `;
  const filters = [
    { id: "all", label: t().pathsFilterAll },
    { id: "fresh", label: t().pathsFilterFresh },
    { id: "active", label: t().pathsFilterActive },
    { id: "mastered", label: t().pathsFilterMastered },
  ];
  const filterWrap = byId("path-filters");
  filterWrap.innerHTML = "";
  filters.forEach((f) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "path-filter" + (pathFilter === f.id ? " active" : "");
    btn.textContent = f.label;
    btn.onclick = () => {
      pathFilter = f.id;
      renderPaths();
    };
    filterWrap.appendChild(btn);
  });
  const grid = byId("path-grid");
  grid.innerHTML = "";
  const filteredPaths = allPaths.filter((path) => {
    const { done, total } = getPathStats(path);
    if (pathFilter === "fresh") return done === 0;
    if (pathFilter === "active") return done > 0 && done < total;
    if (pathFilter === "mastered") return done >= total;
    return true;
  });
  filteredPaths.sort((a, b) => {
    const A = getPathStats(a);
    const B = getPathStats(b);
    const rankA =
      (a.id === G.path ? 100 : 0) +
      (A.done > 0 && A.done < A.total ? 40 : 0) +
      (A.done === 0 ? 20 : 0) +
      (G.pathSeen[a.id] ? 10 : 0) +
      A.progress;
    const rankB =
      (b.id === G.path ? 100 : 0) +
      (B.done > 0 && B.done < B.total ? 40 : 0) +
      (B.done === 0 ? 20 : 0) +
      (G.pathSeen[b.id] ? 10 : 0) +
      B.progress;
    return rankB - rankA;
  });
  if (!filteredPaths.length) {
    grid.innerHTML = `<div class="path-empty glass">${t().pathsNoResult}</div>`;
    return;
  }
  filteredPaths.forEach((path, index) => {
    const { done, total, stars, nextStage, progress } = getPathStats(path);
    const p = Math.round(progress * 100);
    const state = done === 0 ? "fresh" : done >= total ? "mastered" : "active";
    const stateLabel =
      state === "fresh"
        ? t().pathsFreshState
        : state === "mastered"
          ? t().pathsMasteredState
          : t().pathsActiveState;
    const card = document.createElement("div");
    card.className = "path-card glass" + (path.id === G.path ? " selected" : "");
    card.style.setProperty("--path-color", path.color);
    card.style.animationDelay = `${80 + index * 40}ms`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `${path.name[G.lang]} • ${done}/${total} ${isAR() ? "مراحل" : "stages"}`,
    );
    card.innerHTML = `<div class="path-card-aura"></div><div class="path-top"><div><div class="path-name">${path.name[G.lang]}</div><div class="path-desc">${path.desc[G.lang]}</div></div><div class="path-badge">${path.icon}</div></div><div class="path-meta"><div class="meta-pill">${path.stages.length} ${isAR() ? "مراحل" : "Stages"}</div><div class="meta-pill">${levelName(G.levelStart)}</div><div class="meta-pill">⭐ ${stars}</div><div class="meta-pill">${done}/${total}</div></div><div class="path-progress"><span style="width:${p}%"></span></div><div class="path-track"><div class="path-track-k">${t().pathsNextQuest}</div><div class="path-track-v">${t().chapterOf(nextStage, total)}</div></div><div class="path-footer"><div class="path-state path-state-${state}">${stateLabel}</div><button class="path-enter" type="button">${t().pathsEnter}</button></div>`;
    card.onclick = () => selectPath(path.id);
    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectPath(path.id);
      }
    };
    card.querySelector(".path-enter").onclick = (e) => {
      e.stopPropagation();
      selectPath(path.id);
    };
    card.onpointermove = (e) => {
      if (!matchMedia("(hover: hover)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * 8;
      const ry = (x - 0.5) * 8;
      card.style.transform = `translateY(-5px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty("--spot-x", `${x * 100}%`);
      card.style.setProperty("--spot-y", `${y * 100}%`);
    };
    card.onpointerleave = () => {
      card.style.transform = "";
    };
    grid.appendChild(card);
  });
}
function selectPath(id) {
  G.path = id;
  G.pathSeen[id] = true;
  updateUnlockedByLevel();
  renderMap();
  screen("map");
  save();
}
function updateUnlockedByLevel() {
  const path = activePath(),
    len = path.stages.length;
  let base = 1;
  if (G.levelStart === "intermediate") base = Math.min(2, len);
  if (G.levelStart === "advanced") base = Math.min(3, len);
  G.unlocked[G.path] = Math.max(G.unlocked[G.path] || 1, base);
}
function openPopup(st) {
  const done = G.completed[G.path].includes(st.id),
    starCount = G.stars[G.path][st.id] || 0,
    pc = byId("popup-card");
  pc.innerHTML = `<button class="close" id="close-popup">✕</button><div class="popup-head"><div class="popup-ico">${st.icon}</div><div class="popup-kicker">${t().chapterOf(st.id, activeStages().length)}</div><div class="popup-title">${st.title[G.lang]}</div></div><div style="display:flex;justify-content:center;gap:6px;margin:10px 0 4px">${[0, 1, 2].map((i) => `<span style="font-size:22px;opacity:${i < starCount ? 1 : 0.18}">⭐</span>`).join("")}</div><div class="popup-desc">${t().popupDesc}</div><div class="popup-grid"><div class="popup-mini"><div class="i">📖</div><div class="t">${t().story}</div></div><div class="popup-mini"><div class="i">⚡</div><div class="t">${t().quiz}</div></div><div class="popup-mini"><div class="i">🏆</div><div class="t">${t().reward}</div></div><div class="popup-mini"><div class="i">${done ? "🔄" : "🎯"}</div><div class="t">${done ? t().replay : t().begin}</div></div></div><button class="popup-btn" id="begin-stage">${done ? t().replay : t().begin}</button>`;
  byId("popup").classList.add("on");
  byId("close-popup").onclick = closePopup;
  byId("begin-stage").onclick = () => beginStage(st.id);
}
function closePopup(e) {
  if (!e || e.target === byId("popup") || e.target.id === "close-popup")
    byId("popup").classList.remove("on");
}
function beginStage(id) {
  activeStage = activeStages().find((s) => s.id === id);
  storyIndex = 0;
  typingDone = false;
  clearInterval(typingTimer);
  closePopup();
  applyStoryTheme();
  renderStoryHeader();
  renderEraStrip();
  renderStoryDots();
  renderReferences();
  showStoryParagraph(0);
  screen("story");
}
function renderStoryHeader() {
  byId("story-chapter").textContent = t().chapterOf(
    activeStage.id,
    activeStages().length,
  );
  byId("story-icon").textContent = activeStage.icon;
  byId("story-title").textContent = activeStage.title[G.lang];
  byId("story-date").textContent = `${t().storyDate}: ${stageDateLabel(activeStage)}`;
}
function renderEraStrip() {
  const strip = byId("era-strip");
  strip.innerHTML = "";
  const eras =
    activePath().id === "prophet"
      ? [
          {
            k: "makkah",
            icon: "🏜️",
            label: { ar: "مرحلة مكة", en: "Makkah Era" },
          },
          {
            k: "revelation",
            icon: "🕯️",
            label: { ar: "بدء الوحي", en: "Revelation" },
          },
          {
            k: "madinah",
            icon: "🕌",
            label: { ar: "مرحلة المدينة", en: "Madinah Era" },
          },
        ]
      : [
          {
            k: "foundation",
            icon: "🧭",
            label: { ar: "التمهيد", en: "Foundation" },
          },
          { k: "middle", icon: "📘", label: { ar: "البناء", en: "Build" } },
          { k: "deep", icon: "✨", label: { ar: "التعمّق", en: "Deepen" } },
        ];
  eras.forEach((er) => {
    const c = document.createElement("div");
    const active =
      activePath().id === "prophet"
        ? activeStage.era === er.k ||
          (activeStage.era === "makkah" && er.k === "makkah")
        : (["intro", "core", "sentence"].includes(activeStage.era) &&
            er.k === "foundation") ||
          (["beliefs", "pillars", "i3rab"].includes(activeStage.era) &&
            er.k === "middle") ||
          (["reflection", "ethics", "patterns"].includes(activeStage.era) &&
            er.k === "deep");
    c.className = "era-card" + (active ? " active" : "");
    c.innerHTML = `<div class="e1">${er.icon}</div><div class="e2">${er.label[G.lang]}</div><div class="e3">${active ? activeStage.eraTheme[G.lang] : isAR() ? "مرحلة مقفلة بصريًا" : "Visual era"}</div>`;
    strip.appendChild(c);
  });
}
function renderStoryDots() {
  const wrap = byId("story-dots");
  wrap.innerHTML = "";
  activeStage.story[G.lang].forEach((_, i) => {
    const s = document.createElement("span");
    if (i === storyIndex) s.classList.add("active");
    wrap.appendChild(s);
  });
}
function updateStoryDots() {
  [...byId("story-dots").children].forEach((el, i) =>
    el.classList.toggle("active", i === storyIndex),
  );
}
function renderReferences() {
  const reading = byId("reading-list"),
    endorse = byId("endorse-list");
  reading.innerHTML = "";
  endorse.innerHTML = "";
  (activeStage.reading || activePath().refs).forEach((r) => {
    const item = document.createElement("div");
    item.className = "book-item";
    item.innerHTML = `<div class="b1">${r[0]}</div><div class="b2">${r[1]}</div>`;
    reading.appendChild(item);
  });
  const logItems = [
    [isAR() ? "📅 التاريخ" : "📅 Date", stageDateLabel(activeStage)],
    [isAR() ? "🎯 الهدف الرئيسي" : "🎯 Main Objective", activeStage.goal[G.lang]],
    [isAR() ? "🧭 محور المرحلة" : "🧭 Stage Focus", activeStage.focus[G.lang]],
  ];
  logItems.forEach((n) => {
    const item = document.createElement("div");
    item.className = "book-item";
    item.innerHTML = `<div class="b1">${n[0]}</div><div class="b2">${n[1]}</div>`;
    endorse.appendChild(item);
  });
}
function typeText(text, el) {
  clearInterval(typingTimer);
  el.textContent = "";
  let i = 0;
  const step = isAR() ? 20 : 14;
  typingDone = false;
  typingTimer = setInterval(() => {
    i++;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      clearInterval(typingTimer);
      typingDone = true;
    }
  }, step);
}
function showStoryParagraph(index) {
  const arr = activeStage.story[G.lang];
  if (index >= arr.length) {
    beginQuiz();
    return;
  }
  storyIndex = index;
  updateStoryDots();
  byId("story-next").textContent =
    index === arr.length - 1 ? t().startQuiz : t().next;
  const challenge =
    activeStage.quiz[index]?.q[G.lang] ||
    activeStage.quiz[activeStage.quiz.length - 1].q[G.lang];
  byId("story-text").innerHTML = `<div class="story-scene-shell"><div class="story-scene-head"><span class="scene-chip">${t().storyScene} ${index + 1}</span><span class="scene-chip">${stageDateLabel(activeStage)}</span></div><div class="story-scene-line" id="story-line"></div><div class="story-scene-grid"><div class="scene-block"><div class="k">${t().storyFocusLabel}</div><div class="v">${activeStage.focus[G.lang]}</div></div><div class="scene-block"><div class="k">${t().storyGoalLabel}</div><div class="v">${activeStage.goal[G.lang]}</div></div><div class="scene-block scene-block-wide"><div class="k">${t().storyChallengeLabel}</div><div class="v">${challenge}</div></div></div></div>`;
  typeText(arr[index], byId("story-line"));
}
function storyNext() {
  if (!typingDone) {
    clearInterval(typingTimer);
    const line = byId("story-line");
    if (line) line.textContent = activeStage.story[G.lang][storyIndex];
    typingDone = true;
    return;
  }
  showStoryParagraph(storyIndex + 1);
}
function storySkip() {
  clearInterval(typingTimer);
  beginQuiz();
}
function beginQuiz() {
  quizIndex = 0;
  quizScore = 0;
  G.combo = 0;
  renderQuiz();
  screen("quiz");
}
function renderQuiz() {
  const q = activeStage.quiz[quizIndex];
  byId("quiz-count").textContent =
    `${quizIndex + 1} / ${activeStage.quiz.length}`;
  byId("quiz-progress").style.width =
    ((quizIndex + 1) / activeStage.quiz.length) * 100 + "%";
  byId("question-text").textContent = q.q[G.lang];
  byId("feedback").textContent = "";
  byId("feedback").className = "feedback";
  const grid = byId("answer-grid");
  grid.innerHTML = "";
  const keys = isAR() ? ["أ", "ب", "ج", "د"] : ["A", "B", "C", "D"];
  q.o[G.lang].forEach((opt, i) => {
    const el = document.createElement("button");
    el.className = "answer";
    el.innerHTML = `<div class="answer-key">${keys[i]}</div><div class="answer-text">${opt}</div>`;
    el.onclick = () => pickAnswer(i, q.a);
    grid.appendChild(el);
  });
  byId("combo").classList.toggle("on", G.combo >= 2);
  byId("combo").textContent = `🔥 ${G.combo}× Combo`;
  byId("booster-perfect").classList.toggle(
    "active",
    quizScore === quizIndex && quizIndex > 0,
  );
  byId("booster-speed").classList.remove("active");
  updateHUD();
  answerLocked = false;
  questionStart = performance.now();
}
function pickAnswer(selected, correct) {
  if (answerLocked) return;
  answerLocked = true;
  const answers = [...byId("answer-grid").children],
    fast = performance.now() - questionStart < 4500,
    ok = selected === correct;
  if (ok) {
    quizScore++;
    G.combo++;
    G.bestCombo = Math.max(G.bestCombo, G.combo);
  } else G.combo = 0;
  answers.forEach((el, i) => {
    el.classList.add("locked");
    if (i === correct) el.classList.add("correct");
    else if (i === selected && !ok) el.classList.add("wrong");
    else if (i !== selected) el.classList.add("dim");
  });
  const fb = byId("feedback");
  if (ok) {
    fb.textContent = t().correct[quizScore % t().correct.length];
    fb.classList.add("ok");
    addFXBurst(activePath().color);
    floatXP("+" + (fast ? 20 : 15) + " XP");
    byId("booster-speed").classList.toggle("active", fast);
    beep(680, 0.05, "triangle");
  } else {
    fb.textContent = t().wrong;
    fb.classList.add("no");
    beep(180, 0.08, "sawtooth");
  }
  setTimeout(() => {
    if (quizIndex < activeStage.quiz.length - 1) {
      quizIndex++;
      renderQuiz();
    } else finishQuiz();
  }, 1300);
}
function finishQuiz() {
  const total = activeStage.quiz.length,
    perfect = quizScore === total,
    stars = perfect ? 3 : quizScore >= 1 ? 2 : 1,
    speedBonus = G.combo >= 2 ? 10 : 0,
    perfectBonus = perfect ? 20 : 0,
    xpGain = stars * 20 + 15 + speedBonus + perfectBonus,
    gemGain = stars >= 2 ? 1 : 0,
    oldLevel = G.level;
  if (!G.completed[G.path].includes(activeStage.id))
    G.completed[G.path].push(activeStage.id);
  G.stars[G.path][activeStage.id] = Math.max(
    G.stars[G.path][activeStage.id] || 0,
    stars,
  );
  G.xp += xpGain;
  G.gems += gemGain;
  G.streak = perfect ? G.streak + 1 : 0;
  G.unlocked[G.path] = Math.min(
    activeStages().length,
    Math.max(G.unlocked[G.path], activeStage.id + 1),
  );
  lastResult = { stars, xpGain, gemGain, total, correct: quizScore, perfect };
  renderResult(lastResult);
  screen("result");
  historyStack = [];
  save();
  if (G.level > oldLevel)
    showToast(
      "⬆️",
      t().levelUp,
      (isAR() ? "وصلت إلى المستوى " : "Reached level ") + G.level,
    );
  setTimeout(() => checkAchievements(lastResult), 700);
  if (stars >= 2) confetti();
}
function renderResult(data) {
  const titles = t().resultTitles;
  byId("result-emoji").textContent =
    data.stars === 3 ? "🏆" : data.stars === 2 ? "🥇" : "💪";
  byId("result-title").textContent = titles[data.stars - 1];
  byId("result-sub").textContent = t().correctOut(data.correct, data.total);
  const wrap = byId("result-stars");
  wrap.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const s = document.createElement("span");
    s.textContent = "⭐";
    wrap.appendChild(s);
    setTimeout(() => s.classList.toggle("on", i < data.stars), 280 + i * 180);
  }
  byId("loot-xp").textContent = "+" + data.xpGain;
  byId("loot-gems").textContent = "+" + data.gemGain;
  byId("loot-streak").textContent = G.streak;
  byId("loot-rank").textContent = G.rank;
  byId("next-stage-btn").disabled = activeStage.id >= activeStages().length;
  updateHUD();
}
function nextStage() {
  if (activeStage.id >= activeStages().length) {
    renderMap();
    screen("map", false);
    return;
  }
  beginStage(activeStage.id + 1);
}
function retryStage() {
  beginStage(activeStage.id);
}
function backToMap() {
  renderMap();
  screen("map", false);
}
function checkAchievements(ctx) {
  ACHIEVEMENTS.forEach((a) => {
    if (G.achievements.includes(a.id)) return;
    const ok = a.check.length === 1 ? a.check(G) : a.check(G, ctx);
    if (ok) {
      G.achievements.push(a.id);
      showAchievement(a.icon, t().achievement, a.name[G.lang]);
      save();
    }
  });
  updateHUD();
}
