const DEFAULT_STEP_DONATION_CENTS = 1;
const DEFAULT_BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/urnzikfqg5";
const MAX_LEADERBOARD_LIMIT = 25;

let schemaReadyPromise = null;

function isAssetRequest(pathname) {
  return pathname.includes(".");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function getStepDonationCents(env) {
  const raw = Number(env.DONATION_PER_STEP_CENTS);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_STEP_DONATION_CENTS;
}

function getBuyMeCoffeeUrl(env) {
  const raw = (env.BUY_ME_A_COFFEE_URL || "").trim();
  return raw || DEFAULT_BUY_ME_A_COFFEE_URL;
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function generateArabicUsername() {
  const first = [
    "نور",
    "ضياء",
    "سراج",
    "نبراس",
    "هدى",
    "أفق",
    "بيان",
    "بصيرة",
    "مداد",
    "صفاء",
    "يقين",
    "فجر",
  ];
  const second = [
    "العلم",
    "المتعلم",
    "الأثر",
    "الهداية",
    "المعرفة",
    "الرسالة",
    "الدرب",
    "النية",
    "القنديل",
    "الأمل",
    "الساعي",
    "المنارة",
  ];
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${first[Math.floor(Math.random() * first.length)]}_${second[Math.floor(Math.random() * second.length)]}_${suffix}`;
}

function parseProgressJSON(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function normalizeEnglishDigits(value) {
  return String(value || "")
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

function normalizeUsername(value) {
  return normalizeEnglishDigits(value).replace(/\s+/g, " ").trim();
}

function asPositiveInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

function countCompletedStages(progressData) {
  const completed = progressData?.completed;
  if (!completed || typeof completed !== "object") return 0;
  return Object.values(completed).reduce((sum, stages) => {
    if (!Array.isArray(stages)) return sum;
    return sum + stages.length;
  }, 0);
}

function clampLeaderboardLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 10;
  return Math.min(MAX_LEADERBOARD_LIMIT, Math.floor(n));
}

async function ensureSchema(db) {
  if (!db) return;
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const statements = [
        `
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL
          )
        `,
        `
          CREATE TABLE IF NOT EXISTS progress (
            user_id TEXT PRIMARY KEY,
            data_json TEXT NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
          )
        `,
        `
          CREATE TABLE IF NOT EXISTS donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_key TEXT UNIQUE,
            user_id TEXT NOT NULL,
            source TEXT NOT NULL,
            amount_cents INTEGER NOT NULL,
            path_id TEXT,
            stage_id INTEGER,
            step_count INTEGER,
            note TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
          )
        `,
        "CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at)",
      ];
      for (const sql of statements) {
        await db.prepare(sql).run();
      }
    })().catch((err) => {
      schemaReadyPromise = null;
      throw err;
    });
  }
  await schemaReadyPromise;
}

async function getUserById(db, userId) {
  if (!userId) return null;
  const row = await db
    .prepare("SELECT id, username, created_at FROM users WHERE id = ?")
    .bind(userId)
    .first();
  return row || null;
}

async function createUniqueUser(db) {
  const now = Date.now();
  for (let i = 0; i < 50; i++) {
    const id = crypto.randomUUID();
    const username = generateArabicUsername();
    const res = await db
      .prepare("INSERT OR IGNORE INTO users (id, username, created_at) VALUES (?, ?, ?)")
      .bind(id, username, now)
      .run();
    if (res?.meta?.changes) {
      return { id, username, created_at: now };
    }
  }
  throw new Error("Could not create a unique Arabic username.");
}

async function getOrCreateUser(db, requestedUserId = "") {
  const existing = await getUserById(db, requestedUserId);
  if (existing) return { ...existing, _isNew: false };
  const created = await createUniqueUser(db);
  return { ...created, _isNew: true };
}

async function ensureProgressRow(db, userId) {
  const now = Date.now();
  await db
    .prepare("INSERT OR IGNORE INTO progress (user_id, data_json, updated_at) VALUES (?, ?, ?)")
    .bind(userId, "{}", now)
    .run();
}

async function getProgressRow(db, userId) {
  return db
    .prepare("SELECT data_json, updated_at FROM progress WHERE user_id = ?")
    .bind(userId)
    .first();
}

async function getDonationSummary(db, userId) {
  const row = await db
    .prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN source = 'stage_step' THEN amount_cents ELSE 0 END), 0) AS from_steps_cents,
        COALESCE(SUM(CASE WHEN source = 'buy_me_a_coffee' THEN amount_cents ELSE 0 END), 0) AS manual_cents,
        COALESCE(SUM(amount_cents), 0) AS total_cents,
        COALESCE(SUM(CASE WHEN source = 'stage_step' THEN COALESCE(step_count, 0) ELSE 0 END), 0) AS steps_funded
      FROM donations
      WHERE user_id = ?
    `)
    .bind(userId)
    .first();

  return {
    fromStepsCents: Number(row?.from_steps_cents || 0),
    manualCents: Number(row?.manual_cents || 0),
    totalCents: Number(row?.total_cents || 0),
    stepsFunded: Number(row?.steps_funded || 0),
  };
}

