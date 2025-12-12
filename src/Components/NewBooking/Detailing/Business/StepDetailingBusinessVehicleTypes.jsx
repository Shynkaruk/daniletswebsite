import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// Мапа: ключ у стейті -> текст у формі
const VEHICLE_TYPE_CONFIG = [
  { key: "sedans", label: "Sedans" },
  { key: "suvs", label: "SUVs" },
  { key: "pickups", label: "Pick-Ups" },
  { key: "minivans", label: "Mini-Vans/3-Row SUVs" },
  { key: "transit_vans", label: "Transit Vans" },
  { key: "semi_trucks", label: "Semi-Trucks" },
  { key: "other", label: "Other (please specify)" },
];

export default function StepDetailingBusinessVehicleTypes({
  visible,
  onBack,
  onNext,

  businessVehicleTypes,
  setBusinessVehicleTypes,
  businessVehicleOtherLabel,
  setBusinessVehicleOtherLabel,

  renderProgress,
  progressStepIndex = 5,
  totalSteps = 11,
}) {
  if (!visible) return null;

  const inputClass =
    "w-full h-[44px] rounded-[14px] bg-[#F4F4F5] px-3 text-[14px] outline-none";

  const getCount = (key) => businessVehicleTypes?.[key] || "";

  const setCount = (key, value) => {
    const numeric = value.replace(/[^\d]/g, "");
    setBusinessVehicleTypes((prev) => ({
      ...prev,
      [key]: numeric,
    }));
  };

  const isSelected = (key) => {
    const num = Number(getCount(key) || 0);
    return num > 0;
  };

  const toggleType = (key) => {
    // Якщо не вибраний – включаємо та ставимо 1 за замовчуванням
    if (!isSelected(key)) {
      setBusinessVehicleTypes((prev) => ({
        ...prev,
        [key]: prev[key] && Number(prev[key]) > 0 ? prev[key] : "1",
      }));
    } else {
      // Якщо вже вибраний – очищаємо
      setBusinessVehicleTypes((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  // Порахуємо загальну кількість авто
  const totalVehicles = Object.values(businessVehicleTypes || {}).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );

  const otherCount = Number(businessVehicleTypes?.other || 0);

  const canContinue =
    totalVehicles > 0 &&
    (otherCount > 0 ? businessVehicleOtherLabel.trim() : true);

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-5 sm:p-6 lg:p-8 shadow space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Vehicle types
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF]">
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

        {/* QUESTION */}
        <section className="space-y-4">
          <div className="text-sm text-[#6B7280] font-medium">
            What types of vehicles need detailing? (Select all that apply)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VEHICLE_TYPE_CONFIG.map(({ key, label }) => {
              const active = isSelected(key);

              return (
                <div
                  key={key}
                  className={`rounded-[18px] border p-3 sm:p-4 space-y-2 cursor-pointer transition
                    ${
                      active
                        ? "border-transparent text-[#111827]"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                  onClick={() => toggleType(key)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[14px] sm:text-[15px] font-semibold">
                      {label}
                    </div>
                    <div className="text-[11px] text-[#4B5563] sm:text-[12px]">
                      {active ? "Selected" : "Tap to select"}
                    </div>
                  </div>

                  {/* Для всіх, крім Other – тільки число */}
                  {key !== "other" && active && (
                    <div className="mt-2">
                      <div className="text-[12px] text-[#6B7280] mb-1">
                        Approx. number of vehicles
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={getCount(key)}
                        onChange={(e) => setCount(key, e.target.value)}
                        className={inputClass}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g. 5"
                      />
                    </div>
                  )}

                  {/* Other: назва + число */}
                  {key === "other" && active && (
                    <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <div className="text-[12px] text-[#6B7280] mb-1">
                          What other vehicle type?
                        </div>
                        <input
                          value={businessVehicleOtherLabel}
                          onChange={(e) =>
                            setBusinessVehicleOtherLabel(e.target.value)
                          }
                          className={inputClass}
                          placeholder="e.g. Buses, trailers, etc."
                        />
                      </div>

                      <div>
                        <div className="text-[12px] text-[#6B7280] mb-1">
                          Approx. number of these vehicles
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={getCount("other")}
                          onChange={(e) => setCount("other", e.target.value)}
                          className={inputClass}
                          placeholder="e.g. 3"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error під блоком, якщо нічого не вибрано */}
          {totalVehicles === 0 && (
            <p className="text-xs text-red-500">
              Please select at least one vehicle type and specify quantity.
            </p>
          )}

          {otherCount > 0 && !businessVehicleOtherLabel.trim() && (
            <p className="text-xs text-red-500">
              Please specify what &quot;Other&quot; vehicle type is.
            </p>
          )}
        </section>

        {/* CONTINUE */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`
            w-full h-[52px] sm:h-[56px] rounded-[88px] font-semibold text-black shadow
            inline-flex items-center justify-between px-6
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}
          `}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
