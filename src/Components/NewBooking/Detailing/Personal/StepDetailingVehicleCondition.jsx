import React, { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// Частина 1 — чекбокси
const CONDITION_FLAGS = [
  "Pet Hair",
  "Spills/Stains",
  "Dirt/Mud",
  "Tar/Sap",
  "Paint Overspray",
  "Trash",
  "Other",
];

// Частина 2 — рейтинг (required)
const CONDITION_RATING = [
  "Very Clean",
  "Clean",
  "Dirty",
  "Very Dirty",
  "Extremely Dirty",
];

const StepDetailingVehicleCondition = ({
  visible,
  onBack,
  onNext,

  conditionFlags,      // array
  setConditionFlags,
  conditionRating,     // string
  setConditionRating,
  otherConditionText,  // string
  setOtherConditionText,

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const toggleFlag = (name) => {
    if (conditionFlags.includes(name)) {
      setConditionFlags(conditionFlags.filter((x) => x !== name));
    } else {
      setConditionFlags([...conditionFlags, name]);
    }
  };

  const canContinue = !!conditionRating;

  const showOtherField = conditionFlags.includes("Other");

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
          >
            <FiChevronLeft className="text-[18px]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Vehicle condition
            </h2>
            <p className="text-[12px] text-[#9CA3AF]">Step 4 of {totalSteps}</p>
          </div>
        </div>

        {/* Progress */}
        {renderProgress ? (
          renderProgress(4)
        ) : (
          <ProgressBar activeCount={4} total={totalSteps} />
        )}

        {/* CONDITION FLAGS */}
        <section className="space-y-3">
          <p className="text-sm text-[#6B7280] font-medium">
            Does your vehicle have any of the following? (select all that apply)
          </p>

          <div className="flex flex-col gap-2">
            {CONDITION_FLAGS.map((name) => {
              const active = conditionFlags.includes(name);

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleFlag(name)}
                  className={`w-full rounded-[20px] border px-4 py-3 text-left text-[14px] font-medium
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  <div className="flex items-center justify-between">
                    <span>{name}</span>

                    {/* чекбокс */}
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center text-[12px]
                      ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-[#D4D4D8] bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* input “Other” */}
          {showOtherField && (
            <input
              type="text"
              placeholder="Please specify"
              value={otherConditionText}
              onChange={(e) => setOtherConditionText(e.target.value)}
              className="w-full h-[44px] mt-2 rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
            />
          )}
        </section>

        {/* CONDITION RATING */}
        <section className="space-y-3">
          <p className="text-sm text-[#6B7280] font-medium">
            How would you rate your vehicle's current condition?
          </p>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
            {CONDITION_RATING.map((opt) => {
              const active = conditionRating === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setConditionRating(opt)}
                  className={`w-full rounded-[20px] border px-4 py-3 text-left text-[14px] font-medium
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>

                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[12px]
                        ${
                          active
                            ? "border-black bg-black text-white"
                            : "border-[#D4D4D8] bg-white text-transparent"
                        }`}
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* NEXT BUTTON */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow 
          inline-flex items-center justify-between px-6 mt-2
          ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Next</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepDetailingVehicleCondition;
