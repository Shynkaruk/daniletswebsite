import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const BUSINESS_TYPES = [
  "Dealership",
  "Fleet Company",
  "Rental Car Company",
  "Corporate Fleet",
  "Other",
];

export default function StepDetailingBusinessDetails({
  visible,
  onBack,
  onNext,

  vehiclesCount,
  setVehiclesCount,

  businessType,
  setBusinessType,
  businessTypeOther,
  setBusinessTypeOther,

  renderProgress,
  progressStepIndex = 3,
  totalSteps = 11,
}) {
  if (!visible) return null;

  const inputClass =
    "w-full h-[52px] rounded-[16px] bg-[#F4F4F5] px-4 text-[15px] outline-none";

  const handleVehiclesChange = (value) => {
    // дозволяємо тільки цифри
    const onlyDigits = value.replace(/[^\d]/g, "");
    setVehiclesCount(onlyDigits);
  };

  const vehiclesNum = Number(vehiclesCount) || 0;

  const canContinue =
    vehiclesNum > 0 &&
    businessType.trim() &&
    (businessType !== "Other" || businessTypeOther.trim());

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-5 sm:p-6 lg:p-8 shadow space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Business information
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF]">
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

        {/* FORM FIELDS */}
        <section className="space-y-5">
          {/* How many vehicles need detailing? */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium mb-1.5">
              How many vehicles need detailing? *
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={vehiclesCount}
              onChange={(e) => handleVehiclesChange(e.target.value)}
              className={inputClass}
              placeholder="Enter number of vehicles"
            />
            {vehiclesCount && vehiclesNum <= 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid number greater than 0.
              </p>
            )}
          </div>

          {/* What type of business are you? */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium mb-2">
              What type of business are you? *
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((opt) => {
                const active = businessType === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setBusinessType(opt)}
                    className={`h-[44px] rounded-[16px] border text-sm font-medium px-4 text-left
                      ${
                        active
                          ? "border-transparent text-black"
                          : "border-[#E5E7EB] text-[#4B5563] bg-white"
                      }`}
                    style={{
                      background: active ? GOLD_GRADIENT : undefined,
                    }}
                  >
                    {opt === "Other" ? "Other (please specify)" : opt}
                  </button>
                );
              })}
            </div>

            {/* If Other → show text input */}
            {businessType === "Other" && (
              <input
                value={businessTypeOther}
                onChange={(e) => setBusinessTypeOther(e.target.value)}
                className={`${inputClass} mt-3`}
                placeholder="Please specify your business type"
              />
            )}
          </div>
        </section>

        {/* CONTINUE BUTTON */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`
            w-full h-[52px] sm:h-[56px] rounded-[88px] font-semibold text-black shadow
            inline-flex items-center justify-between px-6
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}
          `}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
