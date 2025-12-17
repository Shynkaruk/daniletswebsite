// src/Components/NewBooking/Cleaning/StepCleaningKitchenTasks.jsx
import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

function toggleInArray(arr, value) {
  const safe = Array.isArray(arr) ? arr : [];
  return safe.includes(value) ? safe.filter((x) => x !== value) : [...safe, value];
}

function CheckRow({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "w-full rounded-[18px] px-5 py-4 border transition flex items-center justify-between text-left",
        checked
          ? "border-transparent text-black"
          : "border-[#E5E7EB] text-[#111827] bg-white",
      ].join(" ")}
      style={{
        background: checked ? GOLD_GRADIENT : undefined,
      }}
    >
      <span className="text-[16px] font-semibold">{label}</span>

      <span
        className={[
          "w-6 h-6 rounded-[7px] border flex items-center justify-center",
          checked ? "bg-black border-black" : "bg-white border-[#D1D5DB]",
        ].join(" ")}
      >
        {checked ? (
          <span className="text-white text-[14px] leading-none">✓</span>
        ) : null}
      </span>
    </button>
  );
}


const KITCHEN_TASKS_OPTIONS = [
  "Surface Cleaning (Cabinets, Counters, and Appliances)",
  "Inside Cabinets",
  "Top of Cabinets",
  "Inside Oven",
  "Inside Fridge",
  "Inside Microwave",
  "Other",
];

export default function StepCleaningKitchenTasks({
  visible,
  onBack,
  onNext,
  propertyType,
  kitchenTasks,
  setKitchenTasks,
  renderProgress,
  progressStepIndex = 6,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const safe = Array.isArray(kitchenTasks) ? kitchenTasks : [];

  const canContinue = useMemo(() => {
    if (!isResidential) return true;
    return safe.length > 0;
  }, [isResidential, safe.length]);

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[22px] font-extrabold text-[#18181B]">Project details</h2>
        </div>

        {renderProgress ? renderProgress(progressStepIndex) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {isResidential ? (
          <section className="space-y-3">
            <div className="text-sm text-[#6B7280] font-medium">
              What will we be doing in the kitchen? (select all that apply) *
            </div>

            <div className="space-y-3">
              {KITCHEN_TASKS_OPTIONS.map((name) => (
                <CheckRow
                  key={name}
                  label={name}
                  checked={safe.includes(name)}
                  onToggle={() => setKitchenTasks((prev) => toggleInArray(prev, name))}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4">
            <div className="text-sm text-[#6B7280] font-medium">Continue to budget.</div>
          </section>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={[
            "w-full h-[54px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2",
            !canContinue ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
          style={{ background: GOLD_GRADIENT }}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
