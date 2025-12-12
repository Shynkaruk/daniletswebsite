// src/components/booking/Step1Search.jsx
import React from "react";

const Step1Search = ({ visible, onSearch }) => {
  if (!visible) return null;

  return (
    <div className="w-full max-w-full min-w-0 text-left">

      <h2 className="text-[28px] sm:text-[32px] font-bold text-black text-center">
        Choose Your Service
      </h2>

      {/* Місце для майбутніх кнопок чи вибору — поки пусто */}
      <p className="text-center mt-4 text-black/80 text-[16px]">
        Select service type on the next step
      </p>
            {/* Кнопка Continue */}
      <button
        onClick={onSearch}
        className="
          w-full h-[56px]
          rounded-[88px]
          font-semibold text-black
          shadow-md mt-4
          text-[16px] sm:text-[18px]
          transition active:scale-95
        "
        style={{
          background:
            "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default Step1Search;
