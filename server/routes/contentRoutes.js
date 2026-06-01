/* eslint-env node */
// ============================================================
// routes/contentRoutes.js
// CRUD для Content Blocks — блоки контенту сторінок сайту.
// Публічний GET (для відображення), захищені POST/PUT/DELETE (тільки адмін).
// ============================================================

import { Router } from "express";
import { ContentBlock } from "../db.js";
import { auth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// ---- Отримати всі блоки контенту (опційно фільтр по сторінці і мові) ----
router.get("/", async (req, res) => {
  const { page, lang = "en" } = req.query;
  try {
    let rows;
    if (page) {
      rows = await ContentBlock.find({ page, lang }).sort({ sort_order: 1, _id: 1 }).lean();
    } else {
      rows = await ContentBlock.find({ lang }).sort({ page: 1, sort_order: 1 }).lean();
    }
    res.json(rows.map((r) => ({ ...r, id: r._id.toString(), _id: undefined })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load content" });
  }
});

// ---- Отримати один блок по унікальному ключу ----
router.get("/by-key/:key", async (req, res) => {
  const { lang = "en" } = req.query;
  try {
    const row = await ContentBlock.findOne({ key: req.params.key, lang }).lean();
    if (!row) return res.json(null);
    res.json({ ...row, id: row._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to load content" });
  }
});

// ---- Створити новий блок контенту (тільки адмін) ----
router.post("/", auth, requireAdmin, async (req, res) => {
  const { key, page, lang = "en", value, published = 1, sort_order = 0 } = req.body || {};
  if (!key || value == null) return res.status(400).json({ error: "key and value required" });

  try {
    const doc = await ContentBlock.create({
      key, page: page || null, lang,
      value: typeof value === "string" ? value : JSON.stringify(value),
      published: !!published, sort_order,
      updated_by: req.user.uid, updated_at: new Date(),
    });
    const row = doc.toObject();
    res.json({ ...row, id: row._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create content" });
  }
});

// ---- Оновити блок контенту (тільки адмін) ----
router.put("/:id", auth, requireAdmin, async (req, res) => {
  const { key, page, lang, value, published, sort_order } = req.body || {};
  try {
    const prev = await ContentBlock.findById(req.params.id);
    if (!prev) return res.status(404).json({ error: "not found" });

    const update = { updated_by: req.user.uid, updated_at: new Date() };
    if (key !== undefined) update.key = key || null;
    if (page !== undefined) update.page = page || null;
    if (lang !== undefined) update.lang = lang || "en";
    if (value !== undefined) update.value = value == null ? null : typeof value === "string" ? value : JSON.stringify(value);
    if (published !== undefined) update.published = !!published;
    if (sort_order !== undefined) update.sort_order = sort_order;

    const doc = await ContentBlock.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
    res.json({ ...doc, id: doc._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update content" });
  }
});

// ---- Видалити блок контенту (тільки адмін) ----
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    await ContentBlock.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to delete content" });
  }
});

export default router;
