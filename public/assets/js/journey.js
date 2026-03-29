function showPaths() {
  renderPaths();
  screen("paths");
}
function startJourney() {
  showPaths();
}

/* ── Helpers ── */
const STAGE_TIMELINE = {
  prophet: { 1: { ar: "قبل 610م", en: "Before 610 CE" }, 2: { ar: "570م", en: "570 CE" }, 3: { ar: "قبل البعثة", en: "Pre-Prophethood" }, 4: { ar: "610م", en: "610 CE" }, 5: { ar: "613-622م", en: "613-622 CE" }, 6: { ar: "622م", en: "622 CE" }, 7: { ar: "624-632م", en: "624-632 CE" }, 8: { ar: "632م وما بعد", en: "632 CE & Beyond" } },
};
function stageDateLabel(st) {
  return STAGE_TIMELINE[activePath().id]?.[st.id]?.[G.lang] || (isAR() ? `المرحلة ${st.id}` : `Stage ${st.id}`);
}
function stageThemeKey(st) {
  const era = st.era;
  if (["jahiliyyah", "birth"].includes(era)) return "origin";
  if (["character", "revelation"].includes(era)) return "rise";
  if (["struggle", "hijra"].includes(era)) return "trial";
  if (["madinah"].includes(era)) return "glory";
  return "legacy";
}
function applyStoryTheme() {
  const shell = document.querySelector("#story .story-shell");
  if (!shell || !activeStage) return;
  shell.setAttribute("data-theme", stageThemeKey(activeStage));
  shell.setAttribute("data-era", activeStage.era);
  /* Set era gradient on body */
  if (activeStage.eraGradient) {
    document.body.style.setProperty("--era-bg1", activeStage.eraGradient[0]);
    document.body.style.setProperty("--era-bg2", activeStage.eraGradient[1]);
    document.body.style.setProperty("--era-bg3", activeStage.eraGradient[2] || activeStage.eraGradient[0]);
  }
  if (activeStage.eraColor) {
    document.body.style.setProperty("--era-accent", activeStage.eraColor);
  }
}

/* ── Checked key-points tracker (per session) ── */
let checkedPoints = {};
function getCheckKey(stageId, stepIdx, pointIdx) { return `${stageId}-${stepIdx}-${pointIdx}`; }

