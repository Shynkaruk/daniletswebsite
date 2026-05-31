import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";

export default function StepCleaningCommercialAdditional({
  visible,
  onBack,
  onNext,

  cleaningCommercial,
  setCleaningCommercial,

  renderProgress,
  progressStepIndex = 10,   // ← Змінено на 10
  totalSteps = 10,          // ← Змінено на 10
}) {
  if (!visible) return null;

  const additionalInfo = cleaningCommercial?.additionalInfo || "";

  const setField = (key, value) =>
    setCleaningCommercial((prev) => ({ ...(prev || {}), [key]: value }));

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        
        {/* Header + Step під заголовком */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center flex-shrink-0"
              aria-label="Back"
              type="button"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>

            <h2 className="text-[26px] font-extrabold text-[#111827]">
              Additional Information
            </h2>
          </div>

          {/* Step під заголовком */}
          <p className="text-[13px] sm:text-[14px] text-[#9CA3AF] pl-12">
            Step {progressStepIndex} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold text-[#111827]">
            Is there anything else you'd like us to know?
          </div>
          <textarea
            value={additionalInfo}
            onChange={(e) => setField("additionalInfo", e.target.value)}
            className="w-full min-h-[140px] rounded-[18px] border border-[#E5E7EB] px-4 py-3 outline-none resize-y"
            placeholder="Type here..."
          />
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
            onClick={onNext}
            className="h-[46px] px-8 rounded-full text-sm font-semibold text-black"
            style={{ background: GOLD_GRADIENT }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}