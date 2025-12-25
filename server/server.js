/* eslint-env node */
/* global process */

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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
  OtpCode,
} from "./db.js";
import googleCodeRouter from "./routes/authGoogle.js";
import googleReviewsRouter from "./routes/reviews.js";
import { sendOtpEmail } from "./email.js";
import contactRouter from "./routes/contact.js";
import contactsFormRouter from "./routes/contactsform.js";
import checkoutRouter from "./routes/checkout.js";

const app = express();

// ---- базові налаштування для DO ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES || "7d";

const BITRIX_BASE_URL = process.env.BITRIX_BASE_URL || "";

// 🆕 ID воронок у Bitrix (ставиш свої значення з CRM)
const BITRIX_CATEGORY_DETAILING = Number(
  process.env.BITRIX_CATEGORY_DETAILING ?? 0
);
const BITRIX_CATEGORY_CLEANING = Number(
  process.env.BITRIX_CATEGORY_CLEANING ?? 1
);

const BITRIX_DEAL_TYPE = process.env.BITRIX_DEAL_TYPE || "SERVICES";

// 🆕 ID етапів "NEW" для кожної воронки
// приклад значень: "NEW", "C1:NEW", "C2:NEW"
// якщо не задано, підставляємо за замовчуванням
const BITRIX_STAGE_DETAILING_NEW =
  process.env.BITRIX_STAGE_DETAILING_NEW || null;
const BITRIX_STAGE_CLEANING_NEW =
  process.env.BITRIX_STAGE_CLEANING_NEW || null;

app.use(
  "/.well-known",
  express.static(path.join(__dirname, ".well-known"))
);


app.set("trust proxy", true);

app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// один раз
app.use("/api/contact", contactRouter);

// ✅ новий роут для форми клієнтів
app.use("/api/contactsform", contactsFormRouter);


app.use("/api/reviews", googleReviewsRouter);
app.use("/api", checkoutRouter);

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

// ====================== Bitrix helpers ======================

async function ensureBitrixContact({ fullName, email, phone }) {
  if (!BITRIX_BASE_URL) return null;

  try {
    let contactId = null;

    // 1) Спробувати знайти контакт по email або телефону
    if (email || phone) {
      const listPayload = {
        filter: {},
        select: ["ID"],
      };

      if (email) {
        listPayload.filter.EMAIL = email;
      } else if (phone) {
        listPayload.filter.PHONE = phone;
      }

      const listUrl = `${BITRIX_BASE_URL}crm.contact.list.json`;
      const listRes = await axios.post(listUrl, listPayload);
      const found = listRes.data?.result?.[0];
      if (found?.ID) {
        contactId = found.ID;
      }
    }

    // 2) Якщо не знайшли – створюємо нового контакта
    if (!contactId) {
      const addUrl = `${BITRIX_BASE_URL}crm.contact.add.json`;
      const addPayload = {
        fields: {
          NAME: fullName || email || phone || "Website client",
          TYPE_ID: "CLIENT",
          SOURCE_ID: "WEB",
          OPENED: "Y",
          PHONE: phone
            ? [{ VALUE: phone, VALUE_TYPE: "WORK" }]
            : [],
          EMAIL: email
            ? [{ VALUE: email, VALUE_TYPE: "WORK" }]
            : [],
        },
      };

      const addRes = await axios.post(addUrl, addPayload);
      contactId = addRes.data?.result || null;
    }

    return contactId;
  } catch (err) {
    console.error("Bitrix contact error:", err.response?.data || err.message);
    return null;
  }
}

