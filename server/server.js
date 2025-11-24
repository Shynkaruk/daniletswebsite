/* eslint-env node */
/* global process */

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import axios from "axios"; 
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import {
  initDb,
  User,
  ContentBlock,
  Card,
  UserPaymentMethod,
  Vehicle,
  RequestModel,
} from "./db.js";
import googleCodeRouter from "./routes/authGoogle.js";
import googleReviewsRouter  from "./routes/reviews.js";
import { OtpCode } from "./db.js";
import { sendOtpEmail } from "./email.js";

const app = express();

// ---- базові налаштування для DO ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES || "7d";

const BITRIX_BASE_URL = process.env.BITRIX_BASE_URL || "";

app.set("trust proxy", true);

app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/reviews", googleReviewsRouter);

// директорії з урахуванням __dirname (щоб не зламалось у контейнері)
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/api/auth", googleCodeRouter);

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
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

// ---- Health check для App Platform ----
app.get("/health", (_req, res) => res.status(200).send("ok"));

// ---- роздаємо фронтенд Vite з dist ----
const DIST_DIR = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get("/", (_req, res) => res.sendFile(path.join(DIST_DIR, "index.html")));
  // SPA fallback
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

// ===== helpers =====
function signToken(user) {
  return jwt.sign(
    { uid: user.id, is_admin: !!user.is_admin, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 цифр
}

async function createBitrixLeadFromRequest(requestDoc, userDoc) {
  if (!BITRIX_BASE_URL) {
    console.warn("BITRIX_BASE_URL not set, skipping Bitrix lead creation");
    return;
  }

  try {
    const fullName =
      `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim() ||
      userDoc.email;

    const url = `${BITRIX_BASE_URL}crm.lead.add.json`;

    const payload = {
      fields: {
        TITLE: `New booking – ${requestDoc.location_type || "service"}`,
        NAME: fullName,
        PHONE: userDoc.phone
          ? [{ VALUE: userDoc.phone, VALUE_TYPE: "WORK" }]
          : [],
        EMAIL: userDoc.email
          ? [{ VALUE: userDoc.email, VALUE_TYPE: "WORK" }]
          : [],
        COMMENTS: `
Status: ${requestDoc.status}
Location type: ${requestDoc.location_type}
Service date: ${requestDoc.service_date || "-"}
Time window: ${requestDoc.time_window || "-"}
Service address: ${requestDoc.service_address || "-"}
Pickup address: ${requestDoc.pickup_address || "-"}
Dropoff address: ${requestDoc.dropoff_address || "-"}
Currency: ${requestDoc.currency}
Subtotal: ${requestDoc.subtotal}
Tax: ${requestDoc.tax}
Total: ${requestDoc.total}

Notes from customer:
${requestDoc.notes_customer || "-"}
        `,
        SOURCE_ID: "WEB",
      },
    };

    const { data } = await axios.post(url, payload);
    console.log("Bitrix lead created:", data);
    return data;
  } catch (err) {
    console.error(
      "Failed to create Bitrix lead:",
      err.response?.data || err.message
    );
  }
}


// Уніфікований ендпоінт для відправки OTP
// body: { email, purpose: "verify" | "reset" }
app.post("/api/auth/otp/send", async (req, res) => {
  const { email, purpose = "verify" } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "email required" });
  }

  try {
    // нормалізуємо purpose до того, що зберігаємо в БД
    const normalizedPurpose = purpose === "reset" ? "reset" : "signup";

    // для reset перевіряємо, що юзер існує (щоб не палити, просто ok)
    if (normalizedPurpose === "reset") {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ ok: true });
      }
    }

    const code = generateOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 хв

    await OtpCode.create({
      email,
      code,
      purpose: normalizedPurpose,
      expires_at: expires,
    });

    await sendOtpEmail({ to: email, code, purpose: normalizedPurpose });

    res.json({ ok: true });
  } catch (e) {
    console.error("otp/send error", e);
    res.status(500).json({ error: "failed to send OTP" });
  }
});

// Уніфікований ендпоінт для перевірки OTP
// body: { email, code, purpose: "verify" | "reset" }
app.post("/api/auth/otp/verify", async (req, res) => {
  const { email, code, purpose = "verify" } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: "email and code required" });
  }

  try {
    const normalizedPurpose = purpose === "reset" ? "reset" : "signup";

    if (normalizedPurpose === "signup") {
      // це по суті те саме, що /api/auth/verify-email-otp
      const otp = await OtpCode.findOne({
        email,
        code,
        purpose: "signup",
        used: false,
        expires_at: { $gt: new Date() },
      });

      if (!otp) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      otp.used = true;
      await otp.save();

      const userDoc = await User.findOneAndUpdate(
        { email },
        { $set: { email_verified: true } },
        { new: true }
      ).lean();

      if (!userDoc) {
        return res.status(404).json({ error: "user not found" });
      }

      const user = {
        id: userDoc._id.toString(),
        email: userDoc.email,
        first_name: userDoc.first_name,
        last_name: userDoc.last_name,
        phone: userDoc.phone,
        is_admin: userDoc.is_admin,
        email_verified: userDoc.email_verified,
      };

      const token = signToken(user);
      return res.json({ user, token });
    }

    if (normalizedPurpose === "reset") {
      // тут тільки перевіряємо код, НЕ відмічаємо used,
      // щоб потім /api/auth/reset-password ще зміг його використати
      const otp = await OtpCode.findOne({
        email,
        code,
        purpose: "reset",
        used: false,
        expires_at: { $gt: new Date() },
      });

      if (!otp) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      // просто кажемо фронту "окей, код правильний"
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown purpose" });
  } catch (e) {
    console.error("otp/verify error", e);
    res.status(500).json({ error: "failed to verify OTP" });
  }
});


function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: "forbidden" });
  next();
}

// ====== SEED ADMIN USER (one-time) ======
async function seedAdmin() {
  try {
    const exists = await User.findOne({ is_admin: true }).lean();
    if (exists) {
      console.log("[seedAdmin] Admin already exists:", exists.email);
      return;
    }

    const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const pass = process.env.SEED_ADMIN_PASSWORD || "admin123";

    const hash = bcrypt.hashSync(pass, 10);

    const doc = await User.create({
      email,
      password: hash,
      first_name: "Admin",
      last_name: "User",
      phone: "",
      is_admin: true,
    });

    console.log(
      `[seedAdmin] Created admin: ${email} / ${pass} (id=${doc._id})`
    );
  } catch (err) {
    console.error("[seedAdmin] Failed to create admin:", err);
  }
}

// ====================== AUTH ======================

// register (створює звичайного юзера)
app.post("/api/auth/register", async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email & password required" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "email already exists" });
    }

    const hash = bcrypt.hashSync(password, 10);

    const userDoc = await User.create({
      email,
      password: hash,
      first_name: first_name || "",
      last_name: last_name || "",
      phone: phone || "",
      is_admin: false,
    });
    const code = generateOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await OtpCode.create({
      email,
      code,
      purpose: "signup",
      expires_at: expires,
    });

    try {
      await sendOtpEmail({ to: email, code, purpose: "signup" });
    } catch (e) {
      console.error("Failed to send signup OTP", e);
    }

    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      first_name: userDoc.first_name,
      last_name: userDoc.last_name,
      phone: userDoc.phone,
      is_admin: userDoc.is_admin,
    };

    const token = signToken(user);
    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to register" });
  }
});

// POST /api/auth/request-reset-otp
app.post("/api/auth/request-reset-otp", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Щоб не палити, що юзер відсутній — просто OK
      return res.json({ ok: true });
    }

    const code = generateOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 хв

    await OtpCode.create({
      email,
      code,
      purpose: "reset",
      expires_at: expires,
    });

    await sendOtpEmail({ to: email, code, purpose: "reset" });

    res.json({ ok: true });
  } catch (e) {
    console.error("request-reset-otp error", e);
    res.status(500).json({ error: "failed to send OTP" });
  }
});

// POST /api/auth/verify-email-otp
// body: { email, code }
app.post('/api/auth/verify-email-otp', async (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: 'email and code required' });
  }

  try {
    const otp = await OtpCode.findOne({
      email,
      code,
      purpose: 'signup',
      used: false,
      expires_at: { $gt: new Date() },
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    otp.used = true;
    await otp.save();

    const userDoc = await User.findOneAndUpdate(
      { email },
      { $set: { email_verified: true } },
      { new: true }
    ).lean();

    if (!userDoc) return res.status(404).json({ error: 'user not found' });

    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      first_name: userDoc.first_name,
      last_name: userDoc.last_name,
      phone: userDoc.phone,
      is_admin: userDoc.is_admin,
      email_verified: userDoc.email_verified,
    };
    const token = signToken(user);

    res.json({ user, token });
  } catch (e) {
    console.error('verify-email-otp error', e);
    res.status(500).json({ error: 'failed to verify code' });
  }
});


// POST /api/auth/reset-password
// body: { email, code, new_password }
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, code, new_password } = req.body || {};
  if (!email || !code || !new_password) {
    return res
      .status(400)
      .json({ error: "email, code and new_password required" });
  }

  try {
    const otp = await OtpCode.findOne({
      email,
      code,
      purpose: "reset",
      used: false,
      expires_at: { $gt: new Date() }, // ще не протух
    });

    if (!otp) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    // помічаємо код використаним
    otp.used = true;
    await otp.save();

    // оновлюємо пароль
    const hash = bcrypt.hashSync(new_password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { password: hash } },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ error: "user not found" });

    // Можна одразу залогінити
    const packed = {
      id: user._id.toString(),
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      is_admin: user.is_admin,
    };
    const token = signToken(packed);

    res.json({ user: packed, token });
  } catch (e) {
    console.error("reset-password error", e);
    res.status(500).json({ error: "failed to reset password" });
  }
});

// login (повертає user + JWT)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.status(401).json({ error: "invalid credentials" });

    const ok = bcrypt.compareSync(password, userDoc.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      first_name: userDoc.first_name,
      last_name: userDoc.last_name,
      phone: userDoc.phone,
      is_admin: userDoc.is_admin,
    };

    const token = signToken(user);
    res.json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "login failed" });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  const userDoc = await User.findById(req.user.uid).lean();
  if (!userDoc) return res.status(404).json({ error: "not found" });

  const { password, ...user } = userDoc;
  user.id = user._id.toString();
  delete user._id;

  res.json({ user });
});

// ====================== CONTENT BLOCKS ======================

// GET відкриті
app.get("/api/content", async (req, res) => {
  const { page, lang = "en" } = req.query;

  try {
    let rows;
    if (page) {
      rows = await ContentBlock.find({ page, lang })
        .sort({ sort_order: 1, _id: 1 })
        .lean();
    } else {
      rows = await ContentBlock.find({ lang })
        .sort({ page: 1, sort_order: 1 })
        .lean();
    }

    const normalized = rows.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));
    res.json(normalized);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load content" });
  }
});

app.get("/api/content/by-key/:key", async (req, res) => {
  const { key } = req.params;
  const { lang = "en" } = req.query;
  try {
    const row = await ContentBlock.findOne({ key, lang }).lean();
    if (!row) return res.json(null);
    row.id = row._id.toString();
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load content" });
  }
});

// Записні — лише admin
app.post("/api/content", auth, requireAdmin, async (req, res) => {
  const {
    key,
    page,
    lang = "en",
    value,
    published = 1,
    sort_order = 0,
  } = req.body || {};
  if (!key || value == null)
    return res.status(400).json({ error: "key and value required" });

  try {
    const doc = await ContentBlock.create({
      key,
      page: page || null,
      lang,
      value: typeof value === "string" ? value : JSON.stringify(value),
      published: !!published,
      sort_order,
      updated_by: req.user.uid,
      updated_at: new Date(),
    });

    const row = doc.toObject();
    row.id = row._id.toString();
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create content" });
  }
});

app.put("/api/content/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { key, page, lang, value, published, sort_order } = req.body || {};

  try {
    const prev = await ContentBlock.findById(id);
    if (!prev) return res.status(404).json({ error: "not found" });

    const update = {
      updated_by: req.user.uid,
      updated_at: new Date(),
    };
    if (key !== undefined) update.key = key || null;
    if (page !== undefined) update.page = page || null;
    if (lang !== undefined) update.lang = lang || "en";
    if (value !== undefined)
      update.value =
        value == null
          ? null
          : typeof value === "string"
          ? value
          : JSON.stringify(value);
    if (published !== undefined) update.published = !!published;
    if (sort_order !== undefined) update.sort_order = sort_order;

    const doc = await ContentBlock.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();
    const row = { ...doc, id: doc._id.toString() };
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update content" });
  }
});

app.delete("/api/content/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    await ContentBlock.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to delete content" });
  }
});

// ====================== CARDS ======================

// GET відкриті
app.get("/api/cards", async (req, res) => {
  const { type, published, slug, slug_in } = req.query;

  try {
    const filter = {};
    if (type) filter.type = type;
    if (published != null) filter.published = !!Number(published);

    // 🔹 фільтр по одному slug
    if (slug) {
      filter.slug = slug;
    }

    // 🔹 опціонально: кілька slug через кому: ?slug_in=detailing,detailing_addon
    if (slug_in) {
      const list = String(slug_in)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length) {
        filter.slug = { $in: list };
      }
    }

    const rows = await Card.find(filter)
      .sort({ sort_order: 1, _id: -1 })
      .lean();

    const normalized = rows.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));
    res.json(normalized);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load cards" });
  }
});


// Запис/оновлення/видалення — лише admin
app.post("/api/cards", auth, requireAdmin, async (req, res) => {
  const {
    type,
    title,
    subtitle,
    body,
    image_url,
    price,
    slug,
    sort_order = 0,
    published = 1,
  } = req.body || {};
  if (!type || !title)
    return res.status(400).json({ error: "type & title required" });

  try {
    const doc = await Card.create({
      type,
      title,
      subtitle: subtitle || null,
      body: body || null,
      image_url: image_url || null,
      price: price ?? null,
      slug: slug || null,
      sort_order,
      published: !!published,
      created_by: req.user.uid,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const row = doc.toObject();
    row.id = row._id.toString();
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create card" });
  }
});

app.put("/api/cards/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const {
    type,
    title,
    subtitle,
    body,
    image_url,
    price,
    slug,
    sort_order,
    published,
  } = req.body || {};

  try {
    const prev = await Card.findById(id);
    if (!prev) return res.status(404).json({ error: "not found" });

    const update = { updated_at: new Date() };
    if (type !== undefined) update.type = type;
    if (title !== undefined) update.title = title;
    if (subtitle !== undefined) update.subtitle = subtitle;
    if (body !== undefined) update.body = body;
    if (image_url !== undefined) update.image_url = image_url;
    if (price !== undefined) update.price = price;
    if (slug !== undefined) update.slug = slug;
    if (sort_order !== undefined) update.sort_order = sort_order;
    if (published !== undefined) update.published = !!published;

    const doc = await Card.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();
    const row = { ...doc, id: doc._id.toString() };
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update card" });
  }
});

app.delete("/api/cards/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    await Card.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to delete card" });
  }
});

// ====================== UPLOADS (тільки admin) ======================
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "_" + Math.random().toString(36).slice(2) + ext;
    cb(null, name);
  },
});

const upload = multer({ storage });

app.post(
  "/api/upload",
  auth,
  requireAdmin,
  upload.single("file"),
  (req, res) => {
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  }
);

// ====================== PROFILE ======================
app.get("/api/me/profile", auth, async (req, res) => {
  const userDoc = await User.findById(req.user.uid).lean();
  if (!userDoc) return res.status(404).json({ error: "not found" });

  const { password, ...u } = userDoc;
  u.id = u._id.toString();
  delete u._id;

  res.json(u);
});

app.put("/api/me/profile", auth, async (req, res) => {
  const { first_name, last_name, phone } = req.body || {};

  await User.findByIdAndUpdate(
    req.user.uid,
    { $set: { first_name, last_name, phone } },
    { new: false }
  );

  const userDoc = await User.findById(req.user.uid).lean();
  if (!userDoc) return res.status(404).json({ error: "not found" });

  const { password, ...u } = userDoc;
  u.id = u._id.toString();
  delete u._id;

  res.json(u);
});

// ====================== VEHICLES (тільки свої) ======================
app.get("/api/me/vehicles", auth, async (req, res) => {
  const rows = await Vehicle.find({ user_id: req.user.uid })
    .sort({ _id: -1 })
    .lean();
  const normalized = rows.map((v) => ({
    ...v,
    id: v._id.toString(),
    _id: undefined,
  }));
  res.json(normalized);
});

app.post("/api/me/vehicles", auth, async (req, res) => {
  const { make, model, year, color, plate, vin, notes } = req.body || {};

  const doc = await Vehicle.create({
    user_id: req.user.uid,
    make,
    model,
    year,
    color,
    plate,
    vin,
    notes,
  });

  const v = doc.toObject();
  v.id = v._id.toString();
  delete v._id;

  res.json(v);
});

app.put("/api/me/vehicles/:id", auth, async (req, res) => {
  const id = req.params.id;
  const { make, model, year, color, plate, vin, notes } = req.body || {};

  const owner = await Vehicle.findOne({ _id: id, user_id: req.user.uid });
  if (!owner) return res.status(404).json({ error: "not found" });

  const doc = await Vehicle.findByIdAndUpdate(
    id,
    {
      $set: {
        make,
        model,
        year,
        color,
        plate,
        vin,
        notes,
      },
    },
    { new: true }
  ).lean();

  const row = { ...doc, id: doc._id.toString() };
  delete row._id;
  res.json(row);
});

app.delete("/api/me/vehicles/:id", auth, async (req, res) => {
  const id = req.params.id;
  const owner = await Vehicle.findOne({ _id: id, user_id: req.user.uid });
  if (!owner) return res.status(404).json({ error: "not found" });

  await Vehicle.deleteOne({ _id: id });
  res.json({ ok: true });
});

// ====================== PAYMENT METHODS ======================

// GET /api/me/payment-methods
app.get("/api/me/payment-methods", auth, async (req, res) => {
  const rows = await UserPaymentMethod.find({ user_id: req.user.uid })
    .sort({ is_default: -1, _id: -1 })
    .lean();

  const normalized = rows.map((r) => ({
    ...r,
    id: r._id.toString(),
    _id: undefined,
  }));

  res.json(normalized);
});

// POST /api/me/payment-methods
app.post("/api/me/payment-methods", auth, async (req, res) => {
  const { brand, last4, exp_month, exp_year, is_default } = req.body || {};
  if (!brand || !last4 || !exp_month || !exp_year) {
    return res.status(400).json({ error: "missing fields" });
  }

  try {
    if (is_default) {
      await UserPaymentMethod.updateMany(
        { user_id: req.user.uid },
        { $set: { is_default: false } }
      );
    }

    const doc = await UserPaymentMethod.create({
      user_id: req.user.uid,
      brand,
      last4,
      exp_month,
      exp_year,
      is_default: !!is_default,
    });

    const row = doc.toObject();
    row.id = row._id.toString();
    delete row._id;

    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create payment method" });
  }
});

// PUT /api/me/payment-methods/:id
app.put("/api/me/payment-methods/:id", auth, async (req, res) => {
  const id = req.params.id;
  const { brand, last4, exp_month, exp_year, is_default } = req.body || {};

  const owner = await UserPaymentMethod.findById(id);
  if (!owner || owner.user_id.toString() !== req.user.uid) {
    return res.status(404).json({ error: "not found" });
  }

  try {
    if (is_default === true) {
      await UserPaymentMethod.updateMany(
        { user_id: req.user.uid },
        { $set: { is_default: false } }
      );
    }

    const update = {};
    if (brand !== undefined) update.brand = brand;
    if (last4 !== undefined) update.last4 = last4;
    if (exp_month !== undefined) update.exp_month = exp_month;
    if (exp_year !== undefined) update.exp_year = exp_year;
    if (is_default != null) update.is_default = !!is_default;

    const doc = await UserPaymentMethod.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();

    const row = { ...doc, id: doc._id.toString() };
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update payment method" });
  }
});

// DELETE /api/me/payment-methods/:id
app.delete("/api/me/payment-methods/:id", auth, async (req, res) => {
  const id = req.params.id;
  const owner = await UserPaymentMethod.findById(id);
  if (!owner || owner.user_id.toString() !== req.user.uid) {
    return res.status(404).json({ error: "not found" });
  }

  await UserPaymentMethod.deleteOne({ _id: id });
  res.json({ ok: true });
});

// ====================== REQUESTS (юзер) ======================
// ---- Хелпер для створення ліда в Bitrix24 ----
async function createBitrixLeadFromRequest(requestDoc, userDoc) {
  if (!BITRIX_BASE_URL) {
    console.warn("BITRIX_BASE_URL not set, skipping Bitrix lead creation");
    return;
  }

  try {
    const fullName =
      `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim() ||
      userDoc.email;

    const url = `${BITRIX_BASE_URL}crm.lead.add.json`;

    const payload = {
      fields: {
        TITLE: `New Booking – ${requestDoc.location_type || "service"}`,
        NAME: fullName,
        PHONE: userDoc.phone
          ? [{ VALUE: userDoc.phone, VALUE_TYPE: "WORK" }]
          : [],
        EMAIL: userDoc.email
          ? [{ VALUE: userDoc.email, VALUE_TYPE: "WORK" }]
          : [],
        COMMENTS: `
Status: ${requestDoc.status}
Service date: ${requestDoc.service_date || "-"}
Time window: ${requestDoc.time_window || "-"}
Service address: ${requestDoc.service_address || "-"}
Pickup address: ${requestDoc.pickup_address || "-"}
Dropoff address: ${requestDoc.dropoff_address || "-"}
Currency: ${requestDoc.currency}
Subtotal: ${requestDoc.subtotal}
Tax: ${requestDoc.tax}
Total: ${requestDoc.total}

Customer notes:
${requestDoc.notes_customer || "-"}
        `,
        SOURCE_ID: "WEB",
      },
    };

    const { data } = await axios.post(url, payload);
    console.log("Bitrix Lead created:", data);
    return data;
  } catch (err) {
    console.error("Bitrix lead error:", err.response?.data || err.message);
  }
}


// ====================== REQUEST ROUTES ======================

// GET /api/requests
app.get("/api/requests", auth, async (req, res) => {
  const rows = await RequestModel.find({ user_id: req.user.uid })
    .sort({ created_at: -1 })
    .lean();

  const normalized = rows.map((r) => ({
    ...r,
    id: r._id.toString(),
    _id: undefined,
  }));
  res.json(normalized);
});

// GET /api/requests/:id
app.get("/api/requests/:id", auth, async (req, res) => {
  const id = req.params.id;
  const row = await RequestModel.findOne({
    _id: id,
    user_id: req.user.uid,
  }).lean();
  if (!row) return res.status(404).json({ error: "not found" });

  row.id = row._id.toString();
  delete row._id;
  res.json(row);
});

// POST /api/requests
app.post("/api/requests", auth, async (req, res) => {
  const {
    vehicle_id,
    status = "new",
    location_type = "shop",
    service_date,
    time_window,
    service_address,
    pickup_address,
    dropoff_address,
    items_json,
    currency = "USD",
    subtotal = 0,
    tax = 0,
    total = 0,
    notes_customer,
  } = req.body || {};

  try {
    const doc = await RequestModel.create({
      user_id: req.user.uid,
      vehicle_id: vehicle_id || null,
      status,
      location_type,
      service_date: service_date || null,
      time_window: time_window || null,
      service_address: service_address || null,
      pickup_address: pickup_address || null,
      dropoff_address: dropoff_address || null,
      items_json: items_json || "[]",
      currency,
      subtotal,
      tax,
      total,
      notes_customer: notes_customer || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // --- Bitrix ---
    try {
      const userDoc = await User.findById(req.user.uid).lean();
      if (userDoc) {
        await createBitrixLeadFromRequest(doc, userDoc);
      }
    } catch (e) {
      console.error("Failed to send booking to Bitrix:", e);
    }

    const row = doc.toObject();
    row.id = row._id.toString();
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create request" });
  }
});

// PUT /api/requests/:id
app.put("/api/requests/:id", auth, async (req, res) => {
  const id = req.params.id;
  const exists = await RequestModel.findOne({ _id: id, user_id: req.user.uid });
  if (!exists) return res.status(404).json({ error: "not found" });

  const {
    vehicle_id,
    status,
    location_type,
    service_date,
    time_window,
    service_address,
    pickup_address,
    dropoff_address,
    items_json,
    currency,
    subtotal,
    tax,
    total,
    notes_customer,
  } = req.body || {};

  const update = { updated_at: new Date() };
  if (vehicle_id !== undefined) update.vehicle_id = vehicle_id || null;
  if (status !== undefined) update.status = status;
  if (location_type !== undefined) update.location_type = location_type;
  if (service_date !== undefined) update.service_date = service_date || null;
  if (time_window !== undefined) update.time_window = time_window || null;
  if (service_address !== undefined)
    update.service_address = service_address || null;
  if (pickup_address !== undefined)
    update.pickup_address = pickup_address || null;
  if (dropoff_address !== undefined)
    update.dropoff_address = dropoff_address || null;
  if (items_json !== undefined) update.items_json = items_json;
  if (currency !== undefined) update.currency = currency;
  if (subtotal !== undefined) update.subtotal = subtotal;
  if (tax !== undefined) update.tax = tax;
  if (total !== undefined) update.total = total;
  if (notes_customer !== undefined)
    update.notes_customer = notes_customer || null;

  const doc = await RequestModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean();
  const row = { ...doc, id: doc._id.toString() };
  delete row._id;
  res.json(row);
});

// DELETE /api/requests/:id
app.delete("/api/requests/:id", auth, async (req, res) => {
  const id = req.params.id;
  const exists = await RequestModel.findOne({ _id: id, user_id: req.user.uid });
  if (!exists) return res.status(404).json({ error: "not found" });

  await RequestModel.deleteOne({ _id: id });
  res.json({ ok: true });
});


// ====================== ADMIN: REQUESTS ======================

// список усіх заявок з фільтрами
app.get("/api/admin/requests", auth, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  try {
    const rows = await RequestModel.find(filter)
      .sort({ created_at: -1 })
      .populate("user_id")
      .populate("vehicle_id")
      .lean();

    const normalized = rows.map((r) => {
      const user = r.user_id || {};
      const vehicle = r.vehicle_id || {};
      const user_full_name =
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        "Unknown name";

      return {
        ...r,
        id: r._id.toString(),
        _id: undefined,
        user_email: user.email || null,
        user_phone: user.phone || null,
        user_full_name,
        vehicle_make: vehicle.make || null,
        vehicle_model: vehicle.model || null,
        vehicle_year: vehicle.year || null,
      };
    });

    res.json(normalized);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load admin requests" });
  }
});

// отримати одну заявку
app.get("/api/admin/requests/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const row = await RequestModel.findById(id).lean();
    if (!row) return res.status(404).json({ error: "not found" });

    row.id = row._id.toString();
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load request" });
  }
});

// створити нову (адмін від імені користувача)
app.post("/api/admin/requests", auth, requireAdmin, async (req, res) => {
  const { user_id, ...rest } = req.body || {};
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  const {
    vehicle_id,
    status = "new",
    location_type = "shop",
    service_date,
    time_window,
    service_address,
    pickup_address,
    dropoff_address,
    items_json,
    currency = "USD",
    subtotal = 0,
    tax = 0,
    total = 0,
    notes_customer,
    notes_admin,
  } = rest;

  try {
    const doc = await RequestModel.create({
      user_id,
      vehicle_id: vehicle_id || null,
      status,
      location_type,
      service_date: service_date || null,
      time_window: time_window || null,
      service_address: service_address || null,
      pickup_address: pickup_address || null,
      dropoff_address: dropoff_address || null,
      items_json: items_json || "[]",
      currency,
      subtotal,
      tax,
      total,
      notes_customer: notes_customer || null,
      notes_admin: notes_admin || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const row = doc.toObject();
    row.id = row._id.toString();
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create request" });
  }
});

// оновити будь-яку
app.put("/api/admin/requests/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const {
    user_id,
    vehicle_id,
    status,
    location_type,
    service_date,
    time_window,
    service_address,
    pickup_address,
    dropoff_address,
    items_json,
    currency,
    subtotal,
    tax,
    total,
    notes_customer,
    notes_admin,
  } = req.body || {};

  try {
    const prev = await RequestModel.findById(id);
    if (!prev) return res.status(404).json({ error: "not found" });

    const update = { updated_at: new Date() };
    if (user_id !== undefined) update.user_id = user_id;
    if (vehicle_id !== undefined) update.vehicle_id = vehicle_id || null;
    if (status !== undefined) update.status = status;
    if (location_type !== undefined) update.location_type = location_type;
    if (service_date !== undefined) update.service_date = service_date || null;
    if (time_window !== undefined) update.time_window = time_window || null;
    if (service_address !== undefined)
      update.service_address = service_address || null;
    if (pickup_address !== undefined)
      update.pickup_address = pickup_address || null;
    if (dropoff_address !== undefined)
      update.dropoff_address = dropoff_address || null;
    if (items_json !== undefined) update.items_json = items_json;
    if (currency !== undefined) update.currency = currency;
    if (subtotal !== undefined) update.subtotal = subtotal;
    if (tax !== undefined) update.tax = tax;
    if (total !== undefined) update.total = total;
    if (notes_customer !== undefined)
      update.notes_customer = notes_customer || null;
    if (notes_admin !== undefined) update.notes_admin = notes_admin || null;

    const doc = await RequestModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();
    const row = { ...doc, id: doc._id.toString() };
    delete row._id;
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update request" });
  }
});

// видалити
app.delete("/api/admin/requests/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    await RequestModel.deleteOne({ _id: id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to delete request" });
  }
});


// ---- запуск ----
initDb()
  .then(async () => {
    await seedAdmin(); // 🟢 створюємо адміна, якщо немає

    app.listen(PORT, HOST, () => {
      console.log(
        `API listening on http://${HOST}:${PORT} (NODE_ENV=${
          process.env.NODE_ENV || "dev"
        })`
      );
    });
  })
  .catch((err) => {
    console.error("Failed to init DB", err);
    process.exit(1);
  });
