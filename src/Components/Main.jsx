import React, { useState } from "react";
import Head from "./Head.jsx";
import Services from "./Services.jsx";
import familyPhoto from "../assets/photo/family-photo.png";
import fon_two from "../assets/photo/fon_car2.JPG";
import newPhoto from "../assets/photo/InfoPhoto.png";
import diamondicon from "../assets/icons/diamond-icon.svg";
import OurPortfolio from "./OurPortfolio.jsx";
import OurCoreValues from "./OurCoreValues.jsx";
import OurReviews from "./OurReviews.jsx";
import ActionMini from "./ActionMini.jsx";
import FAQ from "./FAQ.jsx";
import Footer from "./Footer.jsx";
import leftArrowIcon from "../assets/icons/arrows/arrow_left_white.svg";
import rightArrowIcon from "../assets/icons/arrows/arrow_right_white.svg";

const Main = () => {
  const images = [familyPhoto, fon_two];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8 overflow-x-clip">
      <Head />

      <main
        className="flex min-h-screen bg-cover bg-center relative z-0 overflow-x-clip"
        style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
      >
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

        {images.length > 1 && (
<div className="absolute bottom-6 md:bottom-[120px] left-6 md:left-15 flex gap-3 z-[60] pointer-events-auto">
            <button
              onClick={handlePrev}
              className="
                w-[40px] h-[32px]
                sm:w-[46px] sm:h-[36px]
                md:w-[50px] md:h-[40px]
                lg:w-[56px] lg:h-[44px]
                xl:w-[64px] xl:h-[50px]
                rounded-full
                bg-[rgba(73,73,73,1)]
                flex items-center justify-center
              "
            >
              <img
                src={leftArrowIcon}
                alt="Arrow Left"
                className="w-5 h-5 lg:w-6 lg:h-6"
              />
            </button>
            <button
              onClick={handleNext}
              className="
                w-[40px] h-[32px]
                sm:w-[46px] sm:h-[36px]
                md:w-[50px] md:h-[40px]
                lg:w-[56px] lg:h-[44px]
                xl:w-[64px] xl:h-[50px]
                rounded-full
                bg-[rgba(73,73,73,1)]
                flex items-center justify-center
              "
            >
              <img
                src={rightArrowIcon}
                alt="Arrow Right"
                className="w-5 h-5 lg:w-6 lg:h-6"
              />
            </button>
          </div>
        )}

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
