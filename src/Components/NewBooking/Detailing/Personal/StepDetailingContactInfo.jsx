// src/Components/Booking/Detailing/Personal/StepDetailingContactInfo.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях!

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
  heardAbout,
  setHeardAbout,

  renderProgress,
  progressStepIndex = 9, // наприклад "Step 9 of 11"
  totalSteps = 11,
}) => {
  if (!visible) return null;

  // безпечні значення, щоб нічого не падало
  const firstVal = firstName ?? "";
  const lastVal = lastName ?? "";
  const phoneVal = phone ?? "";
  const emailVal = email ?? "";

  // heardAbout може бути рядком, масивом або undefined – приводимо до строки
  const heardVal = Array.isArray(heardAbout)
    ? heardAbout.join(", ")
    : heardAbout ?? "";

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v || "");
  const isPhone = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

  const canContinue =
    firstVal.trim() &&
    lastVal.trim() &&
    isPhone(phoneVal) &&
    isEmail(emailVal) &&
    heardVal.trim();

  const handleContinue = () => {
    if (!canContinue) return;
    onNext?.();
  };

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

        {/* ВСІ ІНПУТИ ОДИН ПІД ОДНИМ */}
        <section className="space-y-3 pt-1">
          {/* First name */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">
              First name
            </div>
            <input
              value={firstVal}
              onChange={(e) => setFirstName?.(e.target.value)}
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
            />
          </div>

          {/* Last name */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">
              Last name
            </div>
            <input
              value={lastVal}
              onChange={(e) => setLastName?.(e.target.value)}
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">
              Phone number
            </div>
            <input
              value={phoneVal}
              onChange={(e) => setPhone?.(e.target.value)}
              placeholder="(xxx) xxx-xxxx"
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
            />
            {!isPhone(phoneVal) && phoneVal && (
              <p className="text-[11px] text-red-500 mt-0.5">
                Please enter a valid phone number.
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Email</div>
            <input
              value={emailVal}
              type="email"
              onChange={(e) => setEmail?.(e.target.value)}
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
            />
            {!isEmail(emailVal) && emailVal && (
              <p className="text-[11px] text-red-500 mt-0.5">
                Please enter a valid email.
              </p>
            )}
          </div>

          {/* How did you hear about us? */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">
              How did you hear about us?
            </div>
            <input
              value={heardVal}
              onChange={(e) => setHeardAbout?.(e.target.value)}
              placeholder="Instagram, Google, friend, etc."
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
            />
          </div>
        </section>

        {/* BUTTON */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepDetailingContactInfo;
