import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 GOLD ICONS
import bubbleGoldIcon from "../../assets/icons/bubble_gold_icon_quote.svg";
import broomGoldIcon from "../../assets/icons/broom_gold_icon_quote.svg";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

const Step1Search = ({
  visible,
  onSearch,
  value, // "detailing" | "cleaning" (controlled)
  onChange, // (service) => void
}) => {
  if (!visible) return null;

  const navigate = useNavigate();

  // fallback local state (якщо не передали value/onChange)
  const [local, setLocal] = useState("detailing");
  const selected = value ?? local;

  const setSelected = (next) => {
    if (typeof onChange === "function") onChange(next);
    else setLocal(next);
  };

  const options = useMemo(
    () => [
      {
        id: "detailing",
        title: "Detailing",
        desc: "Car detailing & ceramic options",
        icon: bubbleGoldIcon,
        learnMorePath: "/services/detailing",
      },
      {
        id: "cleaning",
        title: "Cleaning",
        desc: "Residential & commercial cleaning",
        icon: broomGoldIcon,
        learnMorePath: "/services/cleaning",
      },
    ],
    []
  );

  const handleContinue = () => {
    if (!selected) return;
    try {
      onSearch(selected);
    } catch {
      onSearch();
    }
  };

  const goLearnMore = (path) => navigate(path);

  return (
    <div className="w-full max-w-full min-w-0">
      {/* ===== OUTER GOLD BORDER ===== */}
      <div
        className="
          w-full
          rounded-[34px]
          p-[2px]
          shadow-[0_24px_70px_rgba(0,0,0,0.14)]
        "
        style={{ background: GOLD_GRADIENT }}
      >
        {/* ===== INNER CONTAINER (без золотого оверлея, тільки бордер зовні) ===== */}
        <div
          className="
            w-full
            rounded-[32px]
            bg-[#F2F2F2]/95
            backdrop-blur-sm
            px-4 sm:px-6 lg:px-10
            py-6 sm:py-8
          "
          style={{
            boxShadow: "inset 0 0 0 1px rgba(226, 192, 123, 0.45)",
          }}
        >
          {/* Title */}
          <div className="text-center">
            <h2 className="text-[28px] sm:text-[34px] font-bold text-black">
              Choose Your Service
            </h2>
            <p className="mt-2 text-[14px] sm:text-[16px] text-black/60">
              Select what you want to book first
            </p>
          </div>

          {/* Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {options.map((opt) => {
              const active = selected === opt.id;

              return (
                <div key={opt.id} className="w-full">
                  {/* Card button = перемикач */}
                  <button
                    type="button"
                    onClick={() => setSelected(opt.id)}
                    className="
                      relative w-full text-left
                      rounded-[24px]
                      transition
                      active:scale-[0.99]
                      focus:outline-none
                    "
                  >
                    {/* Active gold border */}
                    <div
                      className="rounded-[24px] p-[2px]"
                      style={{
                        background: active ? GOLD_GRADIENT : "transparent",
                      }}
                    >
                      <div className="rounded-[22px] bg-white border border-black/10 px-5 py-5 sm:px-6 sm:py-6 shadow-sm">
                        <div className="flex items-start gap-4">
                          {/* ICON */}
                          <div
                            className="
                              h-12 w-12
                              rounded-full
                              flex items-center justify-center
                              border border-black/10
                              shrink-0
                            "
                            style={{
                              background: active
                                ? "rgba(242, 216, 146, 0.35)"
                                : "rgba(0,0,0,0.03)",
                            }}
                          >
                            <img
                              src={opt.icon}
                              alt={opt.title}
                              className="w-6 h-6"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-[18px] sm:text-[20px] font-bold text-black">
                                {opt.title}
                              </h3>

                              <span
                                className={`
                                  inline-flex items-center justify-center
                                  h-6 px-3 rounded-full text-[12px] font-semibold
                                  border
                                  ${
                                    active
                                      ? "border-transparent text-black"
                                      : "border-black/10 text-black/60"
                                  }
                                `}
                                style={{
                                  background: active
                                    ? "rgba(0,0,0,0.04)"
                                    : "transparent",
                                }}
                              >
                                {active ? "Selected" : "Select"}
                              </span>
                            </div>

                            <p className="mt-2 text-[13px] sm:text-[14px] text-black/60">
                              {opt.desc}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-[1px] w-full bg-black/10" />

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[13px] sm:text-[14px] text-black/60">
                            Tap to choose
                          </span>
                          <span className="text-[14px] font-semibold text-black">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Learn more під блоком (як на скріні) */}
                  <button
                    type="button"
                    onClick={() => goLearnMore(opt.learnMorePath)}
                    className="
                      mt-4 w-full h-[44px]
                      rounded-full
                      border border-black/10
                      bg-white
                      text-black
                      font-semibold
                      shadow-sm
                      transition
                      hover:bg-white
                      active:scale-95
                    "
                  >
                    Learn More — {opt.title}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`
              w-full h-[56px]
              rounded-[88px]
              font-semibold
              shadow-md mt-6
              text-[16px] sm:text-[18px]
              transition active:scale-95
              ${selected ? "text-black" : "text-black/40"}
            `}
            style={{
              background: selected ? GOLD_GRADIENT : "rgba(0,0,0,0.06)",
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1Search;
