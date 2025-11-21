// server/db.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set');
}

// ----- SCHEMAS -----

const userSchema = new mongoose.Schema({
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true }, // bcrypt hash
  first_name: String,
  last_name:  String,
  phone:      String,
  is_admin:   { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const contentBlockSchema = new mongoose.Schema({
  key:        { type: String, required: true },
  page:       String,
  lang:       { type: String, default: 'en' },
  value:      { type: String, required: true }, // можна потім зробити Mixed
  published:  { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const cardSchema = new mongoose.Schema({
  type:       { type: String, required: true }, // "service" | "portfolio" | ...
  title:      { type: String, required: true },
  subtitle:   String,
  body:       String,
  image_url:  String,
  price:      Number,
  slug:       String,
  sort_order: { type: Number, default: 0 },
  published:  { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const userPaymentMethodSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand:      { type: String, required: true },
  last4:      { type: String, required: true },
  exp_month:  { type: Number, required: true },
  exp_year:   { type: Number, required: true },
  is_default: { type: Boolean, default: false },
  external_id:String,
  created_at: { type: Date, default: Date.now },
});

const vehicleSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make:       String,
  model:      String,
  year:       Number,
  color:      String,
  plate:      String,
  vin:        String,
  notes:      String,
  created_at: { type: Date, default: Date.now },
});

const requestSchema = new mongoose.Schema({
  user_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  status:          { type: String, default: 'new' },       // new|confirmed|...
  location_type:   { type: String, default: 'shop' },      // shop|mobile|pickup
  service_date:    String,                                 // 'YYYY-MM-DD'
  time_window:     String,                                 // '09:00-11:00'
  service_address: String,
  pickup_address:  String,
  dropoff_address: String,
  items_json:      { type: String, default: '[]' },        // можна потім зробити Array
  currency:        { type: String, default: 'USD' },
  subtotal:        { type: Number, default: 0 },
  tax:             { type: Number, default: 0 },
  total:           { type: Number, default: 0 },
  notes_customer:  String,
  notes_admin:     String,
  created_at:      { type: Date, default: Date.now },
  updated_at:      { type: Date, default: Date.now },
});

// ----- MODELS -----

export const User              = mongoose.model('User', userSchema);
export const ContentBlock      = mongoose.model('ContentBlock', contentBlockSchema);
export const Card              = mongoose.model('Card', cardSchema);
export const UserPaymentMethod = mongoose.model('UserPaymentMethod', userPaymentMethodSchema);
export const Vehicle           = mongoose.model('Vehicle', vehicleSchema);
export const RequestModel      = mongoose.model('Request', requestSchema);

// ----- INIT + SEED ADMIN -----

async function seedAdmin() {
  const exists = await User.findOne({ is_admin: true });
  if (exists) return;

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const pass  = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const hash  = bcrypt.hashSync(pass, 10);

  await User.create({
    email,
    password: hash,
    first_name: 'Admin',
    last_name:  'User',
    phone: '',
    is_admin: true,
  });

  console.log(`[db] Seeded admin: ${email} / ${pass}`);
}

export async function initDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");

  await mongoose.connect(uri, {
    dbName: "admin",
  });

  console.log("[DB] Connected to MongoDB");

  await seedAdmin(); // 🟢 створюємо адміна, якщо немає
}
