import React, { useState, useEffect } from "react";
import mokPhoto from "../assets/photo/mok-photo.png";
import RightArrowIcon from "../assets/icons/arrows/arrow_right_black.svg";
import LeftArrowIcon from "../assets/icons/arrows/arrow-left-black.svg";

const OurPortfolio = () => {
  const portfolioItems = [
    { id: 1, type: "photo", image: mokPhoto },
    { id: 2, type: "photo", image: mokPhoto },
    { id: 3, type: "photo", image: mokPhoto },
    { id: 4, type: "photo", image: mokPhoto },
    { id: 5, type: "photo", image: mokPhoto },
    { id: 6, type: "video", image: mokPhoto },
    { id: 7, type: "video", image: mokPhoto },
    { id: 8, type: "video", image: mokPhoto },
  ];

  const [activeTab, setActiveTab] = useState("photo");
  const [startIndex, setStartIndex] = useState(0);
  const visibleCards = 3;

  const filteredItems = portfolioItems.filter(
    (item) => item.type === activeTab
  );

  useEffect(() => {
    setStartIndex(0);
  }, [activeTab]);

  const handlePrev = () => {
    if (filteredItems.length <= visibleCards) return;
    setStartIndex((prev) =>
      prev === 0 ? Math.max(filteredItems.length - visibleCards, 0) : prev - 1
    );
  };

  const handleNext = () => {
    if (filteredItems.length <= visibleCards) return;
    setStartIndex((prev) =>
      prev + visibleCards >= filteredItems.length ? 0 : prev + 1
    );
  };

  const visibleItems = filteredItems.slice(
    startIndex,
    startIndex + visibleCards
  );

  return (
    <section className="bg-[#EDEDED] py-10 md:py-14">
      {/* Контейнер з такою ж шириною, як у верхньому блоці */}
      <div className="w-[95%] max-w-[1792px] mx-auto px-4 md:px-6 md:-mt-10 rounded-3xl">
        {/* Заголовок + таби */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <h2 className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[60px] font-bold text-black">
            Portfolio
          </h2>

          <div className="inline-flex items-center rounded-full bg-white px-2 py-1 md:px-3 md:py-1.5 gap-2">
            <button
              onClick={() => setActiveTab("photo")}
              className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-sm sm:text-base md:text-lg font-medium transition ${
                activeTab === "photo"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-sm sm:text-base md:text-lg font-medium transition ${
                activeTab === "video"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Videos
            </button>
          </div>
        </div>

        {/* Галерея */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleItems.map((item) => (
              <div key={item.id} className="w-full">
                <div
                  className="
                    w-full overflow-hidden rounded-2xl md:rounded-3xl
                    aspect-[4/3] md:aspect-[3/2]
                    transition-transform duration-500 hover:scale-[1.03]
                  "
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки навігації */}
        <div className="mt-10 flex gap-5">
          <button
            onClick={handlePrev}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition"
          >
            <img
              src={LeftArrowIcon}
              alt="Prev"
              className="w-6 h-6 sm:w-7 sm:h-7"
            />
          </button>
          <button
            onClick={handleNext}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition"
          >
            <img
              src={RightArrowIcon}
              alt="Next"
              className="w-6 h-6 sm:w-7 sm:h-7"
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurPortfolio;
