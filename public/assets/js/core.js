const DEFAULT_DONATION_PER_STEP_CENTS = 1;
const SPEED_DONATION_BONUS_CENTS = 5;
const PERFECT_DONATION_BONUS_CENTS = 10;
const PATH_COMPLETION_BONUS_CENTS = 15;
const DEFAULT_BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/urnzikfqg5";
const DEFAULT_GLOBAL_TARGET_CENTS = 100000;
const MONEY_DIVISOR = 1000;
const LEVEL_DONATION_MULTIPLIERS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function getPathOrder() {
  const loadedPathIds = Object.keys(PATHS || {});
  const preferred = Array.isArray(PATH_ORDER) ? PATH_ORDER : [];
  const ordered = preferred.filter((id) => loadedPathIds.includes(id));
  const rest = loadedPathIds.filter((id) => !ordered.includes(id));
  return [...ordered, ...rest];
}

function inferDifficultyFromIndex(index) {
  if (index === 1) return "intermediate";
  if (index >= 2) return "advanced";
  return "beginner";
}

function getPathDifficulty(pathId) {
  const path = PATHS[pathId] || DISABLED_PATHS[pathId] || {};
  const declared = String(path.difficulty || "").toLowerCase();
  if (LEVELS.includes(declared)) return declared;
  const order = getPathOrder();
  const idx = order.indexOf(pathId);
  return inferDifficultyFromIndex(idx >= 0 ? idx : 0);
}

function getDonationRateMultiplier(level) {
  return LEVEL_DONATION_MULTIPLIERS[level] || 1;
}

function getPathDonationMultiplier(pathId = G.path) {
  return getDonationRateMultiplier(getPathDifficulty(pathId));
}

function getEffectiveStepDonationCents(pathId = G.path) {
  return Math.max(1, Math.floor(G.donationPerStepCents * getPathDonationMultiplier(pathId)));
}

function defaultDonations() {
  return {
    fromStepsCents: 0,
    manualCents: 0,
    totalCents: 0,
    stepsFunded: 0,
  };
}

function defaultBoost() {
  return {
    potionBalance: 0,
    activeMultiplier: 1,
    activeUntil: 0,
    isActive: false,
  };
}

function defaultReferral() {
  return {
    inviteUrl: "",
    invitedCount: 0,
    studiedCount: 0,
  };
}

function defaultGlobalImpact() {
  return {
    totalCents: 0,
    targetCents: DEFAULT_GLOBAL_TARGET_CENTS,
    progressPct: 0,
    contributors: 0,
    stepsFunded: 0,
  };
}

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
  userId: "",
  username: "",
  donationPerStepCents: DEFAULT_DONATION_PER_STEP_CENTS,
  buyMeCoffeeUrl: DEFAULT_BUY_ME_A_COFFEE_URL,
  donations: defaultDonations(),
  boost: defaultBoost(),
  referral: defaultReferral(),
  globalImpact: defaultGlobalImpact(),
  leaderboard: {
    rank: null,
    top: [],
  },
  completedPathBonuses: {},
  updatedAt: 0,
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
let isNewUserSession = false;

const $ = (s) => document.querySelector(s),
  byId = (id) => document.getElementById(id),
  t = () => COPY[G.lang],
  isAR = () => G.lang === "ar",
  activePath = () => PATHS[G.path],
  activeStages = () => activePath().stages;

const STORAGE_KEY = "nibras-quest-paths";
const LEGACY_STORAGE_KEY = "noor-quest-paths";

function setText(id, value) {
  const el = byId(id);
  if (el) el.textContent = value;
}

function shareIconSVG(platform) {
  if (platform === "facebook") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2V10H8v3h2.3v8h3.2z"></path></svg>';
  }
  if (platform === "x") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.146 2H21l-6.73 7.69L22 22h-6.172l-4.833-6.343L5.44 22H2.584l7.2-8.228L2 2h6.328l4.37 5.77L18.146 2zm-1.082 18h1.58L7.47 3.895H5.776L17.064 20z"></path></svg>';
  }
  if (platform === "linkedin") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.5H3.56V20h3.38V8.5zm.22-3.56C7.16 3.86 6.29 3 5.25 3S3.34 3.86 3.34 4.94c0 1.07.86 1.94 1.9 1.94h.02c1.06 0 1.9-.87 1.9-1.94zM20.66 13.28c0-3.16-1.69-4.63-3.95-4.63-1.82 0-2.63 1-3.08 1.71V8.5h-3.38c.04 1.22 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.67.12-.91.27-.67.88-1.36 1.9-1.36 1.34 0 1.88 1.02 1.88 2.51V20H21s.04-5.7 0-6.72z"></path></svg>';
  }
  return "";
}

