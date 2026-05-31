import React, { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const SERVICE_OPTIONS = [
  "Interior Only",
  "Exterior Only",
  "Interior & Exterior",
  "Dealership Inventory Prep",
  "Fleet Detailing",
  "Ceramic Coating",
  "PPF/Wrapping",
  "Other",
];

export default function StepDetailingBusinessServices({
  visible,
  onBack,
  onNext,
  businessServices,
  setBusinessServices,
  businessServicesOther,
  setBusinessServicesOther,
  renderProgress,
  progressStepIndex = 7,
  totalSteps = 11,
}) {
  if (!visible) return null;

  const toggleService = (item) => {
    if (businessServices.includes(item)) {
      setBusinessServices(businessServices.filter((s) => s !== item));
    } else {
      setBusinessServices([...businessServices, item]);
    }
  };

  const canContinue =
    businessServices.length > 0 &&
    (!businessServices.includes("Other") || businessServicesOther.trim());

  return (
    <div className="w-full max-w-full text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-6 shadow space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center"
          >
            <FiChevronLeft className="text-[18px]" />
          </button>
          <div>
            <h2 className="text-[22px] font-extrabold">Services Interested In</h2>
            <p className="text-[12px] text-[#9CA3AF]">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        {renderProgress(progressStepIndex)}

        {/* QUESTION */}
        <div className="space-y-4">
          <p className="text-sm text-[#6B7280]">
            What services are you interested in? (Select all that apply)
          </p>

          <div className="grid grid-cols-1 gap-3">
            {SERVICE_OPTIONS.map((s) => {
              const active = businessServices.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`w-full rounded-[18px] border px-4 py-3 text-left ${
                    active
                      ? "border-transparent text-black"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* OTHER FIELD */}
          {businessServices.includes("Other") && (
            <input
              type="text"
              placeholder="Please specify"
              value={businessServicesOther}
              onChange={(e) => setBusinessServicesOther(e.target.value)}
              className="w-full mt-3 rounded-[16px] border border-[#E5E7EB] px-4 py-3"
            />
          )}
        </div>

        {/* CONTINUE */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow ${
            !canContinue ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ background: GOLD_GRADIENT }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
