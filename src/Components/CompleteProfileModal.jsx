// src/Components/CompleteProfileModal.jsx
// Shown after Google/Apple OAuth when first_name, last_name or phone are missing.
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { meApi, setUser, auth } from "../lib/api";

const gradient =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

export default function CompleteProfileModal({
  open,
  onClose,    // optional — if not provided the X button is hidden (modal is mandatory)
  onDone,     // called after successful save
  initialData = {},
}) {
  const [firstName, setFirstName] = useState(initialData.first_name || "");
  const [lastName,  setLastName]  = useState(initialData.last_name  || "");
  const [phone,     setPhone]     = useState(initialData.phone      || "");
  const email = initialData.email || auth.getUser()?.email || "";

  const [err,     setErr]     = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!firstName.trim()) return setErr("First name is required");
    if (!lastName.trim())  return setErr("Last name is required");
    if (!phone.trim())     return setErr("Phone number is required");

    setLoading(true);
    try {
      await meApi.updateProfile({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        phone:      phone.trim(),
      });

      // Sync localStorage so every component sees the updated data
      const currentUser = auth.getUser();
      setUser({
        ...(currentUser || {}),
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        phone:      phone.trim(),
      });

      onDone?.();
    } catch (e) {
      setErr(e?.error || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999999999999] text-[#18181B]"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full max-w-[380px] rounded-[24px] bg-white shadow-xl p-4 sm:p-5 text-[#18181B]"
        >
          {/* header */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-[18px] font-extrabold">Complete Your Profile</div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center"
                aria-label="Close"
              >
                <FaTimes className="text-[#18181B]" />
              </button>
            )}
          </div>

          <p className="text-sm text-[#6B7280] mb-4">
            Please fill in the missing details to finish setting up your account.
          </p>

          <form className="space-y-3" onSubmit={onSubmit}>
            {/* Email — read-only (already set from OAuth) */}
            <input
              type="email"
              value={email}
              readOnly
              disabled
              placeholder="Email"
              className="w-full h-11 rounded-[12px] bg-[#EBEBEB] px-3 outline-none text-[#6B7280] cursor-not-allowed"
            />

            <input
              placeholder="First name *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
            />

            <input
              placeholder="Last name *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
            />

            <input
              type="tel"
              autoComplete="tel"
              placeholder="Phone number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full h-11 rounded-[12px] bg-[#F4F4F5] px-3 outline-none text-[#18181B] placeholder:text-[#9CA3AF]"
            />

            {err && <div className="text-xs text-red-600">{err}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-[12px] font-semibold text-black"
              style={{ background: gradient }}
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
