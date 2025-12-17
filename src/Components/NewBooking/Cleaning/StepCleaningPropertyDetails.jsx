// src/Components/NewBooking/Cleaning/StepCleaningPropertyDetails.jsx
import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

export default function StepCleaningPropertyDetails({
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

  renderProgress,
  progressStepIndex = 3,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const canContinue = useMemo(() => {
    if (isResidential) return String(bedrooms || "").trim() && String(bathrooms || "").trim();
    if (isCommercial) return String(companyName || "").trim() && String(companyAddress || "").trim();
    return false;
  }, [isResidential, isCommercial, bedrooms, bathrooms, companyName, companyAddress]);

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        {/* Header */}
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
            <h2 className="text-[26px] font-extrabold text-[#111827]">Property details</h2>
            <p className="text-[14px] text-[#6B7280] mt-1">
              {isResidential ? "Tell us about the home size." : "Tell us about your business."}
            </p>
          </div>
        </div>

        {/* ✅ Progress MUST be under title */}
        {renderProgress ? renderProgress(progressStepIndex) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* Fields */}
        {isResidential ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#111827]">Bedrooms</label>
              <input
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="e.g. 3"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">Bathrooms</label>
              <input
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="e.g. 2"
                inputMode="numeric"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#111827]">Company Name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="Your company"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">Company Address</label>
              <input
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="Address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#111827]">Square Feet</label>
                <input
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                  placeholder="e.g. 2500"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#111827]">Cleaning Frequency</label>
                <input
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                  placeholder="Weekly / Monthly ..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom nav */}
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
            onClick={onNext}
            disabled={!canContinue}
            className={[
              "h-[46px] px-8 rounded-full text-sm font-semibold text-black",
              !canContinue ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
            style={{ background: GOLD_GRADIENT }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
