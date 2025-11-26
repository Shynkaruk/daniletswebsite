import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { User } from "../db.js";

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_ENV = process.env.GOOGLE_REDIRECT_URI; // значення з env

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_ENV
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
    const { code, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    // redirect_uri беремо з фронта, якщо є; інакше — з env
    const redirectUri = redirect_uri || REDIRECT_ENV;

    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    });
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

    res.json({ user, token });
  } catch (err) {
    console.error("Google auth by code error:", err?.response?.data || err);
    res.status(400).json({ error: "Google auth failed" });
  }
});

export default router;
