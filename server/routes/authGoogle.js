// routes/authGoogle.js
import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { User } from "../db.js"; // адаптуй якщо в тебе інший експорт

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// ВАЖЛИВО: має збігатися з тим, що використовує @react-oauth/google
// за замовчуванням це window.location.origin (локал: http://localhost:5173)
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// helper: створення нашого JWT
function signAppToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      is_admin: !!user.is_admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * POST /api/auth/google-code
 * Тіло: { code }
 * Фронт: auth.googleCode(code)
 */
router.post("/google-code", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    // Обмінюємо code -> tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: REDIRECT_URI,
    });
    oauth2Client.setCredentials(tokens);

    // Тягнемо профіль
    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    const email = data.email;
    const googleId = data.id;
    const fullName = data.name || "";
    const picture = data.picture;

    if (!email) {
      return res.status(400).json({ error: "No email from Google" });
    }

    // Знаходимо або створюємо юзера
    let user = await User.findOne({ email }); // якщо в тебе Sequelize – адаптуй

    if (!user) {
      const [first_name, ...rest] = fullName.split(" ");
      const last_name = rest.join(" ");

      user = await User.create({
        email,
        first_name,
        last_name,
        google_id: googleId,
        avatar: picture,
      });
    } else if (!user.google_id) {
      // можна прив'язати google_id, якщо ще не збережений
      user.google_id = googleId;
      await user.save();
    }

    const token = signAppToken(user);

    res.json({
      user,
      token,
    });
  } catch (err) {
    console.error("Google auth by code error:", err?.response?.data || err);
    res.status(400).json({ error: "Google auth failed" });
  }
});

/**
 * POST /api/auth/google
 * Тіло: { id_token }
 * Це варіант, якщо ти будеш використовувати не "auth-code", а id_token (One-tap)
 */
router.post("/google", async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ error: "Missing id_token" });
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const googleId = payload.sub;
    const fullName = payload.name || "";
    const picture = payload.picture;

    if (!email) {
      return res.status(400).json({ error: "No email from Google" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const [first_name, ...rest] = fullName.split(" ");
      const last_name = rest.join(" ");

      user = await User.create({
        email,
        first_name,
        last_name,
        google_id: googleId,
        avatar: picture,
      });
    } else if (!user.google_id) {
      user.google_id = googleId;
      await user.save();
    }

    const token = signAppToken(user);

    res.json({
      user,
      token,
    });
  } catch (err) {
    console.error("Google auth by id_token error:", err?.response?.data || err);
    res.status(400).json({ error: "Google auth failed" });
  }
});

export default router;
