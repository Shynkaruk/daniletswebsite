import React, { useState, useEffect, useRef } from "react";
import Head from "./Head.jsx";
import Services from "./Services.jsx";
import { Link } from "react-router-dom";

import diamondicon from "../assets/icons/diamond-icon.svg";
import OurPortfolio from "./OurPortfolio.jsx";
import OurCoreValues from "./OurCoreValues.jsx";
import OurReviews from "./OurReviews.jsx";
import ActionMini from "./ActionMini.jsx";
import FAQ from "./FAQ.jsx";
import Footer from "./Footer.jsx";
import StatsBlock from "./StatsBlock.jsx";

// 📌 СЛАЙДИ ДЛЯ МОБІЛЬНОЇ ВЕРСІЇ — ПІДКЛЮЧЕНО З public/Top_of_Page
// ❗ Шляхи відносно public, тому без import

const SLIDES = [
  {
    id: "top1",
    image: "/Top_of_Page/1.jpg",
    alt: "Danilets slide 1",
    link: "/about-us",
  },
  {
    id: "top2",
    image: "/Top_of_Page/2.jpg",
    alt: "Danilets slide 2",
    link: "/detailing",
  },
  {
    id: "top3",
    image: "/Top_of_Page/3.jpg",
    alt: "Danilets slide 3",
    link: "/cleaning",
  },
  {
    id: "top4",
    image: "/Top_of_Page/4.jpg",
    alt: "Danilets slide 4",
    link: "/detailing",
  },
  {
    id: "top5",
    image: "/Top_of_Page/5.jpg",
    alt: "Danilets slide 5",
    link: "/cleaning",
  },
  {
    id: "top6",
    image: "/Top_of_Page/6.jpg",
    alt: "Danilets slide 6",
    link: "/about-us",
  },
];

const MainMobile = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef(null);

  // AUTO ROTATION — 5s
  useEffect(() => {
    if (!autoPlay) return;

    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoPlay]);

  const stopAutoPlay = () => {
    if (!autoPlay) return;
    setAutoPlay(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const goNext = () => {
    stopAutoPlay();
    setCurrentImageIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const goPrev = () => {
    stopAutoPlay();
    setCurrentImageIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentImageIndex];

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8 overflow-x-hidden">

      {/* HERO */}
      <main className="relative min-h-[100dvh] overflow-hidden">
        {/* 🔥 Фонова карусель */}
        <div className="absolute inset-0">
          {SLIDES.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.alt}
              className={`
        absolute inset-0
        w-full h-full
        transition-opacity duration-700
        ${index === currentImageIndex ? "opacity-100" : "opacity-0"}

        /* ✅ щоб “як на прикладі”: машина знизу, картинка не надто збільшена */
        object-cover object-bottom
        scale-[1.00]
      `}
            />
          ))}

          {/* ✅ 1) Основний градієнт (чорний верх → прозоріше вниз) */}
          <div
            className="
      absolute inset-0
      pointer-events-none
      bg-[linear-gradient(180deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.80)_35%,rgba(0,0,0,0.55)_62%,rgba(0,0,0,0.35)_100%)]
    "
          />

          {/* ✅ 2) Віньєтка по краях + легке затемнення низу (як “рамка” на скріні) */}
          <div
            className="
      absolute inset-0
      pointer-events-none
      bg-[radial-gradient(120%_90%_at_50%_20%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.78)_100%)]
    "
          />
        </div>

        {/* Контент поверх */}
        <div className="relative z-10 flex min-h-[92vh]">
          <div className="w-full mx-auto mt-[120px] px-6">
            <div className="space-y-4">
              <h1
                className="text-[40px] font-extrabold leading-[100%] text-white pr-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                WELCOME TO DANILETS
              </h1>

              <p
                className="text-[20px] text-[rgba(230,230,235,1)] max-w-[85%]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Columbus' trusted provider of premium auto detailing and
                commercial cleaning services tailored with precision and
                delivered with excellence.
              </p>

              <Link
                to={currentSlide.link}
                className="
                  inline-block border border-white px-8 py-4 rounded-full
                  text-white text-[14px] font-semibold
                  hover:bg-white hover:text-black transition
                "
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* 🟡 Бейдж справа */}
          <div
            className="
              absolute bottom-[70px] right-4
              bg-[rgba(235,176,108,0.18)]
              rounded-full
              px-4 py-3
              flex items-center gap-2
              z-10
            "
          >
            <img src={diamondicon} alt="Diamond Icon" className="w-8 h-6" />
            <span className="text-white text-[14px] font-semibold">
              Lets is More
            </span>
          </div>

          {/* ⬅️➡️ СТРІЛКИ КАРУСЕЛІ — ПЕРЕМІЩЕНІ ПРАВІШЕ */}
          <div
            className="
              absolute bottom-[70px]
              left-[20%]             /* Було по центру — тепер правіше */
              -translate-x-1/2
              flex gap-3
              z-20
            "
          >
            <button
              onClick={goPrev}
              className="
                w-[60px] h-[45px]
                rounded-full
                bg-[#4A4A4A]
                flex items-center justify-center
                text-white text-[22px] font-semibold
                shadow-md active:scale-95 transition
              "
            >
              ‹
            </button>

            <button
              onClick={goNext}
              className="
                w-[60px] h-[45px]
                rounded-full
                bg-[#4A4A4A]
                flex items-center justify-center
                text-white text-[22px] font-semibold
                shadow-md active:scale-95 transition
              "
            >
              ›
            </button>
          </div>
        </div>
      </main>

      <Services className="relative z-10 mt-[-40px]" />
      <StatsBlock />
      <OurCoreValues />
      <OurReviews />
      <ActionMini />
      <FAQ />
      <Footer />
    </div>
  );
};

export default MainMobile;
