import React, { useEffect, useRef, useState } from "react";
import {
  FaGoogle,
  FaTiktok,
  FaYoutube,
  FaFacebookF,
  FaBars,
  FaTimes,
  FaEllipsisH,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import logo from "../assets/logo/logo.svg";
import ContactForm from "./ContactForm.jsx";
import AuthModal from "./AuthModal.jsx";
import AccountMenu from "./AccountMenu.jsx";
import SocialModal from "./SocialModal.jsx";

/* ==================== MOBILE ==================== */
const MobileHead = ({ onOpenContact, onOpenAuth, onOpenSocial }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  return (
    <div className="block md:hidden w-full">
      {/* Бар: в межах вікна, з безпечними полями */}
      <div className="relative left-1/2 -translate-x-1/2 w-[min(1800px,calc(100vw-4px))] px-4">
        <div className="flex items-center justify-between w-full mx-auto px-2 py-2 rounded-full bg-white shadow-md">
          {/* Burger */}
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center rounded-full border border-[#A1A1A5] w-[32px] h-[32px]"
            aria-label="Open menu"
          >
            <FaBars className="text-[#A1A1A5] text-sm" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex justify-center flex-1 px-3">
            <img
              src={logo}
              alt="Logo"
              className="h-[30px] object-contain pr-0 scale-110"
            />
          </Link>

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
                Book now
              </button>
            </Link>
            <AccountMenu variant="icon" onShowAuth={onOpenAuth} />
          </div>
        </div>
      </div>

      {/* Mobile side menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={toggleMenu}
          />
          <div
            className={`fixed top-0 left-0 z-[70] w-[80%] max-w-[307px] h-full bg-white shadow-md border-r border-[#A1A1A5] transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div to="/" className="relative p-4 h-full flex flex-col">
              {/* Logo */}
              <Link to="/">
                <img
                  src={logo}
                  alt="Logo"
                  className="absolute top-3 left-3 h-[24px] object-contain"
                />
              </Link>

              {/* Close */}
              <button
                onClick={toggleMenu}
                className="absolute top-3 right-3 flex items-center justify-center w-[32px] h-[32px] rounded-full border border-[#A1A1A5]"
                aria-label="Close menu"
              >
                <FaTimes className="text-[#A1A1A5] text-base" />
              </button>

              {/* Nav */}
              {/* Nav */}
              <nav className="flex flex-col mt-12 gap-3">
                <Link
                  to="/"
                  className="text-[#A1A1A5] border border-[#A1A1A5] rounded-[44px] text-[14px] font-bold text-center py-2 px-4 hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
                  onClick={toggleMenu}
                >
                  Home
                </Link>

                {/* ===== Services with dropdown ===== */}
                <details className="group">
                  <summary
                    className="text-[#A1A1A5] border border-[#A1A1A5] rounded-[44px] 
  text-[14px] font-bold py-2 px-4 cursor-pointer list-none
  flex items-center justify-center relative
  hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
                  >
                    <span>Services</span>
                    <span className="transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>

                  <div className="mt-2 ml-2 flex flex-col gap-2">
                    <Link
                      to="/services/detailing"
                      className="text-[#676767] border border-[#DADADA] rounded-[40px] text-[13px] font-semibold py-2 px-4 hover:bg-[rgba(245,218,147,0.3)] transition"
                      onClick={toggleMenu}
                    >
                      Detailing
                    </Link>

                    <Link
                      to="/services/cleaning"
                      className="text-[#676767] border border-[#DADADA] rounded-[40px] text-[13px] font-semibold py-2 px-4 hover:bg-[rgba(245,218,147,0.3)] transition"
                      onClick={toggleMenu}
                    >
                      Cleaning
                    </Link>
                  </div>
                </details>

                {/* Contact */}
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
                  {[FaGoogle, FaTiktok, FaYoutube, FaFacebookF].map(
                    (Icon, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          toggleMenu();
                          onOpenSocial();
                        }}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:text-black transition"
                        aria-label="Open social modal"
                      >
                        <Icon />
                      </button>
                    )
                  )}
                </div>

                <Link to="/book-online" onClick={toggleMenu}>
                  <button
                    className="
    text-1xl font-bold px-5 py-[10px] rounded-full transition-all duration-200
    hover:scale-[1.05]
    hover:brightness-90
  "
                    style={{
                      background:
                        "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                      color: "rgba(62, 38, 12, 1)",
                    }}
                  >
                    Book now
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
const DesktopHead = ({ onOpenContact, onOpenAuth, onOpenSocial }) => {
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
      {/* Центрований контейнер з обмеженою шириною, щоб не вилізти за фон */}
      <div className="relative left-1/2 -translate-x-1/2 w-[min(1800px,calc(100vw-32px))]">
        <div className="bg-white h-[72px] xl:h-20 rounded-[48px] overflow-visible flex items-center justify-between px-4 sm:px-6 shadow-md">
          {/* Лого */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src={logo}
              alt="Logo"
              className="h-8 xl:h-10 w-auto object-contain min-w-[120px] xl:min-w-[150px]"
            />
          </Link>

          {/* Навігація по центру */}
          <nav className="flex-1 flex justify-center items-center">
            <div className="flex items-center gap-2 xl:gap-3">
              <Link
                to="/"
                className="bg-white text-[#A1A1A5] border border-[#A1A1A5]
                           rounded-[44px] font-bold whitespace-nowrap
                           px-4 py-2 text-sm xl:px-6 xl:py-3 xl:text-base
                           hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
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
                  className="flex items-center gap-2 bg-white text-[#A1A1A5] border border-[#A1A1A5]
                             rounded-[44px] font-bold whitespace-nowrap
                             px-4 py-2 text-sm xl:px-6 xl:py-3 xl:text-base
                             hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
                >
                  Services{" "}
                  <span
                    className={`transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {open && (
                  <div
                    ref={menuRef}
                    role="menu"
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 z-[300] rounded-2xl border border-[#E6E6EA] bg-white shadow-lg overflow-hidden"
                  >
                    {[
                      { label: "Detailing", to: "/services/detailing" },
                      { label: "Cleaning", to: "/services/cleaning" },
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
                className="bg-white text-[#A1A1A5] border border-[#A1A1A5]
                           rounded-[44px] font-bold whitespace-nowrap
                           px-4 py-2 text-sm xl:px-6 xl:py-3 xl:text-base
                           hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
              >
                Contact
              </button>

              <Link
                to="/about-us"
                className="bg-white text-[#A1A1A5] border border-[#A1A1A5]
                           rounded-[44px] font-bold whitespace-nowrap
                           px-4 py-2 text-sm xl:px-6 xl:py-3 xl:text-base
                           hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
              >
                About Us
              </Link>
            </div>
          </nav>

          {/* Правий блок */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* На md–lg — кнопка “…”, на xl — всі соц.іконки */}
            <button
              type="button"
              onClick={onOpenSocial}
              className="md:flex xl:hidden w-10 h-10 rounded-full bg-gray-100 items-center justify-center text-gray-600 hover:text-black transition"
              aria-label="Open social modal"
            >
              <FaEllipsisH />
            </button>

            <div className="hidden xl:flex items-center gap-2">
              {[FaGoogle, FaTiktok, FaYoutube, FaFacebookF].map((Icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={onOpenSocial}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition"
                  aria-label="Open social modal"
                >
                  <Icon />
                </button>
              ))}
            </div>

            <Link to="/book-online" className="shrink-0">
              <button
                className="
    text-black font-bold rounded-full pointer-events-auto
    px-4 py-3 text-sm md:px-5 md:py-3 md:text-sm xl:px-6 xl:py-4 xl:text-base
    transition-all duration-200
    hover:scale-[1.05]
    hover:brightness-90
  "
                style={{
                  background:
                    "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                }}
              >
                Book Now
              </button>
            </Link>

            <AccountMenu variant="icon" onShowAuth={onOpenAuth} />
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
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  const showAuth = (tab = "login") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <header className="fixed top-4 left-0 w-full z-[200] font-sans">
      {/* один фіксований wrapper; усередині — адаптивні хедери */}
      <MobileHead
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAuth={showAuth}
        onOpenSocial={() => setIsSocialOpen(true)}
      />
      <DesktopHead
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAuth={showAuth}
        onOpenSocial={() => setIsSocialOpen(true)}
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
      <SocialModal
        open={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        initialTab="Detailing"
      />
    </header>
  );
};

export default Head;
