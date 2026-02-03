import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";

function titleCase(v) {
  const s = String(v || "").trim();
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatSqft(v) {
  const s = String(v || "").trim();
  if (!s) return "—";
  return `${s} sq ft`;
}

function formatFrequency(v) {
  const s = String(v || "").trim();
  if (!s) return "—";
  const map = {
    one_time: "One-time",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    daily: "Daily",
  };
  return map[s] || titleCase(s.replaceAll("_", " "));
}

// "1000_2500_month" -> "$1,000–$2,500 / month"
function formatBudget(v) {
  const raw = String(v || "").trim();
  if (!raw) return "—";

  // якщо вже красиво
  if (raw.includes("$") || raw.includes("/")) return raw;

  const m = raw.match(/^(\d+)[_\-](\d+)[_\-](month|weekly|day|one_time)$/i);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const period = String(m[3] || "").toLowerCase();

    const fmt = (x) => x.toLocaleString("en-US", { maximumFractionDigits: 0 });

    const periodText = period === "one_time" ? "one-time" : period;

    return `$${fmt(a)}–$${fmt(b)} / ${periodText}`;
  }

  return raw.replaceAll("_", " ");
}

function formatList(arr) {
  if (!Array.isArray(arr) || !arr.length) return "—";
  return arr.join(", ");
}

function formatSupplies(v) {
  if (!v) return "—";
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  if (v === "use_my") return "Use my supplies";
  return titleCase(v);
}

function buildHearAboutText(c) {
  const source = String(c?.hearAbout || "").trim();
  if (!source) return "—";

  if (source === "referral") {
    const name = String(c?.referralName || "").trim();
    return name ? `Referral/Friend — ${name}` : "Referral/Friend";
  }

  if (source === "other") {
    const other = String(c?.hearAboutOther || "").trim();
    return other ? `Other — ${other}` : "Other";
  }

  return titleCase(source.replaceAll("_", " "));
}

function formatProjectType(v) {
  if (!v) return "—";
  const map = {
    office: "Office",
    airbnb: "Airbnb / rental properties",
    post_construction: "Post construction",
    other: "Other",
  };
  return map[v] || titleCase(String(v).replaceAll("_", " "));
}

