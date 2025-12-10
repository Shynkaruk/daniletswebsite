// src/Components/Booking/StepDetailingVehicle.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepDetailingVehicle = ({
  visible,
  onBack,
  onNext,
  // стейт приїжджає зверху з Booking
  year,
  setYear,
  make,
  setMake,
  model,
  setModel,
  // опц. загальний прогрес із Booking (щоб Cleaning/Detailing були в одному flow)
  renderProgress,
  totalSteps = 6,  // скільки всього секцій у Detailing
}) => {
  if (!visible) return null;

  const canContinue = year.trim() && make.trim() && model.trim();

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
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
            Tell us about your vehicle
          </h2>
        </div>

        {/* Прогрес: 1 секція → 1 активна полоска */}
        {renderProgress ? (
          renderProgress(1)
        ) : (
          <ProgressBar activeCount={1} total={totalSteps} />
        )}

        {/* Інпути як на макеті */}
        <div className="space-y-3 pt-1">
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year of your car"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none placeholder:text-[#9CA3AF]"
          />
          <input
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Make of your car"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none placeholder:text-[#9CA3AF]"
          />
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Your car model"
            className="w-full h-[48px] rounded-[999px] bg-[#F4F4F5] px-4 text-[14px] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Кнопка Continue */}
        <button
          onClick={onNext}
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

export default StepDetailingVehicle;
