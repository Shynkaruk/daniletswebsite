// src/Components/Booking/Detailing/Personal/StepDetailingVehicleHistory.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // скоригуй шлях, якщо інший

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// опції з документа
const LAST_DETAILED_OPTIONS = [
  "Within the last 3 months",
  "3-6 months ago",
  "6-12 months ago",
  "Over a year ago",
  "Never professionally detailed",
];

const StepDetailingVehicleHistory = ({
  visible,
  onBack,
  onNext,

  // state з батьківського Booking / DetailingGetQuote
  lastDetailed,      // string
  setLastDetailed,   // (value: string) => void

  renderProgress,
  totalSteps = 6, // скільки всього кроків у Personal-флоу
}) => {
  if (!visible) return null;

  const canContinue = !!lastDetailed;

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

          {/* Тайтл в стилі "Select Service", але під контент секції */}
          <div className="flex flex-col">
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Vehicle history
            </h2>
            <span className="text-[12px] text-[#9CA3AF]">
              Step 3 of {totalSteps} &middot; Detailing questionnaire
            </span>
          </div>
        </div>

        {/* Прогрес-бар (як у скріні з кроками зверху) */}
        {renderProgress ? (
          renderProgress(3)
        ) : (
          <ProgressBar activeCount={3} total={totalSteps} />
        )}

        {/* Основний блок питання (PC + mobile friendly) */}
        <section className="space-y-3 pt-1">
          <p className="text-sm text-[#6B7280] font-medium">
            When was your vehicle last professionally detailed?{" "}
            <span className="text-red-500">*</span>
          </p>

          <div className="flex flex-col gap-2">
            {LAST_DETAILED_OPTIONS.map((opt) => {
              const active = lastDetailed === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLastDetailed(opt)}
                  className={`w-full rounded-[20px] border px-4 py-3 sm:px-5 sm:py-4 text-left text-[13px] sm:text-[14px] font-medium
                    transition
                    ${
                      active
                        ? "border-transparent text-black shadow-sm"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{opt}</span>

                    {/* Імітація чекбокс/радіо як у макеті */}
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

          <p className="text-[12px] text-[#9CA3AF]">
            This helps us understand how much work your vehicle may need and
            recommend the right level of detailing.
          </p>
        </section>

        {/* Нижня кнопка як у скріні (Next із золотим градієнтом) */}
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

export default StepDetailingVehicleHistory;
