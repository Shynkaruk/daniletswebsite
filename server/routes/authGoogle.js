// routes/authGoogle.js
import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { User } from "../db.js";

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // важливо!

const oauth2 = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// FRONT → BACK
// { code: "..." }
router.post("/google/code", async (req, res) => {
  try {
    const { code } = req.body;

    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    const googleApi = google.oauth2({ version: "v2", auth: oauth2 });
    const { data } = await googleApi.userinfo.get();

    const email = data.email;
    const googleId = data.id;
    const name = data.name;
    const picture = data.picture;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        first_name: name,
        google_id: googleId,
        avatar: picture,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ error: "Google auth failed" });
  }
});

export default router;
