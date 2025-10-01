// server/server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db.js';
import cardsRouter from './routes/cards.js';

const app = express();
const PORT = process.env.PORT || 5179;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES || '7d';

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.resolve('uploads')));
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ===== helpers =====
function signToken(user) {
  return jwt.sign(
    { uid: user.id, is_admin: !!user.is_admin, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'forbidden' });
  next();
}

// ===== AUTH =====

// register (створює звичайного юзера)
app.post('/api/auth/register', (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`insert into users (email,password,first_name,last_name,phone,is_admin)
                             values (?,?,?,?,?,0)`);
    const info = stmt.run(email, hash, first_name || '', last_name || '', phone || '');
    const user = db.prepare(`select id,email,first_name,last_name,phone,is_admin from users where id=?`)
                   .get(info.lastInsertRowid);
    const token = signToken(user);
    res.json({ user, token });
  } catch (e) {
    if (String(e).includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    console.error(e);
    res.status(500).json({ error: 'failed to register' });
  }
});

// login (повертає user + JWT)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const row = db.prepare(`select id,email,first_name,last_name,phone,is_admin,password from users where email=?`).get(email);
  if (!row) return res.status(401).json({ error: 'invalid credentials' });
  const ok = bcrypt.compareSync(password, row.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const { password: _, ...user } = row;
  const token = signToken(user);
  res.json({ user, token });
});

// поточний юзер за токеном (опційно для фронту)
app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare(`select id,email,first_name,last_name,phone,is_admin from users where id=?`).get(req.user.uid);
  res.json({ user });
});

// ===== CONTENT BLOCKS =====

// GET відкриті
app.get('/api/content', (req, res) => {
  const { page, lang = 'en' } = req.query;
  let rows;
  if (page) {
    rows = db.prepare(`select * from content_blocks where page=? and lang=? order by sort_order asc, id asc`).all(page, lang);
  } else {
    rows = db.prepare(`select * from content_blocks where lang=? order by page, sort_order asc`).all(lang);
  }
  res.json(rows);
});

app.get('/api/content/by-key/:key', (req, res) => {
  const { key } = req.params;
  const { lang = 'en' } = req.query;
  const row = db.prepare(`select * from content_blocks where key=? and lang=?`).get(key, lang);
  res.json(row || null);
});

// Записні — лише admin
app.post('/api/content', auth, requireAdmin, (req, res) => {
  const { key, page, lang = 'en', value, published = 1, sort_order = 0 } = req.body || {};
  if (!key || value == null) return res.status(400).json({ error: 'key and value required' });

  const stmt = db.prepare(`insert into content_blocks (key,page,lang,value,published,sort_order,updated_by,updated_at)
                           values (?,?,?,?,?,?,?,datetime('now'))`);
  const info = stmt.run(key, page || null, lang, typeof value === 'string' ? value : JSON.stringify(value),
                        published ? 1 : 0, sort_order, req.user.uid);
  const row = db.prepare(`select * from content_blocks where id=?`).get(info.lastInsertRowid);
  res.json(row);
});

app.put('/api/content/:id', auth, requireAdmin, (req, res) => {
  const id = +req.params.id;
  const { key, page, lang, value, published, sort_order } = req.body || {};
  const prev = db.prepare(`select * from content_blocks where id=?`).get(id);
  if (!prev) return res.status(404).json({ error: 'not found' });

  const stmt = db.prepare(`update content_blocks set
    key = coalesce(?, key),
    page = coalesce(?, page),
    lang = coalesce(?, lang),
    value = coalesce(?, value),
    published = coalesce(?, published),
    sort_order = coalesce(?, sort_order),
    updated_by = ?,
    updated_at = datetime('now')
  where id=?`);

  stmt.run(
    key ?? null,
    page ?? null,
    lang ?? null,
    value == null ? null : (typeof value === 'string' ? value : JSON.stringify(value)),
    published == null ? null : (published ? 1 : 0),
    sort_order ?? null,
    req.user.uid,
    id
  );
  const row = db.prepare(`select * from content_blocks where id=?`).get(id);
  res.json(row);
});

