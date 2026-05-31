import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import DatePicker from "../../DatePicker"; // <-- ПЕРЕВІР шлях!

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

export default function StepDetailingBusinessTimeline({
  visible,
  onBack,
  onNext,

  businessStartDate,
  setBusinessStartDate,

  renderProgress,
  progressStepIndex = 8,
  totalSteps = 11,
}) {
  if (!visible) return null;

  const dateVal = businessStartDate ?? "";
  const canContinue = !!dateVal.trim();

  return (
    <div className="w-full text-left">
      <div className="bg-white/90 rounded-[24px] p-6 shadow space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 bg-[#F2F2F2] flex items-center justify-center rounded-full"
            aria-label="Back"
          >
            <FiChevronLeft />
          </button>

          <div>
            <h2 className="text-[22px] font-extrabold text-[#18181B]">
              Timeline
            </h2>
            <p className="text-[12px] text-[#9CA3AF]">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <div className="space-y-2">
          <p className="text-sm text-[#6B7280]">
            When would you like us to start?
          </p>

          <DatePicker
            value={dateVal}
            onChange={(iso) => setBusinessStartDate?.(iso)} // iso = "YYYY-MM-DD"
            placeholder="Select start date"
            disablePast={true}
          />
        </div>

        <button
          type="button"
          onClick={() => canContinue && onNext?.()}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6 ${
            !canContinue ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
