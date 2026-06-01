/* eslint-env node */
// ============================================================
// routes/requestRoutes.js
// Запити на послуги від юзерів (детейлінг, прибирання тощо).
//
// Публічні ендпоінти (гість або авторизований):
//   POST /public  — створити запит без авторизації (або з нею)
//   POST /        — створити запит (також підтримує гостей)
//
// Захищені ендпоінти (потрібен токен):
//   GET  /        — список запитів поточного юзера
//   GET  /:id     — один запит
//   PUT  /:id     — оновити запит
//   DELETE /:id   — видалити запит
// ============================================================

import { Router } from "express";
import { RequestModel } from "../db.js";
import { auth, optionalAuth } from "../middleware/authMiddleware.js";
import { createBitrixDealFromRequest } from "../helpers/bitrix.js";
import { sendAdminNewRequestNotification, sendAdminPushNotification, pushSvcLabel } from "../email.js";

const router = Router();

// ---- Хелпер: items_json завжди зберігаємо як рядок ----
function normalizeItemsJson(items_json) {
  if (items_json == null) return "{}";
  if (typeof items_json === "string") return items_json.trim() || "{}";
  try { return JSON.stringify(items_json); } catch { return "{}"; }
}

// ---- Список всіх запитів поточного юзера ----
router.get("/", auth, async (req, res) => {
  const rows = await RequestModel.find({ user_id: req.user.uid }).sort({ created_at: -1 }).lean();
  res.json(rows.map((r) => ({ ...r, id: r._id.toString(), _id: undefined })));
});

// ---- Отримати один запит (тільки свій) ----
router.get("/:id", auth, async (req, res) => {
  const row = await RequestModel.findOne({ _id: req.params.id, user_id: req.user.uid }).lean();
  if (!row) return res.status(404).json({ error: "not found" });
  res.json({ ...row, id: row._id.toString(), _id: undefined });
});

// ---- Публічне створення запиту (для гостей і авторизованих юзерів) ----
// Включає дані гостя (name/email/phone) в items_json
router.post("/public", optionalAuth, async (req, res) => {
  try {
    const {
      vehicle_id, location_type = "shop",
      service_date, time_window, service_type, service_address,
      pickup_address, dropoff_address, items_json, currency = "USD",
      subtotal = 0, tax = 0, total = 0, notes_customer,
      guest_name, guest_email, guest_phone,
    } = req.body || {};

    if (!service_type) return res.status(400).json({ error: "service_type required" });

    const status = "processing";

    const userId = req.user?.uid || null;

    // Додаємо дані гостя до items_json щоб не втратити
    let mergedItemsJson = items_json || "{}";
    try {
      const parsed = JSON.parse(mergedItemsJson);
      mergedItemsJson = JSON.stringify({ ...parsed, guest: userId ? null : { name: guest_name || "", email: guest_email || "", phone: guest_phone || "" } });
    } catch { /* якщо items_json не JSON — не чіпаємо */ }

    const doc = await RequestModel.create({
      user_id: userId, vehicle_id: vehicle_id || null,
      service_type, status, location_type,
      service_date: service_date || null, time_window: time_window || null,
      service_address: service_address || null, pickup_address: pickup_address || null,
      dropoff_address: dropoff_address || null, items_json: mergedItemsJson,
      currency, subtotal, tax, total,
      notes_customer: notes_customer || null,
      created_at: new Date(), updated_at: new Date(),
    });

    const row = { ...doc.toObject(), id: doc._id.toString(), _id: undefined };

    // Сповіщення адміну (fire-and-forget, не чекаємо відповіді)
    let guestParsed = {};
    try { guestParsed = JSON.parse(mergedItemsJson || "{}"); } catch {}
    const guestInfo = guestParsed.guest || {};
    const contactInfo = guestParsed.contact || {};
    const customerName = `${contactInfo.firstName || ""} ${contactInfo.lastName || ""}`.trim() || guestInfo.name || guest_name || "";
    sendAdminNewRequestNotification({ serviceType: service_type, requestId: row.id, customerName, customerEmail: guest_email || contactInfo.email || guestInfo.email || "", customerPhone: guest_phone || contactInfo.phone || guestInfo.phone || "", notes: notes_customer || "" });
    sendAdminPushNotification({ title: `New Request - ${pushSvcLabel(service_type)}`, body: customerName ? `From: ${customerName}` : "A new quote request has been submitted", url: "/admin" });

    return res.json(row);
  } catch (e) {
    console.error("POST /api/requests/public error:", e);
    return res.status(500).json({ error: "server_error" });
  }
});

