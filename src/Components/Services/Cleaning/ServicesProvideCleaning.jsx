// src/components/cleaning/ServicesProvideCleaning.jsx
import React, { useEffect, useState } from "react";
import arrowRightIcon from "../../../assets/icons/arrows/arrow_right_black.svg";

// ==== МЕДІА ДЛЯ КОЖНОГО СЕРВІСУ (BOX 1–4 з Portfolio_Cleaning) ====
const mediaByServiceId = {
  1: [
    "/Portfolio_Cleaning/Box 1/IMG_1300.jpg",
    "/Portfolio_Cleaning/Box 1/IMG_1302.jpg",
    "/Portfolio_Cleaning/Box 1/IMG_1310.jpg",
    "/Portfolio_Cleaning/Box 1/IMG_1319.jpg",
    "/Portfolio_Cleaning/Box 1/IMG_1323.jpg",
    "/Portfolio_Cleaning/Box 1/IMG_1340.jpg",
    "/Portfolio_Cleaning/Box 1/IMG_1345.jpg",
    "/Portfolio_Cleaning/Box 1/IMG_1351.jpg",
  ],
  2: [
    "/Portfolio_Cleaning/Box 2/IMG_0946.jpg",
    "/Portfolio_Cleaning/Box 2/IMG_0947.jpg",
    "/Portfolio_Cleaning/Box 2/IMG_0952.jpg",
    "/Portfolio_Cleaning/Box 2/IMG_0957.jpg",
    "/Portfolio_Cleaning/Box 2/IMG_0960.jpg",
    "/Portfolio_Cleaning/Box 2/IMG_0961.jpg",
    "/Portfolio_Cleaning/Box 2/IMG_0962.jpg",
    "/Portfolio_Cleaning/Box 2/IMG_0965.jpg",
  ],
  3: [
    "/Portfolio_Cleaning/Box 3/IMG_8537.jpg",
    "/Portfolio_Cleaning/Box 3/IMG_8538.jpg",
    "/Portfolio_Cleaning/Box 3/IMG_8540.jpg",
    "/Portfolio_Cleaning/Box 3/IMG_8546.jpg",
    "/Portfolio_Cleaning/Box 3/IMG_8551.jpg",
    "/Portfolio_Cleaning/Box 3/IMG_8553.jpg",
  ],
  4: [
    "/Portfolio_Cleaning/Box 4/IMG_4397.JPG",
    "/Portfolio_Cleaning/Box 4/IMG_4502.jpg",
    "/Portfolio_Cleaning/Box 4/IMG_4508.jpg",
    "/Portfolio_Cleaning/Box 4/IMG_4517.jpg",
    "/Portfolio_Cleaning/Box 4/IMG_4534.jpg",
    "/Portfolio_Cleaning/Box 4/IMG_4540.jpg",
    "/Portfolio_Cleaning/Box 4/IMG_5876.JPG",
    "/Portfolio_Cleaning/Box 4/IMG_5879.JPG",
    "/Portfolio_Cleaning/Box 4/IMG_5881.JPG",
  ],
};

