import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar"; // перевір шлях: якщо в тебе інакше — підправ

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

function formatPropertyType(v) {
  if (!v) return "Not specified";
  if (v === "residential") return "Residential";
  if (v === "commercial") return "Commercial";
  return v;
}

function formatProjectType(v) {
  if (!v) return "Not specified";
  const map = {
    deep_clean: "Deep clean",
    post_construction: "Post construction",
    move_in_out: "Move in/out",
    other: "Other",
  };
  return map[v] || v;
}

function formatList(arr) {
  if (!Array.isArray(arr) || !arr.length) return "Not specified";
  return arr.join(", ");
}

function formatHeard(heardAbout) {
  if (!heardAbout) return "—";
  if (Array.isArray(heardAbout)) return heardAbout.length ? heardAbout.join(", ") : "—";
  if (typeof heardAbout === "string") return heardAbout.trim() ? heardAbout : "—";
  return "—";
}

export default function StepCleaningReview({
  visible,
  onBack,
  onSubmit,
  isSubmitting = false,

  // progress
  renderProgress,
  progressStepIndex = 10,
  totalSteps = 10,

  // data
  propertyType,
  projectType,

  // residential details
  bedrooms,
  bathrooms,
  areas,
  generalTasks,
  kitchenTasks,
  resBudget,
  extraDetails,

  // commercial details
  companyName,
  companyAddress,
  squareFeet,
  frequency,
  comBudget,
  comExtraDetails,

  // contact
  firstName,
  lastName,
  phone,
  email,
  heardAbout,
  extraInfo,

  // edit callbacks
  onEditType,
  onEditProject,
  onEditProperty,
  onEditAreas,
  onEditGeneralTasks,
  onEditKitchenTasks,
  onEditBudget,
  onEditContact,
}) {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const propertyTypeText = formatPropertyType(propertyType);
  const projectTypeText = formatProjectType(projectType);

  // ====== UI classes (як у твоєму прикладі) ======
  const cardClass =
    "bg-white/90 backdrop-blur rounded-[24px] p-6 sm:p-8 shadow space-y-7";

  const sectionTitleClass = "text-[17px] font-bold text-[#111827]";

  const infoBoxClass =
    "min-h-[52px] rounded-[14px] bg-[#F4F4F5] px-5 py-3 flex items-center text-[15px] text-[#18181B]";

  const infoBoxMultilineClass =
    "min-h-[52px] rounded-[14px] bg-[#F4F4F5] px-5 py-3 text-[15px] text-[#18181B] leading-relaxed";

  const changeBtnClass =
    "w-full h-[52px] rounded-[88px] text-[15px] sm:text-[16px] font-semibold text-black shadow-md flex items-center justify-center";

  return (
    <div className="w-full max-w-full text-left">
      <div className={cardClass}>
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px]" />
          </button>

          <div>
            <h2 className="text-[24px] sm:text-[26px] font-extrabold text-[#18181B]">
              Review & Submit
            </h2>
            <p className="text-[12px] sm:text-[13px] text-[#9CA3AF]">
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

        <p className="text-[15px] text-[#4B5563] leading-relaxed">
          Please review your cleaning request before submitting. We&apos;ll contact you to
          confirm details and provide pricing.
        </p>

        {/* ==== BLOCK 1: TYPE + PROJECT ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Cleaning details</h3>

          <div className="space-y-3">
            <div className={infoBoxClass}>Property type: {propertyTypeText}</div>
            <div className={infoBoxClass}>Project type: {projectTypeText}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onEditType}
              className={changeBtnClass}
              style={{ background: GOLD_GRADIENT }}
            >
              Change property type
            </button>

            <button
              type="button"
              onClick={onEditProject}
              className={changeBtnClass}
              style={{ background: GOLD_GRADIENT }}
            >
              Change project type
            </button>
          </div>
        </section>

        {/* ==== BLOCK 2: PROPERTY DETAILS ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>
            {isResidential ? "Property details" : "Company / property details"}
          </h3>

          {isResidential && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>Bedrooms: {bedrooms || "—"}</div>
                <div className={infoBoxClass}>Bathrooms: {bathrooms || "—"}</div>
              </div>
            </div>
          )}

          {isCommercial && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>{companyName || "Company name —"}</div>
                <div className={infoBoxClass}>{companyAddress || "Company address —"}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>Square feet: {squareFeet || "—"}</div>
                <div className={infoBoxClass}>Frequency: {frequency || "—"}</div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onEditProperty}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change property details
          </button>
        </section>

        {/* ==== BLOCK 3: AREAS ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Areas</h3>

          <div className={infoBoxMultilineClass}>{formatList(areas)}</div>

          <button
            type="button"
            onClick={onEditAreas}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change areas selection
          </button>
        </section>

        {/* ==== BLOCK 4: GENERAL TASKS ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>General tasks</h3>

          <div className={infoBoxMultilineClass}>{formatList(generalTasks)}</div>

          <button
            type="button"
            onClick={onEditGeneralTasks}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change general tasks
          </button>
        </section>

        {/* ==== BLOCK 5: KITCHEN TASKS ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Kitchen tasks</h3>

          <div className={infoBoxMultilineClass}>{formatList(kitchenTasks)}</div>

          <button
            type="button"
            onClick={onEditKitchenTasks}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change kitchen tasks
          </button>
        </section>

        {/* ==== BLOCK 6: BUDGET ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Budget & notes</h3>

          {isResidential && (
            <div className="space-y-3">
              <div className={infoBoxClass}>Budget: {resBudget || "—"}</div>
              <div className={infoBoxMultilineClass}>
                Notes: {extraDetails?.trim() ? extraDetails : "—"}
              </div>
            </div>
          )}

          {isCommercial && (
            <div className="space-y-3">
              <div className={infoBoxClass}>Budget: {comBudget || "—"}</div>
              <div className={infoBoxMultilineClass}>
                Notes: {comExtraDetails?.trim() ? comExtraDetails : "—"}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onEditBudget}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change budget & notes
          </button>
        </section>

        {/* ==== BLOCK 7: CONTACT ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Contact details</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>{firstName || "—"}</div>
              <div className={infoBoxClass}>{lastName || "—"}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>{phone || "—"}</div>
              <div className={infoBoxClass}>{email || "—"}</div>
            </div>

            <div className={infoBoxClass}>
              How did you hear about us: {formatHeard(heardAbout)}
            </div>

            <div className={infoBoxMultilineClass}>
              Additional information: {extraInfo?.trim() ? extraInfo : "—"}
            </div>
          </div>

          <button
            type="button"
            onClick={onEditContact}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change contact details
          </button>
        </section>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="
            w-full h-[56px]
            rounded-[88px]
            font-semibold
            text-[16px]
            text-black
            shadow-lg
            mt-2
            disabled:opacity-60
          "
          style={{ background: GOLD_GRADIENT }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
