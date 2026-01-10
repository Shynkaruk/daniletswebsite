// src/components/AuthModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaGoogle, FaApple } from "react-icons/fa";
import { auth } from "../lib/api"; // див. src/lib/api.js
import GoogleCustomButton from "./GoogleCustomButton";
import OtpModal from "./OtpModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const gradient =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

export default function AuthModal({
  open,
  onClose,
  initialTab = "login", // "login" | "signup"
  onAuth, // callback після успішної авторизації (опц.)
}) {
  const [tab, setTab] = useState(initialTab);
  const cardRef = useRef(null);

  // OTP для підтвердження email після реєстрації
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [pendingUser, setPendingUser] = useState(null);

  // синхронізація вкладки при відкритті
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [initialTab, open]);

  // закриття по Escape / кліку поза карткою
  // useEffect(() => {
  //   if (!open) return;
  //   const onEsc = (e) => e.key === "Escape" && onClose?.();
  //   const onDown = (e) => {
  //     if (cardRef.current && !cardRef.current.contains(e.target)) onClose?.();
  //   };
  //   document.addEventListener("keydown", onEsc);
  //   document.addEventListener("mousedown", onDown);
  //   return () => {
  //     document.removeEventListener("keydown", onEsc);
  //     document.removeEventListener("mousedown", onDown);
  //   };
  // }, [open, onClose]);

  // Apple login — редірект на бекенд
  const handleAppleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/apple/login`;
  };

  if (!open) return null;

return (
  <div
    className="fixed inset-0 z-[999999999999] text-[#18181B]"
    aria-modal="true"
    role="dialog"
  >
    {/* dim (backdrop) — закриває модалку тільки по кліку на фон */}
    <div
      className="absolute inset-0 bg-black/50"
      onMouseDown={() => onClose?.()}
      onTouchStart={() => onClose?.()}
    />

    {/* card */}
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div
        ref={cardRef}
        // важливо: кліки всередині картки НЕ повинні закривати модалку
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] rounded-[24px] bg-white shadow-xl p-4 sm:p-5 text-[#18181B]"
      >
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[18px] font-extrabold">
            {tab === "login" ? "Log In" : "Sign Up"}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center"
            aria-label="Close"
          >
            <FaTimes className="text-[#18181B]" />
          </button>
        </div>

        {/* tabs */}
        <div className="bg-[#F2F2F2] rounded-full p-1 mb-3 flex">
          {["login", "signup"].map((key) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-full font-semibold text-sm transition ${
                  active ? "bg-white shadow text-[#18181B]" : "text-[#5E5E61]"
                }`}
              >
                {key === "login" ? "Log In" : "Sign Up"}
              </button>
            );
          })}
        </div>

        {/* forms */}
        {tab === "login" ? (
          <LoginForm
            onSuccess={(u) => {
              onAuth?.(u);
              onClose?.();
              window.location.href = "/account";
            }}
          />
        ) : (
          <SignupForm
            onSuccess={(u, email) => {
              setPendingUser(u);
              setOtpEmail(email);
              setOtpOpen(true);
            }}
          />
        )}

        {/* OR */}
        <div className="relative my-3">
          <div className="h-px bg-[#E5E7EB]" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 text-xs text-[#6B7280]">
            OR
          </span>
        </div>

        {/* socials */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 rounded-[12px] bg-[#F4F4F5] font-semibold flex items-center justify-center">
            <GoogleCustomButton
              onDone={(user) => {
                onAuth?.(user);
                onClose?.();
                window.location.href = "/account";
              }}
            />
          </div>

          {/* Apple auth */}
          <button
            type="button"
            onClick={handleAppleLogin}
            className="h-11 rounded-[12px] bg-[#F4F4F5] font-semibold flex items-center justify-center gap-2 text-[#18181B]"
          >
            <FaApple className="text-[#18181B]" />
            <span>Apple</span>
          </button>
        </div>
      </div>
    </div>

    {/* OTP модалка */}
    <OtpModal
      open={otpOpen}
      email={otpEmail}
      mode="verify"
      onClose={() => setOtpOpen(false)}
      onVerified={() => {
        if (pendingUser) onAuth?.(pendingUser);
        setPendingUser(null);
        setOtpEmail("");
        setOtpOpen(false);
        onClose?.();
        if (!onAuth) window.location.reload();
      }}
    />
  </div>
);

}

/* ---------- Login ---------- */
function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e?.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { user } = await auth.login({ email, password });
      onSuccess?.(user);
    } catch (e) {
      setErr(e?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
      />
      {err && <div className="text-xs text-red-600">{err}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-[12px] font-semibold text-black"
        style={{ background: gradient }}
      >
        {loading ? "..." : "Login"}
      </button>
    </form>
  );
}

/* ---------- Sign Up ---------- */
function SignupForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e?.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // 1) створюємо користувача
      const { user } = await auth.register({
        email,
        password,
        first_name: first,
        last_name: last,
        phone,
      });

      // 2) запитуємо OTP на email (режим verify)
      await auth.requestOtp(email, "verify");

      // 3) передаємо наверх юзера + email для відкриття OTP-модалки
      onSuccess?.(user, email);
    } catch (e) {
      setErr(e?.error || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
      />
      <input
        placeholder="First name"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
      />
      <input
        placeholder="Last name"
        value={last}
        onChange={(e) => setLast(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
      />
      <input
        type="tel"
        autoComplete="tel"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
      />
      <input
        type="password"
        autoComplete="new-password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
      />
      {err && <div className="text-xs text-red-600">{err}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-[12px] font-semibold text-black"
        style={{ background: gradient }}
      >
        {loading ? "..." : "Create Account"}
      </button>
    </form>
  );
}
