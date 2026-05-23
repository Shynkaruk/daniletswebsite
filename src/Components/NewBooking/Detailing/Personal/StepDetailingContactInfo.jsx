// src/Components/Booking/Detailing/Personal/StepDetailingContactInfo.jsx
import React, { useState, useCallback } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { AddressAutocomplete } from "../../Detailing/Business/AddressAutocomplete"; // перевір шлях!

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepDetailingContactInfo = ({
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

  renderProgress,
  progressStepIndex = 9,
  totalSteps = 11,
}) => {
  // === ВСІ ХУКИ НА САМОМУ ВЕРХУ ===
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const firstVal = firstName ?? "";
  const lastVal = lastName ?? "";
  const phoneVal = phone ?? "";
  const emailVal = email ?? "";
  const addressVal = address ?? "";
  const heardVal = Array.isArray(heardAbout)
    ? heardAbout.join(", ")
    : heardAbout ?? "";

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
        case "heardAbout":
          if (!heardVal.trim()) newErrors.heardAbout = "Please tell us how you heard about us";
          else delete newErrors.heardAbout;
          break;
        default:
          break;
      }
      return newErrors;
    });
  }, [firstVal, lastVal, phoneVal, emailVal, addressVal, heardVal]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleContinue = () => {
    const allFields = ["firstName", "lastName", "phone", "email", "address", "heardAbout"];

    allFields.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field);
    });

    if (Object.keys(errors).length === 0) {
      onNext?.();
    }
  };

  if (!visible) return null;

  const inputClass = "w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none";

  const getInputClass = (field) => `
    ${inputClass} 
    ${touched[field] && errors[field] ? "border-2 border-red-500 bg-red-50" : ""}
  `;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
              aria-label="Back"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
          )}
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
              Contact information
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* FORM */}
        <section className="space-y-3 pt-1">
          {/* First name */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">First name</div>
            <input
              value={firstVal}
              onChange={(e) => setFirstName?.(e.target.value)}
              onBlur={() => handleBlur("firstName")}
              className={getInputClass("firstName")}
            />
            {touched.firstName && errors.firstName && (
              <p className="text-red-600 text-[11px] mt-0.5">{errors.firstName}</p>
            )}
          </div>

          {/* Last name */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Last name</div>
            <input
              value={lastVal}
              onChange={(e) => setLastName?.(e.target.value)}
              onBlur={() => handleBlur("lastName")}
              className={getInputClass("lastName")}
            />
            {touched.lastName && errors.lastName && (
              <p className="text-red-600 text-[11px] mt-0.5">{errors.lastName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Phone number</div>
            <input
              value={phoneVal}
              onChange={(e) => setPhone?.(e.target.value)}
              onBlur={() => handleBlur("phone")}
              placeholder="(123) 456-7890"
              className={getInputClass("phone")}
            />
            {touched.phone && errors.phone && (
              <p className="text-red-600 text-[11px] mt-0.5">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Email</div>
            <input
              value={emailVal}
              type="email"
              onChange={(e) => setEmail?.(e.target.value)}
              onBlur={() => handleBlur("email")}
              className={getInputClass("email")}
            />
            {touched.email && errors.email && (
              <p className="text-red-600 text-[11px] mt-0.5">{errors.email}</p>
            )}
          </div>

          {/* ========== ADDRESS FIELD ========== */}
          <div className="space-y-1">
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

          {/* How did you hear about us? */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">How did you hear about us?</div>
            <input
              value={heardVal}
              onChange={(e) => setHeardAbout?.(e.target.value)}
              onBlur={() => handleBlur("heardAbout")}
              placeholder="Instagram, Google, friend, etc."
              className={getInputClass("heardAbout")}
            />
            {touched.heardAbout && errors.heardAbout && (
              <p className="text-red-600 text-[11px] mt-0.5">{errors.heardAbout}</p>
            )}
          </div>
        </section>

        {/* BUTTON */}
        <button
          type="button"
          onClick={handleContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6
            ${Object.keys(errors).length > 0 ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
          disabled={Object.keys(errors).length > 0}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepDetailingContactInfo;