import React, { useState, useEffect } from "react";
import Head from "./Head.jsx";
import Services from "./Services.jsx";

import bg_detaling from "../assets/photo/bg_detailing_pc.png"
import bg_cleaining from '../assets/photo/cleaningn_bg.png'

import newPhoto from "../assets/photo/InfoPhoto.png";
import diamondicon from "../assets/icons/diamond-icon.svg";
import OurPortfolio from "./OurPortfolio.jsx";
import OurCoreValues from "./OurCoreValues.jsx";
import OurReviews from "./OurReviews.jsx";
import ActionMini from "./ActionMini.jsx";
import FAQ from "./FAQ.jsx";
import Footer from "./Footer.jsx";

const Main = () => {
  // 👉 Сюди потім підставиш Detailing / Cleaning
  const images = [bg_detaling, bg_cleaining];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Авто-ротація кожні 2.5 секунди
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8 overflow-x-clip">
      <Head />

      {/* Головний блок hero */}
      <main className="relative min-h-screen overflow-x-clip">

        {/* 🔥 Фонова карусель */}
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

          {/* Темний overlay для контрасту тексту */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Контент поверх фону */}
        <div className="relative z-10 flex min-h-screen">
          <div className="w-[95%] max-w-[1792px] mx-auto mt-[180px] px-4 mb-[50px]">
            <div className="w-full md:w-2/3 lg:w-1/2 space-y-5">
              <h1
                className="
                  text-[32px]
                  sm:text-[40px]
                  md:text-[50px]
                  lg:text-[64px]
                  xl:text-[80px]
                  font-extrabold
                  leading-tight
                  text-white
                "
              >
                DANILETS FAMILY
              </h1>

              <p
                className="
                  text-[14px]
                  sm:text-[16px]
                  md:text-[18px]
                  lg:text-[20px]
                  xl:text-[22px]
                  font-medium
                  leading-snug
                  text-[rgba(161,161,165,1)]
                  max-w-[900px]
                "
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Columbos premier dentistry for bespoke luxury services, tailored
                with precision and delivered with excellence – where every detail
                exceeds expectations
              </p>

              <button
                className="
                  border border-white
                  px-5 py-2.5
                  rounded-full
                  text-white
                  text-[15px]
                  sm:text-[17px]
                  font-semibold
                  hover:bg-white hover:text-black
                  transition
                "
              >
                Learn More
              </button>
            </div>
          </div>

          {/* бейдж праворуч внизу */}
          <div
            className="
              absolute bottom-6 md:bottom-[120px] right-20
              bg-[rgba(235,176,108,0.15)]
              rounded-full
              px-6 py-3
              flex items-center gap-3
              z-10
            "
          >
            <img
              src={diamondicon}
              alt="Diamond Icon"
              className="w-6 h-6 lg:w-8 lg:h-8"
            />
            <span
              className="
                text-white
                text-[16px]
                sm:text-[18px]
                lg:text-[20px]
                font-semibold
              "
            >
              Less is more
            </span>
          </div>
        </div>
      </main>

      <Services className="relative z-10 mt-[-100px]" />

      <div className="w-[95%] max-w-[1792px] mx-auto mt-8 px-4">
        <img
          src={newPhoto}
          alt="Additional Photo"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      <OurPortfolio />
      <OurCoreValues />
      <OurReviews />
      <ActionMini />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Main;
