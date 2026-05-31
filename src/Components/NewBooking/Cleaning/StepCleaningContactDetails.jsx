import React, { useState, useCallback, useEffect } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";
import { AddressAutocomplete } from "../Detailing/Business/AddressAutocomplete"; // перевір шлях!

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const HEARD_OPTIONS = [
  "Google",
  "Instagram",
  "Facebook",
  "TikTok",
  "Friend / Referral",
  "Other",
];

function HeardRow({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "w-full h-[44px] rounded-[16px] border px-4 text-sm font-semibold text-left transition flex items-center justify-between",
        checked
          ? "border-transparent text-black"
          : "border-[#E5E7EB] bg-white text-[#4B5563]",
      ].join(" ")}
      style={{ background: checked ? GOLD_GRADIENT : undefined }}
    >
      <span>{label}</span>
      <span
        className={[
          "w-5 h-5 rounded-[6px] border flex items-center justify-center",
          checked ? "bg-black border-black" : "bg-white border-[#D1D5DB]",
        ].join(" ")}
      >
        {checked ? <span className="text-white text-[12px] leading-none">✓</span> : null}
      </span>
    </button>
  );
}

export default function StepCleaningContactDetails({
  visible,
  onBack,
  onNext,

  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  email,
  setEmail,
  address,           // ← НОВЕ
  setAddress,        // ← НОВЕ

  heardAbout,
  setHeardAbout,

  user,

  renderProgress,
  progressStepIndex = 9,
  totalSteps = 10,
}) {
  // === ВСІ ХУКИ НАГОРІ ===
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isLoggedIn = !!user;
  const [mode, setMode] = useState(isLoggedIn ? "account" : "manual");

  const firstVal = firstName ?? "";
  const lastVal = lastName ?? "";
  const phoneVal = phone ?? "";
  const emailVal = email ?? "";
  const addressVal = address ?? "";
  const safeHeard = Array.isArray(heardAbout) ? heardAbout : [];

  // Перемикання режиму
  useEffect(() => {
    if (isLoggedIn) setMode((m) => m || "account");
  }, [isLoggedIn]);

  // Підтягування даних з акаунту
  useEffect(() => {
    if (!isLoggedIn || mode !== "account") return;

    if (user?.first_name) setFirstName(user.first_name);
    if (user?.last_name) setLastName(user.last_name);
    if (user?.phone) setPhone(user.phone);
    if (user?.email) setEmail(user.email);
    if (user?.address) setAddress(user.address);   // ← додано
  }, [isLoggedIn, mode, user, setFirstName, setLastName, setPhone, setEmail, setAddress]);

  const toggleHeard = (val) => {
    setHeardAbout((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return base.includes(val) ? base.filter((x) => x !== val) : [...base, val];
    });
  };

  const validateField = useCallback((field) => {
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };

      switch (field) {
        case "firstName":
          if (!firstVal.trim()) newErrors.firstName = "First name is required";
          else delete newErrors.firstName;
          break;
        case "lastName":
          if (!lastVal.trim()) newErrors.lastName = "Last name is required";
          else delete newErrors.lastName;
          break;
        case "phone":
          const phoneRegex = /^(\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
          if (!phoneVal.trim()) newErrors.phone = "Phone number is required";
          else if (!phoneRegex.test(phoneVal)) newErrors.phone = "Please enter a valid US phone number";
          else delete newErrors.phone;
          break;
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailVal) newErrors.email = "Email is required";
          else if (!emailRegex.test(emailVal)) newErrors.email = "Please enter a valid email address";
          else delete newErrors.email;
          break;
        case "address":
          if (!addressVal.trim()) newErrors.address = "Address is required";
          else delete newErrors.address;
          break;
        default:
          break;
      }
      return newErrors;
    });
  }, [firstVal, lastVal, phoneVal, emailVal, addressVal]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleContinue = () => {
    const allFields = ["firstName", "lastName", "phone", "email", "address"];

    allFields.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field);
    });

    if (Object.keys(errors).length === 0) {
      onNext?.();
    }
  };

  if (!visible) return null;

  const inputClass = "h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full";

  const getInputClass = (field) => `
    ${inputClass} 
    ${touched[field] && errors[field] ? "border-2 border-red-500 bg-red-50" : ""}
  `;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Contact Information
          </h2>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* Режим Account / Manual */}
        {isLoggedIn && (
          <section className="space-y-3">
            <div className="text-sm text-[#6B7280] font-medium">
              How would you like to provide your contact details?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("account")}
                className={`h-[44px] rounded-[16px] border text-sm font-semibold
                  ${mode === "account" ? "border-transparent text-black" : "border-[#E5E7EB] text-[#4B5563] bg-white"}`}
                style={{ background: mode === "account" ? GOLD_GRADIENT : undefined }}
              >
                Use my account
              </button>

              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`h-[44px] rounded-[16px] border text-sm font-semibold
                  ${mode === "manual" ? "border-transparent text-black" : "border-[#E5E7EB] text-[#4B5563] bg-white"}`}
                style={{ background: mode === "manual" ? GOLD_GRADIENT : undefined }}
              >
                Enter different details
              </button>
            </div>
          </section>
        )}

        {/* Форма */}
        <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">First name</div>
              <input
                value={firstVal}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => handleBlur("firstName")}
                className={getInputClass("firstName")}
              />
              {touched.firstName && errors.firstName && (
                <p className="text-red-600 text-[11px] mt-0.5">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">Last name</div>
              <input
                value={lastVal}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => handleBlur("lastName")}
                className={getInputClass("lastName")}
              />
              {touched.lastName && errors.lastName && (
                <p className="text-red-600 text-[11px] mt-0.5">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">Phone</div>
              <input
                value={phoneVal}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => handleBlur("phone")}
                placeholder="+1 (123) 456-7890"
                className={getInputClass("phone")}
              />
              {touched.phone && errors.phone && (
                <p className="text-red-600 text-[11px] mt-0.5">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">Email</div>
              <input
                value={emailVal}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="name@email.com"
                className={getInputClass("email")}
              />
              {touched.email && errors.email && (
                <p className="text-red-600 text-[11px] mt-0.5">{errors.email}</p>
              )}
            </div>
          </div>

          {/* ========== NEW ADDRESS FIELD ========== */}
          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">Address</div>
            <AddressAutocomplete
              value={addressVal}
              onChange={setAddress}
              inputClass={getInputClass("address")}
              placeholder="Start typing your address..."
            />
            {touched.address && errors.address && (
              <p className="text-red-600 text-[11px] mt-0.5">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">How did you hear about us?</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEARD_OPTIONS.map((x) => (
                <HeardRow
                  key={x}
                  label={x}
                  checked={safeHeard.includes(x)}
                  onToggle={() => toggleHeard(x)}
                />
              ))}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${Object.keys(errors).length > 0 ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
          disabled={Object.keys(errors).length > 0}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}