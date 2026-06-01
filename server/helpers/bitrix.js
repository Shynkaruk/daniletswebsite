/* eslint-env node */
// ============================================================
// helpers/bitrix.js
// Вся логіка інтеграції з Bitrix24 CRM.
// Відповідає за: пошук/створення контакта, побудову коментарів
// до угод, та безпосереднє створення Deal в CRM.
// ============================================================

import axios from "axios";
import { Vehicle } from "../db.js";

// URL вебхука Bitrix24 (задається через .env)
const BITRIX_BASE_URL = process.env.BITRIX_BASE_URL || "";

// ID воронок (категорій) у Bitrix для кожного сервісу
const BITRIX_CATEGORY_DETAILING = Number(process.env.BITRIX_CATEGORY_DETAILING ?? 0);
const BITRIX_CATEGORY_CLEANING  = Number(process.env.BITRIX_CATEGORY_CLEANING  ?? 1);

// Тип угоди у Bitrix
const BITRIX_DEAL_TYPE = process.env.BITRIX_DEAL_TYPE || "SERVICES";

// ---- Знаходить існуючий контакт у Bitrix або створює новий ----
// Пошук іде спочатку по email, потім по телефону.
// Повертає ID контакта або null якщо Bitrix не налаштований.
export async function ensureBitrixContact({ fullName, email, phone }) {
  if (!BITRIX_BASE_URL) return null;

  try {
    let contactId = null;

    // 1) Шукаємо контакт по email або телефону
    if (email || phone) {
      const listPayload = { filter: {}, select: ["ID"] };
      if (email) listPayload.filter.EMAIL = email;
      else if (phone) listPayload.filter.PHONE = phone;

      const listRes = await axios.post(`${BITRIX_BASE_URL}crm.contact.list.json`, listPayload);
      const found = listRes.data?.result?.[0];
      if (found?.ID) contactId = found.ID;
    }

    // 2) Якщо не знайшли — створюємо нового контакта
    if (!contactId) {
      const addRes = await axios.post(`${BITRIX_BASE_URL}crm.contact.add.json`, {
        fields: {
          NAME: fullName || email || phone || "Website client",
          TYPE_ID: "CLIENT",
          SOURCE_ID: "WEB",
          OPENED: "Y",
          PHONE: phone ? [{ VALUE: phone, VALUE_TYPE: "WORK" }] : [],
          EMAIL: email ? [{ VALUE: email, VALUE_TYPE: "WORK" }] : [],
        },
      });
      contactId = addRes.data?.result || null;
    }

    return contactId;
  } catch (err) {
    console.error("Bitrix contact error:", err.response?.data || err.message);
    return null;
  }
}

