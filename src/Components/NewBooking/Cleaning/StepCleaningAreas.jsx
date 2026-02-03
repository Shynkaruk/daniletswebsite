// src/Components/NewBooking/Cleaning/StepCleaningAreas.jsx
import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

function toggleInArray(arr, value) {
  const safe = Array.isArray(arr) ? arr : [];
  return safe.includes(value)
    ? safe.filter((x) => x !== value)
    : [...safe, value];
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
      style={{ background: checked ? GOLD_GRADIENT : undefined }}
    >
      <span className="text-[16px] font-semibold">{label}</span>

      <span
        className={[
          "w-6 h-6 rounded-[7px] border flex items-center justify-center",
          checked ? "bg-black border-black" : "bg-white border-[#D1D5DB]",
        ].join(" ")}
      >
        {checked ? <span className="text-white text-[14px] leading-none">✓</span> : null}
      </span>
    </button>
  );
}

const AREAS_OPTIONS = [
  "Kitchen",
  "Living Room",
  "Dining Room",
  "Bedrooms",
  "Bathrooms",
  "Basement",
  "Sunroom",
  "Stairs",
  "Other",
];

export default function StepCleaningAreas({
  visible,
  onBack,
  onNext,
  propertyType,
  areas,
  setAreas,

  // ✅ нове (як у варіанті 1)
  areasOther,
  setAreasOther,

  renderProgress,
  progressStepIndex = 4,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const safeAreas = Array.isArray(areas) ? areas : [];

  const isOtherSelected = safeAreas.includes("Other");
  const otherOk = !isOtherSelected || (areasOther || "").trim().length > 1;

  const canContinue = useMemo(() => {
    if (!isResidential) return true;
    if (safeAreas.length === 0) return false;
    if (!otherOk) return false;
    return true;
  }, [isResidential, safeAreas.length, otherOk]);

  const handleToggle = (name) => {
    setAreas((prev) => {
      const next = toggleInArray(prev, name);

      // ✅ якщо зняли Other — чистимо поле
      if (name === "Other" && Array.isArray(prev) && prev.includes("Other")) {
        if (typeof setAreasOther === "function") setAreasOther("");
      }

      return next;
    });
  };

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <div>
            <h2 className="text-[22px] font-extrabold text-[#18181B]">
              Property Information
            </h2>
          </div>
        </div>

        {/* Progress */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* Content */}
        {isResidential ? (
          <section className="space-y-3">
            <div className="text-sm text-[#6B7280] font-medium">
              What areas do you need cleaned? (select all that apply)
            </div>

            <div className="space-y-3">
              {AREAS_OPTIONS.map((name) => (
                <CheckRow
                  key={name}
                  label={name}
                  checked={safeAreas.includes(name)}
                  onToggle={() => handleToggle(name)}
                />
              ))}
            </div>

            {/* ✅ поле для Other */}
            {isOtherSelected && (
              <div className="pt-2 space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Please specify
                </div>
                <input
                  value={areasOther || ""}
                  onChange={(e) => setAreasOther(e.target.value)}
                  className="w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                  placeholder="Write what other areas you need cleaned..."
                />
                {!otherOk && (
                  <div className="text-[12px] text-red-500">
                    Please describe “Other” to continue.
                  </div>
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4">
            <div className="text-sm text-[#6B7280] font-medium">
              Continue to tasks and budget.
            </div>
          </section>
        )}

        {/* Continue */}
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
