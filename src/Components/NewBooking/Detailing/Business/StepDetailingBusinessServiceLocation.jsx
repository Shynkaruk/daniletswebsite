import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { AddressAutocomplete } from "./AddressAutocomplete";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const OPTIONS = [
  {
    key: "drop_off",
    label: "Customer Drop-Off",
    subtitle: "Vehicles brought to our facility",
  },
  {
    key: "pickup",
    label: "Danilets Pick-Up & Drop-Off",
    subtitle: "$5/mile from our facility",
  },
  {
    key: "mobile",
    label: "Mobile Service",
    subtitle: "We come to your location",
  },
];

export default function StepDetailingBusinessServiceLocation({
  visible,
  onBack,
  onNext,

  businessServiceLocation,
  setBusinessServiceLocation,

  // ✅ NEW: адреса для pickup/mobile (можеш назвати як хочеш)
  pickupAddress,
  setPickupAddress,

  businessVehiclesCount,
  renderProgress,
  progressStepIndex = 6,
  totalSteps = 11,
}) {
  if (!visible) return null;

  // SAFE values
  const loc = businessServiceLocation ?? "";
  const addr = pickupAddress ?? "";

  const vehiclesNum = Number(businessVehiclesCount || 0);

  const isPickupSelected = loc === "pickup";
  const isMobileSelected = loc === "mobile";

  // твоє правило для mobile
  const mobileNotAllowed =
    isMobileSelected && vehiclesNum > 0 && vehiclesNum < 3;

  // ✅ адреса потрібна тільки для pickup (і за бажанням можеш також для mobile)
  const addressRequired = isPickupSelected; // або: isPickupSelected || isMobileSelected
  const addressValid = !addressRequired || addr.trim().length >= 5;

  const canContinue = !!loc && !mobileNotAllowed && addressValid;

  const handleSelect = (key) => {
    setBusinessServiceLocation?.(key);

    // якщо людина пішла з pickup/mobile — можна очищати адресу (по бажанню)
    if (key !== "pickup" /* && key !== "mobile" */) {
      setPickupAddress?.("");
    }
  };

  const inputClass =
    "w-full h-[52px] rounded-[16px] bg-[#F4F4F5] px-4 text-[15px] outline-none";

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-5 sm:p-6 lg:p-8 shadow space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Service Location 
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
        <section className="space-y-3">
          <div className="text-sm text-[#6B7280] font-medium">
            Where would you like the service performed? (required)
          </div>

          <div className="space-y-2">
            {OPTIONS.map((opt) => {
              const active = loc === opt.key;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelect(opt.key)}
                  className={`
                    w-full text-left rounded-[18px] border px-4 py-3 sm:px-5 sm:py-4
                    inline-flex items-center justify-between gap-3
                    ${
                      active
                        ? "border-transparent text-[#111827]"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }
                  `}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] sm:text-[15px] font-semibold">
                      {opt.label}
                    </span>
                    <span className="text-[11px] sm:text-[12px] text-[#4B5563]">
                      {opt.subtitle}
                    </span>
                  </div>

                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[14px]
                      ${
                        active
                          ? "border-white/80 bg-white/80"
                          : "border-[#D4D4D8] bg-white"
                      }
                    `}
                  >
                    {active ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ✅ Показуємо інпут адреси тільки коли вибрали pickup */}
          {isPickupSelected && (
            <div className="pt-2 space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Enter your address *
              </div>

              <AddressAutocomplete
                value={addr}
                onChange={(v) => setPickupAddress?.(v)}
                onSelectAddress={(formatted) => setPickupAddress?.(formatted)}
                inputClass={inputClass}
                placeholder="Enter your address"
              />

              {!addressValid && (
                <p className="text-xs text-red-500">
                  Please enter your address to continue
                </p>
              )}
            </div>
          )}

          {/* Warning для Mobile service */}
          {isMobileSelected && (
            <div className="mt-2 flex items-start gap-2 rounded-[16px] bg-[#FEF3C7] px-3 py-2 text-[12px] sm:text-[13px] text-[#92400E]">
              <span className="mt-[2px] text-[14px]">⚠️</span>
              <span>
                We only offer mobile service for 3 or more vehicles.
                {vehiclesNum > 0 && vehiclesNum < 3 && (
                  <>
                    {" "}
                    Please adjust the number of vehicles or choose a different
                    location option.
                  </>
                )}
              </span>
            </div>
          )}
        </section>

        {/* CONTINUE */}
        <button
          type="button"
          onClick={() => {
            if (!canContinue) return;
            onNext?.();
          }}
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
