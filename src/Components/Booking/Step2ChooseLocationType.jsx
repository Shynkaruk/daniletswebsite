// src/components/booking/Step2ChooseLocationType.jsx
import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { FiChevronLeft } from "react-icons/fi";
import { LuTruck, LuStore } from "react-icons/lu";
import ProgressBar from "./ProgressBar";

const GOLD = "#E1C07B";
const GRAY = "#A8A8AD";

const Step2ChooseLocationType = ({
  visible,
  serviceType,
  setServiceType,
  onNext,
  onBack, // ✅ додаємо проп для кроку назад
}) => {
  if (!visible) return null;

  const mobileColor = serviceType === "mobile" ? GOLD : GRAY;
  const shopColor = serviceType === "shop" ? GOLD : GRAY;

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
        {/* ======== HEADER ЗІ СТРІЛКОЮ НАЗАД ======== */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
            Choose Locations
          </h2>
        </div>

        {/* ======== PROGRESS BAR ======== */}
        <ProgressBar activeCount={1} />

        {/* ======== OPTIONS ======== */}
        <div className="space-y-3">
          {/* Mobile Service */}
          <button
            onClick={() => setServiceType("mobile")}
            aria-pressed={serviceType === "mobile"}
            className={`w-full rounded-[16px] px-3 py-3 shadow flex items-center justify-between
              ${serviceType === "mobile" ? "bg-[#F8F4EC]" : "bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <LuTruck className="w-6 h-6" style={{ color: mobileColor }} />
              <span className="text-[15px] sm:text-[16px] text-[#18181B]">
                Mobile Service
              </span>
            </div>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center
                ${serviceType === "mobile" ? "bg-[#E7D3A3]" : "bg-[#EFEFEF]"}`}
            >
              {serviceType === "mobile" ? "✓" : ""}
            </span>
          </button>

          {/* Shop Service */}
          <button
            onClick={() => setServiceType("shop")}
            aria-pressed={serviceType === "shop"}
            className={`w-full rounded-[16px] px-3 py-3 shadow flex items-center justify-between
              ${serviceType === "shop" ? "bg-[#F8F4EC]" : "bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <LuStore className="w-6 h-6" style={{ color: shopColor }} />
              <span className="text-[15px] sm:text-[16px] text-[#18181B]">
                Shop Service
              </span>
            </div>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center
                ${serviceType === "shop" ? "bg-[#E7D3A3]" : "bg-[#EFEFEF]"}`}
            >
              {serviceType === "shop" ? "✓" : ""}
            </span>
          </button>

          {/* Warning */}
          <div className="w-full rounded-[16px] px-3 py-3 bg-[#FFF7E5] border border-[#FDE68A] text-[#6B4E15] text-[14px] leading-snug flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 shrink-0">
              <FiAlertTriangle className="text-[18px]" />
            </span>
            <span className="pr-2">
              We only offer mobile service for 3 or more vehicles
            </span>
          </div>
        </div>

        {/* ======== CONTINUE BUTTON ======== */}
        <button
          onClick={onNext}
          className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
          }}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default Step2ChooseLocationType;
