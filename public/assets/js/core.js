const G = {
  lang: "ar",
  xp: 0,
  gems: 0,
  streak: 0,
  combo: 0,
  bestCombo: 0,
  stars: {},
  completed: {},
  unlocked: {},
  achievements: [],
  sound: true,
  path: "prophet",
  pathSeen: {},
  levelStart: "beginner",
  get totalStars() {
    return Object.values(this.stars).reduce(
      (a, b) => a + Object.values(b || {}).reduce((x, y) => x + y, 0),
      0,
    );
  },
  get level() {
    return Math.floor(this.xp / 100) + 1;
  },
  get levelXP() {
    return this.xp % 100;
  },
  get rank() {
    return "R" + Math.min(9, Math.floor(this.xp / 120) + 1);
  },
};
let currentScreen = "title",
  historyStack = [],
  pathFilter = "all",
  activeStage = null,
  storyIndex = 0,
  typingTimer = null,
  typingDone = false,
  quizIndex = 0,
  quizScore = 0,
  answerLocked = false,
  questionStart = 0,
  lastResult = null;
const $ = (s) => document.querySelector(s),
  byId = (id) => document.getElementById(id),
  t = () => COPY[G.lang],
  isAR = () => G.lang === "ar",
  activePath = () => PATHS[G.path],
  activeStages = () => activePath().stages;
