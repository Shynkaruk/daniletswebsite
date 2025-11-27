import React from 'react';
import actionIcon from '../assets/icons/icon-action.png';
import RightArrowIcon from '../assets/icons/angle-right-icon.png';

const ActionMini = () => {
  return (
    <div className="relative w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full h-auto min-h-[100px] bg-[#1C1C1C] rounded-[32px] flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 lg:px-12 py-4 sm:py-6">

        {/* Іконка + текст */}
        <div className="flex items-center gap-3 sm:gap-4">
          <img 
            src={actionIcon} 
            alt="Action Icon" 
            className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] rounded-[36px]" 
          />
          <h2
            className="text-[20px] sm:text-[24px] lg:text-[28px] font-bold text-white"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Deals Coming Soon
          </h2>
        </div>

        {/* Кнопка */}
        <button
          className="
            w-full sm:w-[200px] lg:w-[238px]
            h-[48px] sm:h-[58px]
            rounded-[88px]
            flex items-center justify-between
            py-3 sm:py-4 px-4 sm:px-6
            mt-4 sm:mt-0

            transition-all duration-200
            hover:scale-[1.05]
            hover:brightness-90
          "
          style={{
            background: "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
          }}
        >
          <span
            className="text-[14px] sm:text-[16px] font-bold leading-[100%] tracking-[0%] text-black"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Book Now
          </span>
          <img 
            src={RightArrowIcon} 
            alt="Arrow Right" 
            className="w-4 h-4 sm:w-5 sm:h-5" 
          />
        </button>

      </div>
    </div>
  );
};

export default ActionMini;
