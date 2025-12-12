// src/Components/Booking/Detailing/Personal/StepReview.jsx

import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepReview = ({
  visible,
  onBack,
  onSubmit,
  submitting = false,

  // vehicle
  year,
  make,
  model,
  color,
  seatMaterial,

  // history / condition
  lastDetailed,
  conditionFlags = [],
  conditionRating,

  // services
  services = [],
  multipleVehicles,
  vehicles = [],

  // location / timeline
  serviceLocation,
  completionDate,

  // contact
  firstName,
  lastName,
  phone,
  email,
  heardAbout = [],
  extraInfo,

  renderProgress,
  progressStepIndex = 11,
  totalSteps = 11,
}) => {
  if (!visible) return null;

  const vehicleTitle = [year, make, model].filter(Boolean).join(" ");

  const seatText = seatMaterial || "—";
  const colorText = color || "—";

  const historyLines = [
    lastDetailed ? `Last detailed: ${lastDetailed}` : null,
    conditionFlags?.length
      ? `Specific issues / contamination: ${conditionFlags.join(", ")}`
      : null,
    conditionRating ? `Overall condition: ${conditionRating}` : null,
  ].filter(Boolean);

  const servicesText = services.length
    ? services.join(", ")
    : "No services selected";

  let heardText = "—";

  if (Array.isArray(heardAbout)) {
    heardText = heardAbout.length ? heardAbout.join(", ") : "—";
  } else if (typeof heardAbout === "string") {
    heardText = heardAbout.trim() ? heardAbout : "—";
  }

  const locationMap = {
    drop_off: "Customer drop-off at our shop",
    pickup: "Danilets pick-up & drop-off",
  };

  const locationText = locationMap[serviceLocation] || "Not specified";

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 lg:p-8 shadow space-y-6">
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
          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Review & submit
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF] mt-0.5">
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

        <p className="text-sm sm:text-[15px] text-[#4B5563]">
          Please review your request before submitting. We&apos;ll contact you
          to confirm availability, pricing and any additional details.
        </p>

        {/* VEHICLE INFO */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-[15px] font-semibold text-[#6B7280]">
              Vehicle information
            </h3>
          </div>

          <div className="space-y-2">
            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
              {vehicleTitle || "Not specified"}
            </div>

            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
              {colorText}
            </div>

            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
              {seatText}
            </div>
          </div>
        </section>

        {/* HISTORY & CONDITION */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-[15px] font-semibold text-[#6B7280]">
              Vehicle history & condition
            </h3>
          </div>

          <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[13px] sm:text-[14px] text-[#111827] space-y-1">
            {historyLines.length ? (
              historyLines.map((line, idx) => <div key={idx}>{line}</div>)
            ) : (
              <div>Not specified</div>
            )}
          </div>
        </section>

        {/* SERVICES */}
        <section className="space-y-2">
          <h3 className="text-sm sm:text-[15px] font-semibold text-[#6B7280]">
            Services you&apos;re interested in
          </h3>

          <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
            {servicesText}
          </div>

          {multipleVehicles && vehicles?.length > 0 && (
            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[13px] sm:text-[14px] text-[#111827] space-y-1">
              {vehicles.map((v, i) => (
                <div key={i}>
                  <span className="font-semibold">Vehicle {i + 1}: </span>
                  {v.model || "—"}
                  {v.services?.length ? ` — ${v.services.join(", ")}` : ""}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LOCATION & TIMELINE */}
        <section className="space-y-2">
          <h3 className="text-sm sm:text-[15px] font-semibold text-[#6B7280]">
            Location & timeline
          </h3>

          <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
            {locationText}
          </div>

          <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
            {completionDate || "Preferred completion date not specified"}
          </div>
        </section>

        {/* CONTACT DETAILS */}
        <section className="space-y-2">
          <h3 className="text-sm sm:text-[15px] font-semibold text-[#6B7280]">
            Your contact details
          </h3>

          <div className="space-y-2">
            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
              {[firstName, lastName].filter(Boolean).join(" ") || "—"}
            </div>
            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
              {phone || "—"}
            </div>
            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[14px] sm:text-[15px] text-[#111827]">
              {email || "—"}
            </div>
          </div>

          <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[13px] sm:text-[14px] text-[#111827] space-y-1">
            <div className="font-semibold">How did you hear about us?</div>
            <div>{heardText}</div>
          </div>

          {extraInfo && (
            <div className="w-full rounded-[12px] bg-[#F5F5F6] px-4 py-3 text-[13px] sm:text-[14px] text-[#111827] space-y-1">
              <div className="font-semibold">Additional information</div>
              <div>{extraInfo}</div>
            </div>
          )}
        </section>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className={`w-full h-[52px] sm:h-[56px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6 ${
            submitting ? "opacity-60 cursor-not-allowed" : ""
          }`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>{submitting ? "Submitting..." : "Submit request"}</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepReview;
