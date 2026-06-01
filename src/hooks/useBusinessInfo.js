// hooks/useBusinessInfo.js
// ============================================================
// Хук для отримання налаштувань бізнесу з ContentBlock API.
// Дані зберігаються в MongoDB через /api/content,
// редагуються через /admin/settings.
//
// Повертає об'єкт з полями:
//   phone    — номер телефону (+1-614-...)
//   email    — email для клієнтів
//   address  — адреса (рядок)
//   loading  — true поки дані завантажуються
//
// Використовується в: StructuredData.jsx, SEO.jsx, Footer.jsx тощо
// ============================================================

import { useState, useEffect } from "react";
import { contentApi } from "../lib/api";

// Fallback значення — показуються до завантаження з БД
const DEFAULTS = {
  phone:   "+1-614-000-0000",
  email:   "info@danilets.com",
  address: "Columbus, OH",
};

// Простий in-memory кеш — щоб не робити повторні запити при кожному рендері
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 хвилин

export function useBusinessInfo() {
  const [info, setInfo] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      // Якщо кеш свіжий — не йдемо в мережу
      if (_cache && Date.now() - _cacheTime < CACHE_TTL) {
        setInfo(_cache);
        setLoading(false);
        return;
      }

      try {
        // Паралельно завантажуємо всі три поля
        const [phoneBlock, emailBlock, addressBlock] = await Promise.all([
          contentApi.getByKey("business_phone"),
          contentApi.getByKey("business_email"),
          contentApi.getByKey("business_address"),
        ]);

        if (cancelled) return;

        const result = {
          phone:   phoneBlock?.value   || DEFAULTS.phone,
          email:   emailBlock?.value   || DEFAULTS.email,
          address: addressBlock?.value || DEFAULTS.address,
        };

        _cache = result;
        _cacheTime = Date.now();

        setInfo(result);
      } catch {
        // Якщо API недоступний — показуємо fallback мовчки
        if (!cancelled) setInfo(DEFAULTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { ...info, loading };
}

// Очищає кеш — викликати після збереження в AdminSettings
export function invalidateBusinessInfoCache() {
  _cache = null;
  _cacheTime = 0;
}
