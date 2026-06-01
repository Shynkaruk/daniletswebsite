/* eslint-env node */
// ============================================================
// middleware/authMiddleware.js
// Middleware для перевірки JWT токена і прав адміністратора.
// Імпортується у всі route-файли що потребують авторизації.
// ============================================================

import jwt from "jsonwebtoken";

// Секрет для підпису JWT-токенів (задається через .env)
export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Час дії токена (задається через .env, за замовчуванням 7 днів)
export const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES || "7d";

// ---- Підписує JWT для юзера ----
// Повертає токен з uid, is_admin та email
export function signToken(user) {
  return jwt.sign(
    { uid: user.id, is_admin: !!user.is_admin, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

// ---- Генерує 6-значний OTP код ----
export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ---- Обов'язкова авторизація ----
// Якщо токен відсутній або недійсний — повертає 401
export function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

// ---- Опціональна авторизація ----
// Якщо токен є і валідний — req.user заповнюється.
// Якщо немає або недійсний — req.user = null (гостьовий доступ).
export function optionalAuth(req, _res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

// ---- Перевірка прав адміна ----
// Використовується після auth middleware
export function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: "forbidden" });
  next();
}