function buildCleaningComment(requestDoc, userDoc) {
  let parsed = {};
  try {
    parsed = JSON.parse(requestDoc.items_json || "{}");
  } catch {
    parsed = {};
  }

  const {
    propertyType,
    projectType,
    bedrooms,
    bathrooms,
    areas,
    generalTasks,
    kitchenTasks,
    resBudget,
    extraDetails,
    companyName,
    companyAddress,
    squareFeet,
    frequency,
    comBudget,
    comExtraDetails,
  } = parsed;

  const lines = [];

  // Заголовок
  lines.push("CLEANING BOOKING");
  lines.push("");
  lines.push("Main information:");
  lines.push(`- Status: ${requestDoc.status || "-"}`);
  lines.push(`- Service type: Cleaning`);
  lines.push(`- Service date: ${requestDoc.service_date || "-"}`);
  lines.push(`- Time window: ${requestDoc.time_window || "-"}`);
  lines.push("");

  if (propertyType === "residential") {
    lines.push("Residential cleaning:");
    lines.push(`- Property type: Residential`);
    if (projectType) lines.push(`- Project type: ${projectType}`);
    if (bedrooms || bathrooms) {
      lines.push("- Home details:");
      if (bedrooms) lines.push(`  • Bedrooms: ${bedrooms}`);
      if (bathrooms) lines.push(`  • Bathrooms: ${bathrooms}`);
    }
    if (Array.isArray(areas) && areas.length) {
      lines.push("- Areas to clean:");
      areas.forEach((a) => lines.push(`  • ${a}`));
    }
    if (Array.isArray(generalTasks) && generalTasks.length) {
      lines.push("- General tasks:");
      generalTasks.forEach((t) => lines.push(`  • ${t}`));
    }
    if (Array.isArray(kitchenTasks) && kitchenTasks.length) {
      lines.push("- Kitchen tasks:");
      kitchenTasks.forEach((t) => lines.push(`  • ${t}`));
    }
    if (resBudget) lines.push(`- Budget: ${resBudget}`);
    lines.push("");
  }

  if (propertyType === "commercial") {
    lines.push("Commercial cleaning:");
    lines.push(`- Property type: Commercial`);
    if (projectType) lines.push(`- Project type: ${projectType}`);
    if (companyName) lines.push(`- Company name: ${companyName}`);
    if (companyAddress) lines.push(`- Company address: ${companyAddress}`);
    if (squareFeet) lines.push(`- Square footage: ${squareFeet}`);
    if (frequency) lines.push(`- Frequency: ${frequency}`);
    if (comBudget) lines.push(`- Budget: ${comBudget}`);
    lines.push("");
  }

  // Додаткові нотатки (тільки якщо є текст)
  const notes = [];
  if (extraDetails) notes.push(extraDetails);
  if (comExtraDetails) notes.push(comExtraDetails);
  if (requestDoc.notes_customer) notes.push(requestDoc.notes_customer);

  if (notes.length) {
    lines.push("Additional notes from customer:");
    notes.forEach((n) => lines.push(`- ${n}`));
    lines.push("");
  }

  // Інфа про клієнта
  lines.push("Customer information:");
  const nameLine = `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim();
  if (nameLine) lines.push(`- Name: ${nameLine}`);
  if (userDoc.email) lines.push(`- Email: ${userDoc.email}`);
  if (userDoc.phone) lines.push(`- Phone: ${userDoc.phone}`);

  const text = lines.join("\n").trim();
  return text || "Cleaning booking from website";
}

function buildDetailingComment(requestDoc, userDoc, vehicleDoc) {
  const lines = [];

  // Пробуємо розпарсити items_json
  let parsed;
  try {
    parsed = JSON.parse(requestDoc.items_json || "{}");
  } catch {
    parsed = {};
  }

  const serviceType = requestDoc.service_type || "";

  // --- Випадок старого формату (масив з послугами) — лишаємо для сумісності ---
  if (Array.isArray(parsed)) {
    let items = parsed;
    const mainService = items[0] || null;
    const addons = items
      .slice(1)
      .filter(
        (it) => it && typeof it.title === "string" && it.title !== "Tip"
      );
    const tipItem = items.find((it) => it && it.title === "Tip");

    lines.push("DETAILING BOOKING (legacy format)");
    lines.push("");
    lines.push("Main information:");
    lines.push(`- Status: ${requestDoc.status || "-"}`);
    lines.push(`- Location type: ${requestDoc.location_type || "-"}`);
    lines.push(`- Service date: ${requestDoc.service_date || "-"}`);
    lines.push(`- Time window: ${requestDoc.time_window || "-"}`);
    lines.push("");

    if (mainService) {
      lines.push("Type services (main package):");
      lines.push(`- ${mainService.title}`);
      lines.push("");
    }

    if (addons.length) {
      lines.push("Additional services:");
      addons.forEach((svc) => lines.push(`- ${svc.title}`));
      lines.push("");
    }

    if (tipItem) {
      lines.push("Tip:");
      lines.push(
        `- Amount: ${tipItem.price != null ? tipItem.price : ""}`
      );
      lines.push("");
    }

    lines.push("Location:");
    if (requestDoc.service_address)
      lines.push(`- Service address: ${requestDoc.service_address}`);
    if (requestDoc.pickup_address)
      lines.push(`- Pickup address: ${requestDoc.pickup_address}`);
    if (requestDoc.dropoff_address)
      lines.push(`- Dropoff address: ${requestDoc.dropoff_address}`);
    lines.push("");

    if (vehicleDoc) {
      lines.push("Vehicle:");
      if (vehicleDoc.year) lines.push(`- Year: ${vehicleDoc.year}`);
      if (vehicleDoc.make) lines.push(`- Make: ${vehicleDoc.make}`);
      if (vehicleDoc.model) lines.push(`- Model: ${vehicleDoc.model}`);
      if (vehicleDoc.color) lines.push(`- Color: ${vehicleDoc.color}`);
      if (vehicleDoc.plate) lines.push(`- Plate: ${vehicleDoc.plate}`);
      lines.push("");
    }

    lines.push("Price:");
    lines.push(`- Subtotal: ${requestDoc.subtotal || 0}`);
    lines.push(`- Tax: ${requestDoc.tax || 0}`);
    lines.push(`- Total: ${requestDoc.total || 0}`);
    lines.push("");

    if (requestDoc.notes_customer) {
      lines.push("Additional notes from customer:");
      lines.push(`- ${requestDoc.notes_customer}`);
      lines.push("");
    }

    lines.push("Customer information:");
    const nameLineLegacy = `${userDoc.first_name || ""} ${
      userDoc.last_name || ""
    }`.trim();
    if (nameLineLegacy) lines.push(`- Name: ${nameLineLegacy}`);
    if (userDoc.email) lines.push(`- Email: ${userDoc.email}`);
    if (userDoc.phone) lines.push(`- Phone: ${userDoc.phone}`);

    const textLegacy = lines.join("\n").trim();
    return textLegacy || "Detailing booking from website";
  }

  // --- Новий формат: персональний детайлінг з Booking.jsx ---
  if (serviceType === "detailing_quote_personal" || parsed.vehicle) {
    const {
      vehicle,
      history,
      services,
      multipleVehicles,
      vehicles,
      location,
      contact,
    } = parsed;

    lines.push("DETAILING QUOTE (PERSONAL)");
    lines.push("");
    lines.push("Main information:");
    lines.push(`- Status: ${requestDoc.status || "-"}`);
    lines.push(`- Service type: ${serviceType || "detailing_quote_personal"}`);
    lines.push(`- Service date: ${requestDoc.service_date || "-"}`);
    lines.push(`- Location type: ${requestDoc.location_type || "-"}`);
    lines.push("");

    // Vehicle
    lines.push("Vehicle:");
    if (vehicle?.year) lines.push(`- Year: ${vehicle.year}`);
    if (vehicle?.make) lines.push(`- Make: ${vehicle.make}`);
    if (vehicle?.model) lines.push(`- Model: ${vehicle.model}`);
    if (multipleVehicles && Array.isArray(vehicles) && vehicles.length) {
      lines.push("- Multiple vehicles selected:");
      vehicles.forEach((v, idx) => {
        lines.push(
          `  • Vehicle ${idx + 1}: ${v.model || "(no description)"} – services: ${
            Array.isArray(v.services) && v.services.length
              ? v.services.join(", ")
              : "none"
          }`
        );
      });
    }
    lines.push("");

    // History & condition
    if (history) {
      lines.push("Vehicle history & condition:");
      if (history.lastDetailed)
        lines.push(`- Last detailed: ${history.lastDetailed}`);
      if (
        Array.isArray(history.conditionFlags) &&
        history.conditionFlags.length
      ) {
        lines.push(`- Condition flags: ${history.conditionFlags.join(", ")}`);
      }
      if (history.conditionRating)
        lines.push(`- Overall condition: ${history.conditionRating}`);
      lines.push("");
    }

    // Services
    lines.push("Requested services:");
    if (Array.isArray(services) && services.length) {
      services.forEach((s) => lines.push(`- ${s}`));
    } else {
      lines.push("- (none selected)");
    }
    lines.push("");

    // Location
    lines.push("Location:");
    if (location?.baseAddress)
      lines.push(`- Customer address (search): ${location.baseAddress}`);
    if (requestDoc.service_address)
      lines.push(`- Service address: ${requestDoc.service_address}`);
    if (requestDoc.pickup_address)
      lines.push(`- Pickup address: ${requestDoc.pickup_address}`);
    if (requestDoc.dropoff_address)
      lines.push(`- Dropoff address: ${requestDoc.dropoff_address}`);
    if (location?.completionDate)
      lines.push(`- Preferred completion date: ${location.completionDate}`);
    lines.push("");

    // Notes
    if (requestDoc.notes_customer || parsed.contact?.extraInfo) {
      lines.push("Additional notes from customer:");
      if (parsed.contact?.extraInfo)
        lines.push(`- ${parsed.contact.extraInfo}`);
      if (requestDoc.notes_customer)
        lines.push(`- ${requestDoc.notes_customer}`);
      lines.push("");
    }

    // Customer
    lines.push("Customer information:");
    const contactName =
      `${contact?.firstName || ""} ${
        contact?.lastName || ""
      }`.trim() ||
      `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim();
    if (contactName) lines.push(`- Name: ${contactName}`);
    const email =
      contact?.email || parsed.contact?.email || userDoc.email || null;
    const phone =
      contact?.phone || parsed.contact?.phone || userDoc.phone || null;
    if (email) lines.push(`- Email: ${email}`);
    if (phone) lines.push(`- Phone: ${phone}`);

    const textPersonal = lines.join("\n").trim();
    return textPersonal || "Detailing quote (personal) from website";
  }

  // --- Новий формат: бізнес / флот детайлінг ---
  if (
    serviceType === "detailing_quote_business" ||
    parsed.business ||
    parsed.fleet
  ) {
    const { business, contact, fleet, preferences, location } = parsed;

    lines.push("DETAILING QUOTE (BUSINESS / FLEET)");
    lines.push("");
    lines.push("Main information:");
    lines.push(`- Status: ${requestDoc.status || "-"}`);
    lines.push(`- Service type: ${serviceType || "detailing_quote_business"}`);
    lines.push("");
    if (business?.businessType)
      lines.push(`- Business type: ${business.businessType}`);
    if (business?.businessTypeOther)
      lines.push(`- Business type (other): ${business.businessTypeOther}`);
    if (business?.vehiclesCount)
      lines.push(`- Number of vehicles (approx): ${business.vehiclesCount}`);
    if (business?.serviceFrequency)
      lines.push(`- Service frequency: ${business.serviceFrequency}`);
    if (business?.serviceFrequencyOther)
      lines.push(
        `- Service frequency (other): ${business.serviceFrequencyOther}`
      );
    lines.push("");

    // Fleet
    if (fleet) {
      lines.push("Fleet:");
      const vt = fleet.vehicleTypes || {};
      const sumVehicles = Object.values(vt).reduce(
        (s, v) => s + (Number(v) || 0),
        0
      );
      if (sumVehicles) lines.push(`- Total vehicles in fleet: ${sumVehicles}`);

      const vehicleLines = [];
      const addIf = (key, label) => {
        const val = Number(vt[key] || 0);
        if (val > 0) {
          vehicleLines.push(`${label}: ${val}`);
        }
      };
      addIf("sedans", "Sedans");
      addIf("suvs", "SUVs");
      addIf("pickups", "Pick-Ups");
      addIf("minivans", "Mini-Vans / 3-Row SUVs");
      addIf("transit_vans", "Transit Vans");
      addIf("semi_trucks", "Semi-Trucks");
      if (Number(vt.other || 0) > 0) {
        vehicleLines.push(
          `${fleet.vehicleOtherLabel || "Other"}: ${vt.other}`
        );
      }
      if (vehicleLines.length) {
        vehicleLines.forEach((l) => lines.push(`- ${l}`));
      }
      if (fleet.serviceLocation)
        lines.push(`- Service location: ${fleet.serviceLocation}`);
      if (Array.isArray(fleet.services) && fleet.services.length) {
        lines.push("- Requested services:");
        fleet.services.forEach((s) => lines.push(`  • ${s}`));
      }
      if (fleet.servicesOther) {
        lines.push(`- Other services: ${fleet.servicesOther}`);
      }
      lines.push("");
    }

    // Location
    lines.push("Location:");
    if (location?.baseAddress)
      lines.push(`- Base customer location: ${location.baseAddress}`);
    if (requestDoc.service_address)
      lines.push(`- Service address: ${requestDoc.service_address}`);
    if (requestDoc.pickup_address)
      lines.push(`- Pickup address: ${requestDoc.pickup_address}`);
    if (requestDoc.dropoff_address)
      lines.push(`- Dropoff address: ${requestDoc.dropoff_address}`);
    lines.push("");

    // Preferences / notes
    if (preferences) {
      lines.push("Contact preferences:");
      if (preferences.preferredContactMethod)
        lines.push(
          `- Preferred contact method: ${preferences.preferredContactMethod}`
        );
      if (preferences.contactTimePreference)
        lines.push(
          `- Best time to reach: ${preferences.contactTimePreference}`
        );
      if (preferences.notes) {
        lines.push("");
        lines.push("Additional preferences / notes:");
        lines.push(`- ${preferences.notes}`);
      }
      lines.push("");
    }

    if (requestDoc.notes_customer) {
      lines.push("Notes (from requestDoc.notes_customer):");
      lines.push(`- ${requestDoc.notes_customer}`);
      lines.push("");
    }

    // Customer
    lines.push("Customer information:");
    const contactName =
      `${contact?.firstName || ""} ${
        contact?.lastName || ""
      }`.trim() ||
      `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim();
    if (contactName) lines.push(`- Name: ${contactName}`);
    const email =
      contact?.email || parsed.contact?.email || userDoc.email || null;
    const phone =
      contact?.phone || parsed.contact?.phone || userDoc.phone || null;
    if (contact?.companyName) lines.push(`- Company: ${contact.companyName}`);
    if (contact?.companyAddress)
      lines.push(`- Company address: ${contact.companyAddress}`);
    if (email) lines.push(`- Email: ${email}`);
    if (phone) lines.push(`- Phone: ${phone}`);

    const textBusiness = lines.join("\n").trim();
    return textBusiness || "Detailing quote (business/fleet) from website";
  }

  // Fallback
  const text = lines.join("\n").trim();
  return text || "Detailing booking from website";
}

// ---- Хелпер для створення DEAL в Bitrix24 ----
async function createBitrixDealFromRequest(requestDoc, userDoc) {
  if (!BITRIX_BASE_URL) {
    console.warn("BITRIX_BASE_URL not set, skipping Bitrix deal creation");
    return;
  }

  try {
    const fullName =
      `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim() ||
      userDoc.email ||
      "New client";

    const serviceType = requestDoc.service_type || "";

    // 🔹 Все, що починається з "cleaning" – вважаємо Cleaning
    const isCleaning =
      serviceType.startsWith("cleaning") ||
      (!serviceType && requestDoc.location_type === "cleaning");

    const categoryId = isCleaning
      ? BITRIX_CATEGORY_CLEANING
      : BITRIX_CATEGORY_DETAILING;

    // 🔹 Тайтл угоди в Bitrix
    let titlePrefix;
    if (isCleaning) {
      titlePrefix = "Cleaning";
    } else if (serviceType === "detailing_quote_business") {
      titlePrefix = "Detailing (Business/Fleet)";
    } else if (serviceType === "detailing_quote_personal") {
      titlePrefix = "Detailing (Personal)";
    } else {
      titlePrefix = "Detailing";
    }

    // 🔹 Сума угоди – для квот можемо ставити 0, або брати total, якщо він є
    const opportunity = isCleaning ? 0 : (requestDoc.total ?? 0);

    // 🔹 Стадія воронки
    const stageId =
      categoryId && categoryId > 0 ? `C${categoryId}:NEW` : "NEW";

    // 🔹 Контакт
    const contactId = await ensureBitrixContact({
      fullName,
      email: userDoc.email,
      phone: userDoc.phone,
    });

    // 🔹 Авто (тільки для старих Detailing-букінгів, де є vehicle_id)
    let vehicleDoc = null;
    if (!isCleaning && requestDoc.vehicle_id) {
      try {
        vehicleDoc = await Vehicle.findById(requestDoc.vehicle_id).lean();
      } catch (e) {
        console.error("Failed to load vehicle for detailing comment:", e);
      }
    }

    // 🔹 Коментар в угоді – будуємо окремими хелперами
    const commentText = isCleaning
      ? buildCleaningComment(requestDoc, userDoc)
      : buildDetailingComment(requestDoc, userDoc, vehicleDoc);

    console.log("Bitrix COMMENTS payload:\n", commentText);

    const url = `${BITRIX_BASE_URL}crm.deal.add.json`;

    const payload = {
      fields: {
        TITLE: `${titlePrefix} – ${fullName}`,

        CATEGORY_ID: categoryId,
        STAGE_ID: stageId,

        // Тип сделки — Services (налаштований у Bitrix)
        TYPE_ID: BITRIX_DEAL_TYPE,

        OPPORTUNITY: opportunity,
        CURRENCY_ID: requestDoc.currency || "USD",

        ...(contactId ? { CONTACT_ID: contactId } : {}),

        PHONE: userDoc.phone
          ? [{ VALUE: userDoc.phone, VALUE_TYPE: "WORK" }]
          : [],
        EMAIL: userDoc.email
          ? [{ VALUE: userDoc.email, VALUE_TYPE: "WORK" }]
          : [],

        COMMENTS: commentText,
        SOURCE_ID: "WEB",
      },
    };

    const { data } = await axios.post(url, payload);
    console.log("Bitrix Deal created:", data);

    const dealId = data?.result;

    if (!dealId) {
      console.error("No dealId returned from Bitrix:", data);
      return data;
    }

    // 🧾 Додаємо товари/послуги тільки для Detailing, і тільки якщо items_json – масив (старий формат)
    if (!isCleaning) {
      let items = [];
      try {
        const parsed = JSON.parse(requestDoc.items_json || "[]");
        if (Array.isArray(parsed)) items = parsed;
      } catch {
        items = [];
      }

      const rows = items
        .filter(
          (it) =>
            it &&
            typeof it.title === "string" &&
            it.title.trim() &&
            it.title !== "Tip" // Tip не додаємо як товар
        )
        .map((it) => ({
          PRODUCT_NAME: it.title,
          PRICE: Number(it.price) || 0,
          QUANTITY:
            it.qty != null && !Number.isNaN(Number(it.qty))
              ? Number(it.qty)
              : 1,
        }));

      if (rows.length) {
        try {
          const prodUrl = `${BITRIX_BASE_URL}crm.deal.productrows.set.json`;
          const prodPayload = {
            id: dealId,
            rows,
          };

          const prodRes = await axios.post(prodUrl, prodPayload);
          console.log("Bitrix product rows set:", prodRes.data);
        } catch (e) {
          console.error(
            "Bitrix productrows.set error:",
            e.response?.data || e.message
          );
        }
      }
    }

    return data;
  } catch (err) {
    console.error(
      "Bitrix deal error:",
      err.response?.data || err.message || err
    );
  }
}



