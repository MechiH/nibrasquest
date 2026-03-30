function showPaths() {
  renderPaths();
  screen("paths");
}
async function startJourney() {
  const ready = await ensureIdentityForJourneyStart();
  if (!ready) return;
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
function activePathSequence() {
  return getPathOrder().filter((id) => PATHS[id]);
}
function isPathCompleted(pathId) {
  const path = PATHS[pathId];
  if (!path) return false;
  return (G.completed[pathId] || []).length >= path.stages.length;
}
function pathLockDependency(pathId) {
  const ordered = activePathSequence();
  const idx = ordered.indexOf(pathId);
  if (idx <= 0) return null;
  const requiredPathId = ordered[idx - 1];
  return isPathCompleted(requiredPathId) ? null : requiredPathId;
}

/* ── Path Rendering ── */
function renderPaths() {
  ensureState();
  const allActivePaths = activePathSequence().map((id) => PATHS[id]).filter(Boolean);
  const disabledPaths = Object.values(DISABLED_PATHS);
  const getPathStats = (path) => {
    const done = (G.completed[path.id] || []).length;
    const total = path.stages.length;
    const stars = Object.values(G.stars[path.id] || {}).reduce((a, b) => a + b, 0);
    const nextStage = Math.min(total, G.unlocked[path.id] || 1);
    return { done, total, stars, nextStage, progress: total ? done / total : 0 };
  };
  const lp = byId("level-picker");
  if (lp) {
    lp.innerHTML = "";
    lp.classList.add("hidden");
  }
  const totalStages = allActivePaths.reduce((acc, p) => acc + p.stages.length, 0);
  const completedStages = allActivePaths.reduce((acc, p) => acc + (G.completed[p.id] || []).length, 0);
  const progressPct = totalStages ? Math.round((completedStages / totalStages) * 100) : 0;
  const userLabel = G.username || (isAR() ? "قيد الإنشاء" : "Preparing");
  const dashboard = byId("paths-dashboard");
  dashboard.innerHTML = `
    <div class="path-dash-card glass"><div class="path-dash-k">${t().initiativeUserLabel}</div><div class="path-dash-v user">${userLabel}</div></div>
    <div class="path-dash-card glass"><div class="path-dash-k">${t().initiativeTotalLabel}</div><div class="path-dash-v">${formatMoney(G.donations.totalCents)}</div></div>
    <div class="path-dash-card glass"><div class="path-dash-k">${t().pathsCompleted}</div><div class="path-dash-v">${completedStages}/${totalStages}</div></div>
    <div class="path-dash-card glass"><div class="path-dash-k">${t().initiativeStepsLabel}</div><div class="path-dash-v">${G.donations.stepsFunded}</div></div>`;
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
    const difficulty = getPathDifficulty(path.id);
    const rateMultiplier = getPathDonationMultiplier(path.id);
    const dependencyPathId = pathLockDependency(path.id);
    const isLockedByPath = Boolean(dependencyPathId);
    const state = isLockedByPath
      ? "locked"
      : done === 0
        ? "fresh"
        : done >= total
          ? "mastered"
          : "active";
    const stateLabel = state === "fresh"
      ? t().pathsFreshState
      : state === "mastered"
        ? t().pathsMasteredState
        : state === "locked"
          ? t().pathsLockedState
          : t().pathsActiveState;
    const card = document.createElement("div");
    card.className = "path-card glass"
      + (path.id === G.path ? " selected" : "")
      + (isLockedByPath ? " locked-chain" : "");
    card.style.setProperty("--path-color", path.color);
    card.style.animationDelay = `${80 + index * 40}ms`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    const dependencyName = dependencyPathId ? PATHS[dependencyPathId]?.name?.[G.lang] : "";
    const lockNote = dependencyName
      ? `<div class="path-lock-note">${t().pathsLockedBy(dependencyName)}</div>`
      : "";
    card.innerHTML = `<div class="path-card-aura"></div><div class="path-top"><div><div class="path-name">${path.name[G.lang]}</div><div class="path-desc">${path.desc[G.lang]}</div></div><div class="path-badge">${iconHTML(path.icon, "path-icon")}</div></div>
    ${path.source ? `<div class="path-source"><span>${t().sourceLabel}:</span> ${path.source[G.lang]}</div>` : ""}
    <div class="path-meta"><div class="meta-pill">${path.stages.length} ${isAR() ? "مراحل" : "Stages"}</div><div class="meta-pill">${levelName(difficulty)}</div><div class="meta-pill">x${rateMultiplier}</div><div class="meta-pill">${iconHTML("star", "meta-pill-icon icon-gold")} ${stars}</div><div class="meta-pill">${done}/${total}</div></div><div class="path-progress"><span style="width:${p}%"></span></div><div class="path-track"><div class="path-track-k">${t().pathsNextQuest}</div><div class="path-track-v">${t().chapterOf(nextStage, total)}</div></div>${lockNote}<div class="path-footer"><div class="path-state path-state-${state}">${stateLabel}</div><button class="path-enter" type="button" ${isLockedByPath ? "disabled" : ""}>${isLockedByPath ? t().pathsLockedState : t().pathsEnter}</button></div>`;
    card.onclick = () => {
      if (isLockedByPath) {
        showToast("lock", t().pathLockedTitle, dependencyName ? t().pathsLockedBy(dependencyName) : t().pathLockedTitle);
        return;
      }
      selectPath(path.id);
    };
    card.querySelector(".path-enter").onclick = (e) => {
      e.stopPropagation();
      if (isLockedByPath) {
        showToast("lock", t().pathLockedTitle, dependencyName ? t().pathsLockedBy(dependencyName) : t().pathLockedTitle);
        return;
      }
      selectPath(path.id);
    };
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
    card.innerHTML = `<div class="path-card-aura"></div><div class="path-top"><div><div class="path-name">${path.name[G.lang]}</div><div class="path-desc">${path.desc[G.lang]}</div></div><div class="path-badge">${iconHTML(path.icon, "path-icon")}</div></div><div class="path-footer"><div class="path-state path-state-coming">${t().pathsComingSoon}</div></div>`;
    grid.appendChild(card);
  });
  renderLeaderboard();
}
function selectPath(id) {
  const dependencyPathId = pathLockDependency(id);
  if (dependencyPathId) {
    const dependencyName = PATHS[dependencyPathId]?.name?.[G.lang] || "";
    showToast("lock", t().pathLockedTitle, dependencyName ? t().pathsLockedBy(dependencyName) : t().pathLockedTitle);
    return;
  }
  G.path = id;
  G.pathSeen[id] = true;
  updateUnlockedByLevel();
  renderMap();
  screen("map");
  save();
}
function updateUnlockedByLevel() {
  const path = activePath();
  const len = path.stages.length;
  const completedSet = new Set((G.completed[G.path] || []).map((v) => Number(v)));
  let next = 1;
  for (let stageId = 1; stageId <= len; stageId++) {
    if (!completedSet.has(stageId)) break;
    next = stageId + 1;
  }
  G.unlocked[G.path] = Math.min(len + 1, next);
}

