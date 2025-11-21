const API = import.meta.env.VITE_API_URL || "";

/* ---------------- TOKEN & USER STORAGE ---------------- */

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

/* ---------------- JSON HELPERS ---------------- */

async function parseJsonSafe(r) {
  const text = await r.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw { error: `HTTP ${r.status} ${r.statusText}`, details: text.slice(0, 300) };
  }

  if (!r.ok) {
    const msg = (data && (data.error || data.message)) || "";

    const badToken =
      r.status === 401 ||
      /invalid token|jwt|expired/i.test(msg) ||
      /invalid token|jwt|expired/i.test(text);

    if (badToken) {
      setToken(null);
      setUser(null);
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

/* Це важливо: для OTP НЕ треба auto-logout */
async function sendJsonNoAutoLogout(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!r.ok) throw (data || { error: `HTTP ${r.status} ${r.statusText}` });
  return data;
}

/* ============================================================
   AUTH + OTP
============================================================ */

export const auth = {
  getUser() { return USER; },
  isAdmin() { return !!(USER && USER.is_admin); },

  async register(payload) {
    // Бекенд сам надсилає OTP
    const data = await sendJson(`${API}/api/auth/register`, "POST", payload);
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    return data;
  },

  async login(payload) {
    const data = await sendJson(`${API}/api/auth/login`, "POST", payload);
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

  /* ---------------- OTP FIXED ---------------- */

  // 1) Надсилати код для reset password
  async requestOtp(email, purpose = "verify") {
    if (purpose === "verify") {
      // при реєстрації OTP вже надіслано у /register
      return { ok: true };
    }
    if (purpose === "reset") {
      return sendJsonNoAutoLogout(`${API}/api/auth/request-reset-otp`, "POST", { email });
    }
  },

  // 2) Перевірити код
  async verifyOtp({ email, code, purpose = "verify", new_password }) {
    if (purpose === "verify") {
      return sendJsonNoAutoLogout(`${API}/api/auth/verify-email-otp`, "POST", {
        email,
        code
      });
    }

    if (purpose === "reset") {
      return sendJsonNoAutoLogout(`${API}/api/auth/reset-password`, "POST", {
        email,
        code,
        new_password
      });
    }
  }
};

/* ============================================================
   OTHER APIS (content, cards, me, requests…)
============================================================ */

export const contentApi = {
  async getByKey(key, lang = "en") {
    return getJson(`${API}/api/content/by-key/${encodeURIComponent(key)}?lang=${lang}`);
  },
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return getJson(`${API}/api/content?${q}`);
  },
  async save(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/content/${row.id}` : `${API}/api/content`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  async remove(id) {
    const r = await fetch(`${API}/api/content/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
};

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

    return parseJsonSafe(r);
  },
};

export const meApi = {
  profile() { return getJson(`${API}/api/me/profile`); },
  updateProfile(payload) { return sendJson(`${API}/api/me/profile`, "PUT", payload); },

  myVehicles() { return getJson(`${API}/api/me/vehicles`); },
  saveVehicle(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/me/vehicles/${row.id}` : `${API}/api/me/vehicles`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  deleteVehicle(id) {
    const r = await fetch(`${API}/api/me/vehicles/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },

  myPaymentMethods() { return getJson(`${API}/api/me/payment-methods`); },
  savePaymentMethod(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/me/payment-methods/${row.id}` : `${API}/api/me/payment-methods`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  deletePaymentMethod(id) {
    const r = await fetch(`${API}/api/me/payment-methods/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
};

export const reqApi = {
  async listMine(params = {}) {
    const q = new URLSearchParams(params).toString();
    return getJson(`${API}/api/requests${q ? `?${q}` : ""}`);
  },
  getMine(id) { return getJson(`${API}/api/requests/${id}`); },
  saveMine(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/requests/${row.id}` : `${API}/api/requests`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  deleteMine(id) {
    const r = await fetch(`${API}/api/requests/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
};

export const adminReqApi = {
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return getJson(`${API}/api/admin/requests?${q}`);
  },
  get(id) { return getJson(`${API}/api/admin/requests/${id}`); },
  save(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/admin/requests/${row.id}` : `${API}/api/admin/requests`;
    const method = isUpdate ? "PUT" : "POST";
    return sendJson(url, method, row);
  },
  remove(id) {
    const r = await fetch(`${API}/api/admin/requests/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseJsonSafe(r);
  },
};
