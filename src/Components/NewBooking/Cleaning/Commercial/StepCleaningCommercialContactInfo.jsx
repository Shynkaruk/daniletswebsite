import React, { useState, useCallback, useEffect } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";
import { AddressAutocomplete } from "../../Detailing/Business/AddressAutocomplete"; // перевір шлях!

const HEAR_OPTIONS = [
  { key: "google", label: "Google Search" },
  { key: "facebook", label: "Facebook" },
  { key: "returning", label: "Returning Client" },
  { key: "instagram", label: "Instagram" },
  { key: "referral", label: "Referral/Friend" },
  { key: "other", label: "Other (please specify)" },
];

export default function StepCleaningCommercialContactInfo({
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
  address,          // ← НОВЕ
  setAddress,       // ← НОВЕ

  hearAbout,
  setHearAbout,
  referralName,
  setReferralName,
  hearOther,
  setHearOther,

  user,

  renderProgress,
  progressStepIndex = 2,
  totalSteps = 10,
}) {
  // === ВСІ ХУКИ НА САМОМУ ВЕРХУ ===
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isLoggedIn = !!user;
  const [mode, setMode] = useState(isLoggedIn ? "account" : "manual");

  // Auto-fill from account when mode = "account"
  useEffect(() => {
    if (!isLoggedIn || mode !== "account") return;
    if (user?.first_name) setFirstName?.(user.first_name);
    if (user?.last_name)  setLastName?.(user.last_name);
    if (user?.phone)      setPhone?.(user.phone);
    if (user?.email)      setEmail?.(user.email);
  }, [isLoggedIn, mode, user, setFirstName, setLastName, setPhone, setEmail]);

  const firstVal = firstName ?? "";
  const lastVal = lastName ?? "";
  const phoneVal = phone ?? "";
  const emailVal = email ?? "";
  const addressVal = address ?? "";
  const hearVal = hearAbout ?? "";
  const referralVal = referralName ?? "";
  const otherVal = hearOther ?? "";

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
          if (!phoneVal.trim()) {
            newErrors.phone = "Phone number is required";
          } else if (!phoneRegex.test(phoneVal)) {
            newErrors.phone = "Please enter a valid US phone number (e.g. (123) 456-7890)";
          } else {
            delete newErrors.phone;
          }
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
        case "hearAbout":
          if (!hearVal) newErrors.hearAbout = "Please tell us how you heard about us";
          else delete newErrors.hearAbout;
          break;
        case "referralName":
          if (hearVal === "referral" && !referralVal.trim()) {
            newErrors.referralName = "Name is required";
          } else {
            delete newErrors.referralName;
          }
          break;
        case "hearOther":
          if (hearVal === "other" && !otherVal.trim()) {
            newErrors.hearOther = "Please specify";
          } else {
            delete newErrors.hearOther;
          }
          break;
        default:
          break;
      }
      return newErrors;
    });
  }, [firstVal, lastVal, phoneVal, emailVal, addressVal, hearVal, referralVal, otherVal]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleContinue = () => {
    const isAccountMode = isLoggedIn && mode === "account";
    const allFields = isAccountMode
      ? ["address", "hearAbout"]
      : ["firstName", "lastName", "phone", "email", "address", "hearAbout"];

    if (hearVal === "referral") allFields.push("referralName");
    if (hearVal === "other") allFields.push("hearOther");

    allFields.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field);
    });

    if (Object.keys(errors).length === 0) {
      onNext?.();
    }
  };

  if (!visible) return null;

  const isAccountMode = isLoggedIn && mode === "account";
  const inputClass = `mt-2 w-full h-[52px] rounded-[18px] border px-4 outline-none ${isAccountMode ? "border-[#D1D5DB] bg-[#EBEBEB] text-[#6B7280] cursor-default" : "border-[#E5E7EB]"}`;

  const getInputClass = (field) => `
    ${inputClass}
    ${!isAccountMode && touched[field] && errors[field] ? "border-2 border-red-500 bg-red-50" : ""}
  `;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[26px] font-extrabold text-[#111827]">
              Contact Information
            </h2>
          </div>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* Account / Manual toggle */}
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

        <div className="space-y-4">
          {/* ========== CONTACT BLOCK (як у Residential) ========== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#111827]">First Name</label>
              <input
                value={firstVal}
                readOnly={isAccountMode}
                onChange={(e) => !isAccountMode && setFirstName(e.target.value)}
                onBlur={() => !isAccountMode && handleBlur("firstName")}
                className={getInputClass("firstName")}
              />
              {!isAccountMode && touched.firstName && errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">Last Name</label>
              <input
                value={lastVal}
                readOnly={isAccountMode}
                onChange={(e) => !isAccountMode && setLastName(e.target.value)}
                onBlur={() => !isAccountMode && handleBlur("lastName")}
                className={getInputClass("lastName")}
              />
              {!isAccountMode && touched.lastName && errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#111827]">Phone Number</label>
            <input
              value={phoneVal}
              readOnly={isAccountMode}
              onChange={(e) => !isAccountMode && setPhone(e.target.value)}
              onBlur={() => !isAccountMode && handleBlur("phone")}
              className={getInputClass("phone")}
              inputMode="tel"
              placeholder="(123) 456-7890"
            />
            {!isAccountMode && touched.phone && errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-[#111827]">Email</label>
            <input
              value={emailVal}
              readOnly={isAccountMode}
              onChange={(e) => !isAccountMode && setEmail(e.target.value)}
              onBlur={() => !isAccountMode && handleBlur("email")}
              className={getInputClass("email")}
              inputMode="email"
              placeholder="name@email.com"
            />
            {!isAccountMode && touched.email && errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* ========== ADDRESS FIELD ========== */}
          <div>
            <label className="text-sm font-semibold text-[#111827]">Address</label>
            <AddressAutocomplete
              value={addressVal}
              onChange={setAddress}
              inputClass={getInputClass("address")}
              placeholder="Start typing your address..."
            />
            {touched.address && errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* How did you hear about us? (залишив без змін) */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-[#111827]">
              How did you hear about us?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEAR_OPTIONS.map((opt) => {
                const active = hearVal === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setHearAbout(opt.key);
                      if (opt.key !== "referral") setReferralName("");
                      if (opt.key !== "other") setHearOther("");
                    }}
                    className={`min-h-[44px] rounded-[16px] border text-sm font-semibold px-3 text-left
                      ${active ? "border-transparent text-black" : "border-[#E5E7EB] text-[#4B5563] bg-white"}`}
                    style={{ background: active ? GOLD_GRADIENT : undefined }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {hearVal === "referral" && (
              <div className="pt-2">
                <label className="text-sm font-semibold text-[#111827]">Name</label>
                <input
                  value={referralVal}
                  onChange={(e) => setReferralName(e.target.value)}
                  onBlur={() => handleBlur("referralName")}
                  className={getInputClass("referralName")}
                  placeholder="Name of that person"
                />
                {touched.referralName && errors.referralName && (
                  <p className="text-red-600 text-sm mt-1">{errors.referralName}</p>
                )}
              </div>
            )}

            {hearVal === "other" && (
              <div className="pt-2">
                <label className="text-sm font-semibold text-[#111827]">Please specify</label>
                <input
                  value={otherVal}
                  onChange={(e) => setHearOther(e.target.value)}
                  onBlur={() => handleBlur("hearOther")}
                  className={getInputClass("hearOther")}
                />
                {touched.hearOther && errors.hearOther && (
                  <p className="text-red-600 text-sm mt-1">{errors.hearOther}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="h-[46px] px-6 rounded-full border border-[#D1D5DB] text-sm font-semibold text-[#111827]"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className={[
              "h-[46px] px-8 rounded-full text-sm font-semibold text-black",
              Object.keys(errors).length > 0 ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
            style={{ background: GOLD_GRADIENT }}
            disabled={Object.keys(errors).length > 0}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}