function setShareButton(id, label, platform) {
  const btn = byId(id);
  if (!btn) return;
  btn.innerHTML = `<span class="share-logo share-logo-${platform}">${shareIconSVG(platform)}</span>`;
  btn.setAttribute("aria-label", label);
  btn.title = label;
}

function escapeHTML(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeEnglishDigits(value) {
  return String(value || "")
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

function normalizeUsernameInput(value) {
  return normalizeEnglishDigits(value).replace(/\s+/g, " ").trim();
}

function formatMoney(cents) {
  const n = Number(cents || 0);
  return `$${(Math.max(0, n) / MONEY_DIVISOR).toFixed(3)}`;
}

function formatDurationLeft(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function leaderboardRankText() {
  return Number.isFinite(G.leaderboard.rank) && G.leaderboard.rank > 0
    ? `#${G.leaderboard.rank}`
    : "—";
}

function totalCompletedStages(state = G) {
  return Object.values(state.completed || {}).reduce((sum, list) => {
    if (!Array.isArray(list)) return sum;
    return sum + list.length;
  }, 0);
}

function normalizeDonationState() {
  if (!G.donations || typeof G.donations !== "object") {
    G.donations = defaultDonations();
  }
  G.donations.fromStepsCents = Number(G.donations.fromStepsCents || 0);
  G.donations.manualCents = Number(G.donations.manualCents || 0);
  G.donations.totalCents = Number(G.donations.totalCents || 0);
  G.donations.stepsFunded = Number(G.donations.stepsFunded || 0);

  G.donationPerStepCents = Number(G.donationPerStepCents || DEFAULT_DONATION_PER_STEP_CENTS);
  if (!Number.isFinite(G.donationPerStepCents) || G.donationPerStepCents <= 0) {
    G.donationPerStepCents = DEFAULT_DONATION_PER_STEP_CENTS;
  }

  if (!G.buyMeCoffeeUrl || typeof G.buyMeCoffeeUrl !== "string") {
    G.buyMeCoffeeUrl = DEFAULT_BUY_ME_A_COFFEE_URL;
  }

  if (!G.boost || typeof G.boost !== "object") {
    G.boost = defaultBoost();
  }
  applyServerBoost(G.boost);

  if (!G.referral || typeof G.referral !== "object") {
    G.referral = defaultReferral();
  }
  applyServerReferral(G.referral);

  if (!G.globalImpact || typeof G.globalImpact !== "object") {
    G.globalImpact = defaultGlobalImpact();
  }
  applyServerGlobalImpact(G.globalImpact);

  if (!G.leaderboard || typeof G.leaderboard !== "object") {
    G.leaderboard = { rank: null, top: [] };
  }
  if (!Array.isArray(G.leaderboard.top)) G.leaderboard.top = [];
  const numericRank = Number(G.leaderboard.rank);
  G.leaderboard.rank = Number.isFinite(numericRank) && numericRank > 0 ? numericRank : null;

  if (!G.completedPathBonuses || typeof G.completedPathBonuses !== "object") {
    G.completedPathBonuses = {};
  }
}

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
  normalizeDonationState();
  Object.keys(PATHS).forEach((pid) => {
    if (!G.completed[pid]) G.completed[pid] = [];
    if (!G.unlocked[pid]) G.unlocked[pid] = 1;
    if (!G.stars[pid]) G.stars[pid] = {};
    normalizeCompleted(pid);
    const len = PATHS[pid].stages.length;
    const completedSet = new Set((G.completed[pid] || []).map((v) => Number(v)));
    const strictCompleted = [];
    for (let stageId = 1; stageId <= len; stageId++) {
      if (!completedSet.has(stageId)) break;
      strictCompleted.push(stageId);
    }
    G.completed[pid] = strictCompleted;
    Object.keys(G.stars[pid] || {}).forEach((stageId) => {
      if (!strictCompleted.includes(Number(stageId))) {
        delete G.stars[pid][stageId];
      }
    });
    G.unlocked[pid] = Math.min(len + 1, strictCompleted.length + 1);
  });
}

function getPersistedState() {
  return {
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
    userId: G.userId,
    username: G.username,
    donationPerStepCents: G.donationPerStepCents,
    buyMeCoffeeUrl: G.buyMeCoffeeUrl,
    donations: G.donations,
    boost: G.boost,
    referral: G.referral,
    globalImpact: G.globalImpact,
    leaderboard: { rank: G.leaderboard.rank },
    completedPathBonuses: G.completedPathBonuses,
    updatedAt: Date.now(),
  };
}

function save() {
  const state = getPersistedState();
  G.updatedAt = state.updatedAt;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    Object.assign(G, JSON.parse(raw) || {});
  } catch (e) {}
  normalizeDonationState();
}

async function apiJSON(path, options = {}) {
  const method = options.method || "GET";
  const hasBody = options.body !== undefined;
  const res = await fetch(path, {
    method,
    headers: hasBody
      ? {
        "content-type": "application/json",
      }
      : undefined,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = payload?.error || `${method} ${path} failed (${res.status})`;
    throw new Error(reason);
  }
  return payload;
}

function applyServerDonations(donations) {
  if (!donations || typeof donations !== "object") return;
  G.donations = {
    fromStepsCents: Number(donations.fromStepsCents || 0),
    manualCents: Number(donations.manualCents || 0),
    totalCents: Number(donations.totalCents || 0),
    stepsFunded: Number(donations.stepsFunded || 0),
  };
}

function applyServerBoost(boost) {
  const source = boost && typeof boost === "object" ? boost : {};
  const now = Date.now();
  const activeUntil = Number(source.activeUntil || 0);
  const activeMultiplier = Number(source.activeMultiplier || 1);
  const isActive = Boolean(source.isActive) && activeUntil > now && activeMultiplier > 1;
  G.boost = {
    potionBalance: Math.max(0, Number(source.potionBalance || 0)),
    activeMultiplier: isActive ? Math.max(1, Math.floor(activeMultiplier)) : 1,
    activeUntil: isActive ? activeUntil : 0,
    isActive,
  };
}

function applyServerReferral(referral) {
  const source = referral && typeof referral === "object" ? referral : {};
  G.referral = {
    inviteUrl: String(source.inviteUrl || "").trim(),
    invitedCount: Math.max(0, Number(source.invitedCount || 0)),
    studiedCount: Math.max(0, Number(source.studiedCount || 0)),
  };
}

function applyServerGlobalImpact(globalImpact) {
  const source = globalImpact && typeof globalImpact === "object"
    ? globalImpact
    : {};
  G.globalImpact = {
    totalCents: Math.max(0, Number(source.totalCents || 0)),
    targetCents: Math.max(1, Number(source.targetCents || DEFAULT_GLOBAL_TARGET_CENTS)),
    progressPct: Math.max(0, Number(source.progressPct || 0)),
    contributors: Math.max(0, Number(source.contributors || 0)),
    stepsFunded: Math.max(0, Number(source.stepsFunded || 0)),
  };
}

function getReferralCodeFromURL() {
  try {
    const ref = new URLSearchParams(window.location.search).get("ref") || "";
    return String(ref).trim();
  } catch {
    return "";
  }
}

function getInviteUrl() {
  const fromState = String(G.referral?.inviteUrl || "").trim();
  if (fromState) return fromState;
  if (!G.userId) return window.location.href;
  const invite = new URL("/", window.location.origin);
  invite.searchParams.set("ref", G.userId);
  return invite.toString();
}

async function updateUsername(username) {
  if (!G.userId) throw new Error("Missing userId.");
  const cleaned = normalizeUsernameInput(username);
  if (cleaned.length < 3 || cleaned.length > 40) {
    throw new Error("Username must be between 3 and 40 characters.");
  }
  const res = await apiJSON("/api/username", {
    method: "POST",
    body: {
      userId: G.userId,
      username: cleaned,
    },
  });
  G.username = res.username || cleaned;
  markIdentityReady();
  isNewUserSession = false;
  updateInitiativePanel();
  updateHUD();
  save();
  await syncProgress();
  return G.username;
}

function identityReadyKey() {
  return `nibras-identity-ready:${G.userId || ""}`;
}

function isIdentityReady() {
  return Boolean(G.userId) && localStorage.getItem(identityReadyKey()) === "1";
}

function markIdentityReady() {
  if (!G.userId) return;
  localStorage.setItem(identityReadyKey(), "1");
}

function setIdentityModalOpen(open) {
  const modal = byId("identity-modal");
  if (!modal) return;
  modal.classList.toggle("on", open);
  modal.setAttribute("aria-hidden", open ? "false" : "true");
}

function setIdentityModalBusy(busy) {
  ["identity-use-generated-btn", "identity-continue-btn", "identity-cancel-btn", "identity-name-input"]
    .forEach((id) => {
      const el = byId(id);
      if (!el) return;
      el.disabled = busy;
    });
}

function setIdentityModalError(message = "") {
  const el = byId("identity-error");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("on", Boolean(message));
}

function openIdentityModal() {
  const modal = byId("identity-modal");
  if (!modal) return Promise.resolve(true);

  const generated = normalizeUsernameInput(G.username) || t().usernamePromptPlaceholder;
  const input = byId("identity-name-input");
  const useGeneratedBtn = byId("identity-use-generated-btn");
  const continueBtn = byId("identity-continue-btn");
  const cancelBtn = byId("identity-cancel-btn");

  setText("identity-generated-value", generated);
  if (input) {
    input.value = "";
    input.placeholder = t().identityInputPlaceholder || generated;
  }
  setIdentityModalError("");
  setIdentityModalBusy(false);
  setIdentityModalOpen(true);

  return new Promise((resolve) => {
    let finished = false;

    const finish = (result) => {
      if (finished) return;
      finished = true;
      modal.onclick = null;
      if (useGeneratedBtn) useGeneratedBtn.onclick = null;
      if (continueBtn) continueBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;
      if (input) input.onkeydown = null;
      setIdentityModalOpen(false);
      setIdentityModalError("");
      resolve(result);
    };

    const onCancel = () => finish(false);

    const onUseGenerated = () => {
      markIdentityReady();
      isNewUserSession = false;
      finish(true);
    };

    const onContinue = async () => {
      const raw = input ? input.value : "";
      const nextName = normalizeUsernameInput(raw || generated);
      if (nextName.length < 3 || nextName.length > 40) {
        setIdentityModalError(t().usernameInvalidText);
        return;
      }

      setIdentityModalBusy(true);
      setIdentityModalError("");
      try {
        if (nextName !== normalizeUsernameInput(G.username)) {
          await updateUsername(nextName);
        } else {
          markIdentityReady();
          isNewUserSession = false;
        }
        finish(true);
      } catch (err) {
        const message = String(err?.message || "").toLowerCase();
        if (message.includes("already taken")) {
          setIdentityModalError(t().usernameTakenText);
        } else {
          setIdentityModalError(t().identityErrorGeneric);
        }
      } finally {
        setIdentityModalBusy(false);
      }
    };

    modal.onclick = (event) => {
      if (event.target === modal) onCancel();
    };
    if (useGeneratedBtn) useGeneratedBtn.onclick = onUseGenerated;
    if (continueBtn) continueBtn.onclick = onContinue;
    if (cancelBtn) cancelBtn.onclick = onCancel;
    if (input) {
      input.onkeydown = (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onContinue();
        }
      };
      setTimeout(() => input.focus(), 0);
    }
  });
}

async function ensureIdentityForJourneyStart() {
  if (!G.userId) return true;
  if (isIdentityReady()) return true;
  if (!isNewUserSession) {
    markIdentityReady();
    return true;
  }
  return openIdentityModal();
}

async function bootstrapCloudState() {
  try {
    const params = new URLSearchParams();
    if (G.userId) params.set("userId", G.userId);
    const refCode = getReferralCodeFromURL();
    if (refCode && refCode !== G.userId) params.set("ref", refCode);
    const session = await apiJSON(`/api/session${params.toString() ? `?${params.toString()}` : ""}`);

    G.userId = session.userId || G.userId;
    G.username = session.username || G.username;
    isNewUserSession = Boolean(session.isNewUser);
    G.donationPerStepCents = Number(session.donationPerStepCents || G.donationPerStepCents || DEFAULT_DONATION_PER_STEP_CENTS);
    G.buyMeCoffeeUrl = session.buyMeCoffeeUrl || G.buyMeCoffeeUrl || DEFAULT_BUY_ME_A_COFFEE_URL;
    if (session.boost) applyServerBoost(session.boost);
    if (session.referral) applyServerReferral(session.referral);
    if (session.globalImpact) applyServerGlobalImpact(session.globalImpact);
    if (!isNewUserSession) markIdentityReady();
    if (session.donations) applyServerDonations(session.donations);
    if (Number.isFinite(session.rank) && session.rank > 0) {
      G.leaderboard.rank = Number(session.rank);
    }

    if (!G.userId) return;

    const remote = await apiJSON(`/api/progress?userId=${encodeURIComponent(G.userId)}`);
    const remoteProgress = remote.progress && typeof remote.progress === "object" ? remote.progress : null;

    if (remoteProgress) {
      const localCompleted = totalCompletedStages(G);
      const remoteCompleted = totalCompletedStages(remoteProgress);
      const localDonations = Number(G.donations.totalCents || 0);
      const remoteDonations = Number(remoteProgress?.donations?.totalCents || 0);
      const localUpdatedAt = Number(G.updatedAt || 0);
      const remoteUpdatedAt = Number(remote.updatedAt || remoteProgress.updatedAt || 0);

      const useRemote =
        remoteCompleted > localCompleted ||
        (remoteCompleted === localCompleted && remoteDonations > localDonations) ||
        (remoteCompleted === localCompleted && remoteDonations === localDonations && remoteUpdatedAt > localUpdatedAt);

      if (useRemote) {
        Object.assign(G, remoteProgress);
        G.userId = session.userId || G.userId;
        G.username = session.username || remote.username || G.username;
        G.buyMeCoffeeUrl = session.buyMeCoffeeUrl || G.buyMeCoffeeUrl;
        G.donationPerStepCents = Number(session.donationPerStepCents || G.donationPerStepCents || DEFAULT_DONATION_PER_STEP_CENTS);
        if (remoteProgress.boost) applyServerBoost(remoteProgress.boost);
        if (remoteProgress.referral) applyServerReferral(remoteProgress.referral);
        if (remoteProgress.globalImpact) applyServerGlobalImpact(remoteProgress.globalImpact);
        normalizeDonationState();
        ensureState();
      } else {
        await syncProgress();
      }
    } else {
      await syncProgress();
    }

    if (remote?.donations) applyServerDonations(remote.donations);
    if (Number.isFinite(remote?.rank) && remote.rank > 0) G.leaderboard.rank = Number(remote.rank);
    if (remote?.boost) applyServerBoost(remote.boost);
    if (remote?.referral) applyServerReferral(remote.referral);
    if (remote?.globalImpact) applyServerGlobalImpact(remote.globalImpact);

    await refreshLeaderboard();
    await refreshGlobalImpact();
    updateInitiativePanel();
  } catch (err) {
    console.warn("Cloud sync unavailable:", err);
  }
  save();
}

async function syncProgress(options = {}) {
  if (!G.userId) return null;
  const payload = getPersistedState();
  try {
    const res = await apiJSON("/api/progress", {
      method: "PUT",
      body: {
        userId: G.userId,
        progress: payload,
        donationEvent: options.donationEvent || null,
      },
    });
    if (res.username) G.username = res.username;
    if (res.donations) applyServerDonations(res.donations);
    if (Number.isFinite(res.rank) && res.rank > 0) G.leaderboard.rank = Number(res.rank);
    if (res.boost) applyServerBoost(res.boost);
    if (res.referral) applyServerReferral(res.referral);
    if (res.globalImpact) applyServerGlobalImpact(res.globalImpact);
    save();
    return res;
  } catch (err) {
    console.warn("Failed to sync progress:", err);
    return null;
  }
}

async function refreshLeaderboard() {
  if (!G.userId) return;
  try {
    const data = await apiJSON(`/api/leaderboard?limit=10&userId=${encodeURIComponent(G.userId)}`);
    G.leaderboard.top = Array.isArray(data.entries) ? data.entries : [];
    if (Number.isFinite(data.rank) && data.rank > 0) {
      G.leaderboard.rank = Number(data.rank);
    }
    renderLeaderboard();
    updateInitiativePanel();
    save();
  } catch (err) {
    console.warn("Failed to refresh leaderboard:", err);
  }
}

async function refreshGlobalImpact() {
  try {
    const data = await apiJSON("/api/global-impact");
    applyServerGlobalImpact(data);
    updateInitiativePanel();
    save();
  } catch (err) {
    console.warn("Failed to refresh global impact:", err);
  }
}

async function activateBoostPotion() {
  if (!G.userId) return false;
  if ((G.boost?.potionBalance || 0) <= 0) {
    showToast("🧪", t().activatePotionNone, t().activatePotionNone);
    return false;
  }
  const btn = byId("activate-potion-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = t().activatePotionBusy;
  }
  try {
    const res = await apiJSON("/api/boost/activate", {
      method: "POST",
      body: { userId: G.userId },
    });
    if (res?.boost) applyServerBoost(res.boost);
    updateInitiativePanel();
    updateHUD();
    save();
    showToast("⚡", t().activatePotionDone, t().activatePotionDone);
    return true;
  } catch (err) {
    console.warn("Failed to activate potion:", err);
    showToast("⚠️", t().activatePotionError, t().activatePotionError);
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = t().activatePotion;
    }
  }
}

