import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import avatarIcon from "../assets/icons/avatar-icon.png";
import RightArrowIcon from "../assets/icons/angle-right-icon.png";
import LeftArrowIcon from "../assets/icons/angle-left-icon.png";
import { reqApi } from "../lib/api"; // перевір, щоб шлях співпадав зі структурою проєкту

const OurReviews = () => {
  const location = useLocation();
  const isDetailingPage = location.pathname.includes("/services/detailing");

  const [reviewsByService, setReviewsByService] = useState({
    Detailing: [],
    Cleaning: [],
  });
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState("Detailing");
  const [startIndex, setStartIndex] = useState(0);
  const visibleCards = 4;

  // якщо переходимо на сторінку Detailing — фіксуємо сервіс на Detailing
  useEffect(() => {
    if (isDetailingPage) {
      setSelectedService("Detailing");
      setStartIndex(0);
    }
  }, [isDetailingPage]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (isDetailingPage) {
          // тільки Detailing для сторінки /services/detailing
          const detRes = await reqApi.get("/reviews/detailing");
          const detJson = detRes.data;

          setReviewsByService({
            Detailing: detJson.reviews || [],
            Cleaning: [],
          });
        } else {
          // загальний випадок: тягнемо і Detailing, і Cleaning
          const [detRes, cleanRes] = await Promise.all([
            reqApi.get("/reviews/detailing"),
            reqApi.get("/reviews/cleaning"),
          ]);

          const detJson = detRes.data;
          const cleanJson = cleanRes.data;

          setReviewsByService({
            Detailing: detJson.reviews || [],
            Cleaning: cleanJson.reviews || [],
          });
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isDetailingPage]);

  const filteredReviews = reviewsByService[selectedService] || [];

  const safeVisibleCards =
    filteredReviews.length < visibleCards
      ? filteredReviews.length || 0
      : visibleCards;

  const handlePrev = () => {
    if (filteredReviews.length <= safeVisibleCards) return;

    setStartIndex((prevIndex) =>
      prevIndex === 0
        ? filteredReviews.length - safeVisibleCards
        : prevIndex - 1
    );
  };

  const handleNext = () => {
    if (filteredReviews.length <= safeVisibleCards) return;

    setStartIndex((prevIndex) =>
      prevIndex + safeVisibleCards >= filteredReviews.length ? 0 : prevIndex + 1
    );
  };

  const visibleItems = filteredReviews.slice(
    startIndex,
    startIndex + safeVisibleCards
  );

  const buttonRefs = useRef({});
  const [activePosition, setActivePosition] = useState({ left: 0, width: 0 });

  useEffect(() => {
    // оновлюємо позицію підсвітки тільки якщо є таби (тобто не на DetailingPage)
    if (!isDetailingPage) {
      const activeButton = buttonRefs.current[selectedService];
      if (activeButton) {
        const { offsetLeft, offsetWidth } = activeButton;
        setActivePosition({ left: offsetLeft, width: offsetWidth });
      }
    }
  }, [selectedService, isDetailingPage]);

  if (loading) {
    return (
      <div className="w-[100%] max-w-[2100px] mx-auto py-12 px-4 md:px-16">
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Reviews
        </h2>
        <p className="text-lg text-[#52525B]">Loading Google Reviews...</p>
      </div>
    );
  }

  return (
    <div className="w-[100%] max-w-[2100px] mx-auto py-12">
      {/* Заголовок + (умовно) перемикачі */}
      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 mb-8 px-4 md:px-16">
        <h2 className="text-4xl md:text-5xl font-bold text-black ml-2">
          Reviews
        </h2>

        {/* Перемикач показуємо тільки якщо ми НЕ на /services/detailing */}
        {!isDetailingPage && (
          <div className="relative inline-flex items-center bg-white rounded-full px-1 py-1">
            {/* Підсвітка активного табу */}
            <div
              className="absolute top-1 bottom-1 bg-[rgba(242,242,242,1)] rounded-full transition-all duration-300 ease-in-out z-0"
              style={{
                left: `${activePosition.left}px`,
                width: `${activePosition.width}px`,
              }}
            />

            {/* Таби */}
            <div className="relative flex z-10 space-x-1">
              {["Detailing", "Cleaning"].map((service) => (
                <button
                  key={service}
                  ref={(el) => (buttonRefs.current[service] = el)}
                  onClick={() => {
                    setSelectedService(service);
                    setStartIndex(0);
                  }}
                  className="text-[14px] md:text-[24px] font-semibold text-[#18181B] py-4 px-9 rounded-full leading-none transition"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Картки */}
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 px-4 md:px-12">
        {visibleItems.length === 0 && (
          <p className="text-lg text-[#52525B]">
            Ще немає відгуків для цього сервісу.
          </p>
        )}

        {visibleItems.map((item, index) => (
          <div
            key={item.id ?? index}
            className="flex flex-col w-full md:w-[436px] min-h-[260px] bg-white rounded-[32px] p-6"
          >
            <div className="flex items-center mb-4">
              {item.profilePhotoUrl ? (
                <img
                  src={item.profilePhotoUrl}
                  alt="Avatar"
                  className="w-[80px] h-[80px] rounded-full mr-3 object-cover"
                />
              ) : (
                <img
                  src={avatarIcon}
                  alt="Avatar"
                  className="w-[80px] h-[80px] rounded-full mr-3"
                />
              )}
              <div className="flex flex-col">
                <h3
                  className="text-[20px] font-bold leading-[28px] text-[#18181B]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {item.name}
                </h3>
                {item.rating && (
                  <span className="text-sm text-[#F59E0B]">
                    ⭐ {item.rating}/5
                  </span>
                )}
                {item.relativeTime && (
                  <span className="text-xs text-[#A1A1AA]">
                    {item.relativeTime}
                  </span>
                )}
              </div>
            </div>
            <p
              className="text-[16px] font-normal leading-[140%] text-[#52525B]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {item.review}
            </p>
          </div>
        ))}
      </div>

      {/* Стрілки */}
      {filteredReviews.length > safeVisibleCards && (
        <div className="flex justify-start mt-4 px-4 md:px-16">
          <div className="flex space-x-[8px]">
            <button
              onClick={handlePrev}
              className="w-[68px] h-[52px] rounded-[88px] bg-white flex items-center justify-center py-4 px-6"
            >
              <img src={LeftArrowIcon} alt="Arrow Left" className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-[68px] h-[52px] rounded-[88px] bg-white flex items-center justify-center py-4 px-6"
            >
              <img src={RightArrowIcon} alt="Arrow Right" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurReviews;
