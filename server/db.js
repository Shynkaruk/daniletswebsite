// server/db.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DB_PATH || path.resolve('data.sqlite');
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = `
-- ===== USERS =====
create table if not exists users (
  id integer primary key autoincrement,
  email text unique not null,
  password text not null,     -- bcrypt hash
  first_name text,
  last_name text,
  phone text,
  is_admin integer default 0, -- 1 = admin
  created_at text default (datetime('now'))
);

-- ===== CONTENT BLOCKS =====
create table if not exists content_blocks (
  id integer primary key autoincrement,
  key text not null,
  page text,
  lang text default 'en',
  value text not null,
  published integer default 1,
  sort_order integer default 0,
  updated_at text default (datetime('now')),
  updated_by integer references users(id)
);
create unique index if not exists idx_content_key_lang on content_blocks(key, lang);

-- ===== CARDS =====
create table if not exists cards (
  id integer primary key autoincrement,
  type text not null,         -- "service" | "portfolio" | ...
  title text not null,
  subtitle text,
  body text,
  image_url text,
  price real,
  slug text,
  sort_order integer default 0,
  published integer default 1,
  created_at text default (datetime('now')),
  updated_at text default (datetime('now')),
  created_by integer references users(id)
);
create index if not exists idx_cards_type on cards(type);

-- ===== USER PAYMENT METHODS (safe only) =====
create table if not exists user_payment_methods (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  brand text not null,
  last4 text not null,
  exp_month integer not null,
  exp_year integer not null,
  is_default integer default 0,
  external_id text,
  created_at text default (datetime('now'))
);
create index if not exists idx_upm_uid on user_payment_methods(user_id);

-- ===== VEHICLES =====
create table if not exists vehicles (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  make text,
  model text,
  year integer,
  color text,
  plate text,
  vin text,
  notes text,
  created_at text default (datetime('now'))
);
create index if not exists idx_vehicles_uid on vehicles(user_id);

-- ===== CARDS =====
create table if not exists cards (
  id integer primary key autoincrement,
  type text not null,         -- "service" | "portfolio" | ...
  title text not null,
  subtitle text,
  body text,
  image_url text,
  price real,
  slug text,
  sort_order integer default 0,
  published integer default 1,
  created_at text default (datetime('now')),
  updated_at text default (datetime('now')),
  created_by integer references users(id)
);
create index if not exists idx_cards_type on cards(type);


-- ===== REQUESTS =====
create table if not exists requests (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  vehicle_id integer references vehicles(id) on delete set null,
  status text not null default 'new',      -- new|confirmed|in_progress|done|cancelled|draft
  location_type text not null default 'shop', -- shop|mobile|pickup
  service_date text,                       -- 'YYYY-MM-DD'
  time_window text,                        -- '09:00-11:00'
  service_address text,
  pickup_address text,
  dropoff_address text,
  items_json text,                         -- JSON array
  currency text default 'USD',
  subtotal real default 0,
  tax real default 0,
  total real default 0,
  notes_customer text,
  notes_admin text,
  created_at text default (datetime('now')),
  updated_at text default (datetime('now'))
);
create index if not exists idx_requests_uid on requests(user_id);
create index if not exists idx_requests_status on requests(status);
`;


db.exec(schema);

/** Optional seed admin (runs once if no admin exists) */
function seedAdmin() {
  const exists = db.prepare(`select id from users where is_admin=1 limit 1`).get();
  if (exists) return;

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const pass = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(pass, 10);

  db.prepare(`insert into users (email, password, first_name, last_name, phone, is_admin)
              values (?,?,?,?,?,1)`).run(email, hash, 'Admin', 'User', '');
  // eslint-disable-next-line no-console
  console.log(`[db] Seeded admin: ${email} / ${pass}`);
}
seedAdmin();

export default db;
