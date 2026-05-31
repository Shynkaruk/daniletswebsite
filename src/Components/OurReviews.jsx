import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import avatarIcon from "../assets/icons/avatar-icon.png";
import RightArrowIcon from "../assets/icons/angle-right-icon.png";
import LeftArrowIcon from "../assets/icons/angle-left-icon.png";
import { apiGet } from "../lib/api";

const VISIBLE_CARDS = 4;

const OurReviews = ({ className = "" }) => {
  const location = useLocation();

  // Hostname wins over pathname so domain-specific sites work correctly
  const domainType = useMemo(() => {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("daniletsdetailing")) return "detailing";
    if (host.includes("daniletscleaning")) return "cleaning";
    return "main";
  }, []);

  const isDetailingPage = useMemo(
    () => domainType === "detailing" || location.pathname.includes("/detailing"),
    [domainType, location.pathname]
  );
  const isCleaningPage = useMemo(
    () => domainType === "cleaning" || location.pathname.includes("/cleaning"),
    [domainType, location.pathname]
  );

  const hideTabs = isDetailingPage || isCleaningPage;

  const [reviewsByService, setReviewsByService] = useState({
    Detailing: [],
    Cleaning: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("Detailing");
  const [startIndex, setStartIndex] = useState(0);

  // 1) Фіксуємо selectedService на сторінках detailing/cleaning
  useEffect(() => {
    if (isDetailingPage) {
      setSelectedService("Detailing");
      setStartIndex(0);
    } else if (isCleaningPage) {
      setSelectedService("Cleaning");
      setStartIndex(0);
    }
  }, [isDetailingPage, isCleaningPage]);

  // 2) Фетчимо Google reviews
  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      setLoading(true);

      try {
        if (isDetailingPage) {
          const detJson = await apiGet("/api/reviews/google/detailing");
          if (cancelled) return;

          setReviewsByService({
            Detailing: detJson?.reviews || [],
            Cleaning: [],
          });
        } else if (isCleaningPage) {
          const cleanJson = await apiGet("/api/reviews/google/cleaning");
          if (cancelled) return;

          setReviewsByService({
            Detailing: [],
            Cleaning: cleanJson?.reviews || [],
          });
        } else {
          const [detJson, cleanJson] = await Promise.all([
            apiGet("/api/reviews/google/detailing"),
            apiGet("/api/reviews/google/cleaning"),
          ]);
          if (cancelled) return;

          setReviewsByService({
            Detailing: detJson?.reviews || [],
            Cleaning: cleanJson?.reviews || [],
          });
        }
      } catch (error) {
        if (!cancelled) console.error("Error loading Google reviews:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, isDetailingPage, isCleaningPage]);

  const filteredReviews = reviewsByService[selectedService] || [];
  const safeVisibleCards = Math.min(VISIBLE_CARDS, filteredReviews.length);

  // 3) Якщо змінився сервіс — скидаємо індекс (на головній важливо)
  useEffect(() => {
    setStartIndex(0);
  }, [selectedService]);

  // 4) Якщо дані змінились і startIndex виліз за межі — підрізаємо
  useEffect(() => {
    if (filteredReviews.length === 0) {
      if (startIndex !== 0) setStartIndex(0);
      return;
    }

    const maxStart = Math.max(0, filteredReviews.length - safeVisibleCards);
    if (startIndex > maxStart) setStartIndex(0);
  }, [filteredReviews.length, safeVisibleCards, startIndex]);

  const visibleItems = useMemo(() => {
    if (safeVisibleCards === 0) return [];
    return filteredReviews.slice(startIndex, startIndex + safeVisibleCards);
  }, [filteredReviews, startIndex, safeVisibleCards]);

  const handlePrev = () => {
    if (filteredReviews.length <= safeVisibleCards) return;

    setStartIndex((prev) =>
      prev === 0 ? filteredReviews.length - safeVisibleCards : prev - 1
    );
  };

  const handleNext = () => {
    if (filteredReviews.length <= safeVisibleCards) return;

    setStartIndex((prev) =>
      prev + safeVisibleCards >= filteredReviews.length ? 0 : prev + 1
    );
  };

  // Tabs underline positioning
  const buttonRefs = useRef({});
  const [activePosition, setActivePosition] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (hideTabs) return;
    const activeButton = buttonRefs.current[selectedService];
    if (!activeButton) return;

    const update = () => {
      const { offsetLeft, offsetWidth } = activeButton;
      setActivePosition({ left: offsetLeft, width: offsetWidth });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [selectedService, hideTabs]);

  if (loading) {
    return (
      <section className={`w-full py-12 ${className}`}>
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Reviews
        </h2>
        <p className="text-lg text-[#52525B]">Loading Google Reviews...</p>
      </section>
    );
  }

  return (
    <section className={`w-full py-12 ${className}`}>
      {/* Header + tabs */}
      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-black">Reviews</h2>

        {!hideTabs && (
          <div className="relative inline-flex items-center bg-white rounded-full px-1 py-1">
            <div
              className="absolute top-1 bottom-1 bg-[rgba(242,242,242,1)] rounded-full transition-all duration-300 ease-in-out z-0"
              style={{
                left: `${activePosition.left}px`,
                width: `${activePosition.width}px`,
              }}
            />
            <div className="relative flex z-10 gap-1">
              {["Detailing", "Cleaning"].map((service) => (
                <button
                  key={service}
                  ref={(el) => (buttonRefs.current[service] = el)}
                  onClick={() => setSelectedService(service)}
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

      {/* Cards */}
      <div className="flex flex-col md:flex-row justify-center gap-4">
        {visibleItems.length === 0 && (
          <p className="text-lg text-[#52525B]">Reviews coming soon</p>
        )}

        {visibleItems.map((item, index) => (
          <div
            key={item?.id ?? `${selectedService}-${startIndex}-${index}`}
            className="flex flex-col w-full md:w-[436px] min-h-[260px] bg-white rounded-[32px] p-6"
          >
            <div className="flex items-center mb-4">
              <img
                src={item?.profilePhotoUrl || avatarIcon}
                alt="Avatar"
                className="w-[80px] h-[80px] rounded-full mr-3 object-cover"
              />

              <div className="flex flex-col">
                <h3
                  className="text-[20px] font-bold leading-[28px] text-[#18181B]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {item?.name || "Anonymous"}
                </h3>

                {typeof item?.rating === "number" && (
                  <span className="text-sm text-[#F59E0B]">
                    ⭐ {item.rating}/5
                  </span>
                )}

                {item?.relativeTime && (
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
              {item?.review || ""}
            </p>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {filteredReviews.length > safeVisibleCards && (
        <div className="flex justify-start mt-4">
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="w-[68px] h-[52px] rounded-[88px] bg-white flex items-center justify-center"
              aria-label="Previous reviews"
            >
              <img src={LeftArrowIcon} alt="" className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="w-[68px] h-[52px] rounded-[88px] bg-white flex items-center justify-center"
              aria-label="Next reviews"
            >
              <img src={RightArrowIcon} alt="" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default OurReviews;