/* ── Path Rendering ── */
function renderPaths() {
  ensureState();
  const allActivePaths = Object.values(PATHS);
  const disabledPaths = Object.values(DISABLED_PATHS);
  const getPathStats = (path) => {
    const done = (G.completed[path.id] || []).length;
    const total = path.stages.length;
    const stars = Object.values(G.stars[path.id] || {}).reduce((a, b) => a + b, 0);
    const nextStage = Math.min(total, G.unlocked[path.id] || 1);
    return { done, total, stars, nextStage, progress: total ? done / total : 0 };
  };
  const lp = byId("level-picker");
  lp.innerHTML = "";
  LEVELS.forEach((l) => {
    const b = document.createElement("button");
    b.className = "level-pill" + (G.levelStart === l ? " active" : "");
    b.textContent = levelName(l);
    b.onclick = () => { G.levelStart = l; renderPaths(); save(); };
    lp.appendChild(b);
  });
  const totalStages = allActivePaths.reduce((acc, p) => acc + p.stages.length, 0);
  const completedStages = allActivePaths.reduce((acc, p) => acc + (G.completed[p.id] || []).length, 0);
  const progressPct = totalStages ? Math.round((completedStages / totalStages) * 100) : 0;
  const dashboard = byId("paths-dashboard");
  dashboard.innerHTML = `
    <div class="path-dash-card glass"><div class="path-dash-k">${t().level}</div><div class="path-dash-v">LV ${G.level}</div></div>
    <div class="path-dash-card glass"><div class="path-dash-k">⭐ ${isAR() ? "نجوم" : "Stars"}</div><div class="path-dash-v">${G.totalStars}</div></div>
    <div class="path-dash-card glass"><div class="path-dash-k">${t().pathsCompleted}</div><div class="path-dash-v">${completedStages}/${totalStages}</div></div>
    <div class="path-dash-card glass"><div class="path-dash-k">${t().pathsProgress}</div><div class="path-dash-v">${progressPct}%</div></div>`;
  const filterWrap = byId("path-filters");
  filterWrap.innerHTML = "";
  const filters = [
    { id: "all", label: t().pathsFilterAll },
    { id: "fresh", label: t().pathsFilterFresh },
    { id: "active", label: t().pathsFilterActive },
    { id: "mastered", label: t().pathsFilterMastered },
  ];
  filters.forEach((f) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "path-filter" + (pathFilter === f.id ? " active" : "");
    btn.textContent = f.label;
    btn.onclick = () => { pathFilter = f.id; renderPaths(); };
    filterWrap.appendChild(btn);
  });
  const grid = byId("path-grid");
  grid.innerHTML = "";
  /* Active paths */
  allActivePaths.forEach((path, index) => {
    const { done, total, stars, nextStage, progress } = getPathStats(path);
    const p = Math.round(progress * 100);
    const state = done === 0 ? "fresh" : done >= total ? "mastered" : "active";
    const stateLabel = state === "fresh" ? t().pathsFreshState : state === "mastered" ? t().pathsMasteredState : t().pathsActiveState;
    const card = document.createElement("div");
    card.className = "path-card glass" + (path.id === G.path ? " selected" : "");
    card.style.setProperty("--path-color", path.color);
    card.style.animationDelay = `${80 + index * 40}ms`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.innerHTML = `<div class="path-card-aura"></div><div class="path-top"><div><div class="path-name">${path.name[G.lang]}</div><div class="path-desc">${path.desc[G.lang]}</div></div><div class="path-badge">${path.icon}</div></div>
    ${path.source ? `<div class="path-source"><span>${t().sourceLabel}:</span> ${path.source[G.lang]}</div>` : ""}
    <div class="path-meta"><div class="meta-pill">${path.stages.length} ${isAR() ? "مراحل" : "Stages"}</div><div class="meta-pill">${levelName(G.levelStart)}</div><div class="meta-pill">⭐ ${stars}</div><div class="meta-pill">${done}/${total}</div></div><div class="path-progress"><span style="width:${p}%"></span></div><div class="path-track"><div class="path-track-k">${t().pathsNextQuest}</div><div class="path-track-v">${t().chapterOf(nextStage, total)}</div></div><div class="path-footer"><div class="path-state path-state-${state}">${stateLabel}</div><button class="path-enter" type="button">${t().pathsEnter}</button></div>`;
    card.onclick = () => selectPath(path.id);
    card.querySelector(".path-enter").onclick = (e) => { e.stopPropagation(); selectPath(path.id); };
    card.onpointermove = (e) => {
      if (!matchMedia("(hover: hover)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      card.style.transform = `translateY(-5px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg)`;
    };
    card.onpointerleave = () => { card.style.transform = ""; };
    grid.appendChild(card);
  });
  /* Disabled (coming soon) paths */
  disabledPaths.forEach((path, index) => {
    const card = document.createElement("div");
    card.className = "path-card glass disabled";
    card.style.setProperty("--path-color", path.color);
    card.style.animationDelay = `${80 + (allActivePaths.length + index) * 40}ms`;
    card.innerHTML = `<div class="path-card-aura"></div><div class="path-top"><div><div class="path-name">${path.name[G.lang]}</div><div class="path-desc">${path.desc[G.lang]}</div></div><div class="path-badge">${path.icon}</div></div><div class="path-footer"><div class="path-state path-state-coming">${t().pathsComingSoon}</div></div>`;
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
  const path = activePath(), len = path.stages.length;
  let base = 1;
  if (G.levelStart === "intermediate") base = Math.min(2, len);
  if (G.levelStart === "advanced") base = Math.min(3, len);
  G.unlocked[G.path] = Math.max(G.unlocked[G.path] || 1, base);
}

/* ── Popup ── */
function openPopup(st) {
  const done = isStageCompleted(G.path, st.id), starCount = G.stars[G.path][st.id] || 0;
  const pc = byId("popup-card");
  pc.innerHTML = `<button class="close" id="close-popup">✕</button>
    <div class="popup-head">
      <div class="popup-ico">${st.icon}</div>
      <div class="popup-kicker">${t().chapterOf(st.id, activeStages().length)} • ${stageDateLabel(st)}</div>
      <div class="popup-title">${st.title[G.lang]}</div>
      <div class="popup-era">${st.eraLabel[G.lang]}</div>
    </div>
    <div style="display:flex;justify-content:center;gap:6px;margin:10px 0 4px">${[0, 1, 2].map((i) => `<span style="font-size:22px;opacity:${i < starCount ? 1 : 0.18}">⭐</span>`).join("")}</div>
    <div class="popup-desc">${t().popupDesc}</div>
    <div class="popup-focus"><strong>${t().deepFocus}:</strong> ${st.focus[G.lang]}</div>
    <div class="popup-focus"><strong>${t().deepGoal}:</strong> ${st.goal[G.lang]}</div>
    <div class="popup-steps-count">${st.steps.length} ${isAR() ? "خطوات تعليمية" : "learning steps"} + ${st.quiz.length} ${isAR() ? "أسئلة" : "questions"}</div>
    <button class="popup-btn" id="begin-stage">${done ? t().replay : t().begin}</button>`;
  byId("popup").classList.add("on");
  byId("close-popup").onclick = closePopup;
  byId("begin-stage").onclick = () => beginStage(st.id);
}
function closePopup(e) {
  if (!e || e.target === byId("popup") || e.target.id === "close-popup") byId("popup").classList.remove("on");
}

/* ── Story (Step-based learning) ── */
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
  showStoryStep(0);
  screen("story");
}
function renderStoryHeader() {
  byId("story-chapter").textContent = t().chapterOf(activeStage.id, activeStages().length);
  byId("story-icon").textContent = activeStage.icon;
  byId("story-title").textContent = activeStage.title[G.lang];
  byId("story-date").textContent = `${t().storyDate}: ${stageDateLabel(activeStage)}`;
}
function renderEraStrip() {
  const strip = byId("era-strip");
  strip.innerHTML = "";
  /* Group 8 eras into 4 visual periods */
  const periods = [
    { eras: ["jahiliyyah", "birth"], icon: "🏜️", label: { ar: "قبل البعثة", en: "Pre-Revelation" }, theme: { ar: "التمهيد والنشأة", en: "Preparation" }, color: "#8B6914" },
    { eras: ["character", "revelation"], icon: "🕯️", label: { ar: "البعثة والوحي", en: "Revelation" }, theme: { ar: "الصدق والرسالة", en: "Truth & Message" }, color: "#E8D44D" },
    { eras: ["struggle", "hijra"], icon: "🔥", label: { ar: "الابتلاء والهجرة", en: "Trials & Hijra" }, theme: { ar: "الصبر والتحول", en: "Patience & Shift" }, color: "#D4603A" },
    { eras: ["madinah", "legacy"], icon: "🕌", label: { ar: "المدينة والإرث", en: "Madinah & Legacy" }, theme: { ar: "البناء والخلود", en: "Nation & Eternity" }, color: "#2E8B57" },
  ];
  periods.forEach((p) => {
    const active = p.eras.includes(activeStage.era);
    const c = document.createElement("div");
    c.className = "era-card" + (active ? " active" : "");
    if (active) c.style.setProperty("--era-card-color", activeStage.eraColor || p.color);
    c.innerHTML = `<div class="e1">${active ? activeStage.eraIcon : p.icon}</div><div class="e2">${active ? activeStage.eraLabel[G.lang] : p.label[G.lang]}</div><div class="e3">${active ? activeStage.eraTheme[G.lang] : ""}</div>`;
    strip.appendChild(c);
  });
}
function renderStoryDots() {
  const wrap = byId("story-dots");
  wrap.innerHTML = "";
  /* Regular step dots + 1 summary dot */
  const total = activeStage.steps.length + 1;
  for (let i = 0; i < total; i++) {
    const s = document.createElement("span");
    if (i === storyIndex) s.classList.add("active");
    if (i === total - 1) s.classList.add("summary-dot");
    wrap.appendChild(s);
  }
}
function updateStoryDots() {
  [...byId("story-dots").children].forEach((el, i) => el.classList.toggle("active", i === storyIndex));
}
function renderReferences() {
  const reading = byId("reading-list"), endorse = byId("endorse-list");
  reading.innerHTML = "";
  endorse.innerHTML = "";
  (activeStage.reading || activePath().refs).forEach((r) => {
    const item = document.createElement("div");
    item.className = "book-item";
    item.innerHTML = `<div class="b1">${r[0]}</div><div class="b2">${r[1]}</div>`;
    reading.appendChild(item);
  });
  /* Timeline log: steps as checkpoints */
  activeStage.steps.forEach((step, i) => {
    const item = document.createElement("div");
    item.className = "book-item";
    item.innerHTML = `<div class="b1">${t().storyCheckpoint} ${i + 1} • ${step.title[G.lang]}</div><div class="b2">${step.narrative[G.lang].slice(0, 80)}…</div>`;
    endorse.appendChild(item);
  });
}

/* ── Show a single step ── */
function showStoryStep(index) {
  const steps = activeStage.steps;
  const summaryIndex = steps.length; /* virtual summary step */
  if (index > summaryIndex) { beginQuiz(); return; }
  storyIndex = index;
  updateStoryDots();

  /* Always hide the static reference-board section */
  const refBoard = document.querySelector(".reference-board");
  if (refBoard) refBoard.style.display = "none";

  const isSummary = index === summaryIndex;
  byId("story-next").textContent = isSummary ? t().startQuiz : t().next;

  /* Timeline track — regular steps + summary node */
  const track = byId("timeline-track");
  track.innerHTML = "";
  steps.forEach((step, i) => {
    const state = i < index ? "done" : i === index ? "active" : "next";
    const ev = document.createElement("div");
    ev.className = `timeline-event ${state}`;
    ev.innerHTML = `<div class="timeline-event-node">${i < index ? "✓" : i + 1}</div><div class="timeline-event-label"><div class="timeline-event-title">${step.title[G.lang]}</div></div>`;
    ev.onclick = () => { if (i <= storyIndex) showStoryStep(i); };
    track.appendChild(ev);
    /* connector after each step */
    const conn = document.createElement("div");
    conn.className = `timeline-connector${i < index ? " filled" : ""}`;
    conn.innerHTML = `<div class="timeline-connector-line"><span></span></div>`;
    track.appendChild(conn);
  });
  /* Summary node at the end */
  const summaryState = isSummary ? "active" : index > summaryIndex ? "done" : "next";
  const summaryEv = document.createElement("div");
  summaryEv.className = `timeline-event ${summaryState} summary-node`;
  summaryEv.innerHTML = `<div class="timeline-event-node">${isSummary ? "📋" : index > summaryIndex ? "✓" : "📋"}</div><div class="timeline-event-label"><div class="timeline-event-title">${t().storySummaryTitle}</div></div>`;
  summaryEv.onclick = () => { if (storyIndex >= summaryIndex - 1) showStoryStep(summaryIndex); };
  track.appendChild(summaryEv);

  const activeEl = track.querySelector(".timeline-event.active");
  if (activeEl) setTimeout(() => activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }), 60);

  /* Content card */
  const card = byId("story-event-content");
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "";

  if (isSummary) {
    /* ── Summary step ── */
    const readingItems = (activeStage.reading || activePath().refs)
      .map((r) => `<div class="book-item"><div class="b1">${r[0]}</div><div class="b2">${r[1]}</div></div>`)
      .join("");

    const allKeyPoints = steps.map((step, si) => {
      const pts = step.keyPoints[G.lang];
      return `<div class="summary-step-group">
        <div class="summary-step-title"><span class="summary-step-num">${si + 1}</span>${step.title[G.lang]}</div>
        <div class="summary-kp-list">${pts.map((pt, pi) => {
          const ck = getCheckKey(activeStage.id, si, pi);
          return `<div class="summary-kp${checkedPoints[ck] ? " checked" : ""}"><span class="summary-kp-icon">${checkedPoints[ck] ? "✅" : "○"}</span><span>${pt}</span></div>`;
        }).join("")}</div>
      </div>`;
    }).join("");

    card.innerHTML =
      `<div class="step-header summary-header"><div class="step-number summary-icon">📋</div><div class="step-info"><div class="step-title-text">${t().storySummaryTitle}</div><div class="step-label">${t().storySummaryDesc}</div></div></div>` +
      `<div class="summary-all-points">${allKeyPoints}</div>` +
      `<div class="summary-reading-section">` +
        `<div class="summary-reading-header"><span>📚</span><span>${t().storyDeepReadingTitle}</span></div>` +
        `<div class="summary-reading-desc">${t().storyDeepReadingDesc}</div>` +
        `<div class="summary-reading-list">${readingItems}</div>` +
      `</div>`;
  } else {
    /* ── Regular content step ── */
    const step = steps[index];
    const narrative = step.narrative[G.lang];
    const keyPoints = step.keyPoints[G.lang];
    const stepLabel = isAR() ? `الخطوة ${index + 1} من ${steps.length}` : `Step ${index + 1} of ${steps.length}`;

    card.innerHTML =
      `<div class="step-header"><div class="step-number">${index + 1}</div><div class="step-info"><div class="step-title-text">${step.title[G.lang]}</div><div class="step-label">${stepLabel}</div></div></div>` +
      `<div class="story-content-main"><p>${narrative}</p></div>` +
      `<div class="key-points-section"><div class="key-points-header"><span class="key-points-icon">✅</span><span>${t().storyKeyPoints}</span><span class="key-points-count" id="kp-count-${index}">0/${keyPoints.length}</span></div>` +
      `<div class="key-points-list">${keyPoints.map((point, pi) => {
        const ck = getCheckKey(activeStage.id, index, pi);
        const checked = checkedPoints[ck];
        return `<label class="key-point${checked ? " checked" : ""}"><input type="checkbox" ${checked ? "checked" : ""} data-ck="${ck}" data-idx="${index}" data-total="${keyPoints.length}"><span class="kp-check"></span><span class="kp-text">${point}</span></label>`;
      }).join("")}</div></div>`;

    /* Bind checkbox events */
    card.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.onchange = () => {
        const ck = cb.dataset.ck;
        checkedPoints[ck] = cb.checked;
        cb.parentElement.classList.toggle("checked", cb.checked);
        updateKeyPointCount(parseInt(cb.dataset.idx), parseInt(cb.dataset.total));
      };
    });
    updateKeyPointCount(index, keyPoints.length);
  }

  /* Scroll content card into view */
  setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}