async function copyInviteLink() {
  const link = getInviteUrl();
  try {
    await navigator.clipboard.writeText(link);
    showToast("🔗", t().inviteCopied, link);
  } catch (err) {
    console.warn("Failed to copy invite link:", err);
    showToast("⚠️", t().inviteCopyFailed, t().inviteCopyFailed);
  }
}

function shareInvite(platform) {
  const link = getInviteUrl();
  const message = t().shareMessage;
  const encodedLink = encodeURIComponent(link);
  const encodedMessage = encodeURIComponent(message);
  let shareUrl = "";
  if (platform === "facebook") {
    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`;
  } else if (platform === "x") {
    shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`;
  } else if (platform === "linkedin") {
    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
  }
  if (!shareUrl) return;
  window.open(shareUrl, "_blank", "noopener,noreferrer,width=760,height=640");
}

function renderLeaderboard() {
  const lists = ["leaderboard-list", "home-leaderboard-list"]
    .map((id) => byId(id))
    .filter(Boolean);
  if (!lists.length) return;
  const rows = G.leaderboard.top || [];
  if (!rows.length) {
    const empty = `<div class="leaderboard-empty">${escapeHTML(t().leaderboardEmpty)}</div>`;
    lists.forEach((list) => {
      list.innerHTML = empty;
    });
    return;
  }
  const html = rows.map((entry) => {
    const mine = entry.userId === G.userId ? " me" : "";
    return `<div class="leaderboard-row${mine}">
      <div class="leaderboard-rank">#${entry.rank}</div>
      <div class="leaderboard-name">${escapeHTML(entry.username)}</div>
      <div class="leaderboard-stages">${escapeHTML(t().leaderboardStages(entry.stagesCompleted || 0))}</div>
      <div class="leaderboard-amount">${formatMoney(entry.totalCents || 0)}</div>
    </div>`;
  }).join("");
  lists.forEach((list) => {
    list.innerHTML = html;
  });
}

