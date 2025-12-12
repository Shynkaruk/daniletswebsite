import React from "react";
import { FiChevronLeft } from "react-icons/fi";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";


export default function StepDetailingBusinessAdditionalInfo({
  visible,
  onBack,
  onNext,
  businessNotes,
  setBusinessNotes,
  renderProgress,
  progressStepIndex = 9,
  totalSteps = 11,
}) {
  if (!visible) return null;

  return (
    <div className="w-full text-left">
      <div className="bg-white/90 rounded-[24px] p-6 shadow space-y-6">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center"
          >
            <FiChevronLeft />
          </button>

          <div>
            <h2 className="text-[22px] font-extrabold">Additional Information</h2>
            <p className="text-[12px] text-[#9CA3AF]">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {renderProgress(progressStepIndex)}

        <div className="space-y-2">
          <p className="text-sm text-[#6B7280]">
            Is there anything else you'd like us to know? (optional)
          </p>
          <textarea
            className="w-full border rounded-[16px] px-4 py-3 min-h-[120px]"
            placeholder="Fleet size, turnaround needs, special requirements, etc."
            value={businessNotes}
            onChange={(e) => setBusinessNotes(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          className="w-full h-[52px] rounded-[88px] text-black font-semibold shadow"
          style={{ background: GOLD_GRADIENT }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
