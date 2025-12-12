import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepDetailingAdditionalInfo = ({
  visible,
  onBack,
  onNext,

  additionalInfo,
  setAdditionalInfo,

  renderProgress,
  progressStepIndex = 11, // Section 11
  totalSteps = 11,
}) => {
  if (!visible) return null;

  const handleContinue = () => {
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
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
          )}
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Additional information
          </h2>
        </div>

        {/* PROGRESS */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar
            activeCount={progressStepIndex}
            total={totalSteps}
          />
        )}

        {/* TEXTAREA */}
        <section className="space-y-2">
          <p className="text-sm text-[#6B7280] font-medium">
            Is there anything else you&apos;d like us to know?
          </p>
          <p className="text-[12px] text-[#9CA3AF]">
            Optional – any special requests, concerns, or details about your
            vehicle.
          </p>

          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            className="w-full rounded-[16px] bg-[#F4F4F5] px-4 py-2 text-[14px] outline-none resize-none"
            placeholder="For example: sensitive paint, pet allergies, specific areas to focus on, gate codes, etc."
          />
        </section>

        {/* BUTTON */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6"
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepDetailingAdditionalInfo;
