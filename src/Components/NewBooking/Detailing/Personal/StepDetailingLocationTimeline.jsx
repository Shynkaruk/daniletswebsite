// src/Components/Booking/StepDetailingLocationTimeline.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// варіанти місця проведення
const LOCATION_OPTIONS = [
  {
    key: "drop_off",
    label: "Customer drop-off",
    subtitle: "You bring the vehicle to our facility",
  },
  {
    key: "pickup",
    label: "Danilets pick-up & drop-off",
    subtitle: "$5/mile from our facility",
  },
];

const StepDetailingLocationTimeline = ({
  visible,
  onBack,
  onNext,

  serviceLocation, // "drop_off" | "pickup" | ""
  setServiceLocation,

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const canContinue = !!serviceLocation;

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
            Service location
          </h2>
        </div>

        {/* Прогрес: 4 секція (або свій номер) */}
        {renderProgress ? (
          renderProgress(4)
        ) : (
          <ProgressBar activeCount={4} total={totalSteps} />
        )}

        {/* Location */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            Where would you like the service performed?
          </div>

          <div className="space-y-2">
            {LOCATION_OPTIONS.map((opt) => {
              const active = serviceLocation === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setServiceLocation(opt.key)}
                  className={`w-full text-left rounded-[20px] border px-4 py-3 sm:px-5 sm:py-4
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  <div className="text-sm sm:text-[15px] font-semibold">
                    {opt.label}
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#4B5563] mt-0.5">
                    {opt.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Підказка для pick-up */}
        {serviceLocation === "pickup" && (
          <div className="text-[12px] sm:text-[13px] text-[#6B7280]">
            We&apos;ll confirm your exact address and scheduling details after
            you submit your request.
          </div>
        )}

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

export default StepDetailingLocationTimeline;
