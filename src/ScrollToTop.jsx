// src/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Вимикаємо можливе автоматичне відновлення скролу браузером
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Трошки відкласти скрол, щоб контент точно встиг відмалюватись
    const id = setTimeout(() => {
      // 1) напряму вікно
      window.scrollTo(0, 0);

      // 2) хак через documentElement / body
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // 3) якщо раптом скролиться якийсь контейнер root
      const rootEl = document.getElementById("root");
      if (rootEl) {
        rootEl.scrollTop = 0;
      }

      // Для дебагу – можна глянути в консолі
      console.log("[ScrollToTop] route:", pathname, "=> scrolled to top");
    }, 0);

    return () => clearTimeout(id);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
