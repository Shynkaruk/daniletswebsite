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
import LayoutContainer from "./LayoutContainer";

const SLIDES = [
  {
    id: "top1",
    image: "/Top_of_Page/1.jpg",
    alt: "Danilets hero 1",
    link: "/about-us",
  },
  {
    id: "top2",
    image: "/Top_of_Page/2.jpg",
    alt: "Danilets hero 2",
    link: "/detailing",
  },
  {
    id: "top3",
    image: "/Top_of_Page/3.jpg",
    alt: "Danilets hero 3",
    link: "/cleaning",
  },
  {
    id: "top4",
    image: "/Top_of_Page/4.jpg",
    alt: "Danilets hero 4",
    link: "/detailing",
  },
  {
    id: "top5",
    image: "/Top_of_Page/5.jpg",
    alt: "Danilets hero 5",
    link: "/cleaning",
  },
  {
    id: "top6",
    image: "/Top_of_Page/6.jpg",
    alt: "Danilets hero 6",
    link: "/about-us",
  },
];

const Main = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // новий стейт для автоплею
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef(null);

  // авто-ротація кожні 5 секунд
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

  // зупиняємо автоплей при ручному кліку
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
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8 overflow-x-clip">
      <Head />

      {/* Головний блок hero */}
      <main className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-screen overflow-x-clip">
        {/* 🔥 Фонова карусель */}
        <div className="absolute inset-0">
          {SLIDES.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.alt}
              className={`
              w-full h-full
              object-contain  /* Заміна object-cover */
              scale-[1]     /* віддаляємо фото */
              object-center
              absolute inset-0
              transition-all duration-700
              ${index === currentImageIndex ? "opacity-100" : "opacity-0"}
              `}
            />
          ))}

          {/* Темний overlay для контрасту тексту */}
          <div
            className={`
              absolute inset-0
              transition-all duration-500
              bg-black/70 sm:bg-black/60 lg:bg-black/50
            `}
          />
        </div>

        {/* Контент поверх фону */}
        <div className="relative z-10 flex min-h-[560px] sm:min-h-[640px] lg:min-h-screen">
          <div className="w-[95%] max-w-[1792px] mx-auto mt-[110px] sm:mt-[130px] lg:mt-[140px] px-4 mb-[50px]">
            <div className="w-full md:w-2/3 lg:w-1/2 space-y-5">
              <h1
                className="
                  text-[30px]
                  sm:text-[38px]
                  md:text-[48px]
                  lg:text-[64px]
                  xl:text-[80px]
                  font-extrabold
                  leading-tight
                  text-white
                "
              >
                WELCOME TO DANILETS
              </h1>
              <p
                className="
                  text-[14px]
                  sm:text-[16px]
                  md:text-[18px]
                  lg:text-[20px]
                  xl:text-[22px]
                  font-semibold
                  leading-snug
                  text-[rgba(230,230,235,1)]
                  max-w-[900px]
                  -mt-5
                "
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Columbus&apos; trusted provider of premium auto detailing and
                commercial cleaning services tailored with precision and
                delivered with excellence.
              </p>

              {/* Learn More → посилання залежить від слайду */}
              <Link
                to={currentSlide.link}
                className="
                  inline-block
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
              </Link>
            </div>
          </div>

          {/* бейдж праворуч внизу */}
          <div
            className="
              absolute bottom-5 sm:bottom-8 md:bottom-[110px] right-4 sm:right-6 md:right-20
              bg-[rgba(235,176,108,0.15)]
              rounded-full
              px-5 sm:px-6 py-2.5 sm:py-3
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
                text-[14px]
                sm:text-[16px]
                lg:text-[20px]
                font-semibold
              "
            >
              Lets is More
            </span>
          </div>

          {/* 🔽 Стрілки-карусель внизу зліва над Services */}
          <div
            className="
              absolute
              bottom-5 sm:bottom-8 md:bottom-[110px]
              left-10 sm:left-20 md:left-12
              flex gap-2
              z-20
            "
          >
            <button
              onClick={goPrev}
              className="
                w-[64px] h-[40px]
                sm:w-[70px] sm:h-[45px]
                rounded-full
                bg-[#4A4A4A]
                flex items-center justify-center
                text-white text-[20px] sm:text-[22px]
                font-semibold
                shadow-md
                active:scale-95
                transition
              "
            >
              ‹
            </button>

            <button
              onClick={goNext}
              className="
                w-[64px] h-[40px]
                sm:w-[70px] sm:h-[45px]
                rounded-full
                bg-[#4A4A4A]
                flex items-center justify-center
                text-white text-[20px] sm:text-[22px]
                font-semibold
                shadow-md
                active:scale-95
                transition
              "
            >
              ›
            </button>
          </div>
        </div>
      </main>
<LayoutContainer>
      <Services className="relative z-10 mt-[-100px]" />
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

export default Main;
