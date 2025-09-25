import React from "react";

const stats = [
  { value: "500+", label: "Customers Served" },
  { value: "365 days", label: "Committed to Quality" },
  { value: "10+ Years", label: "In Business" },
  { value: "100%", label: "Family Owned" },
];

const OurTrackRecord = () => {
  return (
    <section className="w-full mx-auto px-4 md:px-10">
      <div className="bg-white rounded-[32px] shadow-sm overflow-hidden">
        {/* Мобільна сітка 2x2 */}
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-300 md:hidden">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center py-6 px-4 text-center"
            >
              <h3 className="text-[24px] font-extrabold text-black leading-tight">
                {item.value}
              </h3>
              <p className="text-[14px] text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Десктоп версія (в рядок) */}
        <div className="hidden md:flex items-center justify-between divide-x divide-gray-300">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 py-10 px-6 text-center"
            >
              <h3 className="text-[28px] sm:text-[36px] md:text-[48px] font-extrabold text-black leading-tight">
                {item.value}
              </h3>
              <p className="text-[16px] sm:text-[18px] text-gray-500 mt-2">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTrackRecord;