function updateInitiativePanel() {
  const stepMultiplier = getPathDonationMultiplier(G.path);
  const effectiveStep = getEffectiveStepDonationCents(G.path);
  setText(
    "initiative-step-value",
    stepMultiplier > 1
      ? `${formatMoney(effectiveStep)} (x${stepMultiplier})`
      : formatMoney(effectiveStep),
  );
  setText("initiative-total-value", formatMoney(G.donations.totalCents));
  setText("initiative-rank-value", leaderboardRankText());
  setText("initiative-steps-value", G.donations.stepsFunded);

  const target = Number(G.globalImpact.targetCents || DEFAULT_GLOBAL_TARGET_CENTS);
  const total = Number(G.globalImpact.totalCents || 0);
  const pct = target > 0 ? Math.min(100, (total / target) * 100) : 0;
  setText("global-target-value", `${formatMoney(total)} / ${formatMoney(target)}`);
  setText(
    "global-target-meta",
    t().globalTargetMeta(
      pct.toFixed(1),
      Number(G.globalImpact.contributors || 0),
      Number(G.globalImpact.stepsFunded || 0),
    ),
  );
  const targetFill = byId("global-target-fill");
  if (targetFill) targetFill.style.width = `${pct}%`;

  const inviteInput = byId("invite-link-input");
  if (inviteInput) inviteInput.value = getInviteUrl();

  const now = Date.now();
  const boostActive = Boolean(G.boost?.isActive) && Number(G.boost?.activeUntil || 0) > now;
  const remaining = boostActive ? formatDurationLeft(Number(G.boost.activeUntil) - now) : "";
  const balance = Number(G.boost?.potionBalance || 0);
  setText(
    "potion-status",
    boostActive
      ? t().potionStatusActive(balance, remaining)
      : t().potionStatusReady(balance),
  );
  const activateBtn = byId("activate-potion-btn");
  if (activateBtn) {
    activateBtn.disabled = balance <= 0;
    activateBtn.textContent = t().activatePotion;
  }
}