// ====================== OTP ======================

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
      return res.json({ ok: true });
    }

    const code = generateOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

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
app.post("/api/auth/verify-email-otp", async (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: "email and code required" });
  }

  try {
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

    if (!userDoc) return res.status(404).json({ error: "user not found" });

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
    console.error("verify-email-otp error", e);
    res.status(500).json({ error: "failed to verify code" });
  }
});

// POST /api/auth/reset-password
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
      expires_at: { $gt: new Date() },
    });

    if (!otp) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    otp.used = true;
    await otp.save();

    const hash = bcrypt.hashSync(new_password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { password: hash } },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ error: "user not found" });

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

// login
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


async function findOrCreateAppleUser(applePayload) {
  const appleId = applePayload.sub;
  const email = applePayload.email;
  const emailVerified =
    applePayload.email_verified === "true" || applePayload.email_verified === true;

  let userDoc = await User.findOne({ apple_id: appleId });

  if (!userDoc && email) {
    // пробуємо знайти по email (може вже є акаунт)
    userDoc = await User.findOne({ email });
  }

  if (!userDoc) {
    // створюємо нового
    userDoc = await User.create({
      email: email || "",
      apple_id: appleId,
      first_name: "",
      last_name: "",
      phone: "",
      is_admin: false,
      email_verified: emailVerified,
    });
  } else {
    // дописуємо apple_id, якщо не було
    if (!userDoc.apple_id) {
      userDoc.apple_id = appleId;
    }
    if (emailVerified && !userDoc.email_verified) {
      userDoc.email_verified = true;
    }
    await userDoc.save();
  }

  return userDoc;
}

