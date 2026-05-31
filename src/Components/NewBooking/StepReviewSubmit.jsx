import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-4 sm:p-5 space-y-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
    <div className="flex items-center justify-between">
      <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#18181B]">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

// “поле” як на скріні – сіра плашка з лейблом і значенням
const Row = ({ label, value }) => (
  <div className="w-full bg-[#F4F4F5] rounded-[999px] px-4 py-2.5 flex flex-col justify-center">
    <span className="text-[11px] sm:text-[12px] font-medium text-[#9CA3AF] leading-none mb-1">
      {label}
    </span>
    <span className="text-[13px] sm:text-[14px] font-semibold text-[#18181B] truncate">
      {value || "—"}
    </span>
  </div>
);

const StepReviewSubmit = ({
  visible,
  onBack,
  onSubmit,

  // 1. Vehicle
  year,
  make,
  model,

  // 2. History
  lastDetailed,
  conditionFlags,
  conditionRating,

  // 3. Services
  services,
  multipleVehicles,
  vehicles,

  // 4. Location
  serviceLocation,
  completionDate,

  // 5. Contact
  firstName,
  lastName,
  phone,
  email,
  heardAbout,
  extraInfo,

  // Progress
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const locationLabel =
    serviceLocation === "drop_off"
      ? "Customer drop-off"
      : serviceLocation === "pickup"
      ? "Danilets pick-up & drop-off"
      : serviceLocation || "";

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
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
            Review your request
          </h2>
        </div>

        {/* PROGRESS */}
        <ProgressBar activeCount={6} total={totalSteps} />

        {/* VEHICLE INFO */}
        <SectionCard title="Your car information">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Row label="Year" value={year} />
            <Row label="Make" value={make} />
            <Row label="Model" value={model} />
          </div>
        </SectionCard>

        {/* HISTORY & CONDITION */}
        <SectionCard title="Vehicle history & condition">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Row label="Last detailed" value={lastDetailed} />
            <Row label="Condition rating" value={conditionRating} />
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
              Issues found
            </div>
            {conditionFlags?.length ? (
              <div className="bg-[#F4F4F5] rounded-[20px] px-4 py-3">
                <ul className="list-disc pl-5 text-[13px] sm:text-[14px] text-[#18181B] space-y-0.5">
                  {conditionFlags.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[13px] sm:text-[14px] text-[#4B5563]">
                No issues selected.
              </p>
            )}
          </div>
        </SectionCard>

        {/* SERVICES */}
        <SectionCard title="Selected services">
          <div className="space-y-3">
            <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
              Primary vehicle
            </div>
            <div className="bg-[#F4F4F5] rounded-[20px] px-4 py-3">
              {services?.length ? (
                <ul className="list-disc pl-5 text-[13px] sm:text-[14px] text-[#18181B] space-y-0.5">
                  {services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] sm:text-[14px] text-[#4B5563]">
                  No services selected.
                </p>
              )}
            </div>

            {multipleVehicles && (
              <div className="space-y-3 pt-1">
                <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
                  Additional vehicles
                </div>
                {vehicles.map((v, i) => (
                  <div
                    key={i}
                    className="bg-[#F4F4F5] rounded-[20px] px-4 py-3 text-[13px] sm:text-[14px]"
                  >
                    <p className="font-semibold text-[#111827] mb-1">
                      Vehicle {i + 1}
                      {v.model ? ` — ${v.model}` : ""}
                    </p>
                    {(v.services || []).length ? (
                      <ul className="list-disc pl-5 text-[#18181B] space-y-0.5">
                        {v.services.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#4B5563]">No services selected.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* LOCATION */}
        <SectionCard title="Service location & date">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Row label="Location" value={locationLabel} />
            <Row label="Preferred date" value={completionDate} />
          </div>
        </SectionCard>

        {/* CONTACT */}
        <SectionCard title="Your personal information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Row label="First name" value={firstName} />
            <Row label="Last name" value={lastName} />
            <Row label="Phone" value={phone} />
            <Row label="Email" value={email} />
            <Row label="Heard about us" value={heardAbout} />
          </div>

          {extraInfo ? (
            <div className="mt-3 space-y-1">
              <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
                Additional info
              </div>
              <div className="bg-[#F4F4F5] rounded-[20px] px-4 py-3 text-[13px] sm:text-[14px] text-[#18181B]">
                {extraInfo}
              </div>
            </div>
          ) : null}
        </SectionCard>

        {/* SUBMIT BUTTON */}
        <button
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

export default StepReviewSubmit;