function screen(id, push = true) {
  if (push && currentScreen !== id) historyStack.push(currentScreen);
  document
    .querySelectorAll(".screen")
    .forEach((el) => el.classList.remove("on"));
  byId(id).classList.add("on");
  currentScreen = id;
  const startWrap = byId("startWrap");
  if (startWrap) startWrap.classList.toggle("hidden", id !== "title");
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
  /* Keep root direction LTR so scrollbars stay on the right side. */
  document.documentElement.dir = "ltr";
  document.body.dir = "ltr";
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
    showStoryStep(storyIndex);
  }
  if (currentScreen === "quiz" && activeStage) renderQuiz();
  if (currentScreen === "result" && lastResult) renderResult(lastResult);
  save();
}

function levelName(key) {
  return t()[key];
}

function refreshText() {
  setText("hero-kicker", t().heroKicker);
  setText("hero-logo", t().logo);
  setText("hero-sub", t().heroSub);
  setText("purpose-kicker", t().purposeKicker);
  setText("purpose-title", t().purposeTitle);
  setText("mission-copy", t().mission);
  setText("initiative-title", t().initiativeTitle);
  setText("initiative-copy", t().initiativeCopy);
  setText("initiative-step-label", t().initiativeStepLabel);
  setText("initiative-total-label", t().initiativeTotalLabel);
  setText("initiative-rank-label", t().initiativeRankLabel);
  setText("initiative-steps-label", t().initiativeStepsLabel);
  setText("global-target-label", t().globalTargetLabel);
  setText("invite-title", t().inviteTitle);
  setText("invite-copy", t().inviteCopy);
  setText("invite-copy-btn", t().inviteCopyBtn);
  setShareButton("share-fb-btn", t().shareFacebook, "facebook");
  setShareButton("share-x-btn", t().shareX, "x");
  setShareButton("share-li-btn", t().shareLinkedIn, "linkedin");
  setText("activate-potion-btn", t().activatePotion);
  setText("start-btn", t().start);
  setText("identity-modal-title", t().identityModalTitle);
  setText("identity-modal-copy", t().identityModalCopy);
  setText("identity-generated-label", t().identityGeneratedLabel);
  setText("identity-input-label", t().identityInputLabel);
  setText("identity-use-generated-btn", t().identityUseGenerated);
  setText("identity-continue-btn", t().identityContinue);
  setText("identity-cancel-btn", t().identityCancel);
  const identityInput = byId("identity-name-input");
  if (identityInput) identityInput.setAttribute("placeholder", t().identityInputPlaceholder);
  setText("chip-1", t().chip1);
  setText("chip-2", t().chip2);
  setText("chip-3", t().chip3);
  setText("chip-4", t().chip4);
  setText("paths-title", t().pathsTitle);
  setText("paths-sub", t().pathsSub);
  setText("path-control-copy", t().pathsControl);
  setText("home-leaderboard-title", t().leaderboardTitle);
  setText("home-leaderboard-copy", t().leaderboardCopy);
  setText("level-label", t().impactCounterLabel);
  setText("map-label", t().mapLabel);
  setText("map-title", activePath().name[G.lang]);
  setText("panel-title", t().panelTitle);
  setText("panel-copy", t().panelCopy);
  setText("panel-toggle-label", t().panelToggle);
  setText("story-reward-step-label", t().storyRewardPerStep);
  setText("story-reward-stage-label", t().storyRewardStage);
  setText("story-reward-perfect-label", t().storyRewardPerfect);
  setText("deep-focus-label", t().deepFocus);
  setText("deep-goal-label", t().deepGoal);
  setText("deep-books-label", t().deepBooks);
  setText("reading-title", t().readingTitle);
  setText("reading-copy", t().readingCopy);
  setText("endorse-title", t().endorseTitle);
  setText("endorse-copy", t().endorseCopy);
  setText("story-skip", t().skip);
  setText("quiz-label", t().quizLabel);
  setText("loot-xp-label", t().lootStageDonation);
  setText("loot-gems-label", t().lootTotalDonation);
  setText("loot-streak-label", t().lootStepsFunded);
  setText("loot-rank-label", t().lootLeaderboardRank);
  setText("map-btn", t().map);
  setText("retry-btn", t().retry);
  setText("next-stage-btn", t().nextStage);
  setText("back-btn", isAR() ? "رجوع" : "Back");
  setText("mini-goal-label", t().goal);
  setText("mini-bonus-label", t().bonus);
  setText("mini-streak-label", t().streakLabel);
  updateHUD();
  renderLeaderboard();
}

