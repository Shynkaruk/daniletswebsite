/* eslint-env node */
/* global process */
// ============================================================
// server.js — головний файл Express-сервера
//
// Відповідає виключно за:
//   1. Підключення middleware (cors, json, upload директорія)
//   2. Підключення всіх роутів
//   3. Роздачу статики Vite (dist/) і SPA fallback
//   4. Ініціалізацію БД і запуск сервера
//
// Вся бізнес-логіка — у відповідних файлах routes/ і helpers/
// ============================================================

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import webpush from "web-push";
import { fileURLToPath } from "url";
import { initDb, User, Card, PushSubscription } from "./db.js";

// ---- Підключення роутів ----
import googleCodeRouter     from "./routes/authGoogle.js";
import googleReviewsRouter  from "./routes/googleReviews.js";
import contactRouter        from "./routes/contact.js";
import contactsFormRouter   from "./routes/contactsform.js";
import checkoutRouter       from "./routes/checkout.js";

// ---- Нові роути (після рефакторингу) ----
import authRouter           from "./routes/authRoutes.js";
import contentRouter        from "./routes/contentRoutes.js";
import profileRouter        from "./routes/profileRoutes.js";
import requestRouter        from "./routes/requestRoutes.js";
import pushRouter           from "./routes/pushRoutes.js";
import adminRequestRouter   from "./routes/adminRequestRoutes.js";

// ---- Існуючий роут для карток (server/routes/cards.js) ----
import cardsRouter          from "./routes/cards.js";

// ---- Налаштування шляхів ----
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

// ---- Web Push (VAPID) — налаштовуємо якщо є ключі ----
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    // Очищаємо можливі пробіли та зайві = на кінці (помилка при копіюванні)
    const pubKey  = process.env.VAPID_PUBLIC_KEY.trim().replace(/=+$/, "");
    const privKey = process.env.VAPID_PRIVATE_KEY.trim().replace(/=+$/, "");
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || "mailto:admin@danilets.com",
      pubKey,
      privKey
    );
    console.log("[push] VAPID configured OK");
  } catch (e) {
    console.error("[push] Invalid VAPID keys — push disabled:", e.message);
  }
} else {
  console.warn("[push] VAPID keys not set — push notifications disabled");
}

const app = express();

// ---- Обслуговує .well-known/ (потрібно для Apple Pay domain verification) ----
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));

// ---- Базові налаштування Express ----
app.set("trust proxy", true);
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Статична директорія для завантажених файлів ----
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR));

// ============================================================
// ПІДКЛЮЧЕННЯ РОУТІВ
// ============================================================

// -- Зовнішні інтеграції --
app.use("/api/contact",       contactRouter);        // Форма контакту
app.use("/api/contactsform",  contactsFormRouter);   // Форма клієнтів
app.use("/api/reviews",       googleReviewsRouter);  // Google Reviews
app.use("/api",               checkoutRouter);       // Stripe/Whop checkout
app.use("/api/auth",          googleCodeRouter);     // Google OAuth

// -- Авторизація (OTP, register, login, Apple) --
app.use("/api/auth",          authRouter);

// -- Контент і картки --
app.use("/api/content",       contentRouter);        // Content blocks
app.use("/api/cards",         cardsRouter);          // Картки сервісів

// -- Особистий кабінет юзера --
app.use("/api/me",            profileRouter);        // Profile, vehicles, payment methods

// -- Запити на послуги (юзер і гість) --
app.use("/api/requests",      requestRouter);        // User requests

// -- Адмін панель --
app.use("/api/admin/push",    pushRouter);           // Push notifications
app.use("/api/admin/requests", adminRequestRouter);  // Admin: manage requests

// ---- Upload файлів (тільки адмін) ----
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = Date.now() + "_" + Math.random().toString(36).slice(2) + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

// Динамічно імпортуємо middleware щоб уникнути circular dependency
import { auth, requireAdmin } from "./middleware/authMiddleware.js";
app.post("/api/upload", auth, requireAdmin, upload.single("file"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ---- Health check для Digital Ocean App Platform ----
app.get("/health", (_req, res) => res.status(200).send("ok"));

// ---- Роздача фронтенду Vite (dist/) ----
// В продакшені dist/ будується і сервер роздає його як статику
const DIST_DIR = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST_DIR)) {
  // Hashed assets (JS/CSS/images) — кешуємо надовго
  app.use("/assets", express.static(path.join(DIST_DIR, "assets"), {
    maxAge: "1y",
    immutable: true,
  }));
  // Решта статики (favicon, manifest, тощо) — без кешу
  app.use(express.static(DIST_DIR, { maxAge: 0 }));

  // SPA fallback: тільки маршрути без розширення файлу → index.html
  // Запити до assets (.js, .css, etc.) що не знайдені — повертають 404,
  // а не HTML, щоб уникнути MIME type error у браузері
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    if (path.extname(req.path)) return res.status(404).end();
    res
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
      .sendFile(path.join(DIST_DIR, "index.html"));
  });
}

// ============================================================
// ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ І ЗАПУСК СЕРВЕРА
// ============================================================

// ---- Функція для створення першого адміна (one-time seed) ----
async function seedAdmin() {
  try {
    const exists = await User.findOne({ is_admin: true }).lean();
    if (exists) { console.log("[seedAdmin] Admin already exists:", exists.email); return; }

    const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const pass  = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const hash  = bcrypt.hashSync(pass, 10);

    const doc = await User.create({ email, password: hash, first_name: "Admin", last_name: "User", phone: "", is_admin: true });
    console.log(`[seedAdmin] Created admin: ${email} / ${pass} (id=${doc._id})`);
  } catch (err) {
    console.error("[seedAdmin] Failed to create admin:", err);
  }
}

initDb()
  .then(async () => {
    await seedAdmin();
    app.listen(PORT, HOST, () => {
      console.log(`API listening on http://${HOST}:${PORT} (NODE_ENV=${process.env.NODE_ENV || "dev"})`);
    });
  })
  .catch((err) => {
    console.error("Failed to init DB", err);
    process.exit(1);
  });
