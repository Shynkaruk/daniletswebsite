// src/Components/Booking/Step1Search.jsx
import React, { useEffect, useState } from "react";

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

    // Викликаємо onSearch — це важливо для внутрішньої логіки Booking
    if (typeof onSearch === "function") {
      onSearch(selected);
    }

    // Переходимо на правильний домен + book-online
    const domain =
      selected === "detailing"
        ? "https://daniletsdetailing.com"
        : "https://daniletscleaning.com";

    const targetUrl = `${domain}/book-online`;

    window.location.href = targetUrl;
  };

  return (
    <section className="relative w-full min-h-[520px] flex items-center justify-center px-4">
      <div className="w-full max-w-[980px]">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-[44px] sm:text-[64px] md:text-[64px] font-extrabold tracking-[-0.02em] text-black">
            Choose Your Service
          </h1>
          <p className="mt-3 text-[22px] sm:text-[18px] text-black/50">
            Select service type on the next step
          </p>
        </div>

        {/* Два пілли */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
          <Pill
            label="Detailing"
            active={selected === "detailing"}
            onClick={() => setSelected("detailing")}
          />
          <Pill
            label="Cleaning"
            active={selected === "cleaning"}
            onClick={() => setSelected("cleaning")}
          />
        </div>

        {/* Continue */}
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