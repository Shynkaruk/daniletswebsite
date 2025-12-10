// src/Components/Booking/StepDetailingHistoryCondition.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// опції з анкети
const LAST_DETAILED_OPTIONS = [
  "Within the last 3 months",
  "3–6 months ago",
  "6–12 months ago",
  "Over a year ago",
  "Never professionally detailed",
];

const CONDITION_FLAGS_OPTIONS = [
  "Pet Hair",
  "Spills/Stains",
  "Dirt/Mud",
  "Tar/Sap",
  "Paint Overspray",
  "Trash",
  "Other",
];

const CONDITION_RATING_OPTIONS = [
  "Very Clean",
  "Clean",
  "Dirty",
  "Very Dirty",
  "Extremely Dirty",
];

const StepDetailingHistoryCondition = ({
  visible,
  onBack,
  onNext,

  // стейти з Booking
  lastDetailed, // string
  setLastDetailed,
  conditionFlags, // array
  setConditionFlags,
  conditionRating, // string
  setConditionRating,

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const toggleInArray = (arr, value) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  // обов'язкові: коли останній раз детайлили + загальна оцінка
  const canContinue = !!lastDetailed && !!conditionRating;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
            Vehicle history & condition
          </h2>
        </div>

        {/* Прогрес: 2 секція */}
        {renderProgress ? (
          renderProgress(2)
        ) : (
          <ProgressBar activeCount={2} total={totalSteps} />
        )}

        {/* Коли останній раз детайлили */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            When was your vehicle last professionally detailed? *
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LAST_DETAILED_OPTIONS.map((opt) => {
              const active = lastDetailed === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLastDetailed(opt)}
                  className={`h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] font-medium px-3
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </section>

        {/* Що з авто зараз (прапорці) */}
        <section className="space-y-2">
          <div className="text-sm text-[#6B7280] font-medium">
            Does your vehicle have any of the following? (select all that apply)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#111827] mt-1">
            {CONDITION_FLAGS_OPTIONS.map((name) => (
              <label
                key={name}
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#D4D4D8]"
                  checked={conditionFlags.includes(name)}
                  onChange={() =>
                    setConditionFlags((prev) => toggleInArray(prev, name))
                  }
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Загальна оцінка стану */}
        <section className="space-y-2">
          <div className="text-sm text-[#6B7280] font-medium">
            How would you rate your vehicle&apos;s current condition? *
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CONDITION_RATING_OPTIONS.map((opt) => {
              const active = conditionRating === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setConditionRating(opt)}
                  className={`h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] font-medium px-3
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </section>

        {/* Кнопка Continue */}
        <button
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
};

export default StepDetailingHistoryCondition;
