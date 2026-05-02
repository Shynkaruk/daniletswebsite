// src/Components/Head.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
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
      <div className="w-full px-2">
        <div className="w-[min(1800px,calc(100vw-4px))] mx-auto px-4">
          <div className="flex items-center justify-between w-full mx-auto px-2 py-2 rounded-full bg-white shadow-md">
            {/* Burger */}
            <button
              onClick={toggleMenu}
              className="flex items-center justify-center rounded-full border border-[#A1A1A5] w-[32px] h-[32px]"
              aria-label="Open menu"
              type="button"
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
                  type="button"
                  className="text-1xl font-bold px-5 py-[10px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                    color: "rgba(62, 38, 12, 1)",
                  }}
                >
                  Get Quote
                </button>
              </Link>

              {/* Важливо: onShowAuth має бути функцією */}
              <AccountMenu variant="icon" onShowAuth={onOpenAuth} />
            </div>
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
            <div className="relative p-4 h-full flex flex-col">
              {/* Logo */}
              <Link to="/" onClick={toggleMenu}>
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
                type="button"
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
                      to="/detailing"
                      className="text-[#676767] border border-[#DADADA] rounded-[40px] text-[13px] font-semibold py-2 px-4 hover:bg-[rgba(245,218,147,0.3)] transition"
                      onClick={toggleMenu}
                    >
                      Detailing
                    </Link>

                    <Link
                      to="/cleaning"
                      className="text-[#676767] border border-[#DADADA] rounded-[40px] text-[13px] font-semibold py-2 px-4 hover:bg-[rgba(245,218,147,0.3)] transition"
                      onClick={toggleMenu}
                    >
                      Cleaning
                    </Link>
                  </div>
                </details>

                {/* Contact */}
                <button
                  type="button"
                  onClick={() => {
                    toggleMenu();
                    onOpenContact?.();
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
                          onOpenSocial?.();
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
                    type="button"
                    className="text-1xl font-bold px-5 py-[10px] rounded-full transition-all duration-200 hover:scale-[1.05] hover:brightness-90"
                    style={{
                      background:
                        "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                      color: "rgba(62, 38, 12, 1)",
                    }}
                  >
                    Get Quote
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
  const [openServices, setOpenServices] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        openServices &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpenServices(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setOpenServices(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openServices]);

  return (
    <div className="hidden md:block w-full">
      <div className="w-full px-4">
        <div className="w-[min(1800px,calc(100vw-32px))] mx-auto">
          <div className="bg-white h-[72px] xl:h-20 rounded-[48px] overflow-visible flex items-center justify-between px-4 sm:px-6 shadow-md">
            {/* Лого */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={logo}
                alt="Logo"
                className="h-8 xl:h-10 w-auto object-contain min-w-[120px] xl:min-w-[150px]"
              />
            </Link>

            {/* Навігація */}
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
                    onClick={() => setOpenServices((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={openServices}
                    className="flex items-center gap-2 bg-white text-[#A1A1A5] border border-[#A1A1A5]
                             rounded-[44px] font-bold whitespace-nowrap
                             px-4 py-2 text-sm xl:px-6 xl:py-3 xl:text-base
                             hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
                  >
                    Services{" "}
                    <span
                      className={`transition-transform ${
                        openServices ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {openServices && (
                    <div
                      ref={menuRef}
                      role="menu"
                      className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 z-[300] rounded-2xl border border-[#E6E6EA] bg-white shadow-lg overflow-hidden"
                    >
                      {[
                        { label: "Detailing", to: "/detailing" },
                        { label: "Cleaning", to: "/cleaning" },
                      ].map(({ label, to }, idx) => (
                        <Link
                          key={label}
                          to={to}
                          role="menuitem"
                          onClick={() => setOpenServices(false)}
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
                  type="button"
                  onClick={() => onOpenContact?.()}
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
              {/* md–lg — … */}
              <button
                type="button"
                onClick={() => onOpenSocial?.()}
                className="md:flex xl:hidden w-10 h-10 rounded-full bg-gray-100 items-center justify-center text-gray-600 hover:text-black transition"
                aria-label="Open social modal"
              >
                <FaEllipsisH />
              </button>

              {/* xl — всі соц */}
              <div className="hidden xl:flex items-center gap-2">
                {[FaGoogle, FaTiktok, FaYoutube, FaFacebookF].map((Icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onOpenSocial?.()}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition"
                    aria-label="Open social modal"
                  >
                    <Icon />
                  </button>
                ))}
              </div>

              <Link to="/book-online" className="shrink-0">
                <button
                  type="button"
                  className="text-black font-bold rounded-full pointer-events-auto
                    px-4 py-3 text-sm md:px-5 md:py-3 md:text-sm xl:px-6 xl:py-4 xl:text-base
                    transition-all duration-200 hover:scale-[1.05] hover:brightness-90"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Get Quote
                </button>
              </Link>

              {/* ✅ ОЦЕ ГОЛОВНЕ: тепер onOpenAuth точно є */}
              <AccountMenu variant="icon" onShowAuth={onOpenAuth} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== WRAPPER WITH MODALS ==================== */
export default function Head() {
  const [authOpen, setAuthOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const openContact = useCallback(() => setContactOpen(true), []);
  const openSocial = useCallback(() => setSocialOpen(true), []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const closeSocial = useCallback(() => setSocialOpen(false), []);

  // (опційно) блок скролу коли відкрита будь-яка модалка
  useEffect(() => {
    const anyOpen = authOpen || contactOpen || socialOpen;
    if (!anyOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [authOpen, contactOpen, socialOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[200000]">
        <div className="pt-4">
          <MobileHead
            onOpenAuth={openAuth}
            onOpenContact={openContact}
            onOpenSocial={openSocial}
          />
          <DesktopHead
            onOpenAuth={openAuth}
            onOpenContact={openContact}
            onOpenSocial={openSocial}
          />
        </div>
      </header>

      {/* ✅ Auth modal */}
      {authOpen && (
        <AuthModal
          open={authOpen}
          onClose={closeAuth}
        />
      )}

      {/* ✅ Contact modal (якщо ContactForm у тебе вже модалка — ок; якщо ні, обгорни в свою) */}
      {contactOpen && (
        <ContactForm
          open={contactOpen}
          onClose={closeContact}
        />
      )}

      {/* ✅ Social modal */}
      {socialOpen && (
        <SocialModal
          open={socialOpen}
          onClose={closeSocial}
        />
      )}
    </>
  );
}