async function getUserRank(db, userId) {
  const row = await db
    .prepare(`
      WITH totals AS (
        SELECT u.id AS user_id, COALESCE(SUM(d.amount_cents), 0) AS total_cents
        FROM users u
        LEFT JOIN donations d ON d.user_id = u.id
        GROUP BY u.id
      ),
      ranked AS (
        SELECT
          user_id,
          total_cents,
          DENSE_RANK() OVER (ORDER BY total_cents DESC, user_id ASC) AS rank
        FROM totals
      )
      SELECT rank, total_cents
      FROM ranked
      WHERE user_id = ?
    `)
    .bind(userId)
    .first();

  if (!row) return null;
  return Number(row.rank || 0) || null;
}

async function getLeaderboard(db, limit = 10) {
  const rows = await db
    .prepare(`
      SELECT
        u.id AS user_id,
        u.username,
        COALESCE(SUM(d.amount_cents), 0) AS total_cents,
        p.data_json
      FROM users u
      LEFT JOIN donations d ON d.user_id = u.id
      LEFT JOIN progress p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY total_cents DESC, u.created_at ASC
      LIMIT ?
    `)
    .bind(limit)
    .all();

  return (rows?.results || []).map((row, idx) => {
    const progressData = parseProgressJSON(row.data_json);
    return {
      rank: idx + 1,
      userId: row.user_id,
      username: row.username,
      totalCents: Number(row.total_cents || 0),
      stagesCompleted: countCompletedStages(progressData),
    };
  });
}

function sanitizeProgress(progress) {
  if (!progress || typeof progress !== "object") return {};
  const safe = {
    lang: typeof progress.lang === "string" ? progress.lang : "ar",
    xp: Number(progress.xp || 0),
    gems: Number(progress.gems || 0),
    streak: Number(progress.streak || 0),
    combo: Number(progress.combo || 0),
    bestCombo: Number(progress.bestCombo || 0),
    stars: progress.stars && typeof progress.stars === "object" ? progress.stars : {},
    completed: progress.completed && typeof progress.completed === "object" ? progress.completed : {},
    unlocked: progress.unlocked && typeof progress.unlocked === "object" ? progress.unlocked : {},
    achievements: Array.isArray(progress.achievements) ? progress.achievements : [],
    sound: Boolean(progress.sound),
    path: typeof progress.path === "string" ? progress.path : "prophet",
    pathSeen: progress.pathSeen && typeof progress.pathSeen === "object" ? progress.pathSeen : {},
    levelStart: typeof progress.levelStart === "string" ? progress.levelStart : "beginner",
    userId: typeof progress.userId === "string" ? progress.userId : "",
    username: typeof progress.username === "string" ? progress.username : "",
    donationPerStepCents: Number(progress.donationPerStepCents || 0),
    donations: progress.donations && typeof progress.donations === "object"
      ? {
        fromStepsCents: Number(progress.donations.fromStepsCents || 0),
        manualCents: Number(progress.donations.manualCents || 0),
        totalCents: Number(progress.donations.totalCents || 0),
        stepsFunded: Number(progress.donations.stepsFunded || 0),
      }
      : {
        fromStepsCents: 0,
        manualCents: 0,
        totalCents: 0,
        stepsFunded: 0,
      },
    leaderboard: progress.leaderboard && typeof progress.leaderboard === "object"
      ? {
        rank: Number(progress.leaderboard.rank || 0) || null,
      }
      : { rank: null },
    completedPathBonuses:
      progress.completedPathBonuses && typeof progress.completedPathBonuses === "object"
        ? progress.completedPathBonuses
        : {},
    updatedAt: Date.now(),
  };

  return safe;
}

async function handleSession(url, env) {
  if (!env.DB) {
    return json({
      error: "D1 binding missing. Add a DB binding named 'DB' in wrangler config.",
    }, 503);
  }

  await ensureSchema(env.DB);
  const requestedUserId = (url.searchParams.get("userId") || "").trim();
  const user = await getOrCreateUser(env.DB, requestedUserId);
  await ensureProgressRow(env.DB, user.id);
  const donations = await getDonationSummary(env.DB, user.id);
  const rank = await getUserRank(env.DB, user.id);

  return json({
    userId: user.id,
    username: user.username,
    isNewUser: Boolean(user._isNew),
    donationPerStepCents: getStepDonationCents(env),
    buyMeCoffeeUrl: getBuyMeCoffeeUrl(env),
    donations,
    rank,
  });
}

