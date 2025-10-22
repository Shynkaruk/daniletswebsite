// routes/authGoogle.js
import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import db from "../db.js";

const router = express.Router();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET = "dev_secret_change_me",
  TOKEN_EXPIRES = "7d",
} = process.env;

if (!GOOGLE_CLIENT_ID) {
  console.error("ERROR: Set GOOGLE_CLIENT_ID in env!");
}

// --- 0) Мігруємо БД під Google (id/аватар). Безпечні 'IF NOT EXISTS'.
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,              -- може бути NULL для Google-юзерів
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  is_admin INTEGER DEFAULT 0
)`).run();

try { db.prepare(`ALTER TABLE users ADD COLUMN google_id TEXT`).run(); } catch {}
try { db.prepare(`ALTER TABLE users ADD COLUMN avatar TEXT`).run(); } catch {}
try { db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`).run(); } catch {}

// --- 1) helpers
function signToken(user) {
  return jwt.sign(
    { uid: user.id, is_admin: !!user.is_admin, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

function packUser(row) {
  const { password, ...u } = row;
  return u;
}

// створити/оновити користувача по Google
function upsertGoogleUser({ sub, email, name, picture }) {
  const found =
    db.prepare(`SELECT * FROM users WHERE google_id = ? OR email = ?`).get(sub, email) || null;

  const [first_name, ...rest] = (name || "").split(" ");
  const last_name = rest.join(" ") || null;

  if (found) {
    db.prepare(
      `UPDATE users SET
         first_name = COALESCE(?, first_name),
         last_name  = COALESCE(?, last_name),
         avatar     = COALESCE(?, avatar),
         google_id  = COALESCE(?, google_id)
       WHERE id = ?`
    ).run(first_name || null, last_name || null, picture || null, sub, found.id);

    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(found.id);
  }

  const info = db.prepare(
    `INSERT INTO users (email, password, first_name, last_name, phone, is_admin, google_id, avatar)
     VALUES (?, NULL, ?, ?, NULL, 0, ?, ?)`
  ).run(email || null, first_name || null, last_name || null, sub, picture || null);

  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(info.lastInsertRowid);
}

// --- 2) POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { id_token } = req.body || {};
    if (!id_token) return res.status(400).json({ error: "id_token required" });

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const p = ticket.getPayload(); // { sub, email, name, picture, email_verified, ... }
    if (!p?.sub) return res.status(401).json({ error: "invalid google token" });

    const userRow = upsertGoogleUser({
      sub: p.sub,
      email: p.email || null,
      name: p.name || "",
      picture: p.picture || null,
    });

    const user = packUser(userRow);
    const token = signToken(user);

    return res.json({ user, token });
  } catch (e) {
    console.error("Google auth error:", e);
    return res.status(401).json({ error: "google auth failed" });
  }
});

router.post("/google-code", async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "code required" });

    // важливо: redirect_uri "postmessage"
    const oauth = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");
    const { tokens } = await oauth.getToken({ code, redirect_uri: "postmessage" });

    if (!tokens?.id_token) return res.status(401).json({ error: "no id_token" });

    // перевіримо id_token і витягнемо payload
    const ticket = await oauth.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload(); // { sub, email, name, picture, ... }

    const userRow = upsertGoogleUser({
      sub: p.sub,
      email: p.email || null,
      name: p.name || "",
      picture: p.picture || null,
    });

    const user = packUser(userRow);
    const token = signToken(user);

    return res.json({ user, token });
  } catch (e) {
    console.error("Google code flow error:", e?.message || e);
    return res.status(401).json({ error: "google auth failed" });
  }
  
});

export default router;