export default function StepCleaningCommercialReview({
  visible,
  onBack,
  onSubmit,
  isSubmitting = false,

  // data
  serviceAddress,
  cleaningCommercial,
  projectType, // ✅ беремо з Booking.jsx

  // edit callbacks
  onEditContact,
  onEditCompany,
  onEditProjectType,
  onEditProjectInfo,
  onEditSupplies,
  onEditAccess,
  onEditAdditional,

  // progress
  renderProgress,
  progressStepIndex = 9,
  totalSteps = 9,
}) {
  if (!visible) return null;

  const c = cleaningCommercial || {};

  // ====== UI classes (1:1 як резидентський Review) ======
  const cardClass =
    "bg-white/90 backdrop-blur rounded-[24px] p-6 sm:p-8 shadow space-y-7";

  const sectionTitleClass = "text-[17px] font-bold text-[#111827]";

  const infoBoxClass =
    "min-h-[52px] rounded-[14px] bg-[#F4F4F5] px-5 py-3 flex items-center text-[15px] text-[#18181B]";

  const infoBoxMultilineClass =
    "min-h-[52px] rounded-[14px] bg-[#F4F4F5] px-5 py-3 text-[15px] text-[#18181B] leading-relaxed";

  const changeBtnClass =
    "w-full h-[52px] rounded-[88px] text-[15px] sm:text-[16px] font-semibold text-black shadow-md flex items-center justify-center";

  const heardText = buildHearAboutText(c);
  const preferred = Array.isArray(c.preferredDaysTimes) ? c.preferredDaysTimes : [];
  const projectTypeText = formatProjectType(projectType);

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
          Please review your commercial cleaning request before submitting. We&apos;ll contact you
          to confirm details and provide pricing.
        </p>

        {/* ==== BLOCK 1: ADDRESS ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Service address</h3>
          <div className={infoBoxMultilineClass}>
            {serviceAddress?.trim() ? serviceAddress : "—"}
          </div>
        </section>

        {/* ==== BLOCK 2: CONTACT ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Contact details</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>{c.firstName?.trim() ? c.firstName : "—"}</div>
              <div className={infoBoxClass}>{c.lastName?.trim() ? c.lastName : "—"}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>{c.phone?.trim() ? c.phone : "—"}</div>
              <div className={infoBoxClass}>{c.email?.trim() ? c.email : "—"}</div>
            </div>

            <div className={infoBoxClass}>How did you hear about us: {heardText}</div>
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

        {/* ==== BLOCK 3: COMPANY ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Company information</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>
                {c.companyName?.trim() ? c.companyName : "Company name —"}
              </div>
              <div className={infoBoxClass}>
                {c.companyAddress?.trim() ? c.companyAddress : "Company address —"}
              </div>
            </div>

            <div className={infoBoxClass}>
              Type of business:{" "}
              {c.businessTypeText?.trim()
                ? c.businessTypeText
                : c.businessType === "other"
                ? c.businessTypeOther?.trim()
                  ? `Other — ${c.businessTypeOther}`
                  : "Other"
                : c.businessType
                ? titleCase(c.businessType)
                : "—"}
            </div>
          </div>

          <button
            type="button"
            onClick={onEditCompany}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change company information
          </button>
        </section>

        {/* ==== BLOCK 4: PROJECT TYPE ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Project type</h3>

          <div className={infoBoxClass}>Project: {projectTypeText}</div>

          <button
            type="button"
            onClick={onEditProjectType}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change project type
          </button>
        </section>

        {/* ==== BLOCK 5: PROJECT INFORMATION (людсько + розбито на поля) ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Project information</h3>

          {/* OFFICE */}
          {projectType === "office" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>
                  Square footage: {formatSqft(c.officeSquareFootage)}
                </div>
                <div className={infoBoxClass}>
                  Frequency: {formatFrequency(c.officeFrequency)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>Floors: {c.officeFloors || "—"}</div>
                <div className={infoBoxClass}>Restrooms: {c.officeRestrooms || "—"}</div>
              </div>

              <div className={infoBoxClass}>Budget: {formatBudget(c.officeBudget)}</div>

              {Array.isArray(c.officeAreas) && c.officeAreas.length > 0 && (
                <div className={infoBoxMultilineClass}>
                  Areas: {formatList(c.officeAreas)}
                  {c.officeAreas.includes("Other") && c.officeAreasOther
                    ? ` — ${c.officeAreasOther}`
                    : ""}
                </div>
              )}
            </div>
          )}

          {/* AIRBNB */}
          {projectType === "airbnb" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>Units: {c.airbnbUnits || "—"}</div>
                <div className={infoBoxClass}>
                  Turnover: {formatFrequency(c.airbnbTurnover)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>Avg sqft: {formatSqft(c.airbnbAvgSqft)}</div>
                <div className={infoBoxClass}>
                  Budget / unit: {formatBudget(c.airbnbBudgetPerUnit)}
                </div>
              </div>

              <div className={infoBoxMultilineClass}>
                Areas: {formatList(c.airbnbAreas)}
                {Array.isArray(c.airbnbAreas) &&
                c.airbnbAreas.includes("Other") &&
                c.airbnbAreasOther
                  ? ` — ${c.airbnbAreasOther}`
                  : ""}
              </div>
            </div>
          )}

          {/* POST CONSTRUCTION */}
          {projectType === "post_construction" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>
                  Square footage: {formatSqft(c.pcSquareFootage)}
                </div>
                <div className={infoBoxClass}>
                  Frequency: {formatFrequency(c.pcFrequency)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>Floors: {c.pcFloors || "—"}</div>
                <div className={infoBoxClass}>Budget: {formatBudget(c.pcBudget)}</div>
              </div>

              <div className={infoBoxMultilineClass}>
                Surfaces: {formatList(c.pcSurfaces)}
                {Array.isArray(c.pcSurfaces) &&
                c.pcSurfaces.includes("Other") &&
                c.pcSurfacesOther
                  ? ` — ${c.pcSurfacesOther}`
                  : ""}
              </div>
            </div>
          )}

          {/* OTHER */}
          {projectType === "other" && (
            <div className="space-y-3">
              <div className={infoBoxMultilineClass}>
                Description:{" "}
                {c.otherProjectDescription?.trim() ? c.otherProjectDescription : "—"}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={infoBoxClass}>
                  Square footage: {formatSqft(c.otherSquareFootage)}
                </div>
                <div className={infoBoxClass}>
                  Frequency: {formatFrequency(c.otherFrequency)}
                </div>
              </div>

              <div className={infoBoxClass}>Budget: {formatBudget(c.otherBudget)}</div>
            </div>
          )}

          {/* FALLBACK (якщо projectType не встановлений) */}
          {!projectType && (
            <div className={infoBoxMultilineClass}>
              {c.projectSummary?.trim() ? c.projectSummary.replaceAll("_", " ") : "—"}
            </div>
          )}

          <button
            type="button"
            onClick={onEditProjectInfo}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change project information
          </button>
        </section>

        {/* ==== BLOCK 6: SUPPLIES & PREFERENCES ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Supplies & preferences</h3>

          <div className="space-y-3">
            <div className={infoBoxClass}>
              Provide supplies and equipment: {formatSupplies(c.supplies)}
            </div>
            <div className={infoBoxMultilineClass}>
              Product preferences or sensitivities:{" "}
              {c.productPreferences?.trim() ? c.productPreferences : "—"}
            </div>
          </div>

          <button
            type="button"
            onClick={onEditSupplies}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change supplies & preferences
          </button>
        </section>

        {/* ==== BLOCK 7: ACCESS & SCHEDULING ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Access & scheduling</h3>

          <div className="space-y-3">
            <div className={infoBoxMultilineClass}>
              Preferred days/times: {preferred.length ? preferred.join(", ") : "—"}
            </div>
            <div className={infoBoxMultilineClass}>
              Security system / access instructions:{" "}
              {c.accessInstructions?.trim() ? c.accessInstructions : "—"}
            </div>
          </div>

          <button
            type="button"
            onClick={onEditAccess}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change access & scheduling
          </button>
        </section>

        {/* ==== BLOCK 8: ADDITIONAL ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Additional information</h3>

          <div className={infoBoxMultilineClass}>
            Notes: {c.additionalInfo?.trim() ? c.additionalInfo : "—"}
          </div>

          <button
            type="button"
            onClick={onEditAdditional}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change additional information
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