/* ── Popup ── */
function openPopup(st) {
  const done = isStageCompleted(G.path, st.id), starCount = G.stars[G.path][st.id] || 0;
  const pc = byId("popup-card");
  pc.innerHTML = `<button class="close" id="close-popup">${iconHTML("fa-solid fa-xmark", "icon-dim")}</button>
    <div class="popup-head">
      <div class="popup-ico">${iconHTML(st.icon, "stage-icon icon-gold")}</div>
      <div class="popup-kicker">${t().chapterOf(st.id, activeStages().length)} • ${stageDateLabel(st)}</div>
      <div class="popup-title">${st.title[G.lang]}</div>
      <div class="popup-era">${st.eraLabel[G.lang]}</div>
    </div>
    <div style="display:flex;justify-content:center;gap:8px;margin:10px 0 4px">${[0, 1, 2].map((i) => `<span style="font-size:20px;opacity:${i < starCount ? 1 : 0.18}">${iconHTML("star", "icon-gold")}</span>`).join("")}</div>
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
  const target = e?.target;
  const closeButton = target?.closest ? target.closest("#close-popup") : null;
  if (!e || target === byId("popup") || closeButton) byId("popup").classList.remove("on");
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
  setHTML("story-icon", iconHTML(activeStage.icon, "stage-icon icon-gold"));
  byId("story-title").textContent = activeStage.title[G.lang];
  byId("story-date").textContent = `${t().storyDate}: ${stageDateLabel(activeStage)}`;
  const pathMultiplier = getPathDonationMultiplier(G.path);
  const stepValue = getEffectiveStepDonationCents(G.path);
  const stageStepsTotal = stepValue * activeStage.steps.length;
  const perfectTotal = stageStepsTotal + (PERFECT_DONATION_BONUS_CENTS * pathMultiplier);
  setText("story-reward-step-label", t().storyRewardPerStep);
  setText("story-reward-stage-label", t().storyRewardStage);
  setText("story-reward-perfect-label", t().storyRewardPerfect);
  setText("story-reward-step-value", formatMoney(stepValue));
  setText("story-reward-stage-value", formatMoney(stageStepsTotal));
  setText("story-reward-perfect-value", formatMoney(perfectTotal));
}
const PATH_PERIODS = {
  prophet: [
    { eras: ["jahiliyyah", "birth"], icon: "landmark", label: { ar: "قبل البعثة", en: "Pre-Revelation" }, color: "#8B6914" },
    { eras: ["character", "revelation"], icon: "lightbulb", label: { ar: "البعثة والوحي", en: "Revelation" }, color: "#E8D44D" },
    { eras: ["struggle", "hijra"], icon: "fire", label: { ar: "الابتلاء والهجرة", en: "Trials & Hijra" }, color: "#D4603A" },
    { eras: ["madinah", "legacy"], icon: "mosque", label: { ar: "المدينة والإرث", en: "Madinah & Legacy" }, color: "#2E8B57" },
  ],
  essentials: [
    { eras: ["tawheed", "pillars"], icon: "landmark", label: { ar: "العقيدة والأركان", en: "Creed & Pillars" }, color: "#10b981" },
    { eras: ["taharah", "salah"], icon: "droplet", label: { ar: "الطهارة والصلاة", en: "Purity & Prayer" }, color: "#38bdf8" },
    { eras: ["sawm", "zakat"], icon: "moon", label: { ar: "الصيام والزكاة", en: "Fasting & Zakat" }, color: "#8b5cf6" },
    { eras: ["halal", "akhlaq"], icon: "scale", label: { ar: "الحلال والأخلاق", en: "Halal & Character" }, color: "#f59e0b" },
  ],
};
function renderEraStrip() {
  const strip = byId("era-strip");
  strip.innerHTML = "";
  const periods = PATH_PERIODS[G.path] || PATH_PERIODS.prophet;
  periods.forEach((p) => {
    const active = p.eras.includes(activeStage.era);
    const c = document.createElement("div");
    c.className = "era-card" + (active ? " active" : "");
    if (active) c.style.setProperty("--era-card-color", activeStage.eraColor || p.color);
    c.innerHTML = `<div class="e1">${iconHTML(active ? activeStage.eraIcon : p.icon, "era-icon")}</div><div class="e2">${active ? activeStage.eraLabel[G.lang] : p.label[G.lang]}</div><div class="e3">${active ? activeStage.eraTheme[G.lang] : ""}</div>`;
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
    ev.innerHTML = `<div class="timeline-event-node">${i < index ? iconHTML("check-circle", "icon-emerald timeline-node-icon") : i + 1}</div><div class="timeline-event-label"><div class="timeline-event-title">${step.title[G.lang]}</div></div>`;
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
  summaryEv.innerHTML = `<div class="timeline-event-node"><span class="summary-glyph${index > summaryIndex ? " done" : ""}"></span></div><div class="timeline-event-label"><div class="timeline-event-title">${t().storySummaryTitle}</div></div>`;
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
          return `<div class="summary-kp${checkedPoints[ck] ? " checked" : ""}"><span class="summary-kp-icon">${checkedPoints[ck] ? iconHTML("check-circle", "icon-emerald") : iconHTML("dot-circle", "icon-dim")}</span><span>${pt}</span></div>`;
        }).join("")}</div>
      </div>`;
    }).join("");

    card.innerHTML =
      `<div class="step-header summary-header"><div class="step-number summary-icon">${iconHTML("file-lines", "icon-soft-light")}</div><div class="step-info"><div class="step-title-text">${t().storySummaryTitle}</div><div class="step-label">${t().storySummaryDesc}</div></div></div>` +
      `<div class="summary-all-points">${allKeyPoints}</div>` +
      `<div class="summary-reading-section">` +
        `<div class="summary-reading-header"><span>${iconHTML("book-reader", "icon-gold")}</span><span>${t().storyDeepReadingTitle}</span></div>` +
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
      `<div class="key-points-section"><div class="key-points-header"><span class="key-points-icon">${iconHTML("check-circle", "icon-emerald")}</span><span>${t().storyKeyPoints}</span><span class="key-points-count" id="kp-count-${index}">0/${keyPoints.length}</span></div>` +
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
  byId("combo").innerHTML = `${iconHTML("bolt", "icon-gold combo-fa")}<span>${G.combo}x Combo</span>`;
  byId("booster-perfect").classList.toggle("active", quizScore === quizIndex && quizIndex > 0);
  byId("booster-speed").classList.remove("active");
  byId("booster-potion").classList.toggle("active", Boolean(G.boost?.isActive));
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
    floatXP(
      fast
        ? "+" + formatMoney(SPEED_DONATION_BONUS_CENTS)
        : (isAR() ? "تعلّم مستمر" : "Keep learning"),
    );
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
  const total = activeStage.quiz.length;
  const perfect = quizScore === total;
  const oldLevel = G.level;
  const wasCompleted = isStageCompleted(G.path, activeStage.id);
  const firstPerfectCompletion = perfect && !wasCompleted;
  const passedStrict = firstPerfectCompletion || wasCompleted;

  let stars = wasCompleted ? Number(G.stars[G.path][activeStage.id] || 3) : 0;
  let xpGain = 0;
  let gemGain = 0;
  let stepDonationCents = 0;
  let speedDonationCents = 0;
  let perfectDonationCents = 0;
  let pathBonusCents = 0;
  let pathRateMultiplier = getPathDonationMultiplier(G.path);
  let donationMultiplier = 1;
  let baseDonationCents = 0;
  let donationGainCents = 0;
  let donationEvent = null;
  if (firstPerfectCompletion) {
    stars = 3;
    const speedBonusXP = G.combo >= 2 ? 10 : 0;
    const perfectBonusXP = 20;
    xpGain = stars * 20 + 15 + speedBonusXP + perfectBonusXP;
    gemGain = 1;
    markStageCompleted(G.path, activeStage.id);
    G.stars[G.path][activeStage.id] = Math.max(G.stars[G.path][activeStage.id] || 0, stars);
    G.xp += xpGain;
    G.gems += gemGain;
    G.streak += 1;
    updateUnlockedByLevel();

    const stepCount = activeStage.steps.length;
    stepDonationCents = stepCount * G.donationPerStepCents;
    speedDonationCents = G.combo >= 2 ? SPEED_DONATION_BONUS_CENTS : 0;
    perfectDonationCents = PERFECT_DONATION_BONUS_CENTS;
    const pathJustCompleted = G.completed[G.path].length >= activeStages().length;
    if (pathJustCompleted && !G.completedPathBonuses[G.path]) {
      pathBonusCents = PATH_COMPLETION_BONUS_CENTS;
      G.completedPathBonuses[G.path] = true;
    }
    const rawDonationCents =
      stepDonationCents +
      speedDonationCents +
      perfectDonationCents +
      pathBonusCents;
    baseDonationCents = rawDonationCents * pathRateMultiplier;
    const boostIsActive =
      Boolean(G.boost?.isActive) &&
      Number(G.boost?.activeMultiplier || 1) > 1 &&
      Number(G.boost?.activeUntil || 0) > Date.now();
    donationMultiplier = boostIsActive
      ? Math.max(1, Math.floor(Number(G.boost.activeMultiplier || 1)))
      : 1;
    donationGainCents = Math.floor(baseDonationCents * donationMultiplier);
    if (donationGainCents > 0) {
      G.donations.fromStepsCents += donationGainCents;
      G.donations.totalCents += donationGainCents;
      G.donations.stepsFunded += stepCount;
      donationEvent = {
        eventKey: `stage:${G.path}:${activeStage.id}`,
        source: "stage_step",
        amountCents: donationGainCents,
        baseAmountCents: baseDonationCents,
        pathId: G.path,
        stageId: activeStage.id,
        stepCount,
        note: donationMultiplier > 1
          ? `Learning completion donation (path x${pathRateMultiplier}, boost x${donationMultiplier})`
          : `Learning completion donation (path x${pathRateMultiplier})`,
      };
    }
  } else {
    G.streak = 0;
  }
  lastResult = {
    stars,
    xpGain,
    gemGain,
    total,
    correct: quizScore,
    perfect,
    passedStrict,
    replayNoReward: perfect && wasCompleted,
    donationGainCents,
    donationMultiplier,
    pathRateMultiplier,
    stepDonationCents,
    speedDonationCents,
    perfectDonationCents,
    pathBonusCents,
  };
  renderResult(lastResult);
  screen("result");
  historyStack = [];
  save();
  syncProgress({ donationEvent }).then(() => {
    updateHUD();
    renderPaths();
    refreshLeaderboard();
  });
  if (firstPerfectCompletion && G.level > oldLevel)
    showToast("lightbulb", t().levelUp, (isAR() ? "ارتفع أثرك إلى المستوى " : "Your impact reached level ") + G.level);
  if (!passedStrict) {
    showToast("lock", t().strictPerfectTitle, t().strictPerfectMessage);
  } else if (perfect && wasCompleted) {
    showToast("info", t().replayNoRewardTitle, t().replayNoRewardText);
  }
  if (firstPerfectCompletion) {
    setTimeout(() => checkAchievements(lastResult), 700);
    if (stars >= 2) confetti();
  }
}
function renderResult(data) {
  const titles = t().resultTitles;
  if (!data.passedStrict) {
    setHTML("result-emoji", iconHTML("lock", "result-icon icon-rose"));
    byId("result-title").textContent = t().strictPerfectTitle;
    byId("result-sub").textContent = t().strictPerfectResult(data.correct, data.total);
  } else if (data.replayNoReward) {
    setHTML("result-emoji", iconHTML("rotate", "result-icon icon-sky"));
    byId("result-title").textContent = t().replayNoRewardTitle;
    byId("result-sub").textContent = t().replayNoRewardText;
  } else {
    const resultIcon = data.stars === 3 ? "trophy" : data.stars === 2 ? "medal" : "dumbbell";
    setHTML("result-emoji", iconHTML(resultIcon, "result-icon icon-gold"));
    byId("result-title").textContent = titles[Math.max(0, data.stars - 1)] || titles[0];
    byId("result-sub").textContent = t().correctOut(data.correct, data.total);
  }
  const wrap = byId("result-stars");
  wrap.innerHTML = "";
  const stars = Math.max(0, Math.min(3, Number(data.stars || 0)));
  for (let i = 0; i < 3; i++) {
    const s = document.createElement("span");
    s.innerHTML = iconHTML("star", "icon-gold");
    wrap.appendChild(s);
    setTimeout(() => s.classList.toggle("on", i < stars), 280 + i * 180);
  }
  byId("loot-xp").textContent = "+" + formatMoney(data.donationGainCents || 0);
  byId("loot-gems").textContent = formatMoney(G.donations.totalCents);
  byId("loot-streak").textContent = G.donations.stepsFunded;
  byId("loot-rank").textContent = leaderboardRankText();
  byId("next-stage-btn").disabled = !data.passedStrict || activeStage.id >= activeStages().length;
  updateHUD();
}
function nextStage() {
  if (!isStageCompleted(G.path, activeStage.id)) {
    showToast("lock", t().strictPerfectTitle, t().strictPerfectMessage);
    return;
  }
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
