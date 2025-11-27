import React, { useState } from "react";
import Head from "./../Head.jsx";
import familyPhoto from "../../assets/photo/family-photo.png";
import diamondicon from "../../assets/icons/diamond-icon.svg";

const MainAboutUs = () => {
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8 relative">
      <Head />

      <main
        className="flex min-h-screen bg-cover bg-center relative z-0"
        style={{ backgroundImage: `url(${familyPhoto})` }}
      >
        <div className="w-[95%] max-w-[1792px] mx-auto mt-[180px] px-4 mb-50">
          <div className="w-full md:w-2/3 lg:w-1/2 space-y-6">
            <h1
              className="
                text-[36px] sm:text-[44px] md:text-[56px] lg:text-[72px] xl:text-[90px]
                font-extrabold leading-tight text-white
              "
            >
              Danilets Family
            </h1>

            {/* 4.2 More than a business — ОНОВЛЕНИЙ ТЕКСТ */}
            <p
              className="
                text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px]
                font-medium leading-snug text-[rgba(161,161,165,1)] max-w-[900px]
              "
              style={{ fontFamily: "Manrope, sans-serif" }}
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

        {/* Label */}
        <div
          className="
            absolute bottom-30 right-20 bg-[rgba(235,176,108,0.15)]
            rounded-full px-4 py-3 flex items-center gap-3 z-10
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

      {/* Pop-up */}
      {showPopup && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          {/* POPUP BOX */}
          <div className="relative bg-white rounded-2xl w-full max-w-[900px] max-h-[85vh] overflow-y-auto p-8 shadow-2xl">
            {/* X справа */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-2xl font-semibold text-gray-600 hover:text-black bg-white p-2 rounded-full shadow"
            >
              ✕
            </button>

            {/* CONTENT */}
            <h2 className="text-3xl font-bold mb-4 text-center">
              A Journey of Faith and Resilience
            </h2>

            <p className="mb-3">
              Our story begins in 2009 when our family moved to the United
              States, leaving everything behind. We lost our home and business,
              and arrived in upstate New York with nothing but hope and faith in
              God's plan.
            </p>

            <p className="mb-3">
              From 2010 to 2012, Nataly wasn't physically present in the
              US—stuck in Europe, separated from her children, fighting to
              reunite our family. After two years of perseverance and prayer,
              she was finally able to return. In 2013, we moved to Columbus,
              Ohio, where our American dream truly began.
            </p>

            <h3 className="text-2xl font-semibold mt-6 mb-3">
              Building from the Ground Up
            </h3>

            <p className="mb-3">
              When we first arrived in Columbus, Nataly started working at a
              hotel, making just $3.75 per room. During those difficult days,
              she made a promise: "When I have my own company, I will never
              treat my team members like this."
            </p>

            <p className="mb-3">
              From 2013 to 2016, she worked for others while building her skills
              and reputation. She then started working independently...
            </p>

            <p className="mb-3">
              In 2020, everything changed. Nataly began hiring team members,
              growing from a one-person operation to a full cleaning
              company...
            </p>

            <h3 className="text-2xl font-semibold mt-6 mb-3">
              Milestones of Perseverance
            </h3>

            <ul className="list-disc pl-6 mb-3 space-y-1">
              <li>2016: Started cleaning for private clients</li>
              <li>2020: Started hiring team members for cleaning services</li>
              <li>2020: Founded Danilets Detailing</li>
              <li>2021: Granted asylum in the United States</li>
              <li>2024: Received green card</li>
              <li>2024: Purchased first home</li>
              <li>2025: Rebranded the company</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">
              Our Promise to You
            </h3>

            <p className="mb-3">
              We know what it's like to start with nothing. We know the value of
              hard work, integrity...
            </p>

            <p>
              When you choose Danilets, you're not just hiring a service—you're
              supporting a family that believes in the American dream, honors
              God in everything we do, and treats every client like family.
            </p>

            {/* Кнопка Close внизу справа */}
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
