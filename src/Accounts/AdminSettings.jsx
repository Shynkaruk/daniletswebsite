// src/Accounts/AdminSettings.jsx
// ============================================================
// Сторінка налаштувань бізнесу для адміністратора.
// Доступна за адресою /admin/settings
//
// Дозволяє редагувати:
//   - Телефон     (business_phone)  — відображається у JSON-LD, Footer
//   - Email       (business_email)  — відображається у JSON-LD
//   - Адреса      (business_address)— відображається у JSON-LD
//
// Дані зберігаються в MongoDB через ContentBlock API (/api/content).
// Після збереження кеш useBusinessInfo очищається автоматично.
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, contentApi, pushApi } from "../lib/api";
import { invalidateBusinessInfoCache } from "../hooks/useBusinessInfo.js";

// ---- Хелпер: конвертує base64url VAPID ключ у Uint8Array ----
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Ключі полів у ContentBlock
const FIELDS = [
  {
    key: "business_phone",
    label: "Phone number",
    placeholder: "+1-614-000-0000",
    hint: "Displayed in Google search results and structured data. Format: +1-614-XXX-XXXX",
    type: "tel",
  },
  {
    key: "business_email",
    label: "Contact email",
    placeholder: "info@danilets.com",
    hint: "Public business email shown in structured data.",
    type: "email",
  },
  {
    key: "business_address",
    label: "Business address",
    placeholder: "123 Main St, Columbus, OH 43215",
    hint: "Street address for Google Maps and structured data.",
    type: "text",
  },
];

