// src/components/Head.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FaGoogle,
  FaTiktok,
  FaYoutube,
  FaFacebookF,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/logo/logo.svg";

import ContactForm from "./ContactForm.jsx";
import AuthModal from "./AuthModal.jsx";
import AccountMenu from "./AccountMenu.jsx";

/* ==================== MOBILE ==================== */
const MobileHead = ({ onOpenContact, onOpenAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  return (
    <div className="block md:hidden w-full fixed top-0 left-0 z-50 px-4 pt-3">
      {/* Header bar */}
      <div className="flex items-center justify-between w-full max-w-[420px] mx-auto px-3 py-2 rounded-full bg-white shadow-md">
        {/* Burger */}
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center rounded-full border border-[#A1A1A5] w-[32px] h-[32px]"
        >
          <FaBars className="text-[#A1A1A5] text-sm" />
        </button>

        {/* Logo */}
        <div className="flex justify-center flex-1 px-3">
          <img
            src={logo}
            alt="Logo"
            className="h-[30px] object-contain pr-5 scale-110"
          />
        </div>

        {/* CTA + Account */}
        <div className="flex items-center gap-2">
          <Link to="/book-online">
            <button
              className="text-1xl font-bold px-5 py-[10px] rounded-full"
              style={{
                background:
                  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                color: "rgba(62, 38, 12, 1)",
              }}
            >
              Book Online
            </button>
          </Link>

          {/* Аватар (відкриває модалку авторизації) */}
          <AccountMenu variant="icon" onShowAuth={onOpenAuth} />
        </div>
      </div>

      {/* Mobile side menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMenu}
          />
          <div
            className={`fixed top-0 left-0 w-[80%] max-w-[307px] h-full bg-white z-50 shadow-md border-r border-[#A1A1A5] transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="relative p-4 h-full flex flex-col">
              {/* Logo */}
              <img
                src={logo}
                alt="Logo"
                className="absolute top-3 left-3 h-[24px] object-contain"
              />

              {/* Close */}
              <button
                onClick={toggleMenu}
                className="absolute top-3 right-3 flex items-center justify-center w-[32px] h-[32px] rounded-full border border-[#A1A1A5]"
              >
                <FaTimes className="text-[#A1A1A5] text-base" />
              </button>

              {/* Nav */}
              <nav className="flex flex-col mt-12 gap-3">
                <Link
                  to="/"
                  className="text-[#A1A1A5] border border-[#A1A1A5] rounded-[44px] text-[14px] font-bold text-center py-2 px-4 hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
                  onClick={toggleMenu}
                >
                  Home
                </Link>

                <button
                  onClick={() => {
                    toggleMenu();
                    onOpenContact();
                  }}
                  className="text-[#A1A1A5] border border-[#A1A1A5] rounded-[44px] text-[14px] font-bold text-center py-2 px-4 hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
                >
                  Contact
                </button>

                <Link
                  to="/about-us"
                  className="text-[#A1A1A5] border border-[#A1A1A5] rounded-[44px] text-[14px] font-bold text-center py-2 px-4 hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
                  onClick={toggleMenu}
                >
                  About Us
                </Link>
              </nav>

              {/* Social + CTA */}
              <div className="absolute bottom-4 left-0 w-full px-4 flex flex-col items-center">
                <div className="flex gap-4 justify-center text-[#A1A1A5] text-xl mb-4">
                  <FaGoogle />
                  <FaTiktok />
                  <FaYoutube />
                  <FaFacebookF />
                </div>

                <Link to="/book-online">
                  <button
                    className="text-[14px] font-bold px-6 py-2 rounded-full w-full max-w-[275px]"
                    style={{
                      background:
                        "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                      color: "rgba(62, 38, 12, 1)",
                    }}
                  >
                    Book Online
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ==================== DESKTOP ==================== */
const DesktopHead = ({ onOpenContact, onOpenAuth }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="hidden md:block">
      <div className="mx-auto w-full max-w-full px-2 sm:px-6 lg:px-16 pointer-events-auto relative">
        <div className="bg-white h-20 rounded-[48px] flex justify-between items-center px-6 shadow-md">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </div>

          {/* Nav */}
          <nav className="relative flex items-center space-x-2">
            <Link
              to="/"
              className="flex-shrink-0 bg-white text-[#A1A1A5] border border-[#A1A1A5] px-6 py-3 rounded-[44px] text-base font-bold whitespace-nowrap hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
            >
              Home
            </Link>

            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex items-center gap-2 bg-white text-[#A1A1A5] border border-[#A1A1A5] px-6 py-3 rounded-[44px] text-base font-bold whitespace-nowrap hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
              >
                Services{" "}
                <span
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

              {open && (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-56 z-50 rounded-2xl border border-[#E6E6EA] bg-white shadow-lg overflow-hidden"
                >
                  {[
                    { label: "Detailing", to: "/services/detailing" },
                    { label: "Cleaning", to: "/cleaning" },
                    { label: "Pickleball", to: "/pickleball" },
                    { label: "Media", to: "/media" },
                  ].map(({ label, to }, idx) => (
                    <Link
                      key={label}
                      to={to}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={`block w-full text-left px-4 py-3 text-sm font-semibold text-black hover:bg-[rgba(245,218,147,0.25)] ${
                        idx !== 0 ? "border-t border-[#F2F2F5]" : ""
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onOpenContact}
              className="flex-shrink-0 bg-white text-[#A1A1A5] border border-[#A1A1A5] px-6 py-3 rounded-[44px] text-base font-bold whitespace-nowrap hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
            >
              Contact
            </button>

            <Link
              to="/about-us"
              className="flex-shrink-0 bg-white text-[#A1A1A5] border border-[#A1A1A5] px-6 py-3 rounded-[44px] text-base font-bold whitespace-nowrap hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
            >
              About Us
            </Link>
          </nav>

          {/* Socials + CTA + Account (аватарка) */}
          <div className="flex items-center space-x-3">
            {[FaGoogle, FaTiktok, FaYoutube, FaFacebookF].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition"
              >
                <Icon />
              </a>
            ))}

            <Link to="/book-online">
              <button
                className="text-black md:text-base px-6 py-4 rounded-full text-sm font-bold pointer-events-auto"
                style={{
                  background:
                    "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                }}
              >
                Book Online
              </button>
            </Link>

            {/* Аватар замість двох кнопок */}
            <AccountMenu
              variant="icon"          // ← тепер і на десктопі лише аватарка
              onShowAuth={onOpenAuth} // відкриє AuthModal з відповідною вкладкою
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== WRAPPER ==================== */
const Head = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // "login" | "signup"

  const showAuth = (tab = "login") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <header className="fixed top-4 left-0 w-full z-50 font-sans">
      <MobileHead
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAuth={showAuth}
      />
      <DesktopHead
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAuth={showAuth}
      />

      {/* Модалки */}
      <ContactForm
        open={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <AuthModal
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </header>
  );
};

export default Head;
