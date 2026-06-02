/* eslint-env node */
// ============================================================
// routes/authRoutes.js
// Всі ендпоінти пов'язані з автентифікацією:
//   - OTP: відправка і перевірка коду
//   - Реєстрація нового користувача
//   - Вхід (email + password)
//   - Відновлення пароля
//   - Перевірка email через OTP
//   - Отримання профілю поточного юзера (/me)
//   - Авторизація через Apple Sign In
// ============================================================

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import appleSignin from "apple-signin-auth";
import { User, OtpCode } from "../db.js";
import { auth, signToken, generateOtpCode } from "../middleware/authMiddleware.js";
import { sendOtpEmail } from "../email.js";

const router = Router();

// ---- Відправка OTP коду на email ----
// body: { email, purpose: "verify" | "reset" }
// Для purpose="reset" перевіряє що юзер існує (але не розкриває результат)
router.post("/otp/send", async (req, res) => {
  const { email, purpose = "verify" } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const normalizedPurpose = purpose === "reset" ? "reset" : "signup";

    if (normalizedPurpose === "reset") {
      const user = await User.findOne({ email });
      if (!user) return res.json({ ok: true }); // не розкриваємо чи існує юзер
    }

    const code = generateOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // OTP дійсний 10 хвилин

    await OtpCode.create({ email, code, purpose: normalizedPurpose, expires_at: expires });
    await sendOtpEmail({ to: email, code, purpose: normalizedPurpose });

    res.json({ ok: true });
  } catch (e) {
    console.error("otp/send error", e);
    res.status(500).json({ error: "failed to send OTP" });
  }
});

// ---- Перевірка OTP коду ----
// body: { email, code, purpose: "verify" | "reset" }
// Для "signup": позначає email як підтверджений і повертає токен
// Для "reset": лише підтверджує що код правильний (без нового токена)
router.post("/otp/verify", async (req, res) => {
  const { email, code, purpose = "verify" } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: "email and code required" });

  try {
    const normalizedPurpose = purpose === "reset" ? "reset" : "signup";

    if (normalizedPurpose === "signup") {
      const otp = await OtpCode.findOne({ email, code, purpose: "signup", used: false, expires_at: { $gt: new Date() } });
      if (!otp) return res.status(400).json({ error: "Invalid or expired code" });

      otp.used = true;
      await otp.save();

      const userDoc = await User.findOneAndUpdate({ email }, { $set: { email_verified: true } }, { new: true }).lean();
      if (!userDoc) return res.status(404).json({ error: "user not found" });

      const user = { id: userDoc._id.toString(), email: userDoc.email, first_name: userDoc.first_name, last_name: userDoc.last_name, phone: userDoc.phone, is_admin: userDoc.is_admin, email_verified: userDoc.email_verified };
      return res.json({ user, token: signToken(user) });
    }

    if (normalizedPurpose === "reset") {
      const otp = await OtpCode.findOne({ email, code, purpose: "reset", used: false, expires_at: { $gt: new Date() } });
      if (!otp) return res.status(400).json({ error: "Invalid or expired code" });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown purpose" });
  } catch (e) {
    console.error("otp/verify error", e);
    res.status(500).json({ error: "failed to verify OTP" });
  }
});

// ---- Реєстрація нового юзера ----
// Створює акаунт, відправляє OTP для підтвердження email
router.post("/register", async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "email already exists" });

    const hash = bcrypt.hashSync(password, 10);
    const userDoc = await User.create({ email, password: hash, first_name: first_name || "", last_name: last_name || "", phone: phone || "", is_admin: false });

    // Відправляємо OTP для підтвердження email
    const code = generateOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await OtpCode.create({ email, code, purpose: "signup", expires_at: expires });
    try { await sendOtpEmail({ to: email, code, purpose: "signup" }); }
    catch (e) { console.error("Failed to send signup OTP", e); }

    const user = { id: userDoc._id.toString(), email: userDoc.email, first_name: userDoc.first_name, last_name: userDoc.last_name, phone: userDoc.phone, is_admin: userDoc.is_admin };
    res.json({ user, token: signToken(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to register" });
  }
});

// ---- Запит на відновлення пароля ----
// Відправляє OTP з purpose="reset" на вказаний email
router.post("/request-reset-otp", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: true }); // не розкриваємо чи існує юзер

    const code = generateOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await OtpCode.create({ email, code, purpose: "reset", expires_at: expires });
    await sendOtpEmail({ to: email, code, purpose: "reset" });

    res.json({ ok: true });
  } catch (e) {
    console.error("request-reset-otp error", e);
    res.status(500).json({ error: "failed to send OTP" });
  }
});

// ---- Підтвердження email через OTP (signup flow) ----
router.post("/verify-email-otp", async (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: "email and code required" });

  try {
    const otp = await OtpCode.findOne({ email, code, purpose: "signup", used: false, expires_at: { $gt: new Date() } });
    if (!otp) return res.status(400).json({ error: "Invalid or expired code" });

    otp.used = true;
    await otp.save();

    const userDoc = await User.findOneAndUpdate({ email }, { $set: { email_verified: true } }, { new: true }).lean();
    if (!userDoc) return res.status(404).json({ error: "user not found" });

    const user = { id: userDoc._id.toString(), email: userDoc.email, first_name: userDoc.first_name, last_name: userDoc.last_name, phone: userDoc.phone, is_admin: userDoc.is_admin, email_verified: userDoc.email_verified };
    res.json({ user, token: signToken(user) });
  } catch (e) {
    console.error("verify-email-otp error", e);
    res.status(500).json({ error: "failed to verify code" });
  }
});

