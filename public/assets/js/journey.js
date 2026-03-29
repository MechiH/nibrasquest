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
  const shell = document.querySelector("#story .story-shell");
  if (!shell || !activeStage) return;
  shell.setAttribute("data-theme", stageThemeKey(activeStage));
}
function sceneQuestion(index) {
  return activeStage.quiz[index]?.q[G.lang] ||
    activeStage.quiz[activeStage.quiz.length - 1].q[G.lang];
}
function sceneLore(index) {
  const refs = activeStage.reading || activePath().refs || [];
  const entry = refs[index % Math.max(1, refs.length)] || [
    isAR() ? "مرجع المرحلة" : "Stage Reference",
    isAR() ? "توسعة معرفية مرتبطة بالمشهد الحالي." : "Context extension for this scene.",
  ];
  if (isAR()) {
    return [
      `مرجع المشهد: ${entry[0]}.`,
      `زاوية التحليل: ${entry[1]}.`,
      `المحور المعرفي: ${activeStage.focus[G.lang]}.`,
      `إطار المرحلة: ${activeStage.eraLabel[G.lang]} (${stageDateLabel(activeStage)}).`,
      `لماذا يهم الآن: يربط الحدث بسياقه قبل سؤال البوابة.`,
      "نقطة مراجعة: حدّد السبب التاريخي ثم أثره التربوي في سطرين.",
    ].join("\n");
  }
  return [
    `Scene source: ${entry[0]}.`,
    `Analysis lens: ${entry[1]}.`,
    `Knowledge axis: ${activeStage.focus[G.lang]}.`,
    `Stage frame: ${activeStage.eraLabel[G.lang]} (${stageDateLabel(activeStage)}).`,
    "Why this matters now: it anchors the event before the gate question.",
    "Review point: identify one cause and one educational impact in two lines.",
  ].join("\n");
}
function sceneMission(index) {
  const q = sceneQuestion(index);
  if (isAR()) {
    return [
      "1. لخّص الفكرة المركزية في سطر واحد واضح.",
      "2. التقط كلمة مفتاح تقود معنى المشهد.",
      `3. أجب عن سؤال البوابة: ${q}`,
      "4. اربط الدرس بموقف عملي من واقعك أو فريقك.",
      "5. اختر قرارًا واحدًا ستطبّقه قبل الانتقال للمحطة التالية.",
      "6. راجع الخطأ الشائع في هذا المشهد وتجاوزه قبل الضغط على التالي.",
    ].join("\n");
  }
  return [
    "1. Summarize the core idea in one clear line.",
    "2. Capture one keyword that drives this checkpoint.",
    `3. Answer the gate question: ${q}`,
    "4. Connect the lesson to one practical case from real life or team work.",
    "5. Commit to one action before moving to the next checkpoint.",
    "6. Identify and avoid the common misunderstanding in this checkpoint.",
  ].join("\n");
}
function sceneReward(index, total) {
  const xp = 15 + index * 5;
  const finalStep = index === total - 1;
  const gem = index === total - 1 ? 1 : 0;
  if (isAR()) {
    return [
      `+${xp} XP أساسي عند إكمال هذه المحطة.`,
      "⭐ فرصة نجمة إضافية عند دقة كاملة.",
      "🔥 الحفاظ على السلسلة يضاعف أثر التقدّم في المرحلة.",
      `💎 احتمالية الجوهرة: ${gem ? "مضمونة عند الإتقان" : "تزداد كلما ثبت الأداء"}.`,
      `🎖️ وسام المرحلة: ${activeStage.title[G.lang]} / ${activeStage.eraTheme[G.lang]}.`,
      finalStep
        ? "🏁 بعد هذه المحطة يُفتح اختبار المرحلة الكامل."
        : "🔓 بعد هذه المحطة تُفتح المحطة التالية مباشرة.",
      "📦 مكسب طويل المدى: فتح محتوى أعمق في لوحة القراءات.",
    ].join("\n");
  }
  return [
    `+${xp} base XP for clearing this checkpoint.`,
    "⭐ Extra star chance with full accuracy.",
    "🔥 Keeping your streak increases progression impact.",
    `💎 Gem chance: ${gem ? "guaranteed on mastery" : "increases with stable performance"}.`,
    `🎖️ Stage badge: ${activeStage.title[G.lang]} / ${activeStage.eraTheme[G.lang]}.`,
    finalStep
      ? "🏁 Completing this checkpoint unlocks the full stage quiz."
      : "🔓 Completing this checkpoint unlocks the next checkpoint.",
    "📦 Long-term gain: deeper content opens in the reading board.",
  ].join("\n");
}
function sceneArcLine(index, total) {
  if (isAR()) {
    if (index === 0)
      return "هذه بداية القوس السردي؛ ركّز على الصورة الكبرى قبل التفاصيل.";
    if (index === total - 1)
      return "هذه محطة الإغلاق؛ ثبّت الفكرة حتى تدخل الاختبار بثبات.";
    return "هذه محطة الربط؛ حوّل الفهم النظري إلى قرار عملي واضح.";
  }
  if (index === 0)
    return "This opens the narrative arc; focus on the big picture first.";
  if (index === total - 1)
    return "This closes the arc; lock the concept before the quiz.";
  return "This is a bridge checkpoint; convert theory into practical judgment.";
}
function sceneSignal(index) {
  if (isAR()) {
    return [
      "إشارة لعبور أسرع: حدّد السبب والنتيجة داخل القصة.",
      "ضع كلمة مفتاح واحدة تلخّص المشهد.",
      "راجع السؤال المحوري قبل الضغط على التالي.",
    ][index % 3];
  }
  return [
    "Fast-pass hint: identify cause and consequence inside the scene.",
    "Set one keyword that captures this checkpoint.",
    "Review the gate question before hitting next.",
  ][index % 3];
}
function sceneStepTitle(line) {
  const words = line.replace(/[.,،:؛!?]/g, " ").trim().split(/\s+/).filter(Boolean);
  const short = words.slice(0, 5).join(" ");
  return words.length > 5 ? `${short}…` : short;
}
function sceneNarrative(base, index, total) {
  const checkpoint = `${t().storyCheckpoint} ${index + 1}/${total}`;
  const gateQuestion = sceneQuestion(index);
  const nextTitle =
    activeStage.story[G.lang][index + 1] != null
      ? sceneStepTitle(activeStage.story[G.lang][index + 1])
      : null;
  const prophetMode = activePath().id === "prophet";
  if (isAR()) {
    const summary = prophetMode
      ? `ملخص ما جرى في حقبة السيرة: ${base}`
      : `ملخص ما جرى في هذه المحطة: ${base}`;
    const shortAnalysis = prophetMode
      ? `تحليل قصير: هذا الحدث يخدم محور "${activeStage.focus[G.lang]}" ويقود لهدف "${activeStage.goal[G.lang]}". ${sceneArcLine(index, total)}`
      : `تحليل قصير: هذه المحطة تبني فهم "${activeStage.focus[G.lang]}" لتحقيق "${activeStage.goal[G.lang]}". ${sceneArcLine(index, total)}`;
    return [
      `${checkpoint} • ${stageDateLabel(activeStage)}`,
      summary,
      shortAnalysis,
      `سؤال التحقق: ${gateQuestion}`,
      nextTitle
        ? `إذا اتضحت الصورة عندك الآن، فالمحطة القادمة ستكون: ${nextTitle}، وهناك ستنتقل القصة من الفهم العام إلى قرار أدق داخل نفس المسار.`
        : "هذه آخر محطة في القوس السردي؛ بعد تثبيت الفكرة الكبرى ستدخل الاختبار وأنت تمتلك صورة متماسكة لا مجرد عناوين متفرقة.",
      `إشارة تثبيت أخيرة: ${sceneSignal(index).replace("إشارة لعبور أسرع: ", "")}`,
    ].join("\n\n");
  }
  const summary = prophetMode
    ? `What happened in this Prophet-era checkpoint: ${base}`
    : `What happened in this checkpoint: ${base}`;
  const shortAnalysis = prophetMode
    ? `Short analysis: this event serves "${activeStage.focus[G.lang]}" and advances "${activeStage.goal[G.lang]}". ${sceneArcLine(index, total)}`
    : `Short analysis: this checkpoint develops "${activeStage.focus[G.lang]}" to reach "${activeStage.goal[G.lang]}". ${sceneArcLine(index, total)}`;
  return [
    `${checkpoint} • ${stageDateLabel(activeStage)}`,
    summary,
    shortAnalysis,
    `Verification question: ${gateQuestion}`,
    nextTitle
      ? `If this checkpoint is clear, the next scene will be: ${nextTitle}, where the narrative moves from broad understanding to sharper judgment.`
      : "This is the closing checkpoint of the arc. Lock the core idea now so the quiz feels like continuation, not recall.",
    `Final lock-in cue: ${sceneSignal(index).replace("Fast-pass hint: ", "")}`,
  ].join("\n\n");
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
  const done = isStageCompleted(G.path, st.id),
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
  activeStage.story[G.lang].forEach((line, i) => {
    const shortLine = line.length > 84 ? `${line.slice(0, 84)}…` : line;
    const item = document.createElement("div");
    item.className = "book-item";
    item.innerHTML = `<div class="b1">${t().storyCheckpoint} ${i + 1} • ${stageDateLabel(activeStage)}</div><div class="b2">${shortLine}</div>`;
    endorse.appendChild(item);
  });
}
function typeText(text, el) {
  clearInterval(typingTimer);
  el.textContent = text;
  typingDone = false;
  typingDone = true;
}
function isSpecialEvent(index, total) {
  return index === 0 || index === total - 1 || index === Math.floor(total / 2);
}
function eventIcon(index, total) {
  if (index === 0) return "🌅";
  if (index === total - 1) return "🏁";
  if (index === Math.floor(total / 2)) return "⚡";
  return String(index + 1);
}
function eventBadgeText(index, total) {
  if (index === 0) return isAR() ? "البداية" : "Origin";
  if (index === total - 1) return isAR() ? "الخاتمة" : "Finale";
  if (index === Math.floor(total / 2)) return isAR() ? "حدث محوري" : "Key Event";
  return "";
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

  /* ── timeline ── */
  const track = byId("timeline-track");
  track.innerHTML = "";
  arr.forEach((line, i) => {
    const state = i < index ? "done" : i === index ? "active" : "next";
    const special = isSpecialEvent(i, arr.length);
    const ev = document.createElement("div");
    ev.className = `timeline-event ${state}${special ? " special" : ""}`;
    const nodeContent = special ? eventIcon(i, arr.length) : String(i + 1);
    const badge = eventBadgeText(i, arr.length);
    const doneLabel = isAR() ? "✓" : "✓";
    ev.innerHTML = `<div class="timeline-event-node">${nodeContent}</div><div class="timeline-event-label"><div class="timeline-event-title">${sceneStepTitle(line)}</div><div class="timeline-event-date">${stageDateLabel(activeStage)} • +${15 + i * 5} XP</div>${badge ? `<div class="timeline-event-badge">${state === "done" ? doneLabel : badge}</div>` : ""}</div>`;
    ev.onclick = () => showStoryParagraph(i);
    track.appendChild(ev);
    if (i < arr.length - 1) {
      const conn = document.createElement("div");
      conn.className = `timeline-connector${i < index ? " filled" : ""}`;
      conn.innerHTML = `<div class="timeline-connector-line"><span></span></div>`;
      track.appendChild(conn);
    }
  });
  const activeEl = track.querySelector(".timeline-event.active");
  if (activeEl) {
    setTimeout(() => activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }), 60);
  }

  /* ── content card ── */
  const card = byId("story-event-content");
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "";

  const storyText = arr[index];
  const checkpoint = `${t().storyCheckpoint} ${index + 1}/${arr.length}`;
  const gateQ = sceneQuestion(index);
  const analysisLabel = isAR() ? "التحليل" : "Analysis";
  const hintLabel = isAR() ? "إشارة" : "Hint";
  const analysis = isAR()
    ? `هذه المحطة تبني فهم "${activeStage.focus[G.lang]}" لتحقيق "${activeStage.goal[G.lang]}". ${sceneArcLine(index, arr.length)}`
    : `This checkpoint develops "${activeStage.focus[G.lang]}" to reach "${activeStage.goal[G.lang]}". ${sceneArcLine(index, arr.length)}`;
  const hint = sceneSignal(index);

  card.innerHTML =
    `<div class="story-content-main"><p>${storyText}</p></div>` +
    `<div class="story-content-sections">` +
      `<div class="story-section"><div class="story-section-label">${analysisLabel}</div><div class="story-section-text">${analysis}</div></div>` +
      `<div class="story-section"><div class="story-section-label">${hintLabel}</div><div class="story-section-text">${hint}</div></div>` +
    `</div>` +
    `<div class="story-gate-q"><span class="gate-icon">❓</span><span class="gate-text">${gateQ}</span></div>`;
}
function storyNext() {
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
  markStageCompleted(G.path, activeStage.id);
  G.stars[G.path][activeStage.id] = Math.max(
    G.stars[G.path][activeStage.id] || 0,
    stars,
  );
  G.xp += xpGain;
  G.gems += gemGain;
  G.streak = perfect ? G.streak + 1 : 0;
  G.unlocked[G.path] = Math.min(
    activeStages().length + 1,
    Math.max(G.unlocked[G.path], activeStage.id + 1),
  );
  if (G.completed[G.path].length >= activeStages().length)
    G.unlocked[G.path] = activeStages().length + 1;
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
