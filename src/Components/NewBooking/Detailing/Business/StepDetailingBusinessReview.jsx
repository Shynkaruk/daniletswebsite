// src/Components/NewBooking/Detailing/StepDetailingBusinessReview.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // підправ шлях, якщо інший

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// мапа для vehicleTypes (щоб гарно підписати)
const VEHICLE_LABELS = {
  sedans: "Sedans",
  suvs: "SUVs",
  pickups: "Pick-Ups",
  minivans: "Mini-Vans / 3-Row SUVs",
  transit_vans: "Transit Vans",
  semi_trucks: "Semi-Trucks",
  other: "Other",
};

function formatVehicleTypes(vehicleTypes = {}, otherLabel = "") {
  const entries = Object.entries(vehicleTypes || {})
    .filter(([_, v]) => Number(v) > 0)
    .map(([key, v]) => {
      const baseLabel = VEHICLE_LABELS[key] || key;
      if (key === "other" && otherLabel?.trim()) {
        return `${otherLabel} – ${v}`;
      }
      return `${baseLabel}: ${v}`;
    });

  if (!entries.length) return "Not specified";
  return entries.join(", ");
}

function formatServiceLocation(loc) {
  if (!loc) return "Not specified";
  switch (loc) {
    case "customer_dropoff":
    case "drop_off":
      return "Customer Drop-Off (vehicles brought to our facility)";
    case "pickup":
    case "pickup_dropoff":
      return "Danilets Pick-Up and Drop-Off ($5/mile from our facility)";
    case "mobile":
      return "Mobile Service";
    default:
      return loc;
  }
}

function formatHearAbout(hearAbout, hearAboutOther) {
  if (!hearAbout) return "Not specified";
  if (hearAbout === "Other" && hearAboutOther?.trim()) {
    return `Other – ${hearAboutOther}`;
  }
  return hearAbout;
}

function formatServices(services = [], otherText = "") {
  if (!Array.isArray(services) || !services.length) return "Not specified";

  const hasOther = services.includes("Other");
  const cleaned = services.filter((s) => s !== "Other");

  let result = cleaned.join(", ");
  if (hasOther && otherText?.trim()) {
    result = result ? `${result}, Other – ${otherText}` : `Other – ${otherText}`;
  }

  return result || "Not specified";
}

export default function StepDetailingBusinessReview({
  visible,

  // прогрес
  renderProgress,
  progressStepIndex = 10,
  totalSteps = 11,

  // секція 2 – Contact Information
  firstName,
  lastName,
  companyName,
  companyAddress,
  phone,
  email,
  hearAbout,
  hearAboutOther,

  // секція 3 – Vehicles + business type
  businessVehiclesCount,
  businessType,
  businessTypeOther,

  // секція 4 – Service frequency
  serviceFrequency,
  serviceFrequencyOther,

  // секція 5 – Vehicle types
  businessVehicleTypes,
  businessVehicleOtherLabel,

  // секція 6 – Service location
  businessServiceLocation,

  // секція 7 – Services interested in
  businessServices,
  businessServicesOther,

  // секція 8 – Timeline
  businessStartDate,

  // секція 9 – Additional info
  businessNotes,

  // кнопка submit
  onSubmit,
  isSubmitting,

  // колбеки для "Change information"
  onEditContact,
  onEditVehiclesBusinessType,
  onEditFrequency,
  onEditVehicleTypes,
  onEditLocation,
  onEditServices,
  onEditTimeline,
  onEditAdditionalInfo,

  onBack,
}) {
  if (!visible) return null;

  const vehiclesText =
    businessVehiclesCount && Number(businessVehiclesCount) > 0
      ? `${businessVehiclesCount} vehicle(s)`
      : "Not specified";

  const businessTypeText =
    businessType === "Other" && businessTypeOther?.trim()
      ? `Other – ${businessTypeOther}`
      : businessType || "Not specified";

  const frequencyText =
    serviceFrequency === "Other" && serviceFrequencyOther?.trim()
      ? `Other – ${serviceFrequencyOther}`
      : serviceFrequency || "Not specified";

  const locationText = formatServiceLocation(businessServiceLocation);
  const vehicleTypesText = formatVehicleTypes(
    businessVehicleTypes,
    businessVehicleOtherLabel
  );
  const hearAboutText = formatHearAbout(hearAbout, hearAboutOther);
  const servicesText = formatServices(businessServices, businessServicesOther);

  // ====== UI classes (щоб було простіше міняти розміри централізовано) ======
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
          Please review your request before submitting. We&apos;ll contact you to
          confirm availability, pricing and any additional details.
        </p>

        {/* ==== BLOCK 1: CONTACT ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Contact information</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>{firstName || "—"}</div>
              <div className={infoBoxClass}>{lastName || "—"}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>{companyName || "Company name"}</div>
              <div className={infoBoxClass}>
                {companyAddress || "Company address"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={infoBoxClass}>{phone || "Phone"}</div>
              <div className={infoBoxClass}>{email || "Email"}</div>
            </div>

            <div className={infoBoxClass}>
              How did you hear about us: {hearAboutText}
            </div>
          </div>

          <button
            type="button"
            onClick={onEditContact}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change contact information
          </button>
        </section>

        {/* ==== BLOCK 2: VEHICLES & BUSINESS TYPE ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Business & vehicles</h3>

          <div className="space-y-3">
            <div className={infoBoxClass}>
              Vehicles needing detailing: {vehiclesText}
            </div>
            <div className={infoBoxClass}>Business type: {businessTypeText}</div>
          </div>

          <button
            type="button"
            onClick={onEditVehiclesBusinessType}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change business & vehicles information
          </button>
        </section>

        {/* ==== BLOCK 3: SERVICE FREQUENCY ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Service Frequency</h3>

          <div className={infoBoxClass}>{frequencyText}</div>

          <button
            type="button"
            onClick={onEditFrequency}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change service frequency
          </button>
        </section>

        {/* ==== BLOCK 4: VEHICLE TYPES ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Vehicle types</h3>

          <div className={infoBoxMultilineClass}>{vehicleTypesText}</div>

          <button
            type="button"
            onClick={onEditVehicleTypes}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change vehicle types
          </button>
        </section>

        {/* ==== BLOCK 5: SERVICE LOCATION ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Service location</h3>

          <div className={infoBoxMultilineClass}>{locationText}</div>

          <button
            type="button"
            onClick={onEditLocation}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change service location
          </button>
        </section>

        {/* ==== BLOCK 6: SERVICES INTERESTED IN ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Services you&apos;re interested in</h3>

          <div className={infoBoxMultilineClass}>{servicesText}</div>

          <button
            type="button"
            onClick={onEditServices}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change services selection
          </button>
        </section>

        {/* ==== BLOCK 7: TIMELINE ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Timeline</h3>

          <div className={infoBoxClass}>{businessStartDate || "Not specified"}</div>

          <button
            type="button"
            onClick={onEditTimeline}
            className={changeBtnClass}
            style={{ background: GOLD_GRADIENT }}
          >
            Change timeline
          </button>
        </section>

        {/* ==== BLOCK 8: ADDITIONAL INFO ==== */}
        <section className="space-y-4">
          <h3 className={sectionTitleClass}>Additional information</h3>

          <div className={infoBoxMultilineClass}>
            {businessNotes?.trim()
              ? businessNotes
              : "No additional information provided."}
          </div>

          <button
            type="button"
            onClick={onEditAdditionalInfo}
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
          {isSubmitting ? "Submitting..." : "Submit business detailing request"}
        </button>
      </div>
    </div>
  );
}
