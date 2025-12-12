// src/Components/Booking/Detailing/Personal/StepDetailingMultipleVehicles.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях!

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepDetailingMultipleVehicles = ({
  visible,
  onBack,
  onNext,

  // стейт
  multipleVehicles,          // true | false | null
  setMultipleVehicles,       // основний сеттер
  setMultiple,               // старе ім’я – про всяк випадок
  vehiclesCount,
  setVehiclesCount,

  // прогрес
  renderProgress,
  progressStepIndex = 6,     // "Step 6 of 11"
  totalSteps = 11,
}) => {
  if (!visible) return null;

  const currentMultiple =
    typeof multipleVehicles === "boolean" ? multipleVehicles : null;

  const setMultipleLocal = setMultipleVehicles || setMultiple; // що є, те й беремо

  const vehiclesCountVal = vehiclesCount ?? "";

  const isYes = currentMultiple === true;
  const isNo = currentMultiple === false;

  const canContinue =
    (isYes && String(vehiclesCountVal).trim() !== "") || isNo;

  const handleSelect = (val) => {
    if (setMultipleLocal) {
      setMultipleLocal(val);
    }
  };

  const handleContinue = () => {
    if (!canContinue) return;
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
              aria-label="Back"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
          )}
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
              Multiple vehicles
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* QUESTION */}
        <section className="space-y-3 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            Are you interested in detailing multiple vehicles?
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelect(true)}
              className={`h-[44px] rounded-[16px] border text-sm font-semibold
                ${
                  isYes
                    ? "border-transparent text-black"
                    : "border-[#E5E7EB] text-[#4B5563] bg-white"
                }`}
              style={{
                background: isYes ? GOLD_GRADIENT : undefined,
              }}
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() => handleSelect(false)}
              className={`h-[44px] rounded-[16px] border text-sm font-semibold
                ${
                  isNo
                    ? "border-transparent text-black"
                    : "border-[#E5E7EB] text-[#4B5563] bg-white"
                }`}
              style={{
                background: isNo ? GOLD_GRADIENT : undefined,
              }}
            >
              No
            </button>
          </div>
        </section>

        {/* IF YES → HOW MANY */}
        {isYes && (
          <section className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Approximately how many vehicles?
            </div>
            <input
              type="number"
              min="1"
              value={vehiclesCountVal}
              onChange={(e) => setVehiclesCount?.(e.target.value)}
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              placeholder="e.g. 5"
            />
            {String(vehiclesCountVal).trim() === "" && (
              <p className="text-[11px] text-[#9CA3AF]">
                An approximate number is enough.
              </p>
            )}
          </section>
        )}

        {/* BUTTON */}
        <button
          type="button"
          onClick={handleContinue}
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
};

export default StepDetailingMultipleVehicles;