app.delete('/api/content/:id', auth, requireAdmin, (req, res) => {
  const id = +req.params.id;
  db.prepare(`delete from content_blocks where id=?`).run(id);
  res.json({ ok: true });
});

// ===== CARDS =====

// GET відкриті
app.get('/api/cards', (req, res) => {
  const { type, published } = req.query;
  let q = `select * from cards`;
  const cond = [];
  const params = [];
  if (type) { cond.push(`type=?`); params.push(type); }
  if (published != null) { cond.push(`published=?`); params.push(+published ? 1 : 0); }
  if (cond.length) q += ` where ` + cond.join(' and ');
  q += ` order by sort_order asc, id desc`;
  const rows = db.prepare(q).all(...params);
  res.json(rows);
});

// Запис/оновлення/видалення — лише admin
app.post('/api/cards', auth, requireAdmin, (req, res) => {
  const { type, title, subtitle, body, image_url, price, slug, sort_order = 0, published = 1 } = req.body || {};
  if (!type || !title) return res.status(400).json({ error: 'type & title required' });

  const info = db.prepare(`insert into cards (type,title,subtitle,body,image_url,price,slug,sort_order,published,created_by,created_at,updated_at)
                           values (?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`)
    .run(type, title, subtitle || null, body || null, image_url || null, price ?? null, slug || null,
         sort_order, published ? 1 : 0, req.user.uid);
  const row = db.prepare(`select * from cards where id=?`).get(info.lastInsertRowid);
  res.json(row);
});

app.put('/api/cards/:id', auth, requireAdmin, (req, res) => {
  const id = +req.params.id;
  const { type, title, subtitle, body, image_url, price, slug, sort_order, published } = req.body || {};
  const prev = db.prepare(`select * from cards where id=?`).get(id);
  if (!prev) return res.status(404).json({ error: 'not found' });

  db.prepare(`update cards set
      type=coalesce(?,type),
      title=coalesce(?,title),
      subtitle=coalesce(?,subtitle),
      body=coalesce(?,body),
      image_url=coalesce(?,image_url),
      price=coalesce(?,price),
      slug=coalesce(?,slug),
      sort_order=coalesce(?,sort_order),
      published=coalesce(?,published),
      updated_at=datetime('now')
    where id=?`)
    .run(type ?? null, title ?? null, subtitle ?? null, body ?? null, image_url ?? null, price ?? null,
         slug ?? null, sort_order ?? null, (published == null ? null : (published ? 1 : 0)), id);

  const row = db.prepare(`select * from cards where id=?`).get(id);
  res.json(row);
});

app.delete('/api/cards/:id', auth, requireAdmin, (req, res) => {
  const id = +req.params.id;
  db.prepare(`delete from cards where id=?`).run(id);
  res.json({ ok: true });
});

// ===== UPLOADS (тільки admin) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '_' + Math.random().toString(36).slice(2) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

