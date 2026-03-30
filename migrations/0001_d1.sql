CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  referred_by TEXT,
  email TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

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
);

CREATE TABLE IF NOT EXISTS user_boosts (
  user_id TEXT PRIMARY KEY,
  potion_balance INTEGER NOT NULL DEFAULT 0,
  active_multiplier INTEGER NOT NULL DEFAULT 1,
  active_until INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS referral_rewards (
  invitee_user_id TEXT PRIMARY KEY,
  inviter_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(invitee_user_id) REFERENCES users(id),
  FOREIGN KEY(inviter_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS email_otps (
  email TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts_left INTEGER NOT NULL DEFAULT 5,
  is_new_user INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_inviter ON referral_rewards(inviter_user_id);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON email_otps(expires_at);
