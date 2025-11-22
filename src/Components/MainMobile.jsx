import React, { useState, useEffect } from "react";
import Head from "./Head.jsx";
import Services from "./Services.jsx";
import { Link } from "react-router-dom";

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
import familyphoto from "./../assets/photo/family-photo.png";

// СЛАЙДИ ДЛЯ МОБІЛЬНОЇ ВЕРСІЇ
const SLIDES = [
  {
    id: "family",
    image: familyphoto,
    alt: "Danilets family",
    link: "/about-us",
  },
  {
    id: "detailing",
    image: bg_detaling,
    alt: "Danilets Detailing",
    link: "/detailing",
  },
  {
    id: "cleaning",
    image: bg_cleaining,
    alt: "Danilets Cleaning",
    link: "/cleaning",
  },
];

const MainMobile = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // AUTO ROTATION — 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const goPrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentImageIndex];

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8 overflow-x-hidden">
      <Head />

      {/* HERO */}
      <main className="relative min-h-[92vh] overflow-x-hidden">

        {/* Фонова карусель */}
        <div className="absolute inset-0">
          {SLIDES.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.alt}
              className={`
                w-full h-full object-cover absolute inset-0
                transition-opacity duration-700
                ${index === currentImageIndex ? "opacity-100" : "opacity-0"}
              `}
            />
          ))}

          {/* overlay */}
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Контент поверх */}
        <div className="relative z-10 flex min-h-[92vh]">
          <div className="w-full mx-auto mt-[120px] px-4">
            <div className="space-y-4">

              <h1
                className="text-[38px] font-extrabold leading-[100%] text-white pr-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                WELCOME TO DANILETS
              </h1>

              <p
                className="text-[15px] leading-[140%] text-[rgba(230,230,235,1)] max-w-[85%]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Columbus' trusted provider of premium services tailored with
                precision and delivered with excellence.
              </p>

              {/* Learn More — веде на різні сторінки залежно від слайду */}
              <Link
                to={currentSlide.link}
                className="
                  inline-block border border-white px-5 py-2 rounded-full
                  text-white text-[14px] font-semibold
                  hover:bg-white hover:text-black transition
                "
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Бейдж справа */}
          <div
            className="
              absolute bottom-[90px] right-4
              bg-[rgba(235,176,108,0.18)]
              rounded-full
              px-4 py-2
              flex items-center gap-2
              z-10
            "
          >
            <img src={diamondicon} alt="Diamond Icon" className="w-4 h-4" />
            <span className="text-white text-[14px] font-semibold">
              Lets is More
            </span>
          </div>

          {/* СТРІЛКИ КАРУСЕЛІ → як на десктопі */}
          <div className="absolute bottom-[25px] left-4 flex gap-2 z-20">
            <button
              onClick={goPrev}
              className="
                w-9 h-9 rounded-full bg-black/50 border border-white/40
                flex items-center justify-center text-white text-xl
                hover:bg-white hover:text-black transition
              "
            >
              ‹
            </button>

            <button
              onClick={goNext}
              className="
                w-9 h-9 rounded-full bg-black/50 border border-white/40
                flex items-center justify-center text-white text-xl
                hover:bg-white hover:text-black transition
              "
            >
              ›
            </button>
          </div>
        </div>
      </main>

      <Services className="relative z-10 mt-[-40px]" />
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
