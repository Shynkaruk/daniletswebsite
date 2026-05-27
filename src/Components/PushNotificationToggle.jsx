// src/Components/PushNotificationToggle.jsx
import React, { useEffect, useState } from "react";
import { pushApi } from "../lib/api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const STATUS = {
  loading:      "loading",
  unsupported:  "unsupported",
  denied:       "denied",
  subscribed:   "subscribed",
  unsubscribed: "unsubscribed",
};

export default function PushNotificationToggle() {
  const [status, setStatus] = useState(STATUS.loading);
  const [busy, setBusy]     = useState(false);

  // Визначаємо поточний стан при монтуванні
  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus(STATUS.unsupported);
        return;
      }
      if (Notification.permission === "denied") {
        setStatus(STATUS.denied);
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        setStatus(existing ? STATUS.subscribed : STATUS.unsubscribed);
      } catch {
        setStatus(STATUS.unsubscribed);
      }
    })();
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    try {
      // 1) Реєструємо SW якщо ще не зареєстровано
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 2) Запитуємо дозвіл
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(STATUS.denied);
        return;
      }

      // 3) Отримуємо VAPID public key з сервера
      const { publicKey } = await pushApi.getVapidKey();

      // 4) Підписуємося
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5) Відправляємо підписку на сервер
      await pushApi.subscribe(subscription.toJSON());
      setStatus(STATUS.subscribed);
    } catch (e) {
      console.error("[push] enable error:", e);
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await pushApi.unsubscribe();
      setStatus(STATUS.unsubscribed);
    } catch (e) {
      console.error("[push] disable error:", e);
    } finally {
      setBusy(false);
    }
  };

  if (status === STATUS.loading)     return null;
  if (status === STATUS.unsupported) return null;

  if (status === STATUS.denied) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
        <span>&#128276;</span>
        <span>Notifications blocked in browser settings</span>
      </div>
    );
  }

  const isOn = status === STATUS.subscribed;

  return (
    <button
      type="button"
      onClick={isOn ? handleDisable : handleEnable}
      disabled={busy}
      title={isOn ? "Disable push notifications" : "Enable push notifications"}
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-[12px] text-sm font-semibold transition",
        isOn
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-[#F4F4F5] text-[#4B5563] border border-[#E5E7EB] hover:bg-[#EBEBEB]",
        busy ? "opacity-60 cursor-not-allowed" : "",
      ].join(" ")}
    >
      <span>{isOn ? "🔔" : "🔕"}</span>
      <span>{busy ? "..." : isOn ? "Push: On" : "Push: Off"}</span>
    </button>
  );
}
