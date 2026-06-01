// src/lib/api.js
const API = import.meta.env.VITE_API_URL || "";

// ===== токен / юзер у localStorage =====
let TOKEN = localStorage.getItem("token") || null;
let USER = null;
try {
  USER = JSON.parse(localStorage.getItem("user") || "null");
} catch {
  USER = null;
}

export function setToken(token) {
  TOKEN = token;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function setUser(user) {
  USER = user || null;
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
}

function authHeaders() {
  return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
}

/** ================= Safe JSON helpers ================= **/

async function parseJsonSafe(r) {
  const text = await r.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    const brief = text.slice(0, 300);
    throw {
      error: `HTTP ${r.status} ${r.statusText}. Not JSON.`,
      details: brief,
    };
  }

  if (!r.ok) {
    const msg = (data && (data.error || data.message)) || "";
    const badToken =
      r.status === 401 ||
      /invalid token|unauthoriz|jwt|expired/i.test(msg) ||
      /invalid token|unauthoriz|jwt|expired/i.test(text);

    if (badToken) {
      try {
        setToken(null);
        setUser(null);
      } catch {}
      throw { error: "Your session expired. Please log in again.", code: 401 };
    }

    throw data || { error: `HTTP ${r.status} ${r.statusText}` };
  }

  return data;
}

async function getJson(url) {
  const r = await fetch(url, { headers: { ...authHeaders() } });
  return parseJsonSafe(r);
}

async function sendJson(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parseJsonSafe(r);
}

// без глобального auto-logout (для /api/auth/* з помилковими кодами)
async function sendJsonNoAutoLogout(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!r.ok) {
    throw data || { error: `HTTP ${r.status} ${r.statusText}` };
  }
  return data;
}

/** ================= AUTH ================= **/

export const auth = {
  getUser() {
    return USER;
  },
  isAdmin() {
    return !!(USER && USER.is_admin);
  },

  async register(payload) {
    // створює юзера + одразу шле OTP на email (backend уже це робить)
    const data = await sendJsonNoAutoLogout(
      `${API}/api/auth/register`,
      "POST",
      payload
    );
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    return data;
  },

  async login(payload) {
    const data = await sendJsonNoAutoLogout(
      `${API}/api/auth/login`,
      "POST",
      payload
    );
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    return data;
  },

  // Google OAuth (через /api/auth/google-code)
  async googleCode(code) {
    const data = await sendJsonNoAutoLogout(
      `${API}/api/auth/google-code`,
      "POST",
      { code }          // 👈 тільки code
    );
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    return data;
  },


  async google(id_token) {
    const data = await sendJsonNoAutoLogout(
      `${API}/api/auth/google`,
      "POST",
      { id_token }
    );
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    return data;
  },

  async me() {
    const data = await getJson(`${API}/api/auth/me`);
    if (data.user) setUser(data.user);
    return data;
  },

  logout() {
    setToken(null);
    setUser(null);
  },
};

/* ===== OTP (універсальний для signup / reset) =====
   ЦІ ендпоінти мають бути реалізовані на бекенді:
   POST /api/auth/otp/send   { email, purpose }
   POST /api/auth/otp/verify { email, code, purpose }
*/

auth.requestOtp = async function requestOtp(email, purpose = "verify") {
  // purpose: "verify" | "reset"
  return sendJsonNoAutoLogout(`${API}/api/auth/otp/send`, "POST", {
    email,
    purpose,
  });
};

auth.verifyOtp = async function verifyOtp({ email, code, purpose = "verify" }) {
  return sendJsonNoAutoLogout(`${API}/api/auth/otp/verify`, "POST", {
    email,
    code,
    purpose,
  });
};

/* ===== Старі OTP-роути (reset password / verify email) =====
   Можеш використовувати їх окремо в інших компонентах.
*/
export const otpApi = {
  requestReset(email) {
    return sendJsonNoAutoLogout(
      `${API}/api/auth/request-reset-otp`,
      "POST",
      { email }
    );
  },
  resetPassword(email, code, new_password) {
    return sendJsonNoAutoLogout(`${API}/api/auth/reset-password`, "POST", {
      email,
      code,
      new_password,
    });
  },
  verifyEmail(email, code) {
    return sendJsonNoAutoLogout(
      `${API}/api/auth/verify-email-otp`,
      "POST",
      { email, code }
    );
  },
};

/** ================= CONTENT ================= **/

