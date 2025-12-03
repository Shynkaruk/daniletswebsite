import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaGoogle, FaTiktok, FaYoutube, FaFacebookF } from "react-icons/fa";

import logo from "../assets/logo/logo.svg";
import logoRed from "../assets/logo/Danilets_logo_red.svg";

import contactIcon1 from "../assets/icons/icon-envelope.png";
import contactIcon2 from "../assets/icons/icon-phone.png";
import RightArrowIcon from "../assets/icons/angle-right-icon.png";
// 🔹 Модальне вікно соцмереж
import SocialModal from "./SocialModal.jsx";

const Footer = () => {
  const location = useLocation();

  // Перевірка сторінок
  const isDetailingPage = location.pathname.startsWith("/services/detailing");
  const isCleaningPage = location.pathname.startsWith("/services/cleaning");

  // Вибір логотипу
  const logoSrc = isDetailingPage ? logoRed : isCleaningPage ? logoRed : logo;

  // Динамічний email
  const contactEmail = isDetailingPage
    ? "detailing@danilets.com"
    : isCleaningPage
    ? "cleaning@danilets.com"
    : "info@danilets.com";

  // Динамічний фон кнопки
  const buttonGradient = isDetailingPage
    ? "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)"
    : isCleaningPage
    ? "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)"
    : "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

  // 🔹 Стан модалки соцмереж
  const [socialOpen, setSocialOpen] = useState(false);
  const [socialTab, setSocialTab] = useState("Detailing");

  const handleOpenSocial = () => {
    // Вибір вкладки в модалці за маршрутом
    if (isCleaningPage) {
      setSocialTab("Cleaning");
    } else {
      setSocialTab("Detailing");
    }
    setSocialOpen(true);
  };

  const handleCloseSocial = () => setSocialOpen(false);

  return (
    <>
      <div className="relative w-full max-w-[1880px] mx-auto mt-8 px-4 sm:px-6 lg:px-10">
        <div className="w-full bg-white rounded-[32px] p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 overflow-hidden">
          {/* Верхній блок: лого + колонки */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start justify-between">
            {/* Logo + соцмережі */}
            <div className="flex flex-col gap-4 h-full min-w-[180px]">
              <img
                src={logoSrc}
                alt="Logo"
                className="h-10 w-auto object-contain mr-15"
              />

              <div className="flex space-x-3">
                {[FaGoogle, FaTiktok, FaYoutube, FaFacebookF].map(
                  (Icon, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={handleOpenSocial}
                      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition"
                    >
                      <Icon className="text-[16px]" />
                    </button>
                  )
                )}
              </div>

              <p className="text-[14px] lg:text-[15px] font-normal text-black mt-auto pt-2">
                Copyright © 2025 Danilets <br />
                Detailing LLC & Timils Cleaning LLC. <br />
                All rights reserved.
              </p>
            </div>

            {/* Навігаційні блоки */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:flex lg:flex-row lg:gap-20 flex-1 justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] lg:text-[19px] font-extrabold text-[#18181B] mb-1">
                  Services
                </h3>
                {["Detailing", "Cleaning"].map((text, i) => (
                  <Link
                    key={i}
                    to={`/services/${text.toLowerCase()}`}
                    className="text-[15px] lg:text-[16px] font-normal text-[#18181B] hover:text-yellow-600"
                  >
                    {text}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] lg:text-[19px] font-extrabold text-[#18181B] mb-1">
                  Menu
                </h3>
                {["Home", "About Us", "Contact"].map((text, i) => (
                  <Link
                    key={i}
                    to={`/${text.toLowerCase().replace(" ", "-")}`}
                    className={
                      "text-[15px] lg:text-[16px] font-normal text-[#18181B] hover:text-yellow-600" +
                      (text === "About Us" ? " whitespace-nowrap" : "")
                    }
                  >
                    {text}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] lg:text-[19px] font-extrabold text-[#18181B] mb-1">
                  Legal
                </h3>
                {["Privacy Policy", "Terms & Conditions", "FAQ"].map(
                  (text, i) => (
                    <Link
                      key={i}
                      to={`/legal/${text.toLowerCase().replace(" ", "-")}`}
                      className="text-[15px] lg:text-[16px] font-normal text-[#18181B] hover:text-yellow-600"
                    >
                      {text}
                    </Link>
                  )
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-[18px] lg:text-[19px] font-extrabold text-[#18181B]">
                  Contact
                </h3>
                <div className="flex items-center gap-2">
                  <img
                    src={contactIcon2}
                    alt="Phone Icon"
                    className="w-5 h-5"
                  />
                  <a
                    href="tel:(614)980-7380"
                    className="text-[15px] lg:text-[16px] font-normal text-[#18181B]"
                  >
                    (614) 980-7380
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={contactIcon1}
                    alt="Email Icon"
                    className="w-5 h-5"
                  />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-[15px] lg:text-[16px] font-normal text-[#18181B]"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Кнопка Book Online — великі десктопи */}
            <div className="hidden lg:flex lg:items-start lg:ml-auto lg:self-start">
              <Link
                to="/book-online"
                className="
                  group relative
                  h-[50px] min-w-[170px] max-w-[200px]
                  rounded-[88px]
                  flex items-center justify-between px-4
                  overflow-hidden
                "
                style={{ background: buttonGradient }}
              >
                {/* Hover overlay */}
                <div
                  className="
                    absolute inset-0 bg-black
                    opacity-0 group-hover:opacity-20
                    transition-opacity duration-200
                  "
                />
                <span className="text-[14px] font-semibold text-black whitespace-nowrap relative z-10">
                  Book Now
                </span>
                <img
                  src={RightArrowIcon}
                  alt="Arrow Right"
                  className="w-4 h-4 shrink-0 relative z-10"
                />
              </Link>
            </div>

            {/* Кнопка Book Online — мобілка + менші екрани */}
            <div className="flex lg:hidden w-full pt-2">
              <Link
                to="/book-online"
                className="
                  group relative
                  mx-auto w-full max-w-[320px] h-[50px]
                  rounded-[88px]
                  flex items-center justify-center gap-2 px-5
                  overflow-hidden
                "
                style={{ background: buttonGradient }}
              >
                {/* Hover overlay */}
                <div
                  className="
                    absolute inset-0 bg-black
                    opacity-0 group-hover:opacity-20
                    transition-opacity duration-200
                  "
                />
                <span className="text-[15px] font-semibold text-black relative z-10">
                  Book Now
                </span>
                <img
                  src={RightArrowIcon}
                  alt="Arrow Right"
                  className="w-4 h-4 relative z-10"
                />
              </Link>
            </div>
          </div>

          {/* Mobile copyright */}
          <p className="text-[15px] sm:text-[16px] block sm:hidden font-normal text-black mx-auto">
            Copyright © 2025 Danilets Detailing LLC & Timils Cleaning LLC. All
            rights reserved.
          </p>
        </div>
      </div>

      {/* 🔹 Модальне вікно соцмереж */}
      <SocialModal
        open={socialOpen}
        onClose={handleCloseSocial}
        initialTab={socialTab}
      />
    </>
  );
};

export default Footer;
