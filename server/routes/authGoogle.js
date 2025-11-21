import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../db.js"; // беремо Mongoose модель

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

// --- helpers ---
function signToken(user) {
  return jwt.sign(
    { uid: user.id, is_admin: !!user.is_admin, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

function packUser(doc) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    first_name: doc.first_name,
    last_name: doc.last_name,
    phone: doc.phone,
    is_admin: doc.is_admin,
    avatar: doc.avatar || null,
    google_id: doc.google_id || null,
  };
}

// --- створити/оновити користувача в Mongo ---
async function upsertGoogleUser({ sub, email, name, picture }) {
  let user = await User.findOne({
    $or: [{ google_id: sub }, { email }],
  });

  const [first_name, ...rest] = (name || "").split(" ");
  const last_name = rest.join(" ") || "";

  if (user) {
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.avatar = picture || user.avatar;
    user.google_id = sub || user.google_id;

    await user.save();
    return user;
  }

  // створюємо нового Google-користувача
  user = await User.create({
    email,
    password: null,   // Google users might not have password
    first_name,
    last_name,
    phone: "",
    is_admin: false,
    google_id: sub,
    avatar: picture,
  });

  return user;
}

// --- 1) Google auth via id_token ---
router.post("/google", async (req, res) => {
  try {
    const { id_token } = req.body || {};
    if (!id_token) return res.status(400).json({ error: "id_token required" });

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const p = ticket.getPayload();
    if (!p?.sub) return res.status(401).json({ error: "invalid google token" });

    const userDoc = await upsertGoogleUser({
      sub: p.sub,
      email: p.email || null,
      name: p.name || "",
      picture: p.picture || null,
    });

    const user = packUser(userDoc);
    const token = signToken(user);

    return res.json({ user, token });
  } catch (e) {
    console.error("Google auth error:", e);
    return res.status(401).json({ error: "google auth failed" });
  }
});

// --- 2) Google OAuth code flow ---
router.post("/google-code", async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "code required" });

    const oauth = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");
    const { tokens } = await oauth.getToken({ code, redirect_uri: "postmessage" });

    if (!tokens?.id_token) return res.status(401).json({ error: "no id_token" });

    const ticket = await oauth.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const p = ticket.getPayload();

    const userDoc = await upsertGoogleUser({
      sub: p.sub,
      email: p.email || null,
      name: p.name || "",
      picture: p.picture || null,
    });

    const user = packUser(userDoc);
    const token = signToken(user);

    return res.json({ user, token });
  } catch (e) {
    console.error("Google code flow error:", e);
    return res.status(401).json({ error: "google auth failed" });
  }
});

export default router;
