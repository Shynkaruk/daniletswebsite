import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import DatePicker from "../../DatePicker"; // ПЕРЕВІР шлях у твоєму проекті

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepDetailingTimeline = ({
  visible,
  onBack,
  onNext,

  completionDate,      // string або Date
  setCompletionDate,   // setter з батьківського компонента

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const canContinue = !!completionDate;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-5 shadow space-y-6">
        
        {/* Header -------------------------------- */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
          >
            <FiChevronLeft className="text-[18px]" />
          </button>

          <div>
            <h2 className="text-[18px] sm:text-[20px] font-extrabold">
              Timeline
            </h2>
            <p className="text-[12px] text-[#9CA3AF]">
              Step 8 of {totalSteps}
            </p>
          </div>
        </div>

        {/* Progress Bar -------------------------- */}
        {renderProgress ? (
          renderProgress(8)
        ) : (
          <ProgressBar activeCount={8} total={totalSteps} />
        )}

        {/* Question + Date Picker ---------------- */}
        <section className="space-y-2 mt-1">
          <p className="text-sm text-[#6B7280] font-medium">
            By what date does the service need to be completed?
          </p>

          <DatePicker
            value={completionDate}
            onChange={setCompletionDate}
          />

          {!completionDate && (
            <p className="text-[12px] text-red-500">
              Please select a date.
            </p>
          )}

          <p className="text-[12px] text-[#9CA3AF]">
            We will contact you to confirm availability for your preferred date.
          </p>
        </section>

        {/* Continue button ----------------------- */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow 
          inline-flex items-center justify-between px-6 mt-2
          ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>

      </div>
    </div>
  );
};

export default StepDetailingTimeline;