app.post('/api/upload', auth, requireAdmin, upload.single('file'), (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

/* ====== PROFILE (поточний користувач) ====== */
// GET /api/me/profile
app.get('/api/me/profile', auth, (req, res) => {
  const u = db.prepare(`select id,email,first_name,last_name,phone,is_admin from users where id=?`).get(req.user.uid);
  res.json(u);
});

// PUT /api/me/profile
app.put('/api/me/profile', auth, (req, res) => {
  const { first_name, last_name, phone } = req.body || {};
  db.prepare(`update users set
    first_name = coalesce(?, first_name),
    last_name  = coalesce(?, last_name),
    phone      = coalesce(?, phone)
  where id=?`).run(first_name ?? null, last_name ?? null, phone ?? null, req.user.uid);
  const u = db.prepare(`select id,email,first_name,last_name,phone,is_admin from users where id=?`).get(req.user.uid);
  res.json(u);
});

/* ====== VEHICLES (тільки свої) ====== */
// GET /api/me/vehicles
app.get('/api/me/vehicles', auth, (req, res) => {
  const rows = db.prepare(`select * from vehicles where user_id=? order by id desc`).all(req.user.uid);
  res.json(rows);
});

// POST /api/me/vehicles
app.post('/api/me/vehicles', auth, (req, res) => {
  const { make, model, year, color, plate, vin, notes } = req.body || {};
  const info = db.prepare(`insert into vehicles (user_id, make, model, year, color, plate, vin, notes)
    values (?,?,?,?,?,?,?,?)`).run(req.user.uid, make || null, model || null, year || null, color || null, plate || null, vin || null, notes || null);
  const row = db.prepare(`select * from vehicles where id=?`).get(info.lastInsertRowid);
  res.json(row);
});

// PUT /api/me/vehicles/:id
app.put('/api/me/vehicles/:id', auth, (req, res) => {
  const id = +req.params.id;
  const owner = db.prepare(`select user_id from vehicles where id=?`).get(id);
  if (!owner || owner.user_id !== req.user.uid) return res.status(404).json({ error: 'not found' });
  const { make, model, year, color, plate, vin, notes } = req.body || {};
  db.prepare(`update vehicles set
    make=coalesce(?,make), model=coalesce(?,model), year=coalesce(?,year),
    color=coalesce(?,color), plate=coalesce(?,plate), vin=coalesce(?,vin), notes=coalesce(?,notes)
    where id=?`).run(make ?? null, model ?? null, year ?? null, color ?? null, plate ?? null, vin ?? null, notes ?? null, id);
  const row = db.prepare(`select * from vehicles where id=?`).get(id);
  res.json(row);
});

// DELETE /api/me/vehicles/:id
app.delete('/api/me/vehicles/:id', auth, (req, res) => {
  const id = +req.params.id;
  const owner = db.prepare(`select user_id from vehicles where id=?`).get(id);
  if (!owner || owner.user_id !== req.user.uid) return res.status(404).json({ error: 'not found' });
  db.prepare(`delete from vehicles where id=?`).run(id);
  res.json({ ok: true });
});

/* ====== PAYMENT METHODS (safe only) ====== */
// GET /api/me/payment-methods
app.get('/api/me/payment-methods', auth, (req, res) => {
  const rows = db.prepare(`select * from user_payment_methods where user_id=? order by is_default desc, id desc`).all(req.user.uid);
  res.json(rows);
});

// POST /api/me/payment-methods
app.post('/api/me/payment-methods', auth, (req, res) => {
  const { brand, last4, exp_month, exp_year, is_default } = req.body || {};
  if (!brand || !last4 || !exp_month || !exp_year) return res.status(400).json({ error: 'missing fields' });

  if (is_default) {
    db.prepare(`update user_payment_methods set is_default=0 where user_id=?`).run(req.user.uid);
  }
  const info = db.prepare(`insert into user_payment_methods (user_id,brand,last4,exp_month,exp_year,is_default)
    values (?,?,?,?,?,?)`).run(req.user.uid, brand, last4, exp_month, exp_year, is_default ? 1 : 0);
  const row = db.prepare(`select * from user_payment_methods where id=?`).get(info.lastInsertRowid);
  res.json(row);
});

// PUT /api/me/payment-methods/:id
app.put('/api/me/payment-methods/:id', auth, (req, res) => {
  const id = +req.params.id;
  const owner = db.prepare(`select user_id from user_payment_methods where id=?`).get(id);
  if (!owner || owner.user_id !== req.user.uid) return res.status(404).json({ error: 'not found' });

  const { brand, last4, exp_month, exp_year, is_default } = req.body || {};
  if (is_default === true) {
    db.prepare(`update user_payment_methods set is_default=0 where user_id=?`).run(req.user.uid);
  }
  db.prepare(`update user_payment_methods set
    brand=coalesce(?,brand), last4=coalesce(?,last4),
    exp_month=coalesce(?,exp_month), exp_year=coalesce(?,exp_year),
    is_default=coalesce(?,is_default)
    where id=?`).run(brand ?? null, last4 ?? null, exp_month ?? null, exp_year ?? null,
                     (is_default == null ? null : (is_default ? 1 : 0)), id);
  const row = db.prepare(`select * from user_payment_methods where id=?`).get(id);
  res.json(row);
});

// DELETE /api/me/payment-methods/:id
app.delete('/api/me/payment-methods/:id', auth, (req, res) => {
  const id = +req.params.id;
  const owner = db.prepare(`select user_id from user_payment_methods where id=?`).get(id);
  if (!owner || owner.user_id !== req.user.uid) return res.status(404).json({ error: 'not found' });
  db.prepare(`delete from user_payment_methods where id=?`).run(id);
  res.json({ ok: true });
});

/* ====== REQUESTS (юзер бачить/редагує свої) ====== */
// GET /api/requests
app.get('/api/requests', auth, (req, res) => {
  const rows = db.prepare(`select * from requests where user_id=? order by created_at desc`).all(req.user.uid);
  res.json(rows);
});

// GET /api/requests/:id
app.get('/api/requests/:id', auth, (req, res) => {
  const id = +req.params.id;
  const row = db.prepare(`select * from requests where id=? and user_id=?`).get(id, req.user.uid);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

// POST /api/requests
app.post('/api/requests', auth, (req, res) => {
  const {
    vehicle_id, status = 'new', location_type = 'shop',
    service_date, time_window,
    service_address, pickup_address, dropoff_address,
    items_json, currency = 'USD',
    subtotal = 0, tax = 0, total = 0,
    notes_customer
  } = req.body || {};

  const info = db.prepare(`insert into requests
    (user_id, vehicle_id, status, location_type, service_date, time_window,
     service_address, pickup_address, dropoff_address, items_json, currency,
     subtotal, tax, total, notes_customer, created_at, updated_at)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`)
    .run(req.user.uid, vehicle_id ?? null, status, location_type, service_date || null, time_window || null,
         service_address || null, pickup_address || null, dropoff_address || null, items_json || '[]', currency,
         subtotal, tax, total, notes_customer || null);
  const row = db.prepare(`select * from requests where id=?`).get(info.lastInsertRowid);
  res.json(row);
});

// PUT /api/requests/:id  (юзер може оновити свою, базово без жорстких правил)
app.put('/api/requests/:id', auth, (req, res) => {
  const id = +req.params.id;
  const exists = db.prepare(`select * from requests where id=? and user_id=?`).get(id, req.user.uid);
  if (!exists) return res.status(404).json({ error: 'not found' });

  const { vehicle_id, status, location_type, service_date, time_window,
          service_address, pickup_address, dropoff_address,
          items_json, currency, subtotal, tax, total, notes_customer } = req.body || {};

  db.prepare(`update requests set
    vehicle_id=coalesce(?,vehicle_id),
    status=coalesce(?,status),
    location_type=coalesce(?,location_type),
    service_date=coalesce(?,service_date),
    time_window=coalesce(?,time_window),
    service_address=coalesce(?,service_address),
    pickup_address=coalesce(?,pickup_address),
    dropoff_address=coalesce(?,dropoff_address),
    items_json=coalesce(?,items_json),
    currency=coalesce(?,currency),
    subtotal=coalesce(?,subtotal),
    tax=coalesce(?,tax),
    total=coalesce(?,total),
    notes_customer=coalesce(?,notes_customer),
    updated_at=datetime('now')
  where id=?`).run(
    vehicle_id ?? null, status ?? null, location_type ?? null, service_date ?? null, time_window ?? null,
    service_address ?? null, pickup_address ?? null, dropoff_address ?? null,
    items_json ?? null, currency ?? null, subtotal ?? null, tax ?? null, total ?? null,
    notes_customer ?? null, id
  );
  const row = db.prepare(`select * from requests where id=?`).get(id);
  res.json(row);
});

// DELETE /api/requests/:id
app.delete('/api/requests/:id', auth, (req, res) => {
  const id = +req.params.id;
  const exists = db.prepare(`select * from requests where id=? and user_id=?`).get(id, req.user.uid);
  if (!exists) return res.status(404).json({ error: 'not found' });
  db.prepare(`delete from requests where id=?`).run(id);
  res.json({ ok: true });
});

/* ====== ADMIN: REQUESTS ====== */
// список усіх заявок з фільтрами
app.get('/api/admin/requests', auth, requireAdmin, (req, res) => {
  const { status } = req.query;
  let q = `
    select
      r.*,
      u.email as user_email,
      u.phone as user_phone,
      trim(coalesce(u.first_name,'') || ' ' || coalesce(u.last_name,'')) as user_full_name,
      v.make  as vehicle_make,
      v.model as vehicle_model,
      v.year  as vehicle_year
    from requests r
    join users u on u.id = r.user_id
    left join vehicles v on v.id = r.vehicle_id
  `;
  const cond = [];
  const params = [];
  if (status) { cond.push(`r.status=?`); params.push(status); }
  if (cond.length) q += ' where ' + cond.join(' and ');
  q += ' order by r.created_at desc';
  const rows = db.prepare(q).all(...params);
  // нормалізоване ім'я «Unknown name», якщо порожнє:
  rows.forEach(r => { if (!r.user_full_name || r.user_full_name.trim() === '') r.user_full_name = 'Unknown name'; });
  res.json(rows);
});



// отримати одну заявку
app.get('/api/admin/requests/:id', auth, requireAdmin, (req, res) => {
  const id = +req.params.id;
  const row = db.prepare(`select * from requests where id=?`).get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

// створити нову (адмін від імені користувача)
app.post('/api/admin/requests', auth, requireAdmin, (req, res) => {
  const { user_id, ...rest } = req.body || {};
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const {
    vehicle_id, status = 'new', location_type = 'shop',
    service_date, time_window, service_address, pickup_address, dropoff_address,
    items_json, currency = 'USD', subtotal = 0, tax = 0, total = 0,
    notes_customer, notes_admin
  } = rest;

  const info = db.prepare(`insert into requests
    (user_id, vehicle_id, status, location_type, service_date, time_window,
     service_address, pickup_address, dropoff_address, items_json, currency,
     subtotal, tax, total, notes_customer, notes_admin, created_at, updated_at)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`)
    .run(user_id, vehicle_id ?? null, status, location_type, service_date || null, time_window || null,
         service_address || null, pickup_address || null, dropoff_address || null, items_json || '[]', currency,
         subtotal, tax, total, notes_customer || null, notes_admin || null);
  const row = db.prepare(`select * from requests where id=?`).get(info.lastInsertRowid);
  res.json(row);
});

// оновити будь-яку
app.put('/api/admin/requests/:id', auth, requireAdmin, (req, res) => {
  const id = +req.params.id;
  const prev = db.prepare(`select * from requests where id=?`).get(id);
  if (!prev) return res.status(404).json({ error: 'not found' });

  const { user_id, vehicle_id, status, location_type, service_date, time_window,
          service_address, pickup_address, dropoff_address,
          items_json, currency, subtotal, tax, total, notes_customer, notes_admin } = req.body || {};

  db.prepare(`update requests set
    user_id=coalesce(?,user_id),
    vehicle_id=coalesce(?,vehicle_id),
    status=coalesce(?,status),
    location_type=coalesce(?,location_type),
    service_date=coalesce(?,service_date),
    time_window=coalesce(?,time_window),
    service_address=coalesce(?,service_address),
    pickup_address=coalesce(?,pickup_address),
    dropoff_address=coalesce(?,dropoff_address),
    items_json=coalesce(?,items_json),
    currency=coalesce(?,currency),
    subtotal=coalesce(?,subtotal),
    tax=coalesce(?,tax),
    total=coalesce(?,total),
    notes_customer=coalesce(?,notes_customer),
    notes_admin=coalesce(?,notes_admin),
    updated_at=datetime('now')
  where id=?`).run(
    user_id ?? null, vehicle_id ?? null, status ?? null, location_type ?? null,
    service_date ?? null, time_window ?? null, service_address ?? null,
    pickup_address ?? null, dropoff_address ?? null, items_json ?? null, currency ?? null,
    subtotal ?? null, tax ?? null, total ?? null, notes_customer ?? null, notes_admin ?? null, id
  );
  const row = db.prepare(`select * from requests where id=?`).get(id);
  res.json(row);
});

app.use('/api/cards', cardsRouter)

// видалити
app.delete('/api/admin/requests/:id', auth, requireAdmin, (req, res) => {
  const id = +req.params.id;
  db.prepare(`delete from requests where id=?`).run(id);
  res.json({ ok: true });
});


app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
