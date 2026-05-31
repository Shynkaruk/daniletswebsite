import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const FREQUENCY_OPTIONS = [
  "One-Time",
  "Weekly",
  "Bi-Weekly",
  "Monthly",
  "Quarterly",
  "Other",
];

export default function StepDetailingBusinessServiceFrequency({
  visible,
  onBack,
  onNext,

  serviceFrequency,
  setServiceFrequency,
  serviceFrequencyOther,
  setServiceFrequencyOther,

  renderProgress,
  progressStepIndex = 4,
  totalSteps = 11,
}) {
  if (!visible) return null;

  const canContinue =
    serviceFrequency.trim() &&
    (serviceFrequency !== "Other" || serviceFrequencyOther.trim());

  const inputClass =
    "w-full h-[52px] rounded-[16px] bg-[#F4F4F5] px-4 text-[15px] outline-none";

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-5 sm:p-6 lg:p-8 shadow space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Service Frequency
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF]">
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

        {/* QUESTION BLOCK */}
        <section className="space-y-4">
          <div className="text-sm text-[#6B7280] font-medium">
            How often do you need detailing services?
          </div>

          {/* OPTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => {
              const active = serviceFrequency === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setServiceFrequency(opt)}
                  className={`h-[44px] rounded-[16px] border text-sm font-medium px-4 text-left
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{
                    background: active ? GOLD_GRADIENT : undefined,
                  }}
                >
                  {opt === "Other" ? "Other (please specify)" : opt}
                </button>
              );
            })}
          </div>

          {/* If "Other" → text input */}
          {serviceFrequency === "Other" && (
            <input
              value={serviceFrequencyOther}
              onChange={(e) => setServiceFrequencyOther(e.target.value)}
              className={`${inputClass} mt-2`}
              placeholder="Please specify how often"
            />
          )}
        </section>

        {/* CONTINUE BUTTON */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`
            w-full h-[52px] sm:h-[56px] rounded-[88px] font-semibold text-black shadow
            inline-flex items-center justify-between px-6
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}
          `}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
