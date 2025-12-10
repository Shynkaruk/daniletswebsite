// src/Components/Booking/StepDetailingBusinessContact.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const HOW_DID_YOU_HEAR_OPTIONS = [
  "Google Search",
  "Instagram / Facebook",
  "Referral",
  "Returning Customer",
  "Drive By",
  "Other",
];

const StepDetailingBusinessContact = ({
  visible,
  onBack,
  onNext,

  // стейти з Booking
  firstName,
  setFirstName,
  lastName,
  setLastName,
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  phone,
  setPhone,
  email,
  setEmail,
  hearAbout,
  setHearAbout,
  hearAboutOther,
  setHearAboutOther,

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const isHearOther = hearAbout === "Other";

  const canContinue =
    firstName.trim() &&
    lastName.trim() &&
    companyName.trim() &&
    companyAddress.trim() &&
    phone.trim() &&
    email.trim() &&
    hearAbout &&
    (!isHearOther || hearAboutOther.trim());

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
            Contact Information
          </h2>
        </div>

        {/* Progress → 2 секція Business */}
        {renderProgress ? (
          renderProgress(2)
        ) : (
          <ProgressBar activeCount={2} total={totalSteps} />
        )}

        {/* Inputs */}
        <div className="space-y-3 pt-1">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name *"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name *"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
          />
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company Name *"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
          />
          <input
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="Company Address *"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number *"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address *"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
          />
        </div>

        {/* How did you hear about us? */}
        <div className="space-y-2 mt-3">
          <div className="text-sm text-[#6B7280] font-medium">
            How did you hear about us? *
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HOW_DID_YOU_HEAR_OPTIONS.map((opt) => {
              const active = hearAbout === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setHearAbout(opt)}
                  className={`min-h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] px-3 py-1 text-left
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isHearOther && (
            <input
              value={hearAboutOther}
              onChange={(e) => setHearAboutOther(e.target.value)}
              placeholder="Please specify"
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none mt-2"
            />
          )}
        </div>

        {/* Continue */}
        <button
          onClick={onNext}
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

export default StepDetailingBusinessContact;
