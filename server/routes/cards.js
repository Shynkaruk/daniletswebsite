import express from 'express';
import db from '../db.js';

const router = express.Router();

/* --------- прості гардси (очікують, що req.user виставляється загальним middleware) --------- */
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Forbidden' });
  next();
}

/* LIST: /api/cards?type=service|addon&published=1&q=...&limit=&offset= */
router.get('/', (req, res) => {
  const { type, published, q, limit = 200, offset = 0 } = req.query;

  const where = [];
  const params = {};
  if (type) { where.push(`type=@type`); params.type = String(type); }
  if (published !== undefined) { where.push(`published=@published`); params.published = Number(published) ? 1 : 0; }
  if (q) { where.push(`(title like @q or subtitle like @q or body like @q)`); params.q = `%${q}%`; }

  const sql = `
    select id, type, title, subtitle, body, image_url, price, slug, sort_order, published, created_at, updated_at
    from cards
    ${where.length ? 'where ' + where.join(' and ') : ''}
    order by sort_order asc, id asc
    limit @limit offset @offset
  `;
  const rows = db.prepare(sql).all({ ...params, limit: Number(limit), offset: Number(offset) });
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`select * from cards where id=?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', requireAuth, requireAdmin, express.json(), (req, res) => {
  const { type, title, subtitle=null, body=null, image_url=null, price=0, slug=null, sort_order=0, published=1 } = req.body || {};
  if (!type || !title) return res.status(400).json({ error: 'type and title are required' });

  const info = db.prepare(`
    insert into cards (type, title, subtitle, body, image_url, price, slug, sort_order, published, created_by)
    values (@type, @title, @subtitle, @body, @image_url, @price, @slug, @sort_order, @published, @created_by)
  `).run({
    type: String(type),
    title: String(title),
    subtitle, body, image_url,
    price: Number(price) || 0,
    slug,
    sort_order: Number(sort_order) || 0,
    published: Number(published) ? 1 : 0,
    created_by: req.user.id,
  });

  const row = db.prepare(`select * from cards where id=?`).get(info.lastInsertRowid);
  res.json(row);
});

router.put('/:id', requireAuth, requireAdmin, express.json(), (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare(`select * from cards where id=?`).get(id);
  if (!cur) return res.status(404).json({ error: 'Not found' });

  const patch = {
    type: req.body.type ?? cur.type,
    title: req.body.title ?? cur.title,
    subtitle: req.body.subtitle ?? cur.subtitle,
    body: req.body.body ?? cur.body,
    image_url: req.body.image_url ?? cur.image_url,
    price: req.body.price !== undefined ? Number(req.body.price) || 0 : cur.price,
    slug: req.body.slug ?? cur.slug,
    sort_order: req.body.sort_order !== undefined ? Number(req.body.sort_order) || 0 : cur.sort_order,
    published: req.body.published !== undefined ? (Number(req.body.published) ? 1 : 0) : cur.published,
  };

  db.prepare(`
    update cards set
      type=@type, title=@title, subtitle=@subtitle, body=@body,
      image_url=@image_url, price=@price, slug=@slug,
      sort_order=@sort_order, published=@published, updated_at=datetime('now')
    where id=@id
  `).run({ ...patch, id });

  const row = db.prepare(`select * from cards where id=?`).get(id);
  res.json(row);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare(`delete from cards where id=?`).run(req.params.id);
  res.json({ ok: true, deleted: info.changes });
});

export default router;