// ---- Будує текст коментаря для Cleaning-угоди ----
// Парсить items_json запиту і формує читабельний текст для CRM.
export function buildCleaningComment(requestDoc, userDoc) {
  let parsed = {};
  try { parsed = JSON.parse(requestDoc.items_json || "{}"); } catch { parsed = {}; }

  const {
    propertyType, projectType, bedrooms, bathrooms, areas,
    generalTasks, kitchenTasks, resBudget, extraDetails,
    companyName, companyAddress, squareFeet, frequency,
    comBudget, comExtraDetails,
  } = parsed;

  const lines = [];
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

  const notes = [];
  if (extraDetails) notes.push(extraDetails);
  if (comExtraDetails) notes.push(comExtraDetails);
  if (requestDoc.notes_customer) notes.push(requestDoc.notes_customer);
  if (notes.length) {
    lines.push("Additional notes from customer:");
    notes.forEach((n) => lines.push(`- ${n}`));
    lines.push("");
  }

  lines.push("Customer information:");
  const nameLine = `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim();
  if (nameLine) lines.push(`- Name: ${nameLine}`);
  if (userDoc.email) lines.push(`- Email: ${userDoc.email}`);
  if (userDoc.phone) lines.push(`- Phone: ${userDoc.phone}`);

  return lines.join("\n").trim() || "Cleaning booking from website";
}

// ---- Будує текст коментаря для Detailing-угоди ----
// Підтримує три формати: legacy (масив), personal quote, business/fleet quote.
export function buildDetailingComment(requestDoc, userDoc, vehicleDoc) {
  const lines = [];
  let parsed;
  try { parsed = JSON.parse(requestDoc.items_json || "{}"); } catch { parsed = {}; }

  const serviceType = requestDoc.service_type || "";

  // Старий формат (масив послуг) — залишаємо для сумісності
  if (Array.isArray(parsed)) {
    const items = parsed;
    const mainService = items[0] || null;
    const addons = items.slice(1).filter((it) => it && typeof it.title === "string" && it.title !== "Tip");
    const tipItem = items.find((it) => it && it.title === "Tip");

    lines.push("DETAILING BOOKING (legacy format)");
    lines.push("");
    lines.push("Main information:");
    lines.push(`- Status: ${requestDoc.status || "-"}`);
    lines.push(`- Location type: ${requestDoc.location_type || "-"}`);
    lines.push(`- Service date: ${requestDoc.service_date || "-"}`);
    lines.push(`- Time window: ${requestDoc.time_window || "-"}`);
    lines.push("");
    if (mainService) { lines.push("Type services (main package):"); lines.push(`- ${mainService.title}`); lines.push(""); }
    if (addons.length) { lines.push("Additional services:"); addons.forEach((svc) => lines.push(`- ${svc.title}`)); lines.push(""); }
    if (tipItem) { lines.push("Tip:"); lines.push(`- Amount: ${tipItem.price != null ? tipItem.price : ""}`); lines.push(""); }
    lines.push("Location:");
    if (requestDoc.service_address) lines.push(`- Service address: ${requestDoc.service_address}`);
    if (requestDoc.pickup_address) lines.push(`- Pickup address: ${requestDoc.pickup_address}`);
    if (requestDoc.dropoff_address) lines.push(`- Dropoff address: ${requestDoc.dropoff_address}`);
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
    if (requestDoc.notes_customer) { lines.push("Additional notes from customer:"); lines.push(`- ${requestDoc.notes_customer}`); lines.push(""); }
    lines.push("Customer information:");
    const nameLegacy = `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim();
    if (nameLegacy) lines.push(`- Name: ${nameLegacy}`);
    if (userDoc.email) lines.push(`- Email: ${userDoc.email}`);
    if (userDoc.phone) lines.push(`- Phone: ${userDoc.phone}`);
    return lines.join("\n").trim() || "Detailing booking from website";
  }

  // Новий формат: персональний детайлінг
  if (serviceType === "detailing_quote_personal" || parsed.vehicle) {
    const { vehicle, history, services, multipleVehicles, vehicles, location, contact } = parsed;
    lines.push("DETAILING QUOTE (PERSONAL)");
    lines.push("");
    lines.push("Main information:");
    lines.push(`- Status: ${requestDoc.status || "-"}`);
    lines.push(`- Service type: ${serviceType || "detailing_quote_personal"}`);
    lines.push(`- Service date: ${requestDoc.service_date || "-"}`);
    lines.push(`- Location type: ${requestDoc.location_type || "-"}`);
    lines.push("");
    lines.push("Vehicle:");
    if (vehicle?.year) lines.push(`- Year: ${vehicle.year}`);
    if (vehicle?.make) lines.push(`- Make: ${vehicle.make}`);
    if (vehicle?.model) lines.push(`- Model: ${vehicle.model}`);
    if (multipleVehicles && Array.isArray(vehicles) && vehicles.length) {
      lines.push("- Multiple vehicles selected:");
      vehicles.forEach((v, idx) => {
        lines.push(`  • Vehicle ${idx + 1}: ${v.model || "(no description)"} – services: ${Array.isArray(v.services) && v.services.length ? v.services.join(", ") : "none"}`);
      });
    }
    lines.push("");
    if (history) {
      lines.push("Vehicle history & condition:");
      if (history.lastDetailed) lines.push(`- Last detailed: ${history.lastDetailed}`);
      if (Array.isArray(history.conditionFlags) && history.conditionFlags.length) lines.push(`- Condition flags: ${history.conditionFlags.join(", ")}`);
      if (history.conditionRating) lines.push(`- Overall condition: ${history.conditionRating}`);
      lines.push("");
    }
    lines.push("Requested services:");
    if (Array.isArray(services) && services.length) { services.forEach((s) => lines.push(`- ${s}`)); } else { lines.push("- (none selected)"); }
    lines.push("");
    lines.push("Location:");
    if (location?.baseAddress) lines.push(`- Customer address (search): ${location.baseAddress}`);
    if (requestDoc.service_address) lines.push(`- Service address: ${requestDoc.service_address}`);
    if (requestDoc.pickup_address) lines.push(`- Pickup address: ${requestDoc.pickup_address}`);
    if (requestDoc.dropoff_address) lines.push(`- Dropoff address: ${requestDoc.dropoff_address}`);
    if (location?.completionDate) lines.push(`- Preferred completion date: ${location.completionDate}`);
    lines.push("");
    if (requestDoc.notes_customer || parsed.contact?.extraInfo) {
      lines.push("Additional notes from customer:");
      if (parsed.contact?.extraInfo) lines.push(`- ${parsed.contact.extraInfo}`);
      if (requestDoc.notes_customer) lines.push(`- ${requestDoc.notes_customer}`);
      lines.push("");
    }
    lines.push("Customer information:");
    const contactName = `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() || `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim();
    if (contactName) lines.push(`- Name: ${contactName}`);
    const email = contact?.email || parsed.contact?.email || userDoc.email || null;
    const phone = contact?.phone || parsed.contact?.phone || userDoc.phone || null;
    if (email) lines.push(`- Email: ${email}`);
    if (phone) lines.push(`- Phone: ${phone}`);
    return lines.join("\n").trim() || "Detailing quote (personal) from website";
  }

  // Новий формат: бізнес / флот
  if (serviceType === "detailing_quote_business" || parsed.business || parsed.fleet) {
    const { business, contact, fleet, preferences, location } = parsed;
    lines.push("DETAILING QUOTE (BUSINESS / FLEET)");
    lines.push("");
    lines.push("Main information:");
    lines.push(`- Status: ${requestDoc.status || "-"}`);
    lines.push(`- Service type: ${serviceType || "detailing_quote_business"}`);
    lines.push("");
    if (business?.businessType) lines.push(`- Business type: ${business.businessType}`);
    if (business?.businessTypeOther) lines.push(`- Business type (other): ${business.businessTypeOther}`);
    if (business?.vehiclesCount) lines.push(`- Number of vehicles (approx): ${business.vehiclesCount}`);
    if (business?.serviceFrequency) lines.push(`- Service frequency: ${business.serviceFrequency}`);
    if (business?.serviceFrequencyOther) lines.push(`- Service frequency (other): ${business.serviceFrequencyOther}`);
    lines.push("");
    if (fleet) {
      lines.push("Fleet:");
      const vt = fleet.vehicleTypes || {};
      const sumVehicles = Object.values(vt).reduce((s, v) => s + (Number(v) || 0), 0);
      if (sumVehicles) lines.push(`- Total vehicles in fleet: ${sumVehicles}`);
      const addIf = (key, label) => { const val = Number(vt[key] || 0); if (val > 0) lines.push(`- ${label}: ${val}`); };
      addIf("sedans", "Sedans");
      addIf("suvs", "SUVs");
      addIf("pickups", "Pick-Ups");
      addIf("minivans", "Mini-Vans / 3-Row SUVs");
      addIf("transit_vans", "Transit Vans");
      addIf("semi_trucks", "Semi-Trucks");
      if (Number(vt.other || 0) > 0) lines.push(`- ${fleet.vehicleOtherLabel || "Other"}: ${vt.other}`);
      if (fleet.serviceLocation) lines.push(`- Service location: ${fleet.serviceLocation}`);
      if (Array.isArray(fleet.services) && fleet.services.length) { lines.push("- Requested services:"); fleet.services.forEach((s) => lines.push(`  • ${s}`)); }
      if (fleet.servicesOther) lines.push(`- Other services: ${fleet.servicesOther}`);
      lines.push("");
    }
    lines.push("Location:");
    if (location?.baseAddress) lines.push(`- Base customer location: ${location.baseAddress}`);
    if (requestDoc.service_address) lines.push(`- Service address: ${requestDoc.service_address}`);
    if (requestDoc.pickup_address) lines.push(`- Pickup address: ${requestDoc.pickup_address}`);
    if (requestDoc.dropoff_address) lines.push(`- Dropoff address: ${requestDoc.dropoff_address}`);
    lines.push("");
    if (preferences) {
      lines.push("Contact preferences:");
      if (preferences.preferredContactMethod) lines.push(`- Preferred contact method: ${preferences.preferredContactMethod}`);
      if (preferences.contactTimePreference) lines.push(`- Best time to reach: ${preferences.contactTimePreference}`);
      if (preferences.notes) { lines.push(""); lines.push("Additional preferences / notes:"); lines.push(`- ${preferences.notes}`); }
      lines.push("");
    }
    if (requestDoc.notes_customer) { lines.push("Notes (from requestDoc.notes_customer):"); lines.push(`- ${requestDoc.notes_customer}`); lines.push(""); }
    lines.push("Customer information:");
    const cName = `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() || `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim();
    if (cName) lines.push(`- Name: ${cName}`);
    const cEmail = contact?.email || parsed.contact?.email || userDoc.email || null;
    const cPhone = contact?.phone || parsed.contact?.phone || userDoc.phone || null;
    if (contact?.companyName) lines.push(`- Company: ${contact.companyName}`);
    if (contact?.companyAddress) lines.push(`- Company address: ${contact.companyAddress}`);
    if (cEmail) lines.push(`- Email: ${cEmail}`);
    if (cPhone) lines.push(`- Phone: ${cPhone}`);
    return lines.join("\n").trim() || "Detailing quote (business/fleet) from website";
  }

  return lines.join("\n").trim() || "Detailing booking from website";
}