async function handleUsername(request, env) {
  if (!env.DB) {
    return json({
      error: "D1 binding missing. Add a DB binding named 'DB' in wrangler config.",
    }, 503);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const userId = String(body.userId || "").trim();
  const username = normalizeUsername(body.username || "");
  if (!userId) return json({ error: "Missing userId." }, 400);
  if (username.length < 3 || username.length > 40) {
    return json({ error: "Username must be between 3 and 40 characters." }, 400);
  }

  await ensureSchema(env.DB);
  try {
    const res = await env.DB
      .prepare("UPDATE users SET username = ? WHERE id = ?")
      .bind(username, userId)
      .run();
    if (!res?.meta?.changes) {
      return json({ error: "User not found." }, 404);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("unique")) {
      return json({ error: "Username already taken." }, 409);
    }
    throw err;
  }

  return json({ ok: true, userId, username });
}

async function handleGetProgress(url, env) {
  if (!env.DB) {
    return json({
      error: "D1 binding missing. Add a DB binding named 'DB' in wrangler config.",
    }, 503);
  }

  const userId = (url.searchParams.get("userId") || "").trim();
  if (!userId) return json({ error: "Missing userId." }, 400);

  await ensureSchema(env.DB);
  const user = await getUserById(env.DB, userId);
  if (!user) return json({ error: "User not found." }, 404);

  await ensureProgressRow(env.DB, user.id);
  const row = await getProgressRow(env.DB, user.id);
  const progress = parseProgressJSON(row?.data_json);
  const donations = await getDonationSummary(env.DB, user.id);
  const rank = await getUserRank(env.DB, user.id);

  return json({
    userId: user.id,
    username: user.username,
    progress,
    donations,
    rank,
    updatedAt: Number(row?.updated_at || 0),
  });
}

async function handleSaveProgress(request, env) {
  if (!env.DB) {
    return json({
      error: "D1 binding missing. Add a DB binding named 'DB' in wrangler config.",
    }, 503);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return json({ error: "Invalid JSON body." }, 400);
  }

  await ensureSchema(env.DB);

  const user = await getOrCreateUser(env.DB, String(body.userId || "").trim());
  const progress = sanitizeProgress(body.progress || {});
  progress.userId = user.id;
  progress.username = user.username;
  if (!Number.isFinite(progress.donationPerStepCents) || progress.donationPerStepCents <= 0) {
    progress.donationPerStepCents = getStepDonationCents(env);
  }

  const now = Date.now();
  await env.DB
    .prepare(`
      INSERT INTO progress (user_id, data_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        data_json = excluded.data_json,
        updated_at = excluded.updated_at
    `)
    .bind(user.id, JSON.stringify(progress), now)
    .run();

  const donationEvent = body.donationEvent && typeof body.donationEvent === "object"
    ? body.donationEvent
    : null;

  if (donationEvent) {
    const amountCents = Number(donationEvent.amountCents || 0);
    if (Number.isFinite(amountCents) && amountCents > 0) {
      const eventKey = String(donationEvent.eventKey || `${user.id}:${now}`);
      const source = donationEvent.source === "buy_me_a_coffee" ? "buy_me_a_coffee" : "stage_step";
      const pathId = donationEvent.pathId ? String(donationEvent.pathId) : null;
      const stageId = donationEvent.stageId != null ? Number(donationEvent.stageId) : null;
      const stepCount = donationEvent.stepCount != null ? Number(donationEvent.stepCount) : 0;
      const note = donationEvent.note ? String(donationEvent.note).slice(0, 300) : null;

      await env.DB
        .prepare(`
          INSERT OR IGNORE INTO donations
            (event_key, user_id, source, amount_cents, path_id, stage_id, step_count, note, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          eventKey,
          user.id,
          source,
          Math.floor(amountCents),
          pathId,
          Number.isFinite(stageId) ? Math.floor(stageId) : null,
          Number.isFinite(stepCount) ? Math.max(0, Math.floor(stepCount)) : 0,
          note,
          now,
        )
        .run();
    }
  }

  let donations = await getDonationSummary(env.DB, user.id);
  const progressDonations = progress.donations || {};
  const stageBackfill = Math.max(
    0,
    asPositiveInt(progressDonations.fromStepsCents) - asPositiveInt(donations.fromStepsCents),
  );
  const manualBackfill = Math.max(
    0,
    asPositiveInt(progressDonations.manualCents) - asPositiveInt(donations.manualCents),
  );
  const stepBackfill = Math.max(
    0,
    asPositiveInt(progressDonations.stepsFunded) - asPositiveInt(donations.stepsFunded),
  );

  if (stageBackfill > 0) {
    await env.DB
      .prepare(`
        INSERT INTO donations
          (event_key, user_id, source, amount_cents, path_id, stage_id, step_count, note, created_at)
        VALUES (?, ?, 'stage_step', ?, NULL, NULL, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        user.id,
        stageBackfill,
        stepBackfill,
        "Progress sync backfill (stage steps)",
        now,
      )
      .run();
  }

  if (manualBackfill > 0) {
    await env.DB
      .prepare(`
        INSERT INTO donations
          (event_key, user_id, source, amount_cents, path_id, stage_id, step_count, note, created_at)
        VALUES (?, ?, 'buy_me_a_coffee', ?, NULL, NULL, 0, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        user.id,
        manualBackfill,
        "Progress sync backfill (manual)",
        now,
      )
      .run();
  }

  if (stageBackfill > 0 || manualBackfill > 0) {
    donations = await getDonationSummary(env.DB, user.id);
  }

  const rank = await getUserRank(env.DB, user.id);

  return json({
    ok: true,
    userId: user.id,
    username: user.username,
    donations,
    rank,
    updatedAt: now,
  });
}

async function handleManualDonation(request, env) {
  if (!env.DB) {
    return json({
      error: "D1 binding missing. Add a DB binding named 'DB' in wrangler config.",
    }, 503);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return json({ error: "Invalid JSON body." }, 400);
  }

  await ensureSchema(env.DB);

  const user = await getOrCreateUser(env.DB, String(body.userId || "").trim());
  const rawAmount = Number(body.amountCents);
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return json({ error: "amountCents must be a positive number." }, 400);
  }

  const amountCents = Math.floor(rawAmount);
  if (amountCents > 500000) {
    return json({ error: "amountCents is too large." }, 400);
  }

  const note = body.note ? String(body.note).slice(0, 300) : null;
  const now = Date.now();

  await env.DB
    .prepare(`
      INSERT INTO donations
        (event_key, user_id, source, amount_cents, path_id, stage_id, step_count, note, created_at)
      VALUES (?, ?, 'buy_me_a_coffee', ?, NULL, NULL, 0, ?, ?)
    `)
    .bind(crypto.randomUUID(), user.id, amountCents, note, now)
    .run();

  const donations = await getDonationSummary(env.DB, user.id);
  const rank = await getUserRank(env.DB, user.id);

  return json({
    ok: true,
    userId: user.id,
    username: user.username,
    donations,
    rank,
    buyMeCoffeeUrl: getBuyMeCoffeeUrl(env),
  });
}

async function handleLeaderboard(url, env) {
  if (!env.DB) {
    return json({
      error: "D1 binding missing. Add a DB binding named 'DB' in wrangler config.",
    }, 503);
  }

  await ensureSchema(env.DB);
  const limit = clampLeaderboardLimit(url.searchParams.get("limit"));
  const userId = (url.searchParams.get("userId") || "").trim();

  const entries = await getLeaderboard(env.DB, limit);
  let rank = null;
  if (userId) {
    rank = await getUserRank(env.DB, userId);
  }

  return json({ entries, rank });
}

async function handleApi(request, env, url) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: "GET, POST, PUT, OPTIONS",
      },
    });
  }

  if (url.pathname === "/api/session" && request.method === "GET") {
    return handleSession(url, env);
  }

  if (url.pathname === "/api/progress" && request.method === "GET") {
    return handleGetProgress(url, env);
  }

  if (url.pathname === "/api/progress" && request.method === "PUT") {
    return handleSaveProgress(request, env);
  }

  if (url.pathname === "/api/donations" && request.method === "POST") {
    return handleManualDonation(request, env);
  }

  if (url.pathname === "/api/leaderboard" && request.method === "GET") {
    return handleLeaderboard(url, env);
  }

  if (url.pathname === "/api/username" && request.method === "POST") {
    return handleUsername(request, env);
  }

  return json({ error: "Not Found" }, 404);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/api/")) {
        return handleApi(request, env, url);
      }

      if (![
        "GET",
        "HEAD",
      ].includes(request.method)) {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            Allow: "GET, HEAD",
          },
        });
      }

      let response = await env.ASSETS.fetch(request);

      if (response.status !== 404 || isAssetRequest(url.pathname)) {
        return response;
      }

      url.pathname = "/index.html";

      response = await env.ASSETS.fetch(new Request(url.toString(), request));

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected server error";
      return json({ error: message }, 500);
    }
  },
};
