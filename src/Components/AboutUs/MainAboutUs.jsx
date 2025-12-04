import React, { useState } from "react";
import Head from "./../Head.jsx";
import familyPhoto from "../../assets/photo/family-photo3.png";
import diamondicon from "../../assets/icons/diamond-icon.svg";

const MainAboutUs = () => {
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  return (
    <div className="bg-[#e5e5e5] min-h-screen pb-8 relative">
      <Head />

      {/* MAIN SECTION */}
      <main
        className="
          flex min-h-screen bg-cover bg-center relative
          before:content-[''] before:absolute before:inset-0
          before:bg-black/20 before:z-[1]
        "
        style={{ backgroundImage: `url(${familyPhoto})` }}
      >
        {/* TEXT BLOCK */}
        <div className="w-[95%] max-w-[1792px] mx-auto mt-[180px] px-4 mb-50 relative z-[2]">
          <div className="w-full md:w-2/3 lg:w-1/2 space-y-6">
            <h1
              className="
                text-[36px] sm:text-[44px] md:text-[56px] lg:text-[72px] xl:text-[90px]
                font-extrabold leading-tight text-white
              "
            >
              Danilets Family
            </h1>

            <p
              className="
                text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px]
                font-medium leading-snug text-[#A1A1A5] max-w-[900px]
              "
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              A family story of faith, resilience, and the American dream. From
              losing everything to building something meaningful, every
              milestone shaped who we are today.
            </p>

            <button
              onClick={openPopup}
              className="
                border border-white px-6 py-3 rounded-full text-white
                text-[16px] sm:text-[18px] font-semibold
                hover:bg-white hover:text-black transition
              "
            >
              Learn More
            </button>
          </div>
        </div>

        {/* LABEL */}
        <div
          className="
            absolute bottom-30 right-20 bg-[rgba(235,176,108,0.15)]
            rounded-full px-4 py-3 flex items-center gap-3 z-[3]
          "
        >
          <img
            src={diamondicon}
            alt="Diamond Icon"
            className="w-6 h-6 lg:w-8 lg:h-8"
          />
          <span className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-semibold">
            Lets is More
          </span>
        </div>
      </main>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-[900px] max-height-[85vh] overflow-y-auto p-8 shadow-2xl">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-2xl font-semibold text-gray-600 hover:text-black bg-white p-2 rounded-full shadow"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-4 text-center">
              A Journey of Faith and Resilience
            </h2>

            <p className="mb-3">
              Our story begins in 2009 when our family moved to the United
              States, leaving everything behind...
            </p>

            <p className="mb-3">
              From 2010 to 2012, Nataly wasn't physically present in the US...
            </p>

            <h3 className="text-2xl font-semibold mt-6 mb-3">
              Building from the Ground Up
            </h3>

            <p className="mb-3">
              When we first arrived in Columbus, Nataly started working at a
              hotel, making just $3.75 per room...
            </p>

            <h3 className="text-2xl font-semibold mt-6 mb-3">
              Milestones of Perseverance
            </h3>

            <ul className="list-disc pl-6 mb-3 space-y-1">
              <li>2016: Started cleaning for private clients</li>
              <li>2020: Started hiring team members...</li>
              <li>2021: Granted asylum...</li>
              <li>2024: Received green card</li>
              <li>2024: Purchased first home</li>
              <li>2025: Rebranded the company</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">
              Our Promise to You
            </h3>

            <p className="mb-3">
              We know what it's like to start with nothing...
            </p>

            <p>
              When you choose Danilets, you're not just hiring a service — you're
              supporting a family that believes in the American dream...
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closePopup}
                className="px-6 py-2 rounded-full border border-[#D4D4D8] text-sm md:text-[15px] hover:bg-[#F4F4F5] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainAboutUs;
