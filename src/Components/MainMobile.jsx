import React, { useState } from 'react';
import Head from './Head.jsx';
import Services from './Services.jsx';
import familyPhotoMobile from '../assets/photo/family-photo-mobile.png';
import fon_two from '../assets/photo/fon_car2.JPG';
import diamondicon from '../assets/icons/diamond-icon.png';
import OurPortfolio from './OurPortfolio.jsx';
import OurCoreValues from './OurCoreValues.jsx';
import OurReviews from './OurReviews.jsx';
import ActionMini from './ActionMini.jsx';
import FAQ from './FAQ.jsx';
import Footer from './Footer.jsx';
import leftArrowIcon from '../assets/icons/icon-angle-left-white.png';
import rightArrowIcon from '../assets/icons/icon-angle-right-white.png';
import StatsBlock from './StatsBlock.jsx';

const MainMobile = () => {
  const images = [familyPhotoMobile, fon_two];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8">
      <Head />
      <main
        className="flex min-h-[calc(100vh-80px)] bg-cover bg-center relative z-0"
        style={{
          backgroundImage: `url(${images[currentImageIndex]})`,
        }}
      >
        <div className="w-full mx-auto mt-[120px] ml-5 px-4">
          <div className="space-y-4">
            <h1
              className="text-[40px] font-extrabold leading-[100%] tracking-[0%] text-white"
              style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}
            >
              DANILETS FAMILY
            </h1>
            <p
              className="text-[15px] font-normal leading-[140%] tracking-[0%] text-[rgba(161,161,165,1)]"
              style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}
            >
              Columbos premier dentistry for bespoke luxury services, tailored with precision<br />
              and delivered with excellence - where every detail exceeds expectations
            </p>
            <button className="border border-white px-4 py-2 rounded-full text-white text-[14px] font-semibold hover:bg-white hover:text-black transition">
              Learn More
            </button>
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-[80px] left-4 flex space-x-2 z-10">
            <button
              onClick={handlePrev}
              className="w-[48px] h-[40px] rounded-[88px] bg-[rgba(73,73,73,1)] flex items-center justify-center py-2 px-4"
            >
              <img src={leftArrowIcon} alt="Arrow Left" className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-[48px] h-[40px] rounded-[88px] bg-[rgba(73,73,73,1)] flex items-center justify-center py-2 px-4"
            >
              <img src={rightArrowIcon} alt="Arrow Right" className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          className="absolute bottom-[80px] right-4 w-[140px] h-[40px] rounded-full bg-[rgba(235,176,108,0.15)] flex items-center justify-between py-2 px-3 z-10"
        >
          <img src={diamondicon} alt="Diamond Icon" className="w-4 h-4" />
          <span className="text-white text-[14px] font-semibold">Less is more</span>
        </div>
      </main>

      <Services className="relative z-10 mt-[-60px]" />
      <StatsBlock />

      <OurPortfolio />
      <OurCoreValues />
      <OurReviews />
      <ActionMini />
      <FAQ />
      <Footer />
    </div>
  );
};

export default MainMobile;