// ---- Створення запиту (авторизований або гість) ----
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      vehicle_id, location_type = "shop",
      service_date, time_window, service_type, service_address,
      pickup_address, dropoff_address, items_json, currency = "USD",
      subtotal = 0, tax = 0, total = 0, notes_customer,
    } = req.body || {};

    const status = "processing";

    if (!service_type) return res.status(400).json({ error: "service_type required" });

    const safeItemsJson = typeof items_json === "string" ? (items_json.trim() || "{}") : JSON.stringify(items_json ?? {});

    const doc = await RequestModel.create({
      user_id: req.user?.uid || null,
      is_guest: !req.user,
      vehicle_id: vehicle_id || null, service_type, status, location_type,
      service_date: service_date || null, time_window: time_window || null,
      service_address: service_address || null, pickup_address: pickup_address || null,
      dropoff_address: dropoff_address || null, items_json: safeItemsJson,
      currency, subtotal: Number(subtotal) || 0, tax: Number(tax) || 0, total: Number(total) || 0,
      notes_customer: notes_customer || null, created_at: new Date(), updated_at: new Date(),
    });

    const row = { ...doc.toObject(), id: doc._id.toString(), _id: undefined };
    delete row.__v;

    // Сповіщення адміну (fire-and-forget)
    let parsedItems = {};
    try { parsedItems = JSON.parse(safeItemsJson || "{}"); } catch {}
    const contact = parsedItems.contact || {};
    const pushName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
    sendAdminNewRequestNotification({ serviceType: service_type, requestId: row.id, customerName: pushName, customerEmail: contact.email || "", customerPhone: contact.phone || "", notes: notes_customer || "" });
    sendAdminPushNotification({ title: `New Request - ${pushSvcLabel(service_type)}`, body: pushName ? `From: ${pushName}` : "A new quote request has been submitted", url: "/admin" });

    res.json(row);
  } catch (e) {
    console.error("POST /api/requests error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---- Оновити запит (тільки свій) ----
router.put("/:id", auth, async (req, res) => {
  const exists = await RequestModel.findOne({ _id: req.params.id, user_id: req.user.uid });
  if (!exists) return res.status(404).json({ error: "not found" });

  const { vehicle_id, status, location_type, service_date, time_window, service_address, pickup_address, dropoff_address, items_json, currency, subtotal, tax, total, notes_customer } = req.body || {};

  const update = { updated_at: new Date() };
  if (vehicle_id !== undefined) update.vehicle_id = vehicle_id || null;
  if (status !== undefined) update.status = status;
  if (location_type !== undefined) update.location_type = location_type;
  if (service_date !== undefined) update.service_date = service_date || null;
  if (time_window !== undefined) update.time_window = time_window || null;
  if (service_address !== undefined) update.service_address = service_address || null;
  if (pickup_address !== undefined) update.pickup_address = pickup_address || null;
  if (dropoff_address !== undefined) update.dropoff_address = dropoff_address || null;
  if (items_json !== undefined) update.items_json = items_json;
  if (currency !== undefined) update.currency = currency;
  if (subtotal !== undefined) update.subtotal = subtotal;
  if (tax !== undefined) update.tax = tax;
  if (total !== undefined) update.total = total;
  if (notes_customer !== undefined) update.notes_customer = notes_customer || null;

  const doc = await RequestModel.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
  res.json({ ...doc, id: doc._id.toString(), _id: undefined });
});

// ---- Видалити запит (тільки свій) ----
router.delete("/:id", auth, async (req, res) => {
  const exists = await RequestModel.findOne({ _id: req.params.id, user_id: req.user.uid });
  if (!exists) return res.status(404).json({ error: "not found" });
  await RequestModel.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

export default router;