function updateHUD() {
  ensureState();

  setText("level-value", formatMoney(G.donations.totalCents));
  const fill = byId("xp-fill");
  if (fill) fill.style.width = `${Math.round((G.donations.totalCents % MONEY_DIVISOR) / 10)}%`;
  setText(
    "xp-text",
    t().impactMeterHint(formatMoney(getEffectiveStepDonationCents(G.path)), G.donations.stepsFunded),
  );

  setText("stat-stars", totalCompletedStages(G));
  setText("stat-gems", formatMoney(G.donations.fromStepsCents));
  setText("stat-streak", formatMoney(G.donations.manualCents));
  setText("stat-ach", leaderboardRankText());
  setText("panel-rank", leaderboardRankText());

  const qp = byId("quest-progress");
  if (qp) {
    qp.innerHTML = "";
    activeStages().forEach((st) => {
      const d = document.createElement("div");
      d.className = "mini-dot";
      d.innerHTML = `<span style="width:${isStageCompleted(G.path, st.id) || st.id < G.unlocked[G.path] ? "100%" : "0%"}"></span>`;
      qp.appendChild(d);
    });
  }

  setText("booster-combo", (isAR() ? "سلسلة: " : "Combo: ") + G.combo);
  setText("booster-perfect", t().perfectReady);
  setText("booster-speed", t().quick);
  setText("booster-potion", t().boosterPotion);
  const potionBooster = byId("booster-potion");
  if (potionBooster) potionBooster.classList.toggle("active", Boolean(G.boost?.isActive));
  setText(
    "mini-goal-value",
    activeStage
      ? `${Math.min(quizIndex + 1, activeStage.quiz.length)}/${activeStage.quiz.length}`
      : `${G.completed[G.path].length}/${activeStages().length}`,
  );
  setText(
    "mini-bonus-value",
    "+" + formatMoney(G.combo >= 2 ? SPEED_DONATION_BONUS_CENTS : 0),
  );
  setText("mini-streak-value", G.streak);

  const soundToggle = byId("sound-toggle");
  if (soundToggle) {
    soundToggle.textContent = (G.sound ? "🔊 " : "🔈 ") + "SFX";
    soundToggle.classList.toggle("active", G.sound);
  }

  const nxt =
    activeStages().find((s) => !isStageCompleted(G.path, s.id)) ||
    activeStages()[activeStages().length - 1];

  setText("deep-focus-value", nxt.focus[G.lang]);
  setText("deep-goal-value", nxt.goal[G.lang]);

  const deep = byId("deep-books-list");
  if (deep) {
    deep.innerHTML = "";
    (nxt.reading || activePath().refs).slice(0, 3).forEach((r) => {
      const item = document.createElement("div");
      item.className = "book-item";
      item.innerHTML = `<div class="b1">${r[0]}</div><div class="b2">${r[1]}</div>`;
      deep.appendChild(item);
    });
  }

  updateInitiativePanel();
}