// ДАНІ ЧОТИРЬОХ СЕРВІСІВ
const cleaningServices = [
  {
    id: 1,
    title: "Commercial Cleaning",
    short:
      "Comprehensive cleaning for businesses — retail spaces, offices, and more.",
    detailed: `
Professional commercial cleaning services designed to maintain your business environment at the highest standards. We understand that your workspace is a reflection of your brand, and cleanliness directly impacts employee productivity and customer perception. Our comprehensive services include floor care, surface sanitization of high-touch areas, restroom deep cleaning and restocking, break room and kitchen cleaning, trash removal and recycling management, and dusting of all surfaces.

We work with retail spaces, corporate offices, and various other commercial properties using professional-grade products that are effective yet safe. Flexible scheduling available including after-hours, early morning, and weekend services to minimize disruption to your operations.
`,
  },
  {
    id: 2,
    title: "Office Cleaning",
    short:
      "Specialized cleaning for office environments that support productivity.",
    detailed: `
Specialized office cleaning services that create healthy, productive work environments for your team. We provide thorough desk and workstation cleaning, conference room sanitization, reception area maintenance, kitchen and break room deep cleaning, restroom sanitization and supply restocking, floor care for all surface types, and window and glass cleaning.

Our team understands the importance of confidentiality and security in office settings. Flexible scheduling options include after-hours cleaning, early morning services, or weekend deep cleans to ensure minimal disruption while maintaining the highest cleaning standards. Perfect for corporate environments where professionalism and attention to detail matter.
`,
  },
  {
    id: 3,
    title: "Airbnb Cleaning",
    short:
      "Professional cleaning for short-term rentals. Perfect for maintaining 5-star ratings.",
    detailed: `
Professional Airbnb and short-term rental cleaning services designed specifically for hosts who want to maintain 5-star ratings. Our service includes complete bedroom preparation with fresh linens, bathroom deep cleaning and sanitization, kitchen clean with appliance care, living area refresh, floor care throughout the property, and final walkthrough to ensure everything is guest-ready.

We work on your booking schedule with fast turnaround times between guests. Same-day turnovers available for back-to-back bookings. Our team pays special attention to the details that guests notice in reviews—fresh scents, spotless bathrooms, and that hotel-clean feeling that earns 5-star ratings.
`,
  },
  {
    id: 4,
    title: "Deep Cleaning",
    short:
      "Intensive, detailed cleaning for move-ins, move-outs, seasonal refresh, and more.",
    detailed: `
Intensive, comprehensive deep cleaning services that go far beyond regular maintenance cleaning. Our service includes baseboard cleaning, detailed window cleaning, thorough appliance cleaning inside and out, cabinet cleaning, light fixture and ceiling fan cleaning, vent cleaning, detailed bathroom cleaning with grout scrubbing, kitchen deep clean with backsplash scrubbing, and hard floor care.

Perfect for move-in and move-out situations, post-construction cleaning, seasonal deep cleans, or when your space needs a complete refresh. We bring professional-grade equipment and products that deliver results you can see and feel. Available as a one-time service or periodic deep clean to supplement regular maintenance.
`,
  },
];

