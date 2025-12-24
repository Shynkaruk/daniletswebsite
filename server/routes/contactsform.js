// routes/contactsform.js
import express from "express";
import { RequestModel, User } from "../db.js";

const router = express.Router();

/**
 * POST /api/contactsform
 * body: { firstName, lastName, email, phone, service, description, pagePath }
 *
 * Зберігаємо як RequestModel для адмінки:
 * service_type = "forms_clients"
 * items_json = JSON.stringify(payload)
 */
router.post("/", async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      email = "",
      phone = "",
      service = "",
      description = "",
      pagePath = "",
    } = req.body || {};

    // мінімальна валідація
    if (!email && !phone) {
      return res.status(400).json({ error: "email or phone required" });
    }

    // якщо є користувач з таким email — прив’яжемо user_id (не обов’язково)
    let user_id = null;
    if (email) {
      const user = await User.findOne({ email }).lean();
      if (user?._id) user_id = user._id.toString();
    }

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      service,
      description,
      pagePath,
      source: "website_form",
      createdAt: new Date().toISOString(),
    };

    const doc = await RequestModel.create({
      user_id,                 // може бути null
      vehicle_id: null,
      service_type: "forms_clients",   // ✅ ключ для AdminRequests
      status: "new",
      location_type: null,
      service_date: null,
      time_window: null,
      service_address: null,
      pickup_address: null,
      dropoff_address: null,
      items_json: JSON.stringify(payload), // ✅ головне
      currency: "USD",
      subtotal: 0,
      tax: 0,
      total: 0,
      notes_customer: null,
      notes_admin: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const row = doc.toObject();
    row.id = row._id.toString();
    delete row._id;

    return res.json({ ok: true, request: row });
  } catch (e) {
    console.error("contactsform error:", e);
    return res.status(500).json({ error: "failed to create contacts form" });
  }
});

export default router;