export const contentApi = {
  // Отримати один блок по унікальному ключу
  async getByKey(key, lang = "en") {
    return getJson(`${API}/api/content/by-key/${encodeURIComponent(key)}?lang=${lang}`);
  },

  // Список всіх блоків (з фільтром по сторінці або мові)
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return getJson(`${API}/api/content${q ? `?${q}` : ""}`);
  },

  // Створити або оновити блок
  async save(row) {
    const id = row?.id || row?._id;
    const isUpdate = Boolean(id);
    const url = isUpdate ? `${API}/api/content/${id}` : `${API}/api/content`;
    const method = isUpdate ? "PUT" : "POST";
    const payload = { ...row };
    delete payload._id;
    return sendJson(url, method, payload);
  },

  // Видалити блок
  async remove(id) {
    const r = await fetch(`${API}/api/content/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },

  // Зручний helper: знайти блок по ключу або створити новий
  async upsertByKey(key, value, extra = {}) {
    const existing = await contentApi.getByKey(key);
    if (existing) {
      return contentApi.save({ ...existing, value });
    }
    return contentApi.save({ key, value, page: "settings", lang: "en", published: true, ...extra });
  },
};

/** ================= CARDS ================= **/

export const cardsApi = {
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return getJson(`${API}/api/cards?${q}`);
  },
  async save(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/cards/${row.id}` : `${API}/api/cards`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  async remove(id) {
    const r = await fetch(`${API}/api/cards/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
  async upload(file) {
    const form = new FormData();
    form.append("file", file);
    const r = await fetch(`${API}/api/upload`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: form,
    });
    return parseJsonSafe(r); // { url }
  },
};

/** ================= ME (profile, vehicles, payment methods) ================= **/

export const meApi = {
  async profile() {
    return getJson(`${API}/api/me/profile`);
  },
  async updateProfile(payload) {
    return sendJson(`${API}/api/me/profile`, "PUT", payload);
  },

  // vehicles
  async myVehicles() {
    return getJson(`${API}/api/me/vehicles`);
  },
  async saveVehicle(row) {
    const isUpdate = !!row.id;
    const url = isUpdate
      ? `${API}/api/me/vehicles/${row.id}`
      : `${API}/api/me/vehicles`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  async deleteVehicle(id) {
    const r = await fetch(`${API}/api/me/vehicles/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
  async uploadVehiclePhoto(file) {
    const form = new FormData();
    form.append("file", file);
    const r = await fetch(`${API}/api/upload`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: form,
    });
    return parseJsonSafe(r); // { url }
  },

  // payment methods
  async myPaymentMethods() {
    return getJson(`${API}/api/me/payment-methods`);
  },
  async savePaymentMethod(row) {
    const isUpdate = !!row.id;
    const url = isUpdate
      ? `${API}/api/me/payment-methods/${row.id}`
      : `${API}/api/me/payment-methods`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  async deletePaymentMethod(id) {
    const r = await fetch(`${API}/api/me/payment-methods/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
};

/** ================= Requests (user) ================= **/

export const reqApi = {
  async listMine(params = {}) {
    const q = new URLSearchParams(params).toString();
    return getJson(`${API}/api/requests${q ? `?${q}` : ""}`);
  },
  async getMine(id) {
    return getJson(`${API}/api/requests/${id}`);
  },
  async saveMine(row) {
    const isUpdate = !!row.id;
    const url = isUpdate
      ? `${API}/api/requests/${row.id}`
      : `${API}/api/requests`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  async deleteMine(id) {
    const r = await fetch(`${API}/api/requests/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
    async createPublic(payload) {
    return apiSend("/api/requests/public", "POST", payload);
  },
};

// ===== УНІВЕРСАЛЬНИЙ HELPER ДЛЯ ЗАПИТІВ НА API (GET) =====
export async function apiGet(path) {
  // path типу "/api/reviews/google/detailing"
  return getJson(`${API}${path}`);
}

// (якщо потім треба буде POST/PUT можна зробити apiSend)
export async function apiSend(path, method = "POST", body = {}) {
  return sendJson(`${API}${path}`, method, body);
}


/** ================= Admin: Requests ================= **/

export const adminReqApi = {
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    const data = await getJson(`${API}/api/admin/requests?${q}`);

    // ✅ нормалізація: щоб скрізь був row.id
    if (Array.isArray(data)) {
      return data.map((r) => ({ ...r, id: r.id || r._id }));
    }
    return data;
  },

  async get(id) {
    if (!id || id === "undefined") {
      throw new Error("Missing request id");
    }
    return getJson(`${API}/api/admin/requests/${id}`);
  },

  async save(row) {
    const id = row?.id || row?._id; // ✅ підтримка _id
    const isUpdate = !!id;

    const url = isUpdate
      ? `${API}/api/admin/requests/${id}`
      : `${API}/api/admin/requests`;

    const method = isUpdate ? "PUT" : "POST";

    // ✅ важливо: не відправляй _id назад у бекенд як поле
    const payload = { ...row, id };
    delete payload._id;

    return sendJson(url, method, payload);
  },

  async remove(id) {
    // ✅ захист від undefined/порожнього
    if (!id || id === "undefined") {
      // без alert: просто кидаємо помилку, а UI хай вирішує як показати
      throw new Error("Missing request id");
    }

    const r = await fetch(`${API}/api/admin/requests/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    const data = await parseJsonSafe(r);

    // ✅ якщо бекенд вернув 4xx/5xx — кидаємо помилку наверх
    if (!r.ok) {
      const msg = data?.error || data?.message || `HTTP ${r.status}`;
      const err = new Error(msg);
      err.status = r.status;
      err.data = data;
      throw err;
    }

    return data;
  },
};

/** ================= Admin: Push Notifications ================= **/

export const pushApi = {
  async getVapidKey() {
    return getJson(`${API}/api/admin/push/vapid-key`);
  },

  async subscribe(subscription) {
    return sendJson(`${API}/api/admin/push/subscribe`, "POST", { subscription });
  },

  async unsubscribe() {
    const r = await fetch(`${API}/api/admin/push/unsubscribe`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
};
