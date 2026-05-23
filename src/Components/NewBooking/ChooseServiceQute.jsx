// src/Components/Booking/Step1Search.jsx
import React, { useEffect, useState, useMemo } from "react";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

export default function Step1Search({
  visible,
  onSearch,
  value,
  onChange,
  initial = "cleaning",
}) {
  const [local, setLocal] = useState(initial);
  const selected = value ?? local;

  // === ВИЗНАЧАЄМО ТИП САЙТУ ===
  const domainType = useMemo(() => {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("daniletsdetailing")) return "detailing";
    if (host.includes("daniletscleaning")) return "cleaning";
    return "main"; // fallback
  }, []);

  const isDetailingSite = domainType === "detailing";

  useEffect(() => {
    if (value == null) setLocal(initial);
  }, [initial, value]);

  if (!visible) return null;

  const setSelected = (next) => {
    if (typeof onChange === "function") onChange(next);
    else setLocal(next);
  };

  const handleContinue = () => {
    if (!selected) return;
    if (typeof onSearch === "function") {
      onSearch(selected);
    }
  };

  return (
    <section className="relative w-full min-h-[520px] flex items-center justify-center px-4">
      <div className="w-full max-w-[980px]">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-[44px] sm:text-[64px] md:text-[64px] font-extrabold tracking-[-0.02em] text-black">
            Choose Your Service
          </h1>
          <p className="mt-3 text-[20px] sm:text-[18px] text-black/60">
            What type of service are you looking for?
          </p>
        </div>

        {/* Динамічні опції залежно від домену */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
          {isDetailingSite ? (
            <>
              <Pill
                label="Personal"
                active={selected === "personal"}
                onClick={() => setSelected("personal")}
              />
              <Pill
                label="Business"
                active={selected === "business"}
                onClick={() => setSelected("business")}
              />
            </>
          ) : (
            <>
              <Pill
                label="Residential"
                active={selected === "residential"}
                onClick={() => setSelected("residential")}
              />
              <Pill
                label="Commercial"
                active={selected === "commercial"}
                onClick={() => setSelected("commercial")}
              />
            </>
          )}
        </div>

        {/* Continue Button */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
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
              background: selected ? GOLD_GRADIENT : "rgba(0,0,0,0.06)",
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