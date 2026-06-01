/* eslint-env node */
// ============================================================
// routes/pushRoutes.js
// Push-сповіщення для адміністраторів.
// Використовує Web Push (VAPID) протокол.
//   GET    /vapid-key    — повертає публічний VAPID ключ для фронту
//   POST   /subscribe    — зберігає підписку адміна
//   DELETE /unsubscribe  — видаляє підписку
// ============================================================

import { Router } from "express";
import { PushSubscription } from "../db.js";
import { auth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// ---- Повертає публічний VAPID ключ ----
// Фронт використовує його для реєстрації push-підписки через ServiceWorker
router.get("/vapid-key", auth, requireAdmin, (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ error: "Push not configured" });
  res.json({ publicKey: key });
});

// ---- Зберігає push-підписку адміна ----
// Upsert: якщо підписка вже є — оновлює, нова — створює
router.post("/subscribe", auth, requireAdmin, async (req, res) => {
  try {
    const { subscription } = req.body || {};
    if (!subscription?.endpoint) return res.status(400).json({ error: "Invalid subscription" });
    await PushSubscription.findOneAndUpdate(
      { user_id: req.user.uid },
      { user_id: req.user.uid, subscription },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("[push] subscribe error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---- Видаляє push-підписку адміна ----
router.delete("/unsubscribe", auth, requireAdmin, async (req, res) => {
  try {
    await PushSubscription.deleteMany({ user_id: req.user.uid });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
