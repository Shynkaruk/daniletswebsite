const API = import.meta.env.VITE_API_URL || "http://localhost:5179";

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
    // Кидаємо осмислену помилку замість "Unexpected token '<'"
    throw { error: `HTTP ${r.status} ${r.statusText}. Not JSON.`, details: brief };
  }

  if (!r.ok) {
    // ---- Глобальна обробка невалідного/простроченого токена ----
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
      // Повертаємо уніфіковану помилку
      throw { error: "Your session expired. Please log in again.", code: 401 };
    }

    // Сервер повернув іншу помилку JSON
    throw (data || { error: `HTTP ${r.status} ${r.statusText}` });
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
/** ===================================================== **/

export const auth = {
  getUser() { return USER; },
  isAdmin() { return !!(USER && USER.is_admin); },

  async register(payload) {
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

  async google(id_token) {
    const data = await sendJson(`${API}/api/auth/google`, "POST", { id_token });
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
      headers: { ...authHeaders() }, // важливо: токен
      body: form,
    });
    return parseJsonSafe(r); // { url }
  },
};

/* ===== ME (profile, vehicles, payment methods) ===== */
export const meApi = {
  async profile() {
    return getJson(`${API}/api/me/profile`);
  },
  async updateProfile(payload) {
    return sendJson(`${API}/api/me/profile`, 'PUT', payload);
  },

  // vehicles
  async myVehicles() {
    return getJson(`${API}/api/me/vehicles`);
  },
  async saveVehicle(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/me/vehicles/${row.id}` : `${API}/api/me/vehicles`;
    const method = isUpdate ? 'PUT' : 'POST';
    return sendJson(url, method, row);
  },
  async deleteVehicle(id) {
    const r = await fetch(`${API}/api/me/vehicles/${id}`, { method:'DELETE', headers: { ...authHeaders() } });
    return parseJsonSafe(r);
  },

  // payment methods (safe)
  async myPaymentMethods() {
    return getJson(`${API}/api/me/payment-methods`);
  },
  async savePaymentMethod(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/me/payment-methods/${row.id}` : `${API}/api/me/payment-methods`;
    const method = isUpdate ? 'PUT' : 'POST';
    return sendJson(url, method, row);
  },
  async deletePaymentMethod(id) {
    const r = await fetch(`${API}/api/me/payment-methods/${id}`, { method:'DELETE', headers: { ...authHeaders() } });
    return parseJsonSafe(r);
  },
};

/* ===== Requests (user scope) ===== */
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
    const url = isUpdate ? `${API}/api/requests/${row.id}` : `${API}/api/requests`;
    const method = isUpdate ? 'PUT' : 'POST';
    return sendJson(url, method, row);
  },
  async deleteMine(id) {
    const r = await fetch(`${API}/api/requests/${id}`, { method:'DELETE', headers: { ...authHeaders() } });
    return parseJsonSafe(r);
  },
};

/* ===== Admin: Requests ===== */
export const adminReqApi = {
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return getJson(`${API}/api/admin/requests?${q}`);
  },
  async get(id) {
    return getJson(`${API}/api/admin/requests/${id}`);
  },
  async save(row) {
    const isUpdate = !!row.id;
    const url = isUpdate ? `${API}/api/admin/requests/${row.id}` : `${API}/api/admin/requests`;
    const method = isUpdate ? 'PUT' : 'POST';
    return sendJson(url, method, row);
  },
  async remove(id) {
    const r = await fetch(`${API}/api/admin/requests/${id}`, { method:'DELETE', headers: { ...authHeaders() } });
    return parseJsonSafe(r);
  },
};
