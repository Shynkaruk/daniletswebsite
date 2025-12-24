import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { AddressAutocomplete } from "./AddressAutocomplete";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const HEAR_OPTIONS = [
  "Google Search",
  "Instagram",
  "Facebook",
  "Referral / Friend",
  "Returning Client",
  "Other",
];

// --- Google Places loader (один раз на сторінку) ---
let __gmapsPromise = null;
function loadGooglePlaces() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // якщо вже є google.maps.places — готово
  if (window.google?.maps?.places) return Promise.resolve(true);

  // якщо вже грузимо — повертаємо той самий проміс
  if (__gmapsPromise) return __gmapsPromise;

  // якщо нема ключа — просто не включаємо автокомпліт (щоб не падало)
  if (!key) return Promise.resolve(false);

  __gmapsPromise = new Promise((resolve) => {
    // якщо скрипт вже є в DOM
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


export default function StepDetailingBusinessContactInfo({
  visible,
  onBack,
  onNext,

  firstName,
  setFirstName,
  lastName,
  setLastName,
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  phone,
  setPhone,
  email,
  setEmail,

  heardAbout,
  setHeardAbout,
  heardOther,
  setHeardOther,

  renderProgress,
  progressStepIndex = 2,
  totalSteps = 11,
}) {
  // ✅ SAFE values
  const first = firstName ?? "";
  const last = lastName ?? "";
  const comp = companyName ?? "";
  const addr = companyAddress ?? "";
  const ph = phone ?? "";
  const em = email ?? "";
  const heard = heardAbout ?? "";
  const heardO = heardOther ?? "";

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v || "");
  const isPhone = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

  const canContinue = Boolean(
    first.trim() &&
      last.trim() &&
      comp.trim() &&
      addr.trim() &&
      isPhone(ph) &&
      isEmail(em) &&
      heard.trim() &&
      (heard !== "Other" || heardO.trim())
  );

  const handleContinue = () => {
    if (!canContinue) return;
    onNext?.();
  };

  const inputClass =
    "w-full h-[52px] rounded-[16px] bg-[#F4F4F5] px-4 text-[15px] outline-none";

  // ✅ Google Places Autocomplete
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // підключаємо тільки коли крок видимий
    if (!visible) return;

    loadGooglePlaces().then((ok) => {
      if (cancelled) return;
      setPlacesReady(!!ok);
    });

    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (!placesReady) return;
    if (!addressInputRef.current) return;
    if (!window.google?.maps?.places) return;

    // не створюємо двічі
    if (autocompleteRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      fields: ["formatted_address", "address_components", "geometry", "name"],
      // опційно можна обмежити країною:
      // componentRestrictions: { country: "us" },
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace?.();
      const formatted = place?.formatted_address || place?.name || "";
      if (formatted) setCompanyAddress?.(formatted);
    });

    autocompleteRef.current = ac;
  }, [visible, placesReady, setCompanyAddress]);

  // ✅ return null тільки після хуків
  if (!visible) return null;

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
              Contact Information
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF]">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* FORM */}
        <section className="space-y-4">
          {/* First + Last */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#6B7280] font-medium">
                First Name *
              </div>
              <input
                value={first}
                onChange={(e) => setFirstName?.(e.target.value)}
                className={inputClass}
                placeholder="Enter first name"
              />
            </div>

            <div>
              <div className="text-sm text-[#6B7280] font-medium">
                Last Name *
              </div>
              <input
                value={last}
                onChange={(e) => setLastName?.(e.target.value)}
                className={inputClass}
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium">
              Company Name *
            </div>
            <input
              value={comp}
              onChange={(e) => setCompanyName?.(e.target.value)}
              className={inputClass}
              placeholder="Enter your company name"
            />
          </div>

          {/* Company Address (Google Places) */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium">
              Company Address *
            </div>
  <AddressAutocomplete
    value={addr}
    onChange={(v) => setCompanyAddress?.(v)}
    onSelectAddress={(formatted) => setCompanyAddress?.(formatted)}
    inputClass={inputClass}
    placeholder="Start typing address…"
  />

            {/* міні-підказка якщо ключа нема/скрипт не завантажився */}
            {!placesReady && import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
              <p className="text-[11px] text-[#9CA3AF] mt-1">
                Loading address suggestions…
              </p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#6B7280] font-medium">
                Phone Number *
              </div>
              <input
                value={ph}
                onChange={(e) => setPhone?.(e.target.value)}
                placeholder="(xxx) xxx-xxxx"
                className={inputClass}
              />
              {!isPhone(ph) && ph && (
                <p className="text-xs text-red-500 mt-1">
                  Invalid phone number
                </p>
              )}
            </div>

            <div>
              <div className="text-sm text-[#6B7280] font-medium">Email *</div>
              <input
                value={em}
                type="email"
                onChange={(e) => setEmail?.(e.target.value)}
                className={inputClass}
                placeholder="Enter email"
              />
              {!isEmail(em) && em && (
                <p className="text-xs text-red-500 mt-1">Invalid email</p>
              )}
            </div>
          </div>

          {/* Heard about */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium">
              How did you hear about us? *
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {HEAR_OPTIONS.map((opt) => {
                const active = heard === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setHeardAbout?.(opt)}
                    className={`h-[44px] rounded-[16px] border text-sm font-medium ${
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

            {heard === "Other" && (
              <input
                value={heardO}
                onChange={(e) => setHeardOther?.(e.target.value)}
                className={`${inputClass} mt-3`}
                placeholder="Please specify"
              />
            )}
          </div>
        </section>

        {/* CONTINUE */}
        <button
          type="button"
          onClick={handleContinue}
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
