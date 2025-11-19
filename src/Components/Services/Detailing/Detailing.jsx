import React from "react";
import Head from "../../Head";
import bgImageMobile from "../../../assets/photo/bg2_mobile_detailing.png";
import bgImagePC from "../../../assets/photo/bg_detailing_pc.png";
import iconBuble from "../../../assets/icons/buble_red.svg";
import ServicesProvide from "./ServicesProvide";
import LogoRed from "../../../assets/icons/logo_red.svg";

const Detailing = () => {
  return (
    <section
      className="relative w-full min-h-[100dvh] overflow-hidden text-white flex flex-col justify-between"
      style={{
        background: "linear-gradient(90deg, #1C1C1C 46.13%)",
      }}
    >
      {/* Фон — мобільний */}
      <div className="absolute inset-0 z-0 pointer-events-none md:hidden flex justify-end items-end">
        <img
          src={bgImageMobile}
          alt="Mobile background"
          className="w-full object-cover"
        />
      </div>

      {/* Фон — ПК */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
        <img
          src={bgImagePC}
          alt="Desktop background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Затемнення */}
      <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />

      {/* Контент */}
      <div className="relative z-20 px-6 pt-6 md:pt-[10vh] md:ml-15">
        <Head />
        <div className="mt-20 md:mt-20">
          {/* LogoRed */}
          <img
            src={LogoRed}
            alt="Danilets Logo"
            className="w-68 md:w-124 mb-6 object-contain"
          />

          <h1 className="text-5xl md:text-6xl font-bold leading-tight break-words">
            "Danilets Detailing
          </h1>

          <p
            className="mt-2 text-xl md:hidden max-w-md"
            style={{ color: "#A1A1A5" }}
          >
            Deep interior clean, safe exterior care, and protection — for a car
            that looks its best, every time
          </p>
          <p
            className="mt-2 text-2xl hidden md:block max-w-screen-md"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            Precision detailing for dealerships, fleets, and vehicle owners who
            demand excellence. From commercial work to ceramic coatings — we
            deliver perfection in every detail.
          </p>

          <button className="text-base md:text-xl mt-6 px-12 py-4 border border-white rounded-full hover:bg-white hover:text-black transition">
            Book
          </button>
        </div>
      </div>

      {/* Бульбашка */}
      <div className="absolute bottom-25 right-5 md:bottom-35 md:right-21 z-10">
        <div className="flex items-center space-x-3 bg-[#FF525226] backdrop-blur-md rounded-full px-4 py-3">
          <img
            src={iconBuble}
            alt="Bubble icon"
            className="w-6 h-6 object-contain"
          />
          <span className="text-base font-bold md:text-lg whitespace-nowrap">
            Lets Detail
          </span>
        </div>
      </div>
    </section>
  );
};

export default Detailing;
