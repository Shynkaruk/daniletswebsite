// src/components/booking/Step6AddOns.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import { LuStar } from "react-icons/lu";
import ProgressBar from "./ProgressBar";

const GOLD = "#E1C07B";

const Step6AddOns = ({
  visible,
  addonsDb,
  loadingAddons,
  selectedAddOns,
  toggleAddOn,
  onNext,
  onBack,
}) => {
  if (!visible) return null;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Add More Services
          </h2>
        </div>

        <ProgressBar activeCount={5} />

        <div className="space-y-3">
          {loadingAddons ? (
            <div className="text-[#6B7280]">Loading…</div>
          ) : addonsDb.length === 0 ? (
            <div className="text-[#6B7280]">No add-ons available.</div>
          ) : (
            addonsDb.map((ad) => {
              const active = selectedAddOns.has(ad.id);
              return (
                <button
                  key={ad.id}
                  onClick={() => toggleAddOn(ad.id)}
                  aria-pressed={active}
                  className={`
                    w-full rounded-[16px] px-4 py-3 flex items-center justify-between
                    ${
                      active
                        ? "bg-[#F8F4EC] shadow"
                        : "bg-white border border-[#E5E7EB]"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F2F2F2]">
                      <LuStar
                        className="w-4 h-4"
                        style={{ color: active ? GOLD : "#D5D5D8" }}
                      />
                    </span>
                    <span className="text-[15px] sm:text-[16px] text-[#18181B]">
                      {ad.title}
                      {ad.subtitle ? (
                        <span className="ml-2 text-[#6B7280]">
                          · {ad.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] text-[#6B7280]">
                      ${(Number(ad.price) || 0).toFixed(2)}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center
                      ${active ? "bg-[#E7D3A3]" : "bg-[#EFEFEF]"}`}
                    >
                      {active ? "✓" : ""}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <button
          onClick={onNext}
          className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
          }}
        >
          Add Another Vehicle <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default Step6AddOns;
