// src/Components/ProgressBar.jsx
import React from "react";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const ProgressBar = ({ activeCount = 1, total = 4 }) => {
  const items = Array.from({ length: total });

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-[#6B7280] tracking-wide uppercase">
          Step {activeCount} of {total}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {items.map((_, index) => {
          const isActive = index < activeCount;

          return (
            <div
              key={index}
              className="h-[4px] flex-1 rounded-full"
              style={{
                background: isActive ? GOLD_GRADIENT : "#E5E7EB",
                opacity: isActive ? 1 : 0.7,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
