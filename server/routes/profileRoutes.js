/* eslint-env node */
// ============================================================
// routes/profileRoutes.js
// Ендпоінти для особистого кабінету авторизованого юзера:
//   - /me/profile    — перегляд і редагування профілю
//   - /me/vehicles   — список автомобілів юзера (CRUD)
//   - /me/payment-methods — збережені способи оплати (CRUD)
// ============================================================

import { Router } from "express";
import { User, Vehicle, UserPaymentMethod } from "../db.js";
import { auth } from "../middleware/authMiddleware.js";

const router = Router();

// ====================== ПРОФІЛЬ ======================

// ---- Отримати профіль поточного юзера ----
router.get("/profile", auth, async (req, res) => {
  const userDoc = await User.findById(req.user.uid).lean();
  if (!userDoc) return res.status(404).json({ error: "not found" });
  const { password, ...u } = userDoc;
  res.json({ ...u, id: u._id.toString(), _id: undefined });
});

// ---- Оновити профіль (ім'я, прізвище, телефон) ----
router.put("/profile", auth, async (req, res) => {
  const { first_name, last_name, phone } = req.body || {};
  await User.findByIdAndUpdate(req.user.uid, { $set: { first_name, last_name, phone } });
  const userDoc = await User.findById(req.user.uid).lean();
  if (!userDoc) return res.status(404).json({ error: "not found" });
  const { password, ...u } = userDoc;
  res.json({ ...u, id: u._id.toString(), _id: undefined });
});

// ====================== АВТОМОБІЛІ ======================

// ---- Список автомобілів юзера ----
router.get("/vehicles", auth, async (req, res) => {
  const rows = await Vehicle.find({ user_id: req.user.uid }).sort({ _id: -1 }).lean();
  res.json(rows.map((v) => ({ ...v, id: v._id.toString(), _id: undefined })));
});

// ---- Додати новий автомобіль ----
router.post("/vehicles", auth, async (req, res) => {
  const { make, model, year, color, plate, vin, notes } = req.body || {};
  const doc = await Vehicle.create({ user_id: req.user.uid, make, model, year, color, plate, vin, notes });
  const v = doc.toObject();
  res.json({ ...v, id: v._id.toString(), _id: undefined });
});

// ---- Оновити дані автомобіля ----
router.put("/vehicles/:id", auth, async (req, res) => {
  const owner = await Vehicle.findOne({ _id: req.params.id, user_id: req.user.uid });
  if (!owner) return res.status(404).json({ error: "not found" });

  const { make, model, year, color, plate, vin, notes } = req.body || {};
  const doc = await Vehicle.findByIdAndUpdate(req.params.id, { $set: { make, model, year, color, plate, vin, notes } }, { new: true }).lean();
  res.json({ ...doc, id: doc._id.toString(), _id: undefined });
});

// ---- Видалити автомобіль ----
router.delete("/vehicles/:id", auth, async (req, res) => {
  const owner = await Vehicle.findOne({ _id: req.params.id, user_id: req.user.uid });
  if (!owner) return res.status(404).json({ error: "not found" });
  await Vehicle.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

// ====================== МЕТОДИ ОПЛАТИ ======================

// ---- Список збережених методів оплати ----
router.get("/payment-methods", auth, async (req, res) => {
  const rows = await UserPaymentMethod.find({ user_id: req.user.uid }).sort({ is_default: -1, _id: -1 }).lean();
  res.json(rows.map((r) => ({ ...r, id: r._id.toString(), _id: undefined })));
});

// ---- Додати новий метод оплати ----
// Якщо is_default=true — знімає default з інших карток
router.post("/payment-methods", auth, async (req, res) => {
  const { brand, last4, exp_month, exp_year, is_default } = req.body || {};
  if (!brand || !last4 || !exp_month || !exp_year) return res.status(400).json({ error: "missing fields" });

  try {
    if (is_default) await UserPaymentMethod.updateMany({ user_id: req.user.uid }, { $set: { is_default: false } });
    const doc = await UserPaymentMethod.create({ user_id: req.user.uid, brand, last4, exp_month, exp_year, is_default: !!is_default });
    const row = doc.toObject();
    res.json({ ...row, id: row._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create payment method" });
  }
});

// ---- Оновити метод оплати ----
router.put("/payment-methods/:id", auth, async (req, res) => {
  const owner = await UserPaymentMethod.findById(req.params.id);
  if (!owner || owner.user_id.toString() !== req.user.uid) return res.status(404).json({ error: "not found" });

  const { brand, last4, exp_month, exp_year, is_default } = req.body || {};
  try {
    if (is_default === true) await UserPaymentMethod.updateMany({ user_id: req.user.uid }, { $set: { is_default: false } });
    const update = {};
    if (brand !== undefined) update.brand = brand;
    if (last4 !== undefined) update.last4 = last4;
    if (exp_month !== undefined) update.exp_month = exp_month;
    if (exp_year !== undefined) update.exp_year = exp_year;
    if (is_default != null) update.is_default = !!is_default;
    const doc = await UserPaymentMethod.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
    res.json({ ...doc, id: doc._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update payment method" });
  }
});

// ---- Видалити метод оплати ----
router.delete("/payment-methods/:id", auth, async (req, res) => {
  const owner = await UserPaymentMethod.findById(req.params.id);
  if (!owner || owner.user_id.toString() !== req.user.uid) return res.status(404).json({ error: "not found" });
  await UserPaymentMethod.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

export default router;
