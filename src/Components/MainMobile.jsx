import React, { useState, useEffect } from "react";
import Head from "./Head.jsx";
import Services from "./Services.jsx";

import bg_detaling from "../assets/photo/bg2_mobile_detailing.png";
import bg_cleaining from "../assets/photo/cleaningn_bg.png";

import diamondicon from "../assets/icons/diamond-icon.png";
import OurPortfolio from "./OurPortfolio.jsx";
import OurCoreValues from "./OurCoreValues.jsx";
import OurReviews from "./OurReviews.jsx";
import ActionMini from "./ActionMini.jsx";
import FAQ from "./FAQ.jsx";
import Footer from "./Footer.jsx";
import StatsBlock from "./StatsBlock.jsx";

const MainMobile = () => {
  // 👉 Сюди потім підставиш свої мобільні фото (Detailing / Cleaning)
  const images = [bg_detaling, bg_cleaining];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Авто-ротація кожні 2.5 секунди з плавним переходом
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2500); // 2000–3000 ms як тобі комфортно

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8">
      <Head />

      {/* hero-блок з фоновою каруселлю */}
      <main className="relative min-h-[calc(100vh-80px)] overflow-x-clip">
        {/* 🔥 Фонова карусель (fade між зображеннями) */}
        <div className="absolute inset-0">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt=""
              className={`
                w-full h-full
                object-cover
                absolute inset-0
                transition-opacity duration-700
                ${index === currentImageIndex ? "opacity-100" : "opacity-0"}
              `}
            />
          ))}

          {/* Легкий темний overlay для читабельності тексту */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Контент поверх фону */}
        <div className="relative z-10 flex min-h-[calc(100vh-80px)]">
          <div className="w-full mx-auto mt-[120px] ml-5 px-4">
            <div className="space-y-4">
              <h1
                className="text-[40px] font-extrabold leading-[100%] tracking-[0%] text-white"
                style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800 }}
              >
                WELCOME TO DANILETS
              </h1>
              <p
                className="text-[15px] font-normal leading-[140%] tracking-[0%] text-[rgba(161,161,165,1)]"
                style={{ fontFamily: "Manrope, sans-serif", fontWeight: 400 }}
              >
                Columbus' Trusted Provider of Premium Services Tailored with
                precision and delivered with excellence
              </p>
              <button className="border border-white px-4 py-2 rounded-full text-white text-[14px] font-semibold hover:bg-white hover:text-black transition">
                Lets is More
              </button>
            </div>
          </div>

          {/* бейдж праворуч внизу */}
          <div
            className="
              absolute bottom-[80px] right-4
              w-[140px] h-[40px]
              rounded-full
              bg-[rgba(235,176,108,0.15)]
              flex items-center justify-between
              py-2 px-3
              z-10
            "
          >
            <img src={diamondicon} alt="Diamond Icon" className="w-4 h-4" />
            <span className="text-white text-[14px] font-semibold">
              Less is more
            </span>
          </div>
        </div>
      </main>

      <Services className="relative z-10 mt-[-60px]" />
      <StatsBlock />

      <OurPortfolio />
      <OurCoreValues />
      <OurReviews />
      <ActionMini />
      <FAQ />
      <Footer />
    </div>
  );
};

export default MainMobile;
