import React from "react";

const StatsBlock = ({ className = "" }) => {
  const stats = [
    { value: "500+", label: "Customers Served" },
    { value: "100%", label: "Family Owned" },
    { value: "365 days", label: "Committed to Quality" },
    { value: "10+ Years", label: "In Business" },
  ];

  return (
    <section className={`w-full mt-8 lg:mt-10 ${className}`}>
      <div className="w-full bg-[#1A1A1A] rounded-[32px] px-6 md:px-10 lg:px-16 py-7 md:py-9 lg:py-10">
        <div className="relative grid grid-cols-2 gap-4 sm:gap-5 md:flex md:items-center md:justify-between md:gap-0">
          {/* Хрест тільки на мобільній / планшетній версії */}
          <div className="absolute inset-0 flex items-center justify-center md:hidden pointer-events-none">
            <div className="w-full h-[1px] bg-white/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center md:hidden pointer-events-none">
            <div className="h-full w-[1px] bg-white/30" />
          </div>

          {stats.map((item, index) => (
            <div
              key={item.label}
              className="relative flex-1 flex flex-col items-center justify-center text-center py-3 md:py-4"
            >
              {index !== 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-12 lg:h-14 w-px bg-white/25" />
              )}

              <h3
                className="text-[26px] sm:text-[28px] md:text-[34px] lg:text-[36px] font-extrabold text-white"
                style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800 }}
              >
                {item.value}
              </h3>

              <p
                className="mt-1 text-[13px] sm:text-[14px] md:text-[16px] lg:text-[17px] font-normal text-white/85"
                style={{ fontFamily: "Manrope, sans-serif", fontWeight: 400 }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBlock;
