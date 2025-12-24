import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";
import { GOLD_GRADIENT } from "./_ui.jsx";

export default function StepCleaningPropertyType({
  visible,
  onBack,
  onNext,

  propertyType,
  setPropertyType,
  onResetAfterTypeChange,

  renderProgress,
  progressStepIndex = 2,
  totalSteps = 9,
}) {
  if (!visible) return null;

  const canContinue = !!propertyType;

  const pick = (type) => {
    setPropertyType(type);
    onResetAfterTypeChange?.();
  };

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          {/* Section title exactly as in the document */}
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Get Quote
          </h2>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <section className="space-y-2 mt-1">
          {/* Question text exactly as in the document (no asterisk) */}
          <div className="text-sm text-[#6B7280] font-medium">
            Is this for a residential or commercial property?
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "residential", label: "Residential" },
              { key: "commercial", label: "Commercial" },
            ].map((opt) => {
              const active = propertyType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => pick(opt.key)}
                  className={`h-[44px] rounded-[16px] border text-sm font-semibold
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
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
}