const ServicesProvideCleaning = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState(null);
  const [modalMedia, setModalMedia] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const openModal = (service) => {
    setModalService(service);
    const media = mediaByServiceId[service.id] || [];
    setModalMedia(media);
    setActiveMediaIndex(0);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalService(null);
    setModalMedia([]);
    setActiveMediaIndex(0);
    setModalOpen(false);
  };

  const handlePrev = () => {
    if (!modalMedia.length) return;
    setActiveMediaIndex((prev) =>
      prev === 0 ? modalMedia.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!modalMedia.length) return;
    setActiveMediaIndex((prev) =>
      prev === modalMedia.length - 1 ? 0 : prev + 1
    );
  };

  // блокуємо скрол сторінки, коли модалка відкрита
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  return (
    <section className="w-full bg-[#F5F5F7] pt-16 md:pt-28 pb-10 md:pb-16">
      <div className="w-[min(1600px,100%)] mx-auto px-4 md:px-8">
        <div className="relative z-10 -mt-35 md:-mt-60 bg-white rounded-[32px] px-4 py-6 md:px-10 md:py-10 shadow-sm">
          <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-black mb-6">
            Services We Provide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {cleaningServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => openModal(service)}
                className="
                  group cursor-pointer
                  bg-[#F3F4F6] rounded-[32px] p-6
                  flex flex-col text-left
                  transition
                  hover:bg-white hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-[#FF5252CC]
                "
              >
                <div className="w-10 h-10 rounded-full bg-[#FF5252CC] flex items-center justify-center mb-3">
                  <span className="text-lg">✓</span>
                </div>

                <div className="min-h-[72px] flex items-start">
                  <h3 className="text-[24px] md:text-[28px] font-semibold leading-tight">
                    {service.title}
                  </h3>
                </div>

                <div className="mt-2 min-h-[96px] md:min-h-[110px] flex items-start">
                  <p className="text-[15px] md:text-[16px] text-[#6B7280] leading-snug">
                    {service.short}
                  </p>
                </div>

                <div
                  className="
                    mt-auto flex items-center justify-between
                    w-full h-[44px] md:h-[48px]
                    rounded-[999px]
                    text-[14px] md:text-[15px] px-5 font-semibold
                    transition-transform duration-200
                    group-hover:scale-[1.01]
                  "
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  <span>Learn More</span>
                  <span className="inline md:hidden">
                    <img
                      src={arrowRightIcon}
                      alt="arrow"
                      className="w-[18px] h-[18px] object-contain"
                    />
                  </span>
                  <span className="hidden md:inline">
                    <img
                      src={arrowRightIcon}
                      alt="arrow"
                      className="w-[20px] h-[20px] object-contain"
                    />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Модалка */}
      {modalOpen && modalService && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999999] px-4"
          onMouseDown={closeModal}
          onTouchStart={closeModal}
        >
          <div
            className="bg-white rounded-[28px] md:rounded-[32px] w-full max-w-[980px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 md:px-7 pt-5 pb-3 border-b border-[#E4E4E7]">
              <h3
                className="text-[18px] sm:text-[20px] md:text-[22px] font-semibold text-[#18181B]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {modalService.title}
              </h3>
              <button
                onClick={closeModal}
                type="button"
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F5] text-[18px] font-semibold text-[#52525B] hover:bg-[#E4E4E7] transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-5 md:px-7 pb-6 pt-4 overflow-y-auto [-webkit-overflow-scrolling:touch]">
              {/* Головне фото + стрілки */}
              {modalMedia.length > 0 && (
                <div className="relative mb-4">
                  <div className="w-full rounded-[20px] md:rounded-[24px] overflow-hidden bg-[#F4F4F5]">
                    <img
                      src={modalMedia[activeMediaIndex]}
                      alt={`${modalService.title} photo`}
                      className="w-full h-[220px] sm:h-[320px] md:h-[420px] object-cover select-none"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {modalMedia.length > 1 && (
                    <div className="absolute left-4 bottom-4 flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        type="button"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[18px] font-semibold hover:bg-white"
                      >
                        {"<"}
                      </button>
                      <button
                        onClick={handleNext}
                        type="button"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[18px] font-semibold hover:bg-white"
                      >
                        {">"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnails (ФІКС мобілки) */}
              {modalMedia.length > 1 && (
                <div className="mb-3">
                  {/* MOBILE: grid — без overflow-x (це прибирає “колажі” на iOS) */}
                  <div className="grid grid-cols-4 gap-3 sm:hidden">
                    {modalMedia.map((src, idx) => (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`aspect-[4/3] w-full rounded-[14px] overflow-hidden border ${
                          idx === activeMediaIndex
                            ? "border-[#18181B]"
                            : "border-transparent"
                        } bg-[#F4F4F5]`}
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>

                  {/* SM+: горизонтальний скрол як був, але стабільніше */}
                  <div className="hidden sm:block overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                    <div className="flex w-max gap-3">
                      {modalMedia.map((src, idx) => (
                        <button
                          key={`${src}-${idx}`}
                          type="button"
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`w-[96px] h-[80px] rounded-[16px] overflow-hidden border ${
                            idx === activeMediaIndex
                              ? "border-[#18181B]"
                              : "border-transparent"
                          } bg-[#F4F4F5] flex-shrink-0`}
                        >
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Текст */}
              <div className="text-[15px] sm:text-[16px] leading-relaxed text-[#3F3F46] space-y-4">
                {modalService.detailed
                  .trim()
                  .split(/\n\s*\n/)
                  .map((paragraph, idx) => (
                    <p key={idx}>{paragraph.trim()}</p>
                  ))}
              </div>

              {/* Close */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  type="button"
                  className="px-6 py-2 rounded-full border border-[#D4D4D8] text-sm md:text-[15px] hover:bg-[#F4F4F5] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesProvideCleaning;
