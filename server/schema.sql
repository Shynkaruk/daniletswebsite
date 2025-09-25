-- USERS
create table if not exists users (
  id integer primary key autoincrement,
  email text unique not null,
  password text not null,     -- ПЛЕЙНТЕКСТ для "без безпеки". (Замінити на hash з bcrypt пізніше)
  first_name text,
  last_name text,
  phone text,
  is_admin integer default 0, -- 1 = admin
  created_at text default (datetime('now'))
);

-- CONTENT BLOCKS: довільні тексти/JSON за ключем
create table if not exists content_blocks (
  id integer primary key autoincrement,
  key text not null,
  page text,
  lang text default 'en',
  value text not null,        -- зберігай JSON.stringify({text:"..."}) або чистий текст
  published integer default 1,
  sort_order integer default 0,
  updated_at text default (datetime('now')),
  updated_by integer references users(id)
);
create unique index if not exists idx_content_key_lang on content_blocks(key, lang);

-- CARDS: картки послуг/галереї
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


-- ===== USER PAYMENT METHODS (safe fields only) =====
create table if not exists user_payment_methods (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  brand text not null,          -- e.g. "visa"
  last4 text not null,          -- "4242"
  exp_month integer not null,   -- 1..12
  exp_year integer not null,    -- 4-digit
  is_default integer default 0,
  external_id text,             -- наприклад stripe payment_method id
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

-- ===== REQUESTS (заявки/бронювання) =====
create table if not exists requests (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  vehicle_id integer references vehicles(id) on delete set null,
  status text not null default 'new',  -- new|confirmed|in_progress|done|cancelled|draft
  location_type text not null default 'shop', -- shop|mobile|pickup
  service_date text,                   -- ISO date 'YYYY-MM-DD'
  time_window text,                    -- '09:00-11:00'
  service_address text,                -- для mobile/shop можна залишити null
  pickup_address text,                 -- для pickup/dropoff
  dropoff_address text,
  items_json text,                     -- JSON масив позицій [{title, price, qty, card_id?}]
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
