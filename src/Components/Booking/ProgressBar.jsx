// src/components/booking/ProgressBar.jsx
import React from "react";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

const ProgressBar = ({ activeCount }) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="h-1 rounded-full flex-[1.2]"
          style={{
            background: i < activeCount ? GOLD_GRADIENT : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
};

export default ProgressBar;