app.get("/api/auth/apple/login", (req, res) => {
  const params = new URLSearchParams({
    response_type: "code",
    response_mode: "form_post",
    client_id: process.env.APPLE_CLIENT_ID,
    redirect_uri: process.env.APPLE_REDIRECT_URI,
    scope: "name email",
  });

  const url =
    "https://appleid.apple.com/auth/authorize?" + params.toString();

  res.redirect(url);
});


app.post("/api/auth/apple/callback", async (req, res) => {
  try {
    const { code } = req.body || {};

    if (!code) {
      return res.status(400).json({ error: "No code from Apple" });
    }

    // формується clientSecret
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

    // розпарсимо id_token від Apple
    const applePayload = jwt.decode(tokens.id_token);

    // шукаємо/створюємо юзера
    const userDoc = await findOrCreateAppleUser(applePayload);

    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      first_name: userDoc.first_name,
      last_name: userDoc.last_name,
      phone: userDoc.phone,
      is_admin: userDoc.is_admin,
      email_verified: userDoc.email_verified,
    };

    const token = signToken(user); // твоя існуюча функція

    // 🔹 Варіант 1: редірект на фронт з токеном у query
    const FRONT_URL = process.env.FRONT_URL || "https://danilets.com";
    const redirectUrl = `${FRONT_URL}/auth/callback?token=${token}`;

    return res.redirect(redirectUrl);

    // 🔹 Якщо захочеш чистий JSON, замість редіректу робиш:
    // return res.json({ user, token });
  } catch (err) {
    console.error("Apple callback error:", err);
    return res.status(500).json({ error: "Apple auth failed" });
  }
});



