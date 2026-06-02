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
import LayoutContainer from "./LayoutContainer.jsx";
import SEO from "./SEO.jsx";
import { MainStructuredData } from "./StructuredData.jsx";

// 📌 СЛАЙДИ ДЛЯ МОБІЛЬНОЇ ВЕРСІЇ — ПІДКЛЮЧЕНО З public/Top_of_Page
// ❗ Шляхи відносно public, тому без import

const SLIDES = [
  {
    id: "top1",
    image: "/Top_of_Page/1.webp",
    alt: "Danilets slide 1",
    link: "/about-us",
  },
  {
    id: "top2",
    image: "/Top_of_Page/2.webp",
    alt: "Danilets slide 2",
    link: "/detailing",
  },
  {
    id: "top3",
    image: "/Top_of_Page/3.webp",
    alt: "Danilets slide 3",
    link: "/cleaning",
  },
  {
    id: "top4",
    image: "/Top_of_Page/4.webp",
    alt: "Danilets slide 4",
    link: "/detailing",
  },
  {
    id: "top5",
    image: "/Top_of_Page/5.webp",
    alt: "Danilets slide 5",
    link: "/cleaning",
  },
  {
    id: "top6",
    image: "/Top_of_Page/6.webp",
    alt: "Danilets slide 6",
    link: "/about-us",
  },
];

const MainMobile = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex]       = useState(null);
  const currIdxRef   = useRef(0);
  const prevTimerRef = useRef(null);
  const intervalRef  = useRef(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const goTo = (nextIdx) => {
    setPrevImageIndex(currIdxRef.current);
    clearTimeout(prevTimerRef.current);
    prevTimerRef.current = setTimeout(() => setPrevImageIndex(null), 700);
    currIdxRef.current = nextIdx;
    setCurrentImageIndex(nextIdx);
  };

  useEffect(() => {
    if (!autoPlay) return;
    intervalRef.current = setInterval(() => {
      goTo((currIdxRef.current + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    clearTimeout(prevTimerRef.current);
    clearInterval(intervalRef.current);
  }, []);

  const stopAutoPlay = () => {
    if (!autoPlay) return;
    setAutoPlay(false);
    clearInterval(intervalRef.current);
  };

  const goNext = () => { stopAutoPlay(); goTo((currIdxRef.current + 1) % SLIDES.length); };
  const goPrev = () => { stopAutoPlay(); goTo((currIdxRef.current - 1 + SLIDES.length) % SLIDES.length); };

  const currentSlide = SLIDES[currentImageIndex];

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8 overflow-x-hidden">
      <SEO
        title="Premium Auto Detailing & Commercial Cleaning"
        description="Columbus' trusted family-owned provider of premium auto detailing and commercial cleaning services. Mobile detailing, ceramic coating, fleet services. Serving Central Ohio since 2013."
        image="/Top_of_Page/1.webp"
      />
      <MainStructuredData />

      {/* HERO */}
      <main className="relative min-h-[100dvh] overflow-hidden">
        {/* 🔥 Фонова карусель — тільки поточний + попередній слайд у DOM */}
        <div className="absolute inset-0">
          {[
            prevImageIndex !== null ? { ...SLIDES[prevImageIndex], role: "prev" } : null,
            { ...SLIDES[currentImageIndex], role: "curr" },
          ].filter(Boolean).map((slide) => (
            <img
              key={slide.id + slide.role}
              src={slide.image}
              alt={slide.alt}
              loading="eager"
              fetchPriority={slide.role === "curr" && currentImageIndex === 0 ? "high" : "auto"}
              decoding={slide.role === "curr" ? "sync" : "async"}
              width={828}
              height={1792}
              className={[
                "absolute inset-0 w-full h-full",
                "object-cover object-bottom scale-[1.00]",
                "transition-opacity duration-700",
                slide.role === "curr" ? "opacity-100" : "opacity-0",
              ].join(" ")}
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

          {/* ✅ 2) Віньєтка по краях + легке затемнення низу (як "рамка" на скріні) */}
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
            <span className="text-white text-base font-semibold">
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

<LayoutContainer>
      <Services className="relative z-10 mt-[-50px]" />
      </LayoutContainer>
<LayoutContainer>
  <StatsBlock />
</LayoutContainer>

<LayoutContainer>
  <OurCoreValues />
</LayoutContainer>
<LayoutContainer>
  <OurReviews />
</LayoutContainer>
<LayoutContainer>
  <ActionMini />
</LayoutContainer>
<LayoutContainer>
  <FAQ />
</LayoutContainer>
      <Footer />
    </div>
  );
};

export default MainMobile;
