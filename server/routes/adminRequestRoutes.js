/* eslint-env node */
// ============================================================
// routes/adminRequestRoutes.js
// Адмінські ендпоінти для управління запитами на послуги.
// Всі маршрути захищені: потрібен auth + requireAdmin.
//
//   GET    /           — список всіх запитів (з фільтрами)
//   GET    /:id        — один запит по ID
//   POST   /           — створити запит від імені юзера
//   PUT    /:id        — оновити будь-який запит
//   DELETE /:id        — видалити запит
// ============================================================

import { Router } from "express";
import mongoose from "mongoose";
import { RequestModel } from "../db.js";
import { auth, requireAdmin } from "../middleware/authMiddleware.js";
import { createBitrixDealFromRequest } from "../helpers/bitrix.js";

const router = Router();

// ---- Список всіх запитів з опційними фільтрами ----
// Фільтри: status, service_type, service_type_prefix (наприклад "cleaning")
router.get("/", auth, requireAdmin, async (req, res) => {
  const { status, service_type, service_type_prefix } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (service_type) filter.service_type = service_type;
  if (service_type_prefix) filter.service_type = { $regex: `^${service_type_prefix}` };

  const rows = await RequestModel.find(filter).sort({ created_at: -1 }).lean();
  res.json(rows.map((r) => ({ ...r, id: r._id.toString(), _id: undefined })));
});

// ---- Отримати один запит по ID (будь-який, не тільки свій) ----
router.get("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const row = await RequestModel.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: "not found" });
    res.json({ ...row, id: row._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load request" });
  }
});

// ---- Створити запит від імені юзера (адмін вводить вручну) ----
router.post("/", auth, requireAdmin, async (req, res) => {
  const { user_id, ...rest } = req.body || {};
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  const { vehicle_id, status = "new", location_type = "shop", service_date, time_window, service_address, pickup_address, dropoff_address, items_json, currency = "USD", subtotal = 0, tax = 0, total = 0, notes_customer, notes_admin } = rest;

  try {
    const doc = await RequestModel.create({
      user_id, vehicle_id: vehicle_id || null, status, location_type,
      service_date: service_date || null, time_window: time_window || null,
      service_address: service_address || null, pickup_address: pickup_address || null,
      dropoff_address: dropoff_address || null, items_json: items_json || "[]",
      currency, subtotal, tax, total,
      notes_customer: notes_customer || null, notes_admin: notes_admin || null,
      created_at: new Date(), updated_at: new Date(),
    });
    const row = doc.toObject();
    res.json({ ...row, id: row._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create request" });
  }
});

// ---- Оновити будь-який запит (зміна статусу, нотатки адміна тощо) ----
router.put("/:id", auth, requireAdmin, async (req, res) => {
  const { user_id, vehicle_id, status, location_type, service_date, time_window, service_address, pickup_address, dropoff_address, items_json, currency, subtotal, tax, total, notes_customer, notes_admin } = req.body || {};

  try {
    const prev = await RequestModel.findById(req.params.id);
    if (!prev) return res.status(404).json({ error: "not found" });

    const update = { updated_at: new Date() };
    if (user_id !== undefined) update.user_id = user_id;
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
    if (notes_admin !== undefined) update.notes_admin = notes_admin || null;

    const doc = await RequestModel.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
    res.json({ ...doc, id: doc._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update request" });
  }
});

// ---- Видалити запит ----
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "invalid id" });
  try {
    const result = await RequestModel.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to delete request" });
  }
});

export default router;
