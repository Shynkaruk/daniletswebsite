// src/Components/Booking/Cleaning/StepCleaningPropertyDetails.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepCleaningPropertyDetails = ({
  visible,
  onBack,
  onNext,

  propertyType,

  // residential
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,

  // commercial
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  squareFeet,
  setSquareFeet,
  frequency,
  setFrequency,

  totalSteps = 4,
}) => {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  let canContinue = false;

  if (isResidential) {
    canContinue = !!bedrooms && !!bathrooms;
  } else if (isCommercial) {
    canContinue =
      !!companyName && !!companyAddress && !!squareFeet && !!frequency;
  }

  const FREQ_OPTIONS = [
    { key: "one_time", label: "One-time" },
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "other", label: "Other" },
  ];

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
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Property details
          </h2>
        </div>

        <ProgressBar activeCount={2} total={totalSteps} />

        {/* ------- Residential ------- */}
        {isResidential && (
          <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              How many bedrooms and bathrooms? *
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                type="number"
                min="0"
                placeholder="Bedrooms"
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              />
              <input
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                type="number"
                min="0"
                placeholder="Bathrooms"
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              />
            </div>
          </section>
        )}

        {/* ------- Commercial ------- */}
        {isCommercial && (
          <div className="space-y-4">
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Company name *
                </div>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Company address *
                </div>
                <input
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  How many square feet? *
                </div>
                <input
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  type="number"
                  min="0"
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>
            </section>

            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-3">
              <div className="text-sm text-[#6B7280] font-medium">
                Frequency *
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#111827] mt-1">
                {FREQ_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cleaning-frequency"
                      className="w-4 h-4"
                      checked={frequency === opt.key}
                      onChange={() => setFrequency(opt.key)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepCleaningPropertyDetails;