function updateKeyPointCount(stepIdx, total) {
  let count = 0;
  for (let i = 0; i < total; i++) {
    if (checkedPoints[getCheckKey(activeStage.id, stepIdx, i)]) count++;
  }
  const el = byId(`kp-count-${stepIdx}`);
  if (el) el.textContent = `${count}/${total}`;
}
function storyNext() { showStoryStep(storyIndex + 1); }
function storySkip() { clearInterval(typingTimer); beginQuiz(); }

/* ── Quiz ── */
function beginQuiz() {
  quizIndex = 0;
  quizScore = 0;
  G.combo = 0;
  renderQuiz();
  screen("quiz");
}
function renderQuiz() {
  const q = activeStage.quiz[quizIndex];
  byId("quiz-count").textContent = `${quizIndex + 1} / ${activeStage.quiz.length}`;
  byId("quiz-progress").style.width = ((quizIndex + 1) / activeStage.quiz.length) * 100 + "%";
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
  byId("booster-perfect").classList.toggle("active", quizScore === quizIndex && quizIndex > 0);
  byId("booster-speed").classList.remove("active");
  updateHUD();
  answerLocked = false;
  questionStart = performance.now();
}
function pickAnswer(selected, correct) {
  if (answerLocked) return;
  answerLocked = true;
  const answers = [...byId("answer-grid").children], fast = performance.now() - questionStart < 4500, ok = selected === correct;
  if (ok) { quizScore++; G.combo++; G.bestCombo = Math.max(G.bestCombo, G.combo); } else G.combo = 0;
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
    if (quizIndex < activeStage.quiz.length - 1) { quizIndex++; renderQuiz(); }
    else finishQuiz();
  }, 1300);
}
function finishQuiz() {
  const total = activeStage.quiz.length, perfect = quizScore === total;
  const stars = perfect ? 3 : quizScore >= 1 ? 2 : 1;
  const speedBonus = G.combo >= 2 ? 10 : 0, perfectBonus = perfect ? 20 : 0;
  const xpGain = stars * 20 + 15 + speedBonus + perfectBonus, gemGain = stars >= 2 ? 1 : 0, oldLevel = G.level;
  markStageCompleted(G.path, activeStage.id);
  G.stars[G.path][activeStage.id] = Math.max(G.stars[G.path][activeStage.id] || 0, stars);
  G.xp += xpGain;
  G.gems += gemGain;
  G.streak = perfect ? G.streak + 1 : 0;
  G.unlocked[G.path] = Math.min(activeStages().length + 1, Math.max(G.unlocked[G.path], activeStage.id + 1));
  if (G.completed[G.path].length >= activeStages().length) G.unlocked[G.path] = activeStages().length + 1;
  lastResult = { stars, xpGain, gemGain, total, correct: quizScore, perfect };
  renderResult(lastResult);
  screen("result");
  historyStack = [];
  save();
  if (G.level > oldLevel)
    showToast("⬆️", t().levelUp, (isAR() ? "وصلت إلى المستوى " : "Reached level ") + G.level);
  setTimeout(() => checkAchievements(lastResult), 700);
  if (stars >= 2) confetti();
}
function renderResult(data) {
  const titles = t().resultTitles;
  byId("result-emoji").textContent = data.stars === 3 ? "🏆" : data.stars === 2 ? "🥇" : "💪";
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
  if (activeStage.id >= activeStages().length) { renderMap(); screen("map", false); return; }
  beginStage(activeStage.id + 1);
}
function retryStage() { beginStage(activeStage.id); }
function backToMap() { renderMap(); screen("map", false); }
function checkAchievements(ctx) {
  ACHIEVEMENTS.forEach((a) => {
    if (G.achievements.includes(a.id)) return;
    const ok = a.check.length === 1 ? a.check(G) : a.check(G, ctx);
    if (ok) { G.achievements.push(a.id); showAchievement(a.icon, t().achievement, a.name[G.lang]); save(); }
  });
  updateHUD();
}
