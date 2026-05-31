// server/routes/authGoogle.js
import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { User } from "../db.js";

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// === ГОЛОВНЕ: для flow "auth-code" з @react-oauth/google використовуємо "postmessage"
const REDIRECT_URI = "postmessage";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

function signAppToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      is_admin: !!user.is_admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES || "7d" }
  );
}

// --------- POST /api/auth/google-code ---------
router.post("/google-code", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    // 👇 БІЛЬШЕ НЕ ПЕРЕДАЄМО redirect_uri, достатньо того, що в OAuth2Client
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    const email = data.email;
    const googleId = data.id;
    const fullName = data.name || "";
    const picture = data.picture;

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

    const profile_complete = !!(user.first_name && user.last_name && user.phone);
    // Serialize Mongoose doc to plain object so the response is clean
    const userObj = user.toObject ? user.toObject() : user;

    res.json({ user: userObj, token, profile_complete });
  } catch (err) {
    console.error("Google auth by code error:", err?.response?.data || err);
    res.status(400).json({ error: "Google auth failed" });
  }
});

export default router;
