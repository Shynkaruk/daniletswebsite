// src/Components/Booking/Cleaning/StepCleaningTypeProject.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// як у старому StepCleaningDetails
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

const StepCleaningTypeProject = ({
  visible,
  onBack,
  onNext,

  propertyType, // "residential" | "commercial" | ""
  setPropertyType,
  projectType, // residential: deep_clean/... ; commercial: office/...
  setProjectType,

  renderProgress,
  totalSteps = 4, // 1: type/project, 2: property, 3: budget, 4: contact
}) => {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const projectOptions = isResidential
    ? RESIDENTIAL_PROJECT_OPTIONS
    : isCommercial
    ? COMMERCIAL_PROJECT_OPTIONS
    : [];

  const canContinue = !!propertyType && !!projectType;

  const handleSelectType = (type) => {
    // якщо змінив тип – скидаємо projectType, щоб не було "старого" значення
    setPropertyType(type);
    setProjectType("");
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onNext();
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
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Cleaning details
          </h2>
        </div>

        {/* PROGRESS — крок 1 */}
        {renderProgress ? (
          renderProgress(1)
        ) : (
          <ProgressBar activeCount={1} total={totalSteps} />
        )}

        {/* TYPE: Residential / Commercial */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            What type of property is this? *
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "residential", label: "Residential" },
              { key: "commercial", label: "Commercial" },
            ].map((opt) => {
              const active = propertyType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectType(opt.key)}
                  className={`h-[44px] rounded-[16px] border text-sm font-semibold
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
        </section>

        {/* PROJECT TYPE */}
        {(isResidential || isCommercial) && (
          <section className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Type of project (select one) *
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {projectOptions.map((opt) => {
                const active = projectType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setProjectType(opt.key)}
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

export default StepCleaningTypeProject;
