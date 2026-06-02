/* eslint-env node */
// ============================================================
// routes/adminUsersRoutes.js
// Адмінські ендпоінти для перегляду бази користувачів (CRM).
//
//   GET  /              — список всіх юзерів (пагінація + пошук)
//   GET  /:id           — повний профіль: дані + авто + запити
// ============================================================

import { Router } from "express";
import { User, Vehicle, RequestModel } from "../db.js";
import { auth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// ---- Список юзерів ----
// Query: search (ім'я / email / телефон), limit, skip
router.get("/", auth, requireAdmin, async (req, res) => {
  try {
    const { search = "", limit = 100, skip = 0 } = req.query;

    const filter = { is_admin: false };
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [
        { email: re },
        { first_name: re },
        { last_name: re },
        { phone: re },
      ];
    }

    const users = await User.find(filter)
      .sort({ created_at: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();

    // Для кожного юзера рахуємо кількість авто і запитів
    const ids = users.map((u) => u._id);

    const [vehicleCounts, requestCounts] = await Promise.all([
      Vehicle.aggregate([
        { $match: { user_id: { $in: ids } } },
        { $group: { _id: "$user_id", count: { $sum: 1 } } },
      ]),
      RequestModel.aggregate([
        { $match: { user_id: { $in: ids } } },
        { $group: { _id: "$user_id", count: { $sum: 1 }, last_at: { $max: "$created_at" } } },
      ]),
    ]);

    const vcMap  = Object.fromEntries(vehicleCounts.map((x) => [x._id.toString(), x.count]));
    const rcMap  = Object.fromEntries(requestCounts.map((x) => [x._id.toString(), { count: x.count, last_at: x.last_at }]));

    const result = users.map(({ password, ...u }) => ({
      ...u,
      id: u._id.toString(),
      _id: undefined,
      vehicles_count: vcMap[u._id.toString()] || 0,
      requests_count: rcMap[u._id.toString()]?.count || 0,
      last_request_at: rcMap[u._id.toString()]?.last_at || null,
    }));

    res.json(result);
  } catch (e) {
    console.error("[adminUsers] list error:", e);
    res.status(500).json({ error: "failed to load users" });
  }
});

// ---- Повний профіль одного юзера ----
router.get("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const userDoc = await User.findById(req.params.id).lean();
    if (!userDoc) return res.status(404).json({ error: "not found" });

    const [vehicles, requests] = await Promise.all([
      Vehicle.find({ user_id: userDoc._id }).sort({ created_at: -1 }).lean(),
      RequestModel.find({ user_id: userDoc._id }).sort({ created_at: -1 }).lean(),
    ]);

    const { password, ...u } = userDoc;

    res.json({
      ...u,
      id: u._id.toString(),
      _id: undefined,
      vehicles: vehicles.map((v) => ({ ...v, id: v._id.toString(), _id: undefined })),
      requests: requests.map((r) => ({ ...r, id: r._id.toString(), _id: undefined })),
    });
  } catch (e) {
    console.error("[adminUsers] get error:", e);
    res.status(500).json({ error: "failed to load user" });
  }
});

export default router;