const STORAGE_KEY = "nibras-quest-paths";
const LEGACY_STORAGE_KEY = "noor-quest-paths";
function normalizeCompleted(pathId) {
  const len = PATHS[pathId].stages.length;
  const cleaned = [...new Set((G.completed[pathId] || [])
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v >= 1 && v <= len))].sort(
    (a, b) => a - b,
  );
  G.completed[pathId] = cleaned;
}
function isStageCompleted(pathId, stageId) {
  return (G.completed[pathId] || []).includes(Number(stageId));
}
function markStageCompleted(pathId, stageId) {
  const id = Number(stageId);
  if (!Number.isFinite(id)) return;
  if (!G.completed[pathId]) G.completed[pathId] = [];
  if (!isStageCompleted(pathId, id)) G.completed[pathId].push(id);
  normalizeCompleted(pathId);
}
function ensureState() {
  Object.keys(PATHS).forEach((pid) => {
    if (!G.completed[pid]) G.completed[pid] = [];
    if (!G.unlocked[pid]) G.unlocked[pid] = 1;
    if (!G.stars[pid]) G.stars[pid] = {};
    normalizeCompleted(pid);
    const len = PATHS[pid].stages.length;
    const unlocked = Number(G.unlocked[pid]);
    G.unlocked[pid] = Number.isFinite(unlocked)
      ? Math.min(len + 1, Math.max(1, Math.floor(unlocked)))
      : 1;
    if (G.completed[pid].length >= len) G.unlocked[pid] = len + 1;
  });
}
function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      lang: G.lang,
      xp: G.xp,
      gems: G.gems,
      streak: G.streak,
      combo: G.combo,
      bestCombo: G.bestCombo,
      stars: G.stars,
      completed: G.completed,
      unlocked: G.unlocked,
      achievements: G.achievements,
      sound: G.sound,
      path: G.path,
      pathSeen: G.pathSeen,
      levelStart: G.levelStart,
    }),
  );
}
function load() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    Object.assign(G, JSON.parse(raw) || {});
  } catch (e) {}
}
function screen(id, push = true) {
  if (push && currentScreen !== id) historyStack.push(currentScreen);
  document
    .querySelectorAll(".screen")
    .forEach((el) => el.classList.remove("on"));
  byId(id).classList.add("on");
  currentScreen = id;
  byId("backWrap").classList.toggle(
    "hidden",
    id === "title" || historyStack.length === 0,
  );
}
function back() {
  if (!historyStack.length) return;
  const prev = historyStack.pop();
  if (prev === "map") renderMap();
  if (prev === "paths") renderPaths();
  screen(prev, false);
}
function setLang(lang) {
  G.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.classList.toggle("en", lang === "en");
  byId("lang-ar").classList.toggle("active", lang === "ar");
  byId("lang-en").classList.toggle("active", lang === "en");
  refreshText();
  if (currentScreen === "paths") renderPaths();
  if (currentScreen === "map") renderMap();
  if (currentScreen === "story" && activeStage) {
    renderStoryHeader();
    renderEraStrip();
    renderReferences();
    showStoryParagraph(storyIndex);
  }
  if (currentScreen === "quiz" && activeStage) renderQuiz();
  if (currentScreen === "result" && lastResult) renderResult(lastResult);
  save();
}
function levelName(key) {
  return t()[key];
}
function refreshText() {
  byId("hero-kicker").textContent = t().heroKicker;
  byId("hero-logo").textContent = t().logo;
  byId("hero-sub").textContent = t().heroSub;
  byId("mission-copy").textContent = t().mission;
  byId("start-btn").textContent = t().start;
  byId("demo-btn").textContent = t().demo;
  byId("chip-1").textContent = t().chip1;
  byId("chip-2").textContent = t().chip2;
  byId("chip-3").textContent = t().chip3;
  byId("chip-4").textContent = t().chip4;
  byId("paths-title").textContent = t().pathsTitle;
  byId("paths-sub").textContent = t().pathsSub;
  byId("path-control-copy").textContent = t().pathsControl;
  byId("level-label").textContent = t().level;
  byId("map-label").textContent = t().mapLabel;
  byId("map-title").textContent = activePath().name[G.lang];
  byId("panel-title").textContent = t().panelTitle;
  byId("panel-copy").textContent = t().panelCopy;
  byId("panel-toggle-label").textContent = t().panelToggle;
  byId("deep-focus-label").textContent = t().deepFocus;
  byId("deep-goal-label").textContent = t().deepGoal;
  byId("deep-books-label").textContent = t().deepBooks;
  byId("reading-title").textContent = t().readingTitle;
  byId("reading-copy").textContent = t().readingCopy;
  byId("endorse-title").textContent = t().endorseTitle;
  byId("endorse-copy").textContent = t().endorseCopy;
  byId("story-skip").textContent = t().skip;
  byId("quiz-label").textContent = t().quizLabel;
  byId("loot-gems-label").textContent = t().gem;
  byId("loot-streak-label").textContent = t().streak;
  byId("loot-rank-label").textContent = t().rank;
  byId("map-btn").textContent = t().map;
  byId("retry-btn").textContent = t().retry;
  byId("next-stage-btn").textContent = t().nextStage;
  byId("back-btn").textContent = isAR() ? "← رجوع" : "← Back";
  byId("mini-goal-label").textContent = t().goal;
  byId("mini-bonus-label").textContent = t().bonus;
  byId("mini-streak-label").textContent = t().streakLabel;
  ["reward-1", "reward-2", "reward-3"].forEach(
    (id, i) => (byId(id).textContent = t().rewards[i]),
  );
  updateHUD();
}
function updateHUD() {
  ensureState();
  byId("level-value").textContent = G.level;
  byId("xp-fill").style.width = G.levelXP + "%";
  byId("xp-text").textContent = G.xp + " XP";
  byId("stat-stars").textContent = G.totalStars;
  byId("stat-gems").textContent = G.gems;
  byId("stat-streak").textContent = G.streak;
  byId("stat-ach").textContent = G.achievements.length;
  byId("panel-rank").textContent = G.rank;
  const qp = byId("quest-progress");
  qp.innerHTML = "";
  activeStages().forEach((st) => {
    const d = document.createElement("div");
    d.className = "mini-dot";
    d.innerHTML = `<span style="width:${isStageCompleted(G.path, st.id) || st.id < G.unlocked[G.path] ? "100%" : "0%"}"></span>`;
    qp.appendChild(d);
  });
  byId("booster-combo").textContent =
    (isAR() ? "سلسلة: " : "Combo: ") + G.combo;
  byId("booster-perfect").textContent = t().perfectReady;
  byId("booster-speed").textContent = t().quick;
  byId("mini-goal-value").textContent = activeStage
    ? `${Math.min(quizIndex + 1, activeStage.quiz.length)}/${activeStage.quiz.length}`
    : `${G.completed[G.path].length}/${activeStages().length}`;
  byId("mini-bonus-value").textContent = "+" + (G.combo >= 2 ? 10 : 0) + " XP";
  byId("mini-streak-value").textContent = G.streak;
  byId("sound-toggle").textContent = (G.sound ? "🔊 " : "🔈 ") + "SFX";
  byId("sound-toggle").classList.toggle("active", G.sound);
  const nxt =
    activeStages().find((s) => !isStageCompleted(G.path, s.id)) ||
    activeStages()[activeStages().length - 1];
  byId("deep-focus-value").textContent = nxt.focus[G.lang];
  byId("deep-goal-value").textContent = nxt.goal[G.lang];
  const deep = byId("deep-books-list");
  deep.innerHTML = "";
  (nxt.reading || activePath().refs).slice(0, 3).forEach((r) => {
    const item = document.createElement("div");
    item.className = "book-item";
    item.innerHTML = `<div class="b1">${r[0]}</div><div class="b2">${r[1]}</div>`;
    deep.appendChild(item);
  });
}
