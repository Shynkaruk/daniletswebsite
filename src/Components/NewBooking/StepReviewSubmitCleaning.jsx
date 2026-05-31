import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 sm:p-5 space-y-2">
    <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#18181B]">
      {title}
    </h3>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm text-[#4B5563] py-0.5 gap-4">
    <span className="font-medium text-[#6B7280]">{label}</span>
    <span className="text-[#18181B] font-semibold text-right">
      {value || "—"}
    </span>
  </div>
);

const typeLabelMap = {
  residential: "Residential",
  commercial: "Commercial",
};

const residentialProjectLabelMap = {
  deep_clean: "Deep clean",
  post_construction: "Post construction",
  move_in_out: "Move in/out",
  other: "Other",
};

const commercialProjectLabelMap = {
  office: "Office",
  airbnb: "Airbnb / rental properties",
  post_construction: "Post construction",
  other: "Other",
};

const frequencyLabelMap = {
  one_time: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  other: "Other",
};

const StepReviewSubmitCleaning = ({
  visible,
  onBack,
  onSubmit,

  // 1. Type & project
  propertyType,   // "residential" | "commercial"
  projectType,    // ключі як у старих опцій

  // 2. Residential details
  bedrooms,
  bathrooms,

  // 3. Commercial details
  companyName,
  companyAddress,
  squareFeet,
  frequency,

  // 4. Tasks & areas
  areas,
  generalTasks,
  kitchenTasks,

  // 5. Budget & extras
  resBudget,
  extraDetails,
  comBudget,
  comExtraDetails,

  // 6. Contact
  firstName,
  lastName,
  phone,
  email,
  heardAbout,
  extraInfo,
  serviceDate, // preferred service date (із DatePicker, якщо ти його передаєш)

  totalSteps = 6, // Cleaning flow: 1–6
}) => {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const typeLabel = typeLabelMap[propertyType] || "—";

  const projectLabel = isResidential
    ? residentialProjectLabelMap[projectType] || "—"
    : isCommercial
    ? commercialProjectLabelMap[projectType] || "—"
    : "—";

  const frequencyLabel = frequencyLabelMap[frequency] || (frequency || "—");

  // красиво виводимо списки
  const joinList = (arr) =>
    Array.isArray(arr) && arr.length ? arr.join(", ") : "—";

  // дата (якщо в тебе збережена в форматі YYYY-MM-DD — можна легенько привести)
  const formatDate = (v) => {
    if (!v) return "—";
    // очікуємо формат YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-");
      return `${m}.${d}.${y}`;
    }
    return v;
  };

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
              Review your request
            </h2>
            <p className="text-[12px] sm:text-[13px] text-[#6B7280]">
              Please double-check your details before submitting your cleaning
              request.
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        <ProgressBar activeCount={6} total={totalSteps} />

        {/* 1. CONTACT FIRST (як ти й просив) */}
        <SectionCard title="Contact information">
          <Row label="First name" value={firstName} />
          <Row label="Last name" value={lastName} />
          <Row label="Phone" value={phone} />
          <Row label="Email" value={email} />
          <Row label="How you heard about us" value={heardAbout} />
          <Row
            label="Preferred service date"
            value={formatDate(serviceDate)}
          />

          {extraInfo ? (
            <div className="pt-2 space-y-1">
              <div className="text-sm font-medium text-[#6B7280]">
                Additional info:
              </div>
              <p className="text-sm text-[#18181B] whitespace-pre-line">
                {extraInfo}
              </p>
            </div>
          ) : null}
        </SectionCard>

        {/* 2. PROPERTY & PROJECT */}
        <SectionCard title="Property & project">
          <Row label="Property type" value={typeLabel} />
          <Row label="Project type" value={projectLabel} />

          {isResidential && (
            <>
              <Row
                label="Bedrooms"
                value={bedrooms !== "" ? String(bedrooms) : "—"}
              />
              <Row
                label="Bathrooms"
                value={bathrooms !== "" ? String(bathrooms) : "—"}
              />
            </>
          )}

          {isCommercial && (
            <>
              <Row label="Company name" value={companyName} />
              <Row label="Company address" value={companyAddress} />
              <Row
                label="Square feet"
                value={
                  squareFeet !== "" && squareFeet != null
                    ? String(squareFeet)
                    : "—"
                }
              />
              <Row label="Frequency" value={frequencyLabel} />
            </>
          )}
        </SectionCard>

        {/* 3. AREAS & TASKS (для residential) */}
        {isResidential && (
          <SectionCard title="Areas & tasks">
            <div className="space-y-2">
              <Row label="Areas to be cleaned" value={joinList(areas)} />
              <Row
                label="General tasks"
                value={joinList(generalTasks)}
              />

              {Array.isArray(kitchenTasks) && kitchenTasks.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="text-sm font-medium text-[#6B7280]">
                    Kitchen tasks:
                  </div>
                  <ul className="list-disc pl-5 text-sm text-[#18181B]">
                    {kitchenTasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* 4. BUDGET & NOTES */}
        <SectionCard title="Budget & project notes">
          {isResidential && (
            <>
              <Row label="Budget" value={resBudget} />
              {extraDetails ? (
                <div className="pt-2 space-y-1">
                  <div className="text-sm font-medium text-[#6B7280]">
                    Additional details:
                  </div>
                  <p className="text-sm text-[#18181B] whitespace-pre-line">
                    {extraDetails}
                  </p>
                </div>
              ) : null}
            </>
          )}

          {isCommercial && (
            <>
              <Row label="Budget" value={comBudget} />
              {comExtraDetails ? (
                <div className="pt-2 space-y-1">
                  <div className="text-sm font-medium text-[#6B7280]">
                    Additional details:
                  </div>
                  <p className="text-sm text-[#18181B] whitespace-pre-line">
                    {comExtraDetails}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </SectionCard>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          onClick={onSubmit}
          className="w-full h-[52px] mt-1 rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center"
          style={{ background: GOLD_GRADIENT }}
        >
          Submit request
        </button>
      </div>
    </div>
  );
};

export default StepReviewSubmitCleaning;
