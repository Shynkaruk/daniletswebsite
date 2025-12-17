// src/Components/Booking/Detailing/StepDetailingGetQuoteType.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepDetailingGetQuoteType = ({
  visible,
  onBack,
  onNext,

  // варіанти назв пропів — підтримуємо обидва
  quoteType,          // "personal" | "business"
  setQuoteType,
  detailingMode,      // "personal" | "business"
  setDetailingMode,

  // прогрес-бар
  renderProgress,
  progressStepIndex = 1,
  totalSteps = 11,
}) => {
  if (!visible) return null;

  // поточний тип та сеттер — беремо те, що реально передали
  const currentType = quoteType ?? detailingMode ?? "personal";
  const setType = setQuoteType || setDetailingMode;

  const canContinue = !!currentType;

  const handleSelect = (value) => {
    if (setType) {
      setType(value);
    }
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onNext?.();
  };

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
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
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Get Quote
          </h2>
        </div>

        {/* PROGRESS (як на Cleaning details) */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* QUESTION */}
        <section className="space-y-3 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            What type of detailing are you interested in?
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelect("personal")}
              className={`h-[48px] rounded-[16px] border text-sm font-semibold
                ${
                  currentType === "personal"
                    ? "border-transparent text-black"
                    : "border-[#E5E7EB] text-[#4B5563] bg-white"
                }`}
              style={{
                background:
                  currentType === "personal" ? GOLD_GRADIENT : undefined,
              }}
            >
              Personal
            </button>

            <button
              type="button"
              onClick={() => handleSelect("business")}
              className={`h-[48px] rounded-[16px] border text-sm font-semibold
                ${
                  currentType === "business"
                    ? "border-transparent text-black"
                    : "border-[#E5E7EB] text-[#4B5563] bg-white"
                }`}
              style={{
                background:
                  currentType === "business" ? GOLD_GRADIENT : undefined,
              }}
            >
              Business
            </button>
          </div>

          <p className="text-xs sm:text-[13px] text-[#9CA3AF]">
            Personal is for your own vehicle. Business is for fleets,
            dealerships, rental or corporate vehicles.
          </p>
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

export default StepDetailingGetQuoteType;
