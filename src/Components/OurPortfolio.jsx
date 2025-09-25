import React, { useState } from 'react';
import mokPhoto from '../assets/photo/mok-photo.png';
import RightArrowIcon from '../assets/icons/arrows/arrow_right_black.svg';
import LeftArrowIcon from './../assets/icons/arrows/arrow-left-black.svg';

const OurPortfolio = () => {
  const portfolioItems = [
    { id: 1, title: "Danilets Cleaning", description: "Transforming spaces with precision and care.", image: mokPhoto },
    { id: 2, title: "Danilets Detailing", description: "Elevating vehicles to a new standard of perfection.", image: mokPhoto },
    { id: 3, title: "Danilets Media", description: "Capturing moments with creativity and excellence.", image: mokPhoto },
    { id: 4, title: "Danilets Pickleball", description: "Bringing fun and performance to the court.", image: mokPhoto },
    { id: 5, title: "Danilets Cleaning 2", description: "Another amazing cleaning project.", image: mokPhoto },
    { id: 6, title: "Danilets Detailing 2", description: "Detailing with unmatched precision.", image: mokPhoto },
    { id: 7, title: "Danilets Media 2", description: "More stunning visual storytelling.", image: mokPhoto },
  ];

  const [startIndex, setStartIndex] = useState(0);
  const visibleCards = 3;

  const handlePrev = () => {
    setStartIndex((prevIndex) =>
      prevIndex === 0 ? portfolioItems.length - visibleCards : prevIndex - 1
    );
  };

  const handleNext = () => {
    setStartIndex((prevIndex) =>
      prevIndex + visibleCards >= portfolioItems.length ? 0 : prevIndex + 1
    );
  };

  const visibleItems = portfolioItems.slice(startIndex, startIndex + visibleCards);

  return (
    <div className="md:mx-auto py-16">
      {/* Заголовок і кнопки */}
      <div className="flex justify-between items-center mb-4 px-4 md:px-8">
        <h2 className="text-[24px] sm:text-[28px] md:text-[48px] lg:text-[60px] font-bold text-black ml-3 md:ml-10">
          Our Portfolio
        </h2>
        <div className="flex space-x-[8px] mr-2 md:mr-10">
          <button
            onClick={handlePrev}
            className="w-[48px] h-[40px] md:w-[80px] md:h-[64px] rounded-[88px] bg-white flex items-center justify-center"
          >
            <img src={LeftArrowIcon} alt="Arrow Left" className="w-4 h-4 md:w-7 md:h-7" />
          </button>
          <button
            onClick={handleNext}
            className="w-[48px] h-[40px] md:w-[80px] md:h-[64px] rounded-[88px] bg-white flex items-center justify-center"
          >
            <img src={RightArrowIcon} alt="Arrow Right" className="w-4 h-4 md:w-7 md:h-7" />
          </button>
        </div>
      </div>

      {/* Картки */}
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 px-4 md:px-8">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col w-full md:w-[600px] lg:w-[640px] h-[420px] md:h-[560px] lg:h-[600px] bg-white rounded-[24px] md:rounded-[32px] p-4"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-[260px] sm:h-[320px] md:h-[400px] lg:h-[440px] object-cover rounded-[24px] md:rounded-[32px] mb-4"
            />
            <p
              className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-normal leading-snug text-gray-600 mb-2 ml-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {item.description}
            </p>
            <h3
              className="text-[20px] sm:text-[24px] md:text-[32px] lg:text-[36px] font-bold text-black ml-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurPortfolio;
