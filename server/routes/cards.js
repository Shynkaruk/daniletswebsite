import express from 'express';
import { Card } from '../db.js';

const router = express.Router();

/* --------- Auth guards --------- */
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Forbidden' });
  next();
}

/* LIST: /api/cards?type=service|addon&published=1&q=...&limit=&offset= */
router.get('/', async (req, res) => {
  try {
    const { type, published, q, limit = 200, offset = 0 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (published !== undefined) filter.published = Boolean(Number(published));
    if (q) filter.$or = [
      { title:    { $regex: q, $options: 'i' } },
      { subtitle: { $regex: q, $options: 'i' } },
      { body:     { $regex: q, $options: 'i' } },
    ];

    const rows = await Card.find(filter)
      .sort({ sort_order: 1, _id: 1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    res.json(rows.map(r => ({ ...r, id: r._id.toString(), _id: undefined })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to list cards' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await Card.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ ...row, id: row._id.toString(), _id: undefined });
  } catch (e) {
    res.status(500).json({ error: 'failed to get card' });
  }
});

router.post('/', requireAuth, requireAdmin, express.json(), async (req, res) => {
  try {
    const { type, title, subtitle = null, body = null, image_url = null,
            price = 0, slug = null, sort_order = 0, published = true } = req.body || {};
    if (!type || !title) return res.status(400).json({ error: 'type and title are required' });

    const doc = await Card.create({
      type, title, subtitle, body, image_url,
      price: Number(price) || 0,
      slug,
      sort_order: Number(sort_order) || 0,
      published: Boolean(published),
      created_by: req.user.uid || null,
    });
    const row = doc.toObject();
    res.json({ ...row, id: row._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to create card' });
  }
});

router.put('/:id', requireAuth, requireAdmin, express.json(), async (req, res) => {
  try {
    const cur = await Card.findById(req.params.id);
    if (!cur) return res.status(404).json({ error: 'Not found' });

    const patch = {};
    if (req.body.type      !== undefined) patch.type       = req.body.type;
    if (req.body.title     !== undefined) patch.title      = req.body.title;
    if (req.body.subtitle  !== undefined) patch.subtitle   = req.body.subtitle;
    if (req.body.body      !== undefined) patch.body       = req.body.body;
    if (req.body.image_url !== undefined) patch.image_url  = req.body.image_url;
    if (req.body.price     !== undefined) patch.price      = Number(req.body.price) || 0;
    if (req.body.slug      !== undefined) patch.slug       = req.body.slug;
    if (req.body.sort_order!== undefined) patch.sort_order = Number(req.body.sort_order) || 0;
    if (req.body.published !== undefined) patch.published  = Boolean(req.body.published);
    patch.updated_at = new Date();

    const doc = await Card.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true }).lean();
    res.json({ ...doc, id: doc._id.toString(), _id: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to update card' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Card.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'failed to delete card' });
  }
});

export default router;
