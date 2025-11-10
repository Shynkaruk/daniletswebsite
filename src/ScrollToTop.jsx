// src/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // при КОЖНІЙ зміні шляху скролимо вгору
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // можеш змінити на "smooth", якщо хочеш плавно
    });
  }, [pathname]); // важливо: [pathname] в залежностях!

  return null;
};

export default ScrollToTop;
