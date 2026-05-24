// src/Components/NewBooking/ChooseServiceQute.jsx
import React, { useEffect, useState, useMemo } from "react";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

/**
 * Step 1 — service chooser.
 *
 * Domain routing:
 *   danilets.com        → Phase 1: "Detailing" | "Cleaning"
 *                         Phase 2: detailing → "Personal" | "Business"
 *                                  cleaning  → "Residential" | "Commercial"
 *   daniletsdetailing.* → direct:  "Personal" | "Business"
 *   daniletscleaning.*  → direct:  "Residential" | "Commercial"
 *
 * Calls onSearch("personal" | "business" | "residential" | "commercial")
 * on final confirmation. The onSearch handler in Booking.jsx already sets
 * the service type and advances the step — onChange is not needed internally.
 */
export default function Step1Search({
  visible,
  onSearch,
  // kept for API compatibility but not used internally
  value,
  onChange,
  initial,
}) {
  // Which pill is highlighted in the current phase
  const [local, setLocal] = useState(null);
  // main domain only: 1 = top-level, 2 = sub-service
  const [phase, setPhase] = useState(1);
  // top-level choice on main domain ("detailing" | "cleaning")
  const [serviceChoice, setServiceChoice] = useState(null);

  // ── Domain detection ────────────────────────────────────────────────────
  const domainType = useMemo(() => {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("daniletsdetailing")) return "detailing";
    if (host.includes("daniletscleaning")) return "cleaning";
    return "main";
  }, []);

  const isMainDomain = domainType === "main";
  const isDetailingSite = domainType === "detailing";
  const isCleaningSite = domainType === "cleaning";

  // ── Reset when step becomes hidden ──────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      setLocal(null);
      setPhase(1);
      setServiceChoice(null);
    }
  }, [visible]);

  if (!visible) return null;

  // ── Handlers ────────────────────────────────────────────────────────────
  const setSelected = (next) => setLocal(next);

  const handleContinue = () => {
    if (!local) return;

    if (isMainDomain && phase === 1) {
      // Phase 1 done — remember choice, advance to sub-service phase
      setServiceChoice(local);
      setLocal(null);
      setPhase(2);
      return;
    }

    // Final answer → tell Booking.jsx which sub-service was chosen
    if (typeof onSearch === "function") onSearch(local);
  };

  const handleBack = () => {
    setLocal(null);
    setPhase(1);
    setServiceChoice(null);
  };

  // ── Which pill set to show ───────────────────────────────────────────────
  const showTopLevel = isMainDomain && phase === 1;

  const showDetailingPills =
    isDetailingSite ||
    (isMainDomain && phase === 2 && serviceChoice === "detailing");

  const showCleaningPills =
    isCleaningSite ||
    (isMainDomain && phase === 2 && serviceChoice === "cleaning");

  // ── Title / subtitle ────────────────────────────────────────────────────
  const title = showTopLevel
    ? "Choose Your Service"
    : showDetailingPills
    ? "Detailing"
    : "Cleaning";

  const subtitle = showTopLevel
    ? "What type of service are you looking for?"
    : showDetailingPills
    ? "Select your client type"
    : "Select your property type";

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section className="relative w-full min-h-[520px] flex items-center justify-center px-4">
      <div className="w-full max-w-[980px]">
        {/* Back button — main domain phase 2 only */}
        {isMainDomain && phase === 2 && (
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-black/50 hover:text-black transition text-[16px]"
          >
            <span className="text-[20px] leading-none">‹</span>
            <span>Back</span>
          </button>
        )}

        {/* Title */}
        <div className="text-center">
          <h1 className="text-[44px] sm:text-[64px] md:text-[64px] font-extrabold tracking-[-0.02em] text-black">
            {title}
          </h1>
          <p className="mt-3 text-[20px] sm:text-[18px] text-black/60">
            {subtitle}
          </p>
        </div>

        {/* Pills */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
          {showTopLevel && (
            <>
              <Pill
                label="Detailing"
                active={local === "detailing"}
                onClick={() => setSelected("detailing")}
              />
              <Pill
                label="Cleaning"
                active={local === "cleaning"}
                onClick={() => setSelected("cleaning")}
              />
            </>
          )}

          {showDetailingPills && (
            <>
              <Pill
                label="Personal"
                active={local === "personal"}
                onClick={() => setSelected("personal")}
              />
              <Pill
                label="Business"
                active={local === "business"}
                onClick={() => setSelected("business")}
              />
            </>
          )}

          {showCleaningPills && (
            <>
              <Pill
                label="Residential"
                active={local === "residential"}
                onClick={() => setSelected("residential")}
              />
              <Pill
                label="Commercial"
                active={local === "commercial"}
                onClick={() => setSelected("commercial")}
              />
            </>
          )}
        </div>

        {/* Continue */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!local}
            className="
              w-full max-w-[920px]
              h-[64px]
              rounded-full
              px-7
              flex items-center justify-between
              font-semibold
              text-[18px]
              shadow-[0_18px_45px_rgba(0,0,0,0.12)]
              transition
              active:scale-[0.99]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            style={{
              background: local ? GOLD_GRADIENT : "rgba(0,0,0,0.06)",
              color: "#1a1a1a",
            }}
          >
            <span>Continue</span>
            <span className="text-[22px] leading-none">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="
        w-full sm:w-[420px]
        h-[70px]
        rounded-[18px]
        bg-white/85
        backdrop-blur-[6px]
        border border-black/10
        px-6
        flex items-center justify-between
        shadow-[0_10px_30px_rgba(0,0,0,0.08)]
        transition
        hover:bg-white/90
        active:scale-[0.99]
      "
    >
      <span className="text-[22px] font-medium text-black">{label}</span>

      <span
        className={`
          w-[34px] h-[34px]
          rounded-full
          flex items-center justify-center
          border
          ${active ? "border-[#D6B46D]" : "border-black/10"}
          bg-white
        `}
      >
        <span
          className={`
            w-[20px] h-[20px]
            rounded-full
            ${active ? "bg-[#E8D08B]" : "bg-[#E5E5E5]"}
          `}
        />
      </span>
    </button>
  );
}
