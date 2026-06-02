import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { auth } from "../lib/api";

const gradient =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const CODE_LENGTH = 6;

export default function OtpModal({
  open,
  email,
  mode = "verify", // "verify" | "reset"
  onClose,
  onVerified,
}) {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (open) {
      setDigits(Array(CODE_LENGTH).fill(""));
      setErr("");
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 50);
    }
  }, [open]);

  if (!open) return null;

  const code = digits.join("");

  const handleChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const copy = [...digits];
    copy[idx] = value;
    setDigits(copy);

    if (value && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D+/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    const copy = Array(CODE_LENGTH)
      .fill("")
      .map((_, i) => text[i] || "");
    setDigits(copy);
    const lastIndex = Math.min(text.length, CODE_LENGTH) - 1;
    if (lastIndex >= 0) inputsRef.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (code.length !== CODE_LENGTH) {
      setErr(`Enter ${CODE_LENGTH}-digit code`);
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const data = await auth.verifyOtp({ email, code, purpose: mode === "reset" ? "reset" : "verify" });
      onVerified?.(data);
    } catch (e) {
      setErr(e?.error || "Invalid code, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtitle =
    mode === "reset"
      ? "Enter the code we sent to your email to reset your password"
      : "Enter the code we sent to your email to confirm your account";

  return (
    <div className="fixed inset-0 z-[1100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] rounded-[24px] bg-white shadow-2xl p-6 relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center"
          >
            <FaTimes />
          </button>

          <h2 className="text-xl font-extrabold mb-4">
            {mode === "reset" ? "Forgot password?" : "Confirm your email"}
          </h2>

          {/* Code inputs */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2 mb-4">
              {Array.from({ length: CODE_LENGTH }).map((_, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[idx]}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-12 h-12 rounded-[16px] bg-[#F4F4F5] text-center text-lg font-semibold outline-none"
                />
              ))}
            </div>

            <div className="flex items-start gap-2 text-xs text-[#4B5563] mb-5">
              <div className="mt-[2px] w-4 h-4 rounded-full bg-[#FEF3C7] border border-[#FCD34D]" />
              <div>
                <div>{subtitle}</div>
                {email && <div className="font-semibold mt-1 break-all">{email}</div>}
                <button
                  type="button"
                  className="text-[11px] text-[#6B21A8] underline mt-1"
                  onClick={async () => {
                    try {
                      setErr("");
                      await auth.requestOtp(email, mode === "reset" ? "reset" : "verify");
                    } catch (e) {
                      setErr(e?.error || "Failed to resend code");
                    }
                  }}
                >
                  Resend code
                </button>
              </div>
            </div>

            {err && <div className="text-xs text-red-600 mb-3">{err}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[999px] font-semibold text-black"
              style={{ background: gradient }}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
