import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";
import { GOLD_GRADIENT } from "./_ui";

const RESIDENTIAL_PROJECT_OPTIONS = [
  { key: "deep_clean", label: "Deep clean" },
  { key: "post_construction", label: "Post construction" },
  { key: "move_in_out", label: "Move in/out" },
  { key: "other", label: "Other" },
];

const COMMERCIAL_PROJECT_OPTIONS = [
  { key: "office", label: "Office" },
  { key: "airbnb", label: "Airbnb/rental properties" },
  { key: "post_construction", label: "Post construction" },
  { key: "other", label: "Other" },
];

export default function StepCleaningProjectType({
  visible,
  onBack,
  onNext,

  propertyType,
  projectType,
  setProjectType,

  // ✅ нове
  projectTypeOther,
  setProjectTypeOther,

  renderProgress,
  progressStepIndex = 3,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const options = useMemo(() => {
    return isResidential
      ? RESIDENTIAL_PROJECT_OPTIONS
      : isCommercial
      ? COMMERCIAL_PROJECT_OPTIONS
      : [];
  }, [isResidential, isCommercial]);

  const isOther = projectType === "other";
  const otherOk = !isOther || (projectTypeOther || "").trim().length > 1;

  const canContinue = !!projectType && otherOk;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Cleaning details
          </h2>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <section className="space-y-2">
          <div className="text-sm text-[#6B7280] font-medium">
            What type of project is this? (select one)*
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((opt) => {
              const active = projectType === opt.key;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setProjectType(opt.key);

                    // ✅ якщо вибрали не Other — чистимо поле
                    if (opt.key !== "other") setProjectTypeOther?.("");
                  }}
                  className={`min-h-[44px] rounded-[16px] border text-sm font-semibold px-3 text-left
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* ✅ поле для Other */}
          {isOther && (
            <div className="pt-2 space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Please specify
              </div>
              <input
                value={projectTypeOther || ""}
                onChange={(e) => setProjectTypeOther(e.target.value)}
                className="w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="Write your project type..."
              />
              {!otherOk && (
                <div className="text-[12px] text-red-500">
                  Please describe your project type to continue.
                </div>
              )}
            </div>
          )}
        </section>

        <button
          type="button"
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
}
