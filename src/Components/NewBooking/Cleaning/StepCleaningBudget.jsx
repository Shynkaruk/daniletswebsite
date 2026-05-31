import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";
import { GOLD_GRADIENT } from "./_ui";

export default function StepCleaningBudget({
  visible,
  onBack,
  onNext,

  propertyType,

  resBudget,
  setResBudget,
  comBudget,
  setComBudget,

  extraDetails,
  setExtraDetails,
  comExtraDetails,
  setComExtraDetails,

  renderProgress,
  progressStepIndex = 8,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const canContinue = useMemo(() => {
    if (isResidential) return !!resBudget;
    if (isCommercial) return !!comBudget;
    return false;
  }, [isResidential, isCommercial, resBudget, comBudget]);

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
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Budget
          </h2>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {isResidential && (
          <div className="space-y-4">
            <section className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                What is your budget? *
              </div>
              <input
                value={resBudget}
                onChange={(e) => setResBudget(e.target.value)}
                className="h-[52px] rounded-[18px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full border border-transparent focus:border-[#E5E7EB]"
              />
            </section>

            <section className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Is there anything you would like to add?
              </div>
              <textarea
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
                rows={4}
                className="w-full rounded-[18px] bg-[#F4F4F5] px-4 py-3 text-[14px] outline-none resize-none border border-transparent focus:border-[#E5E7EB]"
              />
            </section>
          </div>
        )}

        {isCommercial && (
          <div className="space-y-4">
            <section className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">Budget *</div>
              <select
                value={comBudget}
                onChange={(e) => setComBudget(e.target.value)}
                className="h-[52px] rounded-[18px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full"
              >
                <option value=""></option>
                <option value="Below $1,000">Below $1,000</option>
                <option value="Between $1,000-$3,000">Between $1,000-$3,000</option>
                <option value="Between $3,000-$5,000">Between $3,000-$5,000</option>
                <option value="$5,000+">$5,000+</option>
              </select>
            </section>

            <section className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Any additional details about your project?
              </div>
              <textarea
                value={comExtraDetails}
                onChange={(e) => setComExtraDetails(e.target.value)}
                rows={4}
                className="w-full rounded-[18px] bg-[#F4F4F5] px-4 py-3 text-[14px] outline-none resize-none"
              />
            </section>
          </div>
        )}

        <button
          type="button"
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
}
