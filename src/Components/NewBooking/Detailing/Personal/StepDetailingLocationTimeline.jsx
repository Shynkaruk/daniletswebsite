// src/Components/Booking/StepDetailingLocationTimeline.jsx
import React, { useEffect, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { AddressAutocomplete } from "../Business/AddressAutocomplete"; 
// ⚠️ шлях перевір: якщо AddressAutocomplete лежить в src/Components/AddressAutocomplete.jsx
// тоді буде: import { AddressAutocomplete } from "../AddressAutocomplete";
// якщо він в src/Components/Booking/AddressAutocomplete.jsx -> "./AddressAutocomplete"

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// варіанти місця проведення
const LOCATION_OPTIONS = [
  {
    key: "drop_off",
    label: "Customer drop-off",
    subtitle: "You bring the vehicle to our facility",
  },
  {
    key: "pickup",
    label: "Danilets pick-up & drop-off",
    subtitle: "$5/mile from our facility",
  },
];

// --- Google Places loader (щоб autocomplete працював) ---
let __gmapsPromise = null;
function loadGooglePlaces() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (window.google?.maps?.places) return Promise.resolve(true);
  if (__gmapsPromise) return __gmapsPromise;
  if (!key) return Promise.resolve(false);

  __gmapsPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-gmaps="places"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-gmaps", "places");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return __gmapsPromise;
}

const StepDetailingLocationTimeline = ({
  visible,
  onBack,
  onNext,

  serviceLocation, // "drop_off" | "pickup" | ""
  setServiceLocation,

  // ✅ нове: адреса для pick-up
  pickupAddress,
  setPickupAddress,

  renderProgress,
  totalSteps = 6,
}) => {
  // ✅ хуки завжди зверху (не робимо return null до них)
  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!visible) return;

    loadGooglePlaces().then((ok) => {
      if (cancelled) return;
      setPlacesReady(!!ok);
    });

    return () => {
      cancelled = true;
    };
  }, [visible]);

  const inputClass =
    "w-full h-[52px] rounded-[16px] bg-[#F4F4F5] px-4 text-[15px] outline-none";

  const addr = pickupAddress ?? "";

  const canContinue =
    !!serviceLocation &&
    (serviceLocation !== "pickup" || addr.trim().length > 0);

  const handleContinue = () => {
    if (!canContinue) return;
    onNext?.();
  };

  if (!visible) return null;

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
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B] uppercase">
            Service Location
          </h2>
        </div>

        {/* Прогрес */}
        {renderProgress ? (
          renderProgress(4)
        ) : (
          <ProgressBar activeCount={4} total={totalSteps} />
        )}

        {/* Location */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            Where would you like the service performed?
          </div>

          <div className="space-y-2">
            {LOCATION_OPTIONS.map((opt) => {
              const active = serviceLocation === opt.key;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setServiceLocation(opt.key)}
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

        {/* ✅ Address when pickup */}
        {serviceLocation === "pickup" && (
          <section className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Pick-up Address *
            </div>

            {placesReady ? (
              <AddressAutocomplete
                value={addr}
                onChange={(v) => setPickupAddress?.(v)}
                onSelectAddress={(formatted) => setPickupAddress?.(formatted)}
                placeholder="Start typing pick-up address…"
                inputClass={inputClass}
                // componentRestrictions={{ country: "us" }}
              />
            ) : (
              <input
                value={addr}
                onChange={(e) => setPickupAddress?.(e.target.value)}
                className={inputClass}
                placeholder="Enter pick-up address"
                autoComplete="new-password"
                name="pickup_address__no_autofill"
              />
            )}

            {!addr.trim() && (
              <p className="text-xs text-red-500">
                Please enter your pick-up address.
              </p>
            )}

            <div className="text-[12px] sm:text-[13px] text-[#6B7280]">
              We&apos;ll confirm your exact address and scheduling details after
              you submit your request.
            </div>
          </section>
        )}

        {/* Continue */}
        <button
          onClick={handleContinue}
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

export default StepDetailingLocationTimeline;
