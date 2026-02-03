import React, { useMemo, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

function Pill({ value }) {
  return (
    <div className="w-full rounded-[22px] bg-[#F4F4F5] px-6 py-4 text-[16px] sm:text-[17px] text-[#111827]">
      {value || "—"}
    </div>
  );
}

function SectionCard({
  title,
  open,
  onToggle,
  children,

  // NEW
  actions = [],

  // OLD (щоб не ламати інші секції)
  buttonLabel,
  onButton,
}) {
  const finalActions =
    actions?.length
      ? actions
      : buttonLabel && typeof onButton === "function"
      ? [{ label: buttonLabel, onClick: onButton }]
      : [];

  return (
    <div className="bg-white/70 rounded-[22px] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[15px] sm:text-[16px] font-semibold text-[#111827]">
          {title}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="w-10 h-10 rounded-full bg-[#F4F4F5] inline-flex items-center justify-center"
          aria-label="Toggle section"
        >
          <span
            className={`text-[18px] leading-none transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            ˄
          </span>
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          {children}

          {finalActions.length > 0 && (
            <div className="space-y-3">
              {finalActions.map((a, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={a.onClick}
                  className="w-full h-[56px] rounded-[88px] text-[15px] font-semibold text-[#18181B] shadow"
                  style={{ background: GOLD_GRADIENT }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const StepReview = ({
  visible,
  onBack,
  onSubmit,
  submitting = false,

  // щоб працювали Change...
  onEditSection,

  // vehicle (primary)
  year,
  make,
  model,
  color,
  seatMaterial,

  // condition
  lastDetailed,
  conditionFlags = [],
  conditionRating,
  otherConditionText,

  // services
  services = [],
  otherServiceText,

  // multiple vehicles
  multipleVehicles,
  vehicles = [],

  // location / timeline
  serviceLocation,
  completionDate,
  pickupAddress,

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

  const [openMap, setOpenMap] = useState({
    contact: true,
    vehicle: true,
    condition: true,
    services: true,
    location: true,
  });

  const toggle = (k) => setOpenMap((p) => ({ ...p, [k]: !p[k] }));

  const heardText = useMemo(() => {
    if (Array.isArray(heardAbout)) {
      return heardAbout.length ? heardAbout.join(", ") : "—";
    }
    if (typeof heardAbout === "string") {
      return heardAbout.trim() ? heardAbout.trim() : "—";
    }
    return "—";
  }, [heardAbout]);

  const locationMap = {
    drop_off: "Customer drop-off at our shop",
    pickup: "Danilets pick-up & drop-off",
    mobile: "Mobile service",
  };
  const locationText = locationMap[serviceLocation] || "—";

  const primaryColor = (color ?? "").trim() || "—";
  const primarySeat = (seatMaterial ?? "").trim() || "—";

  const servicesText =
    Array.isArray(services) && services.length ? services.join(", ") : "—";

  const servicesOther =
    Array.isArray(services) &&
    services.includes("Other") &&
    (otherServiceText || "").trim()
      ? (otherServiceText || "").trim()
      : "";

  const flagsArr = Array.isArray(conditionFlags) ? conditionFlags : [];
  const flagsText = flagsArr.length
    ? flagsArr.includes("Other") && (otherConditionText || "").trim()
      ? flagsArr
          .filter((f) => f !== "Other")
          .concat(`Other: ${(otherConditionText || "").trim()}`)
          .join(", ")
      : flagsArr.join(", ")
    : "—";

  const vehiclesArr = Array.isArray(vehicles) ? vehicles : [];

  const pickupAddr = (pickupAddress || "").trim();
  const showPickupAddr = serviceLocation === "pickup" && !!pickupAddr;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 lg:p-8 shadow space-y-5">
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
              Review & Submit
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

        {/* ===== PERSONAL INFO ===== */}
        <SectionCard
          title="Your personal information"
          open={openMap.contact}
          onToggle={() => toggle("contact")}
          buttonLabel="Change Personal Information"
          onButton={() => onEditSection?.("contact")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Pill value={firstName || "—"} />
            <Pill value={lastName || "—"} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Pill value={phone || "—"} />
            <Pill value={email || "—"} />
          </div>

          <Pill value={heardText} />
          {extraInfo ? <Pill value={extraInfo} /> : null}
        </SectionCard>

        {/* ===== CAR INFO ===== */}
        <SectionCard
          title="Your car information"
          open={openMap.vehicle}
          onToggle={() => toggle("vehicle")}
          actions={[
            {
              label: "Change Car Information",
              onClick: () => onEditSection?.("vehicle"),
            },
            {
              label: "Change Multiple Vehicles",
              onClick: () => onEditSection?.("multiple"),
            },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Pill value={year ? `${year} year` : "—"} />
            <Pill value={make || "—"} />
          </div>

          <Pill value={model || "—"} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Pill value={primaryColor} />
            <Pill value={primarySeat} />
          </div>

          {multipleVehicles && vehiclesArr.length > 0 && (
            <div className="space-y-2">
              <div className="text-[12px] text-[#6B7280] font-medium">
                Additional vehicles
              </div>

              <div className="space-y-2">
                {vehiclesArr.map((v, idx) => {
                  const t = [v?.year, v?.make, v?.model]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <div
                      key={idx}
                      className="w-full rounded-[16px] bg-[#F4F4F5] px-4 py-3 text-[13px] text-[#111827]"
                    >
                      <span className="font-semibold">
                        Vehicle {idx + 2}:{" "}
                      </span>
                      {t || "—"}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ===== CONDITION ===== */}
        <SectionCard
          title="Vehicle condition"
          open={openMap.condition}
          onToggle={() => toggle("condition")}
          buttonLabel="Change Vehicle Condition"
          onButton={() => onEditSection?.("condition")}
        >
          <Pill value={lastDetailed ? `Last detailed: ${lastDetailed}` : "—"} />
          <Pill value={conditionRating || "—"} />
          <Pill value={flagsText} />
        </SectionCard>

        {/* ===== SERVICES ===== */}
        <SectionCard
          title="Services"
          open={openMap.services}
          onToggle={() => toggle("services")}
          buttonLabel="Change Services"
          onButton={() => onEditSection?.("services")}
        >
          <Pill value={servicesText} />
          {servicesOther ? <Pill value={`Other: ${servicesOther}`} /> : null}
        </SectionCard>

        {/* ===== LOCATION & TIMELINE ===== */}
        <SectionCard
          title="Service location & timeline"
          open={openMap.location}
          onToggle={() => toggle("location")}
          buttonLabel="Change Location & Timeline"
          onButton={() => onEditSection?.("location")}
        >
          <Pill value={locationText} />

          {/* ✅ pickup address показуємо тільки якщо pickup */}
          {showPickupAddr ? <Pill value={pickupAddr} /> : null}

          <Pill value={completionDate || "—"} />
        </SectionCard>

        {/* SUBMIT */}
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