// ====================== CONTENT BLOCKS ======================

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

app.get("/api/cards", async (req, res) => {
  const { type, published, slug, slug_in } = req.query;

  try {
    const filter = {};
    if (type) filter.type = type;
    if (published != null) filter.published = !!Number(published);

    if (slug) {
      filter.slug = slug;
    }

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

// ====================== VEHICLES ======================

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

app.post("/api/requests", auth, async (req, res) => {
  const {
    vehicle_id,
    status = "new",
    location_type = "shop",
    service_date,
    time_window,
    service_type,
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

  if (!service_type) {
    return res.status(400).json({ error: "service_type required" });
  }

  const doc = await RequestModel.create({
    user_id: req.user.uid,
    vehicle_id: vehicle_id || null,
    service_type, // ✅ збережеться (після фіксу схеми)
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

  const row = doc.toObject();
  row.id = row._id.toString();
  delete row._id;
  res.json(row);
});


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

app.delete("/api/requests/:id", auth, async (req, res) => {
  const id = req.params.id;
  const exists = await RequestModel.findOne({ _id: id, user_id: req.user.uid });
  if (!exists) return res.status(404).json({ error: "not found" });

  await RequestModel.deleteOne({ _id: id });
  res.json({ ok: true });
});

// ====================== ADMIN: REQUESTS ======================

app.get("/api/admin/requests", auth, requireAdmin, async (req, res) => {
  const { status, service_type, service_type_prefix } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (service_type) filter.service_type = service_type;
  if (service_type_prefix) {
    filter.service_type = { $regex: `^${service_type_prefix}` };
  }

  const rows = await RequestModel.find(filter)
    .sort({ created_at: -1 })
    .lean();

  const normalized = rows.map((r) => ({
    ...r,
    id: r._id.toString(),
    _id: undefined,
  }));

  res.json(normalized);
});



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


app.delete("/api/admin/requests/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "invalid id" });
  }

  try {
    const result = await RequestModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to delete request" });
  }
});


// ---- запуск ----
initDb()
  .then(async () => {
    await seedAdmin();

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