export default function AdminSettings() {
  const navigate = useNavigate();

  // Стан для кожного поля: { value, id, loading, saved, error }
  const [fields, setFields] = useState(
    FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: { value: "", id: null, loading: true, saving: false, saved: false, error: null } }), {})
  );

  const [globalError, setGlobalError] = useState(null);

  // ---- Push notification state ----
  const [push, setPush] = useState({
    supported: "serviceWorker" in navigator && "PushManager" in window,
    permission: typeof Notification !== "undefined" ? Notification.permission : "default",
    subscribed: false,
    loading: true,
    busy: false,
    error: null,
  });

  // Перевіряємо чи вже є підписка в цьому браузері
  useEffect(() => {
    if (!push.supported) { setPush((p) => ({ ...p, loading: false })); return; }
    navigator.serviceWorker.ready.then(async (reg) => {
      try {
        const sub = await reg.pushManager.getSubscription();
        setPush((p) => ({ ...p, subscribed: !!sub, loading: false }));
      } catch {
        setPush((p) => ({ ...p, loading: false }));
      }
    });
  }, [push.supported]);

  const handleSubscribe = useCallback(async () => {
    setPush((p) => ({ ...p, busy: true, error: null }));
    try {
      // 1. Отримуємо публічний VAPID ключ з сервера
      const { publicKey } = await pushApi.getVapidKey();

      // 2. Запитуємо дозвіл у браузера
      const permission = await Notification.requestPermission();
      setPush((p) => ({ ...p, permission }));
      if (permission !== "granted") {
        setPush((p) => ({ ...p, busy: false, error: "Permission denied. Allow notifications in browser settings." }));
        return;
      }

      // 3. Підписуємось через Service Worker
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4. Зберігаємо підписку на сервері
      await pushApi.subscribe(sub.toJSON());
      setPush((p) => ({ ...p, subscribed: true, busy: false }));
    } catch (e) {
      console.error("[push] subscribe error:", e);
      setPush((p) => ({ ...p, busy: false, error: e?.error || e?.message || "Failed to subscribe" }));
    }
  }, []);

  const handleUnsubscribe = useCallback(async () => {
    setPush((p) => ({ ...p, busy: true, error: null }));
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await pushApi.unsubscribe();
      setPush((p) => ({ ...p, subscribed: false, busy: false }));
    } catch (e) {
      setPush((p) => ({ ...p, busy: false, error: e?.error || e?.message || "Failed to unsubscribe" }));
    }
  }, []);

  // ---- Перевірка прав ----
  useEffect(() => {
    if (!auth.isAdmin()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  // ---- Завантажуємо поточні значення з API ----
  useEffect(() => {
    async function loadAll() {
      await Promise.all(
        FIELDS.map(async ({ key }) => {
          try {
            const block = await contentApi.getByKey(key);
            setFields((prev) => ({
              ...prev,
              [key]: { ...prev[key], value: block?.value || "", id: block?.id || null, loading: false },
            }));
          } catch {
            setFields((prev) => ({
              ...prev,
              [key]: { ...prev[key], loading: false },
            }));
          }
        })
      );
    }
    loadAll();
  }, []);

  // ---- Зберегти одне поле ----
  async function saveField(key) {
    const field = fields[key];
    if (!field.value.trim()) return;

    setFields((prev) => ({ ...prev, [key]: { ...prev[key], saving: true, saved: false, error: null } }));

    try {
      const result = await contentApi.upsertByKey(key, field.value.trim());

      // Оновлюємо id якщо був новий запис
      setFields((prev) => ({
        ...prev,
        [key]: { ...prev[key], id: result?.id || prev[key].id, saving: false, saved: true, error: null },
      }));

      // Очищаємо кеш хука
      invalidateBusinessInfoCache();

      // Прибираємо галочку через 3 секунди
      setTimeout(() => {
        setFields((prev) => ({ ...prev, [key]: { ...prev[key], saved: false } }));
      }, 3000);
    } catch (e) {
      setFields((prev) => ({
        ...prev,
        [key]: { ...prev[key], saving: false, error: e?.error || "Failed to save" },
      }));
    }
  }

  // ---- Оновити значення поля локально ----
  function updateValue(key, value) {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], value, saved: false, error: null } }));
  }

  const isAnyLoading = Object.values(fields).some((f) => f.loading);

  return (
    <div className="min-h-screen bg-[#F4F4F5] pt-6 pb-16 px-4 sm:px-8">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 mb-4 transition"
        >
          ← Back to CRM
        </button>
        <h1 className="text-2xl font-extrabold text-[#111827]">Business Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Changes here update Google search results and the structured data on the website.
          Allow up to 24–48 hours for Google to re-index.
        </p>
      </div>

      {globalError && (
        <div className="max-w-2xl mx-auto mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {globalError}
        </div>
      )}

      {/* Fields */}
      <div className="max-w-2xl mx-auto space-y-5">
        {FIELDS.map(({ key, label, placeholder, hint, type }) => {
          const f = fields[key];
          return (
            <div key={key} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">

              {/* Label */}
              <label className="block text-sm font-semibold text-[#111827] mb-1">
                {label}
              </label>
              <p className="text-xs text-[#9CA3AF] mb-3">{hint}</p>

              {/* Input row */}
              <div className="flex gap-3 items-center">
                <input
                  type={type}
                  value={f.value}
                  onChange={(e) => updateValue(key, e.target.value)}
                  placeholder={f.loading ? "Loading..." : placeholder}
                  disabled={f.loading || f.saving}
                  className="flex-1 h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] bg-[#F9FAFB] focus:outline-none focus:border-[#111827] transition disabled:opacity-50"
                  onKeyDown={(e) => e.key === "Enter" && saveField(key)}
                />
                <button
                  onClick={() => saveField(key)}
                  disabled={f.loading || f.saving || !f.value.trim()}
                  className="h-11 px-5 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-40 shrink-0"
                >
                  {f.saving ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Status messages */}
              {f.saved && (
                <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  ✓ Saved. Cache cleared — changes will reflect on next page load.
                </p>
              )}
              {f.error && (
                <p className="mt-2 text-xs text-red-500">{f.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Push Notifications */}
      <div className="max-w-2xl mx-auto mt-5">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔔</span>
            <label className="text-sm font-semibold text-[#111827]">Browser Push Notifications</label>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-4">
            Enable push notifications in this browser so you get an instant alert when a client submits a new request — even when the tab is in the background.
          </p>

          {!push.supported && (
            <p className="text-xs text-amber-600">
              Push notifications are not supported in this browser. Try Chrome or Edge on desktop.
            </p>
          )}

          {push.supported && (
            <div className="flex items-center gap-3 flex-wrap">
              {push.loading ? (
                <span className="text-xs text-[#9CA3AF]">Checking status…</span>
              ) : push.subscribed ? (
                <>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    ✓ Notifications enabled on this device
                  </span>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={push.busy}
                    className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] hover:border-red-400 hover:text-red-500 transition disabled:opacity-40"
                  >
                    {push.busy ? "Disabling…" : "Disable"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={push.busy || push.permission === "denied"}
                  className="h-9 px-5 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-40"
                >
                  {push.busy ? "Enabling…" : "Enable Notifications"}
                </button>
              )}

              {push.permission === "denied" && (
                <p className="w-full text-xs text-red-500 mt-1">
                  Notifications are blocked in your browser. Open browser settings → Site permissions → Notifications → Allow for this site.
                </p>
              )}
              {push.error && (
                <p className="w-full text-xs text-red-500 mt-1">{push.error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="max-w-2xl mx-auto mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-sm font-semibold text-amber-800 mb-1">How it works</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          These values are stored in the database and loaded dynamically on every page.
          They appear in the JSON-LD structured data that Google reads to populate your business card in search results.
          After saving, the website reflects the new values immediately — but Google re-crawls on its own schedule (typically 24–48h).
        </p>
      </div>

    </div>
  );
}
