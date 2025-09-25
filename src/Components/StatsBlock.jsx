import React from 'react';

const StatsBlock = () => {
  return (
    <div className="relative w-[95%] max-w-[1200px] mx-auto mt-6 sm:max-w-[95%] sm:mt-4 bg-[#1A1A1A] rounded-[24px] p-6 sm:p-4">
      {/* Сітка 2x2 */}
      <div className="grid grid-cols-2 gap-4 sm:gap-2 relative">
        {/* Вертикальна і горизонтальна лінії для створення хреста */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-white opacity-50"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px] bg-white opacity-50"></div>
        </div>

        {/* Блок 1: 500+ Customers Served */}
        <div className="flex flex-col items-center justify-center text-center">
          <h3
            className="text-[32px] sm:text-[24px] font-extrabold text-white"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}
          >
            500+
          </h3>
          <p
            className="text-[14px] sm:text-[12px] font-normal text-white opacity-80"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}
          >
            Customers Served
          </p>
        </div>

        {/* Блок 2: 365 days Committed to Quality */}
        <div className="flex flex-col items-center justify-center text-center">
          <h3
            className="text-[32px] sm:text-[24px] font-extrabold text-white"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}
          >
            365 days
          </h3>
          <p
            className="text-[14px] sm:text-[12px] font-normal text-white opacity-80"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}
          >
            Committed to Quality
          </p>
        </div>

        {/* Блок 3: 10+ Years In Business */}
        <div className="flex flex-col items-center justify-center text-center">
          <h3
            className="text-[32px] sm:text-[24px] font-extrabold text-white"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}
          >
            10+ Years
          </h3>
          <p
            className="text-[14px] sm:text-[12px] font-normal text-white opacity-80"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}
          >
            In Business
          </p>
        </div>

        {/* Блок 4: 100% Family Owned */}
        <div className="flex flex-col items-center justify-center text-center">
          <h3
            className="text-[32px] sm:text-[24px] font-extrabold text-white"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}
          >
            100%
          </h3>
          <p
            className="text-[14px] sm:text-[12px] font-normal text-white opacity-80"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}
          >
            Family Owned
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsBlock;