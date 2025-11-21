// src/components/booking/Step4Vehicle.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./ProgressBar";

const Step4Vehicle = ({
  visible,
  vehicleYear,
  setVehicleYear,
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  canContinueVehicle,
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
            Tell Us About Your Vehicle
          </h2>
        </div>

        <ProgressBar activeCount={3} />

        <div className="space-y-3">
          <input
            value={vehicleYear}
            onChange={(e) => setVehicleYear(e.target.value)}
            inputMode="numeric"
            placeholder="Year of your car"
            className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
          />
          <input
            value={vehicleMake}
            onChange={(e) => setVehicleMake(e.target.value)}
            placeholder="Make of your car"
            className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
          />
          <input
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="Your car model"
            className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
          />
        </div>

        <button
          onClick={onNext}
          disabled={!canContinueVehicle}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${
              !canContinueVehicle ? "opacity-60 cursor-not-allowed" : ""
            }`}
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

export default Step4Vehicle;
