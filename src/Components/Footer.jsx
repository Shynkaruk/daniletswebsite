import React from "react";
import { Link } from "react-router-dom";
import { FaGoogle, FaTiktok, FaYoutube, FaFacebookF } from "react-icons/fa";
import logo from "../assets/logo/logo.svg";
import contactIcon1 from "../assets/icons/icon-envelope.png";
import contactIcon2 from "../assets/icons/icon-phone.png";
import RightArrowIcon from "../assets/icons/angle-right-icon.png";

const Footer = () => {
  return (
    <div className="relative w-full max-w-[1880px] mx-auto mt-8 px-4 sm:px-6 lg:px-12">
      <div className="w-full bg-white rounded-[32px] p-6 sm:p-10 flex flex-col gap-6 sm:gap-8">
        {/* Верхній блок: логотип/соц + меню + кнопка (кнопка піднята вгору) */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Logo + соцмережі */}
          <div className="flex flex-col gap-5 h-full">
            <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
            <div className="flex space-x-3">
              {[FaGoogle, FaTiktok, FaYoutube, FaFacebookF].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition"
                >
                  <Icon className="text-[18px]" />
                </a>
              ))}
            </div>
            <p className="text-[16px] sm:text-[18px] hidden sm:block font-normal text-black mt-auto pt-2">
              Copyright © 2025 Danilets LLC
            </p>
          </div>

          {/* Посилання */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:flex lg:flex-row lg:flex-nowrap lg:gap-32">
            <div className="flex flex-col gap-2">
              <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B] mb-2">
                Services
              </h3>
              {["Cleaning", "Detailing", "Media", "Pickleball"].map(
                (text, i) => (
                  <Link
                    key={i}
                    to={`/services/${text.toLowerCase()}`}
                    className="text-[18px] sm:text-[20px] font-normal text-[#18181B] hover:text-yellow-600"
                  >
                    {text}
                  </Link>
                )
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B] mb-2">
                Menu
              </h3>
              {["Home", "About Us", "Contact Form", "Newsletter"].map(
                (text, i) => (
                  <Link
                    key={i}
                    to={`/${text.toLowerCase().replace(" ", "-")}`}
                    className="text-[18px] sm:text-[20px] font-normal text-[#18181B] hover:text-yellow-600"
                  >
                    {text}
                  </Link>
                )
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B] mb-2">
                Legal
              </h3>
              {["Privacy Policy", "Terms & Conditions", "FAQ"].map(
                (text, i) => (
                  <Link
                    key={i}
                    to={`/legal/${text.toLowerCase().replace(" ", "-")}`}
                    className="text-[18px] sm:text-[20px] font-normal text-[#18181B] hover:text-yellow-600"
                  >
                    {text}
                  </Link>
                )
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
                Contact
              </h3>
              <div className="flex items-center gap-2">
                <img src={contactIcon2} alt="Phone Icon" className="w-6 h-6" />
                <a
                  href="tel:(614)980-7380"
                  className="text-[18px] sm:text-[20px] font-normal text-[#18181B]"
                >
                  (614) 980-7380
                </a>
              </div>
              <div className="flex items-center gap-2">
                <img src={contactIcon1} alt="Email Icon" className="w-6 h-6" />
                <a
                  href="mailto:info@danilets.com"
                  className="text-[18px] sm:text-[20px] font-normal text-[#18181B]"
                >
                  info@danilets.com
                </a>
              </div>
            </div>
          </div>

          {/* Кнопка Book Online — Десктоп (підняв вище, вирівняв зверху) */}
          <div className="hidden lg:flex lg:items-start lg:ml-auto">
            <Link
              to="/book-online"
              className="min-w-[220px] h-[56px] rounded-[88px] flex items-center justify-between px-5"
              style={{
                background:
                  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
              }}
            >
              <span className="text-[16px] font-semibold text-black">
                Book Online
              </span>
              <img src={RightArrowIcon} alt="Arrow Right" className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Кнопка Book Online — Мобільна (теж вище, перед копірайтом) */}
        <div className="flex justify-center lg:justify-end block md:hidden -mt-2">
          <Link
            to="/book-online"
            className="w-full max-w-[220px] h-[52px] rounded-[88px] flex items-center justify-between px-5"
            style={{
              background:
                "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
            }}
          >
            <span className="text-[16px] font-semibold text-black">
              Book Online
            </span>
            <img src={RightArrowIcon} alt="Arrow Right" className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile copyright (залишив внизу) */}
        <p className="text-[16px] sm:text-[18px] block sm:hidden font-normal text-black mx-auto">
          Copyright © 2025 Danilets LLC
        </p>
      </div>
    </div>
  );
};

export default Footer;
