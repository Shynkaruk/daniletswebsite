// src/Components/Booking/StepDetailingBusinessReview.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const CONTACT_METHOD_OPTIONS = [
  "Phone Call",
  "Text Message",
  "Email",
];

const CONTACT_TIME_OPTIONS = [
  "Morning",
  "Afternoon",
  "Evening",
];

const StepDetailingBusinessReview = ({
  visible,
  onBack,
  onSubmit,
  isSubmitting = false,

  // ==== BUSINESS DATA (все, що назбирали на попередніх кроках) ====

  // Step 1 – Business Details
  businessVehiclesCount,
  businessType,
  businessTypeOther,
  serviceFrequency,
  serviceFrequencyOther,

  // Step 2 – Contact Info
  firstName,
  lastName,
  companyName,
  companyAddress,
  phone,
  email,
  hearAbout,
  hearAboutOther,

  // Step 3 – Fleet & Services
  businessVehicleTypes,
  businessVehicleOtherLabel,
  businessServiceLocation,
  businessServices,
  businessServicesOther,

  // Final step – preferences & notes
  businessNotes,
  setBusinessNotes,
  preferredContactMethod,
  setPreferredContactMethod,
  contactTimePreference,
  setContactTimePreference,

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const fullBusinessType =
    businessType === "Other" && businessTypeOther
      ? `${businessType} – ${businessTypeOther}`
      : businessType;

  const fullFrequency =
    serviceFrequency === "Other" && serviceFrequencyOther
      ? `${serviceFrequency} – ${serviceFrequencyOther}`
      : serviceFrequency;

  const fullHearAbout =
    hearAbout === "Other" && hearAboutOther
      ? `${hearAbout} – ${hearAboutOther}`
      : hearAbout;

  const fullServices =
    businessServices && businessServices.length
      ? businessServices.join(", ")
      : "Not selected";

  const canSubmit =
    !isSubmitting &&
    preferredContactMethod &&
    contactTimePreference;

  // красивий вивід типів авто
  const vehicleTypesSummary = () => {
    if (!businessVehicleTypes) return "Not specified";

    const entries = Object.entries(businessVehicleTypes)
      .filter(([, value]) => Number(value) > 0)
      .map(([key, value]) => {
        let label = "";
        switch (key) {
          case "sedans":
            label = "Sedans";
            break;
          case "suvs":
            label = "SUVs";
            break;
          case "pickups":
            label = "Pick-Ups";
            break;
          case "minivans":
            label = "Mini-Vans / 3-Row SUVs";
            break;
          case "transit_vans":
            label = "Transit Vans";
            break;
          case "semi_trucks":
            label = "Semi-Trucks";
            break;
          case "other":
            label = businessVehicleOtherLabel || "Other";
            break;
          default:
            label = key;
        }
        return `${label}: ${value}`;
      });

    if (!entries.length) return "Not specified";
    return entries.join(" | ");
  };

  const renderLocationLabel = () => {
    switch (businessServiceLocation) {
      case "on_site":
        return "At your business location";
      case "drop_off":
        return "Drop-off at Danilets facility";
      case "mixed":
        return "Combination (on-site & drop-off)";
      default:
        return "Not selected";
    }
  };

  const handleSubmitClick = () => {
    if (!canSubmit) return;
    onSubmit && onSubmit();
  };

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
              Review your request
            </h2>
            <p className="text-xs sm:text-[13px] text-[#6B7280] mt-0.5">
              This is an interest form. Our team will follow up with a quote and scheduling options.
            </p>
          </div>
        </div>

        {/* Прогрес: фінальний крок */}
        {renderProgress ? (
          renderProgress(totalSteps)
        ) : (
          <ProgressBar activeCount={totalSteps} total={totalSteps} />
        )}

        {/* Contact & Business Summary */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#111827]">
            Contact & Business details
          </h3>
          <div className="bg-[#F9FAFB] rounded-[16px] p-3 sm:p-4 space-y-1 text-[13px] sm:text-[14px] text-[#111827]">
            <div>
              <span className="font-medium">Name: </span>
              {firstName} {lastName}
            </div>
            <div>
              <span className="font-medium">Company: </span>
              {companyName || "—"}
            </div>
            <div>
              <span className="font-medium">Address: </span>
              {companyAddress || "—"}
            </div>
            <div>
              <span className="font-medium">Phone: </span>
              {phone || "—"}
            </div>
            <div>
              <span className="font-medium">Email: </span>
              {email || "—"}
            </div>
            <div>
              <span className="font-medium">How did you hear about us: </span>
              {fullHearAbout || "—"}
            </div>
            <div>
              <span className="font-medium">Business type: </span>
              {fullBusinessType || "—"}
            </div>
            <div>
              <span className="font-medium">Number of vehicles: </span>
              {businessVehiclesCount || "—"}
            </div>
            <div>
              <span className="font-medium">Service frequency: </span>
              {fullFrequency || "—"}
            </div>
          </div>
        </section>

        {/* Fleet & Services Summary */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#111827]">
            Fleet & services
          </h3>
          <div className="bg-[#F9FAFB] rounded-[16px] p-3 sm:p-4 space-y-1 text-[13px] sm:text-[14px] text-[#111827]">
            <div>
              <span className="font-medium">Vehicle types: </span>
              {vehicleTypesSummary()}
            </div>
            <div>
              <span className="font-medium">Service location: </span>
              {renderLocationLabel()}
            </div>
            <div>
              <span className="font-medium">Requested services: </span>
              {fullServices}
            </div>
            {businessServices.includes("Other") && businessServicesOther && (
              <div>
                <span className="font-medium">Other services: </span>
                {businessServicesOther}
              </div>
            )}
          </div>
        </section>

        {/* Preferences & Notes */}
        <section className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Preferred contact method *
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CONTACT_METHOD_OPTIONS.map((opt) => {
                const active = preferredContactMethod === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPreferredContactMethod(opt)}
                    className={`h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] font-medium px-3
                      ${
                        active
                          ? "border-transparent text-black"
                          : "border-[#E5E7EB] text-[#4B5563] bg-white"
                      }`}
                    style={{ background: active ? GOLD_GRADIENT : undefined }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Best time to reach you *
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CONTACT_TIME_OPTIONS.map((opt) => {
                const active = contactTimePreference === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setContactTimePreference(opt)}
                    className={`h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] font-medium px-3
                      ${
                        active
                          ? "border-transparent text-black"
                          : "border-[#E5E7EB] text-[#4B5563] bg-white"
                      }`}
                    style={{ background: active ? GOLD_GRADIENT : undefined }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Submit button */}
        <button
          onClick={handleSubmitClick}
          disabled={!canSubmit}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6
            ${!canSubmit ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>{isSubmitting ? "Submitting..." : "Submit request"}</span>
          <span className="text-lg">›</span>
        </button>

        <p className="text-[11px] sm:text-[12px] text-[#9CA3AF] text-center">
          By submitting this form, you’re requesting a quote for business / fleet detailing services. 
          Our team will contact you to confirm details and next steps.
        </p>
      </div>
    </div>
  );
};

export default StepDetailingBusinessReview;
