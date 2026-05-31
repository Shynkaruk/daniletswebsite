// src/Components/Booking/StepDetailingBusinessVehiclesServices.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// Section 5: Vehicle Types
const VEHICLE_TYPE_OPTIONS = [
  { key: "sedans", label: "Sedans" },
  { key: "suvs", label: "SUVs" },
  { key: "pickups", label: "Pick-Ups" },
  { key: "minivans", label: "Mini-Vans / 3-Row SUVs" },
  { key: "transit_vans", label: "Transit Vans" },
  { key: "semi_trucks", label: "Semi-Trucks" },
  { key: "other", label: "Other" },
];

// Section 6: Service Location (для бізнесу / флоту)
const BUSINESS_LOCATION_OPTIONS = [
  {
    key: "on_site",
    label: "At your business location",
    subtitle: "Our team comes to you",
  },
  {
    key: "drop_off",
    label: "Drop-off at Danilets facility",
    subtitle: "You bring vehicles to our shop",
  },
  {
    key: "mixed",
    label: "Combination of both",
    subtitle: "Some vehicles on-site, some at our facility",
  },
];

// Section 7: Services (можна реюзати базові detailing-послуги)
const BUSINESS_SERVICES_OPTIONS = [
  "Interior Only",
  "Exterior Only",
  "Interior & Exterior",
  "Ceramic Coating",
  "Machine Polish and Wax",
  "Glass Coating",
  "Wheel Coating",
  "Headlight Restoration",
  "Trim Restoration",
  "Metal Polish",
  "Decal and Sticker Removal",
  "Window Tinting",
  "PPF/Wrapping",
  "Maintenance Wash Program",
  "Other",
];

const StepDetailingBusinessVehiclesServices = ({
  visible,
  onBack,
  onNext,

  // Section 5 – Vehicle Types (object з кількостями)
  // приклад структури в Booking:
  // { sedans: "2", suvs: "5", pickups: "", minivans: "1", transit_vans: "", semi_trucks: "3", other: "0" }
  businessVehicleTypes,
  setBusinessVehicleTypes,

  // підпис для "Other"
  businessVehicleOtherLabel,
  setBusinessVehicleOtherLabel,

  // Section 6 – Location
  businessServiceLocation, // "on_site" | "drop_off" | "mixed" | ""
  setBusinessServiceLocation,

  // Section 7 – Services
  businessServices, // array of strings
  setBusinessServices,
  businessServicesOther, // string для "Other"
  setBusinessServicesOther,

  renderProgress,
  totalSteps = 6, // загальна кількість кроків у бізнес-флоу
}) => {
  if (!visible) return null;

  const toggleInArray = (arr, value) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const handleVehicleCountChange = (key, value) => {
    // дозволяємо пусте значення, щоб юзер міг стерти
    if (value === "") {
      setBusinessVehicleTypes((prev) => ({
        ...prev,
        [key]: "",
      }));
      return;
    }

    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return;

    setBusinessVehicleTypes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggleService = (name) => {
    setBusinessServices((prev) => toggleInArray(prev, name));
  };

  // ===== ВАЛІДАЦІЯ =====

  // принаймні один тип авто з кількістю > 0
  const totalVehicles = VEHICLE_TYPE_OPTIONS.reduce((sum, opt) => {
    const raw = businessVehicleTypes?.[opt.key] ?? "";
    const num = Number(raw) || 0;
    return sum + num;
  }, 0);

  const hasAnyVehicle = totalVehicles > 0;

  // якщо є "Other" з кількістю > 0 — тоді підпис обов'язковий
  const otherCount = Number(businessVehicleTypes?.other ?? 0) || 0;
  const otherNeedsLabel = otherCount > 0 && !businessVehicleOtherLabel.trim();

  const hasLocation = !!businessServiceLocation;

  const hasServicesBase = businessServices.length > 0;
  const servicesHasOther =
    businessServices.includes("Other") && !businessServicesOther.trim()
      ? false
      : true;

  const canContinue =
    hasAnyVehicle && !otherNeedsLabel && hasLocation && hasServicesBase && servicesHasOther;

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
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
            Fleet setup & services
          </h2>
        </div>

        {/* Прогрес: умовно це другий бізнес-крок */}
        {renderProgress ? (
          renderProgress(2)
        ) : (
          <ProgressBar activeCount={2} total={totalSteps} />
        )}

        {/* Section 5: Vehicle Types */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            What types of vehicles need detailing? (enter quantity for each that applies) *
          </div>

          <div className="space-y-2">
            {VEHICLE_TYPE_OPTIONS.map((opt) => (
              <div
                key={opt.key}
                className="flex items-center justify-between gap-3 bg-[#F9FAFB] rounded-[16px] px-3 py-2"
              >
                <span className="text-[13px] sm:text-[14px] text-[#111827]">
                  {opt.label}
                </span>
                <input
                  type="number"
                  min="0"
                  value={businessVehicleTypes?.[opt.key] ?? ""}
                  onChange={(e) =>
                    handleVehicleCountChange(opt.key, e.target.value)
                  }
                  className="w-[90px] h-[36px] rounded-[12px] bg-white border border-[#E5E7EB] px-3 text-[13px] text-right outline-none"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {!hasAnyVehicle && (
            <p className="text-[12px] text-red-500 mt-1">
              Please enter at least one vehicle.
            </p>
          )}

          {otherCount > 0 && (
            <input
              type="text"
              value={businessVehicleOtherLabel}
              onChange={(e) => setBusinessVehicleOtherLabel(e.target.value)}
              placeholder="Please specify other vehicle type"
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none mt-2"
            />
          )}

          {otherNeedsLabel && (
            <p className="text-[12px] text-red-500 mt-1">
              Please specify the other vehicle type.
            </p>
          )}
        </section>

        {/* Section 6: Service Location */}
        <section className="space-y-2">
          <div className="text-sm text-[#6B7280] font-medium">
            Where would you like the services to be performed? *
          </div>

          <div className="space-y-2">
            {BUSINESS_LOCATION_OPTIONS.map((opt) => {
              const active = businessServiceLocation === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setBusinessServiceLocation(opt.key)}
                  className={`w-full text-left rounded-[20px] border px-4 py-3 sm:px-5 sm:py-4
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  <div className="text-sm sm:text-[15px] font-semibold">
                    {opt.label}
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#4B5563] mt-0.5">
                    {opt.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 7: Services */}
        <section className="space-y-2">
          <div className="text-sm text-[#6B7280] font-medium">
            What services are you interested in for your fleet? (select all that apply) *
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BUSINESS_SERVICES_OPTIONS.map((opt) => {
              const active = businessServices.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggleService(opt)}
                  className={`min-h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] font-medium px-3 py-1 text-left
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

          {businessServices.includes("Other") && (
            <input
              type="text"
              value={businessServicesOther}
              onChange={(e) => setBusinessServicesOther(e.target.value)}
              placeholder="Please specify other services you need"
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none mt-2"
            />
          )}

          {!hasServicesBase && (
            <p className="text-[12px] text-red-500 mt-1">
              Please select at least one service.
            </p>
          )}

          {!servicesHasOther && (
            <p className="text-[12px] text-red-500 mt-1">
              Please specify the other service.
            </p>
          )}
        </section>

        {/* Кнопка Continue */}
        <button
          onClick={onNext}
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

export default StepDetailingBusinessVehiclesServices;
