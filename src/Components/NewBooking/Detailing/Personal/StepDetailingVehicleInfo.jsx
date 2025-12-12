// src/Components/Booking/Detailing/Personal/StepDetailingVehicleInfo.jsx

import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const SEAT_OPTIONS = ["Leather", "Cloth", "Mixed"];

const StepDetailingVehicleInfo = ({
  visible,
  onBack,
  onNext,

  year,
  setYear,
  make,
  setMake,
  model,
  setModel,
  color,
  setColor,
  seatMaterial,
  setSeatMaterial,

  renderProgress,
  progressStepIndex = 2,
  totalSteps = 11,
}) => {
  if (!visible) return null;

  const yearVal = year ?? "";
  const makeVal = make ?? "";
  const modelVal = model ?? "";
  const colorVal = color ?? "";
  const seatVal = seatMaterial ?? "";

  const canContinue =
    yearVal.trim() &&
    makeVal.trim() &&
    modelVal.trim() &&
    seatVal.trim(); // seatMaterial required

  const inputBase =
    "w-full h-[48px] sm:h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 sm:px-5 text-[14px] sm:text-[15px] outline-none";

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 lg:p-8 shadow space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
          )}
          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Vehicle information
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF] mt-0.5">
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

        {/* INPUTS */}
        <section className="space-y-4">

          {/* Year */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Year</div>
            <input
              value={yearVal}
              onChange={(e) => setYear?.(e.target.value)}
              className={inputBase}
              placeholder="Enter vehicle year"
            />
          </div>

          {/* Make */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Make</div>
            <input
              value={makeVal}
              onChange={(e) => setMake?.(e.target.value)}
              className={inputBase}
              placeholder="Enter vehicle make"
            />
          </div>

          {/* Model */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Model</div>
            <input
              value={modelVal}
              onChange={(e) => setModel?.(e.target.value)}
              className={inputBase}
              placeholder="Enter vehicle model"
            />
          </div>

          {/* Color */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">
              Vehicle color
            </div>
            <input
              value={colorVal}
              onChange={(e) => setColor?.(e.target.value)}
              className={inputBase}
              placeholder="Enter color"
            />
          </div>

          {/* Seat Material (required) */}
          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Seat material (required)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SEAT_OPTIONS.map((opt) => {
                const active = seatVal === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSeatMaterial?.(opt)}
                    className={`
                      h-[44px] sm:h-[48px] rounded-[16px] border text-[14px] font-medium
                      ${active ? "border-transparent text-black" : "border-[#E5E7EB] text-[#4B5563] bg-white"}
                    `}
                    style={{ background: active ? GOLD_GRADIENT : undefined }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTINUE BUTTON */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={`
            w-full h-[52px] sm:h-[56px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6
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
};

export default StepDetailingVehicleInfo;
