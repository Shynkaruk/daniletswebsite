// src/components/AuthModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaGoogle, FaApple } from "react-icons/fa";
import { auth } from "../lib/api"; // ← див. src/lib/api.js з попередніх кроків

const gradient =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

export default function AuthModal({
  open,
  onClose,
  initialTab = "login", // "login" | "signup"
  onAuth, // callback після успіху (опц.)
}) {
  const [tab, setTab] = useState(initialTab);
  const cardRef = useRef(null);

  // Синхронізація вкладки, коли модалка відкривається
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [initialTab, open]);

  // Закриття по Escape / кліку поза карткою
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    const onDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("keydown", onEsc);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* dim */}
      <div className="absolute inset-0 bg-black/50" />

      {/* card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={cardRef}
          className="w-full max-w-[380px] rounded-[24px] bg-white shadow-xl p-4 sm:p-5"
        >
          {/* header */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-[18px] font-extrabold text-[#18181B]">
              {tab === "login" ? "Log In" : "Sign Up"}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* tabs */}
          <div className="bg-[#F2F2F2] rounded-full p-1 mb-3 flex">
            {["login", "signup"].map((key) => {
              const active = tab === key;
              return (
                <button
                  key={key}
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
                if (!onAuth) window.location.reload();
              }}
            />
          ) : (
            <SignupForm
              onSuccess={(u) => {
                onAuth?.(u);
                onClose?.();
                if (!onAuth) window.location.reload();
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
              <GoogleLogin
                onSuccess={async ({ credential }) => {
                  try {
                    const { user } = await auth.google(credential); // див. п.2 нижче
                    onAuth?.(user);
                    onClose?.();
                    if (!onAuth) window.location.reload();
                  } catch (e) {
                    alert(e?.error || "Google auth failed");
                  }
                }}
                onError={() => alert("Google auth error")}
                // компонент сам рендерить свою кнопку; контейнер залишено для стилю
              />
            </div>

            {/* поки Apple — як заглушка */}
            <button
              className="h-11 rounded-[12px] bg-[#F4F4F5] font-semibold flex items-center justify-center gap-2"
              disabled
              title="Soon"
            >
              <FaApple />
              Apple
            </button>
          </div>
        </div>
      </div>
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
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none"
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none"
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
      const { user } = await auth.register({
        email,
        password,
        first_name: first,
        last_name: last,
        phone,
      });
      onSuccess?.(user);
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
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none"
      />
      <input
        placeholder="Enter your first name"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none"
      />
      <input
        placeholder="Enter your last name"
        value={last}
        onChange={(e) => setLast(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none"
      />
      <input
        type="tel"
        autoComplete="tel"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none"
      />
      <input
        type="password"
        autoComplete="new-password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none"
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