// ---- Головна функція: створює Deal в Bitrix24 на основі запиту ----
// Визначає воронку (Detailing або Cleaning), будує коментар,
// знаходить або створює контакт, і відправляє угоду в CRM.
export async function createBitrixDealFromRequest(requestDoc, userDoc) {
  if (!BITRIX_BASE_URL) {
    console.warn("BITRIX_BASE_URL not set, skipping Bitrix deal creation");
    return;
  }

  try {
    const fullName = `${userDoc.first_name || ""} ${userDoc.last_name || ""}`.trim() || userDoc.email || "New client";
    const serviceType = requestDoc.service_type || "";

    // Визначаємо тип сервісу: все що починається з "cleaning" — це прибирання
    const isCleaning = serviceType.startsWith("cleaning") || (!serviceType && requestDoc.location_type === "cleaning");

    const categoryId = isCleaning ? BITRIX_CATEGORY_CLEANING : BITRIX_CATEGORY_DETAILING;

    // Назва угоди залежить від типу сервісу
    let titlePrefix;
    if (isCleaning) titlePrefix = "Cleaning";
    else if (serviceType === "detailing_quote_business") titlePrefix = "Detailing (Business/Fleet)";
    else if (serviceType === "detailing_quote_personal") titlePrefix = "Detailing (Personal)";
    else titlePrefix = "Detailing";

    const opportunity = isCleaning ? 0 : (requestDoc.total ?? 0);
    const stageId = categoryId && categoryId > 0 ? `C${categoryId}:NEW` : "NEW";

    const contactId = await ensureBitrixContact({ fullName, email: userDoc.email, phone: userDoc.phone });

    // Завантажуємо авто тільки для старих Detailing-букінгів (де є vehicle_id)
    let vehicleDoc = null;
    if (!isCleaning && requestDoc.vehicle_id) {
      try { vehicleDoc = await Vehicle.findById(requestDoc.vehicle_id).lean(); }
      catch (e) { console.error("Failed to load vehicle for detailing comment:", e); }
    }

    const commentText = isCleaning
      ? buildCleaningComment(requestDoc, userDoc)
      : buildDetailingComment(requestDoc, userDoc, vehicleDoc);

    console.log("Bitrix COMMENTS payload:\n", commentText);

    const { data } = await axios.post(`${BITRIX_BASE_URL}crm.deal.add.json`, {
      fields: {
        TITLE: `${titlePrefix} - ${fullName}`,
        CATEGORY_ID: categoryId,
        STAGE_ID: stageId,
        TYPE_ID: BITRIX_DEAL_TYPE,
        OPPORTUNITY: opportunity,
        CURRENCY_ID: requestDoc.currency || "USD",
        ...(contactId ? { CONTACT_ID: contactId } : {}),
        PHONE: userDoc.phone ? [{ VALUE: userDoc.phone, VALUE_TYPE: "WORK" }] : [],
        EMAIL: userDoc.email ? [{ VALUE: userDoc.email, VALUE_TYPE: "WORK" }] : [],
        COMMENTS: commentText,
        SOURCE_ID: "WEB",
      },
    });

    console.log("Bitrix Deal created:", data);
    const dealId = data?.result;

    if (!dealId) { console.error("No dealId returned from Bitrix:", data); return data; }

    // Додаємо товари/послуги тільки для старого формату Detailing (масив)
    if (!isCleaning) {
      let items = [];
      try { const p = JSON.parse(requestDoc.items_json || "[]"); if (Array.isArray(p)) items = p; } catch { items = []; }
      const rows = items
        .filter((it) => it && typeof it.title === "string" && it.title.trim() && it.title !== "Tip")
        .map((it) => ({ PRODUCT_NAME: it.title, PRICE: Number(it.price) || 0, QUANTITY: it.qty != null && !Number.isNaN(Number(it.qty)) ? Number(it.qty) : 1 }));
      if (rows.length) {
        try {
          const prodRes = await axios.post(`${BITRIX_BASE_URL}crm.deal.productrows.set.json`, { id: dealId, rows });
          console.log("Bitrix product rows set:", prodRes.data);
        } catch (e) { console.error("Bitrix productrows.set error:", e.response?.data || e.message); }
      }
    }

    return data;
  } catch (err) {
    console.error("Bitrix deal error:", err.response?.data || err.message || err);
  }
}