// ---- Скидання пароля ----
// Перевіряє OTP і встановлює новий пароль
router.post("/reset-password", async (req, res) => {
  const { email, code, new_password } = req.body || {};
  if (!email || !code || !new_password) return res.status(400).json({ error: "email, code and new_password required" });

  try {
    const otp = await OtpCode.findOne({ email, code, purpose: "reset", used: false, expires_at: { $gt: new Date() } });
    if (!otp) return res.status(400).json({ error: "Invalid or expired code" });

    otp.used = true;
    await otp.save();

    const hash = bcrypt.hashSync(new_password, 10);
    const user = await User.findOneAndUpdate({ email }, { $set: { password: hash } }, { new: true }).lean();
    if (!user) return res.status(404).json({ error: "user not found" });

    const packed = { id: user._id.toString(), email: user.email, first_name: user.first_name, last_name: user.last_name, phone: user.phone, is_admin: user.is_admin };
    res.json({ user: packed, token: signToken(packed) });
  } catch (e) {
    console.error("reset-password error", e);
    res.status(500).json({ error: "failed to reset password" });
  }
});

// ---- Вхід через email і пароль ----
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.status(401).json({ error: "invalid credentials" });

    const ok = bcrypt.compareSync(password, userDoc.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    // Блокуємо логін до підтвердження email
    // Адміни завжди можуть заходити (їх email верифікується через seedAdmin)
    if (!userDoc.email_verified && !userDoc.is_admin) {
      return res.status(403).json({ error: "email_not_verified", email: userDoc.email });
    }

    const user = { id: userDoc._id.toString(), email: userDoc.email, first_name: userDoc.first_name, last_name: userDoc.last_name, phone: userDoc.phone, is_admin: userDoc.is_admin, email_verified: true };
    res.json({ user, token: signToken(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "login failed" });
  }
});

// ---- Отримання даних поточного авторизованого юзера ----
router.get("/me", auth, async (req, res) => {
  const userDoc = await User.findById(req.user.uid).lean();
  if (!userDoc) return res.status(404).json({ error: "not found" });

  const { password, ...user } = userDoc;
  user.id = user._id.toString();
  delete user._id;
  res.json({ user });
});

// ---- Авторизація через Apple Sign In ----
// Ініціює OAuth редірект на appleid.apple.com
router.get("/apple/login", (req, res) => {
  const params = new URLSearchParams({
    response_type: "code",
    response_mode: "form_post",
    client_id: process.env.APPLE_CLIENT_ID,
    redirect_uri: process.env.APPLE_REDIRECT_URI,
    scope: "name email",
  });
  res.redirect("https://appleid.apple.com/auth/authorize?" + params.toString());
});

// ---- Callback від Apple після авторизації ----
// Отримує code, обмінює на id_token, знаходить або створює юзера
router.post("/apple/callback", async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "No code from Apple" });

    const clientSecret = appleSignin.getClientSecret({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      keyIdentifier: process.env.APPLE_KEY_ID,
    });

    const tokens = await appleSignin.getAuthorizationToken(code, {
      clientID: process.env.APPLE_CLIENT_ID,
      clientSecret,
      redirectUri: process.env.APPLE_REDIRECT_URI,
    });

    const applePayload = jwt.decode(tokens.id_token);

    // Шукаємо юзера по apple_id або email, або створюємо нового
    const appleId = applePayload.sub;
    const email = applePayload.email;
    const emailVerified = applePayload.email_verified === "true" || applePayload.email_verified === true;

    let userDoc = await User.findOne({ apple_id: appleId });
    if (!userDoc && email) userDoc = await User.findOne({ email });
    if (!userDoc) {
      userDoc = await User.create({ email: email || "", apple_id: appleId, first_name: "", last_name: "", phone: "", is_admin: false, email_verified: emailVerified });
    } else {
      if (!userDoc.apple_id) userDoc.apple_id = appleId;
      if (emailVerified && !userDoc.email_verified) userDoc.email_verified = true;
      await userDoc.save();
    }

    const user = { id: userDoc._id.toString(), email: userDoc.email, first_name: userDoc.first_name, last_name: userDoc.last_name, phone: userDoc.phone, is_admin: userDoc.is_admin, email_verified: userDoc.email_verified };
    const token = signToken(user);

    // Редірект на фронт з токеном — фронт зберігає його і робить /me
    const FRONT_URL = process.env.FRONTEND_URL || "https://danilets.com";
    const profile_complete = !!(userDoc.first_name && userDoc.last_name && userDoc.phone) ? 1 : 0;
    return res.redirect(`${FRONT_URL}/auth/callback?token=${token}&profile_complete=${profile_complete}`);
  } catch (err) {
    console.error("Apple callback error:", err);
    return res.status(500).json({ error: "Apple auth failed" });
  }
});

export default router;
