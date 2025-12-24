import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="text-sm text-[#6B7280]">{label}</div>
      <div className="text-sm font-semibold text-[#111827] text-right">
        {value}
      </div>
    </div>
  );
}

function SectionCard({ title, onEdit, children }) {
  return (
    <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[16px] font-extrabold text-[#111827]">{title}</div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="h-[34px] px-4 rounded-full border border-[#D1D5DB] text-xs font-semibold text-[#111827]"
          >
            Change information
          </button>
        )}
      </div>
      <div className="divide-y divide-[#F3F4F6]">{children}</div>
    </div>
  );
}

export default function StepCleaningCommercialReview({
  visible,
  onBack,
  onSubmit,
  isSubmitting,

  serviceAddress,
  cleaningCommercial,

  onEditContact,
  onEditCompany,
  onEditProjectType,
  onEditProjectInfo,
  onEditSupplies,
  onEditAccess,
  onEditAdditional,

  renderProgress,
  progressStepIndex = 9,
  totalSteps = 9,
}) {
  if (!visible) return null;

  const c = cleaningCommercial || {};
  const source = c.hearAbout || "";
  const referralName = c.referralName || "";
  const otherSource = c.hearAboutOther || "";

  const sourceText =
    source === "referral"
      ? `Referral/Friend${referralName ? `: ${referralName}` : ""}`
      : source === "other"
      ? `Other: ${otherSource || ""}`
      : source;

  const preferred = Array.isArray(c.preferredDaysTimes)
    ? c.preferredDaysTimes.join(", ")
    : "";

  const supplies =
    c.supplies === "yes"
      ? "Yes"
      : c.supplies === "no"
      ? "No"
      : c.supplies === "use_my"
      ? "Use my supplies"
      : "";

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
          <h2 className="text-[26px] font-extrabold text-[#111827]">Review</h2>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <div className="space-y-4">
          <SectionCard title="Service Address">
            <Row label="Address" value={serviceAddress || ""} />
          </SectionCard>

          <SectionCard title="Contact Information" onEdit={onEditContact}>
            <Row label="First Name" value={c.firstName || ""} />
            <Row label="Last Name" value={c.lastName || ""} />
            <Row label="Phone Number" value={c.phone || ""} />
            <Row label="Email" value={c.email || ""} />
            <Row label="How did you hear about us?" value={sourceText || ""} />
          </SectionCard>

          <SectionCard title="Company Information" onEdit={onEditCompany}>
            <Row label="Company Name" value={c.companyName || ""} />
            <Row label="Company Address" value={c.companyAddress || ""} />
            <Row label="Type of Business" value={c.businessTypeText || ""} />
          </SectionCard>

          <SectionCard title="Project Type" onEdit={onEditProjectType}>
            <Row label="Type" value={c.projectTypeText || ""} />
          </SectionCard>

          <SectionCard title="Project Information" onEdit={onEditProjectInfo}>
            {/* Ми не розписуємо всі 100 полів у review — але збережемо ключові */}
            <Row label="Summary" value={c.projectSummary || ""} />
          </SectionCard>

          <SectionCard title="Supplies & Preferences" onEdit={onEditSupplies}>
            <Row
              label="Provide supplies and equipment?"
              value={supplies || ""}
            />
            <Row
              label="Product preferences or sensitivities"
              value={c.productPreferences || ""}
            />
          </SectionCard>

          <SectionCard title="Access & Scheduling" onEdit={onEditAccess}>
            <Row label="Preferred days/times" value={preferred || ""} />
            <Row
              label="Security system / access instructions"
              value={c.accessInstructions || ""}
            />
          </SectionCard>

          <SectionCard title="Additional Information" onEdit={onEditAdditional}>
            <Row label="Notes" value={c.additionalInfo || ""} />
          </SectionCard>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!!isSubmitting}
          className={[
            "w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6",
            isSubmitting ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>{isSubmitting ? "Submitting..." : "Submit request"}</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
