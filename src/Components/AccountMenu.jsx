import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { auth } from "../lib/api"; // з попереднього api.js

/**
 * variant:
 *  - "buttons" (дві кнопки Sign Up / Log In)
 *  - "icon"    (лише аватар з дропдауном, для мобільної шапки)
 */
export default function AccountMenu({
  variant = "buttons",
  onShowAuth,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const user = auth.getUser();
  const isAdmin = auth.isAdmin();

  useEffect(() => {
    const onDown = (e) => {
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
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Якщо не залогінений
  if (!user) {
    if (variant === "icon") {
      // на мобілі — показуємо лише іконку, по кліку відкриваємо модалку (Log In)
      return (
        <button
          onClick={() => onShowAuth?.("login")}
          aria-label="Account"
          className={`w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#A1A1A5] ${className}`}
        >
          <FaUserCircle className="text-xl" />
        </button>
      );
    }

    // на десктопі — дві кнопки
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => onShowAuth?.("signup")}
          className="flex-shrink-0 bg-white text-[#A1A1A5] border border-[#A1A1A5] px-4 py-2 rounded-[44px] text-sm font-bold whitespace-nowrap hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
        >
          Sign Up
        </button>
        <button
          onClick={() => onShowAuth?.("login")}
          className="flex-shrink-0 bg-white text-[#A1A1A5] border border-[#A1A1A5] px-4 py-2 rounded-[44px] text-sm font-bold whitespace-nowrap hover:bg-[rgba(245,218,147,0.8)] hover:text-black transition"
        >
          Log In
        </button>
      </div>
    );
  }

  // Якщо залогінений — аватар + дропдаун
  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        className={`${
          variant === "icon" ? "w-9 h-9" : "w-12 h-12"
        } rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition`}
      >
        <FaUserCircle className={variant === "icon" ? "text-xl" : "text-2xl"} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 z-50 rounded-2xl border border-[#E6E6EA] bg-white shadow-lg overflow-hidden"
        >
          {/* Привітання */}
          <div className="px-4 py-3 text-sm font-semibold text-[#111]">
            {user.first_name ? `Hi, ${user.first_name}!` : user.email}
          </div>

          <div className="h-px bg-[#F2F2F5]" />

          {/* My Account */}
          <button
            onClick={() => {
              setOpen(false);
              window.location.href = "/account"; // або navigate("/account")
            }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-black hover:bg-[rgba(245,218,147,0.25)]"
          >
            My Account
          </button>

          <div className="h-px bg-[#F2F2F5]" />

          {/* Admin only */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block w-full text-left px-4 py-3 text-sm font-semibold text-black hover:bg-[rgba(245,218,147,0.25)]"
            >
              Admin Panel
            </Link>
          )}

          {/* Log out */}
          <button
            onClick={() => {
              auth.logout();
              setOpen(false);
              window.location.reload();
            }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-black hover:bg-[rgba(245,218,147,0.25)] inline-flex items-center gap-2"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}
