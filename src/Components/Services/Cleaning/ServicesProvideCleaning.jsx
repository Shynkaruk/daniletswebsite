// src/components/cleaning/ServicesProvideCleaning.jsx
import React, { useState } from "react";

// ДАНІ ЧОТИРЬОХ СЕРВІСІВ
const cleaningServices = [
  {
    id: 1,
    title: "Commercial Cleaning",
    short:
      "Comprehensive cleaning for businesses — retail spaces, offices, and more.",
    detailed: `
Professional commercial cleaning services designed to maintain your business environment at the highest standards. 
Your workspace reflects your brand—cleanliness impacts employee productivity and customer perception.

Our services include:
• Floor care  
• High-touch surface sanitization  
• Restroom deep cleaning & restocking  
• Break room & kitchen cleaning  
• Trash removal & recycling  
• Dusting for all areas  

We service retail spaces, corporate offices, and all commercial properties.  
Flexible scheduling: after-hours, early mornings, or weekends.
`,
  },
  {
    id: 2,
    title: "Office Cleaning",
    short:
      "Specialized cleaning for office environments that support productivity.",
    detailed: `
We create clean, productive office environments where your team can thrive.

Our services include:
• Desk & workstation cleaning  
• Conference room sanitization  
• Reception area cleaning  
• Break room deep clean  
• Restroom sanitization & supply restocking  
• Floor care for all types  
• Window & glass cleaning  

We respect confidentiality and security in office spaces.  
Flexible scheduling: after-hours, early mornings, weekends.
`,
  },
  {
    id: 3,
    title: "Airbnb Cleaning",
    short:
      "Professional cleaning for short-term rentals. Perfect for maintaining 5-star ratings.",
    detailed: `
Designed for Airbnb and short-term rental hosts who want consistent 5-star reviews.

Includes:
• Bedroom prep with fresh linens  
• Bathroom deep sanitization  
• Kitchen cleaning + appliances  
• Living area refresh  
• Floor care  
• Final walkthrough  

Fast turnover for same-day check-ins.  
Guests notice the details — we guarantee the “hotel-clean” experience.
`,
  },
  {
    id: 4,
    title: "Deep Cleaning",
    short:
      "Intensive, detailed cleaning for move-ins, move-outs, seasonal refresh, and more.",
    detailed: `
Complete deep cleaning far beyond regular maintenance.

Includes:
• Baseboards  
• Windows  
• Inside appliances  
• Cabinets  
• Light fixtures  
• Ceiling fans  
• Vent cleaning  
• Bathroom grout scrubbing  
• Kitchen deep cleaning  
• Hard floor care  

Ideal for move-ins/outs, post-construction, seasonal refresh, or one-time resets.  
Uses professional-grade equipment and products.
`,
  },
];

const ServicesProvideCleaning = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState(null);

  const openModal = (service) => {
    setModalService(service);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalService(null);
  };

  return (
    // даємо більше відступу зверху, щоб було з чого “заїхати”
    <section className="w-full bg-[#F5F5F7] pt-16 md:pt-28 pb-10 md:pb-16">
      <div className="w-[min(1600px,100%)] mx-auto px-4 md:px-8">

        {/* ТІЛЬКИ ЦЕЙ КОНТЕЙНЕР ПІДНІМАЄМО */}
        <div className="relative z-10 -mt-10 md:-mt-50 bg-white rounded-[32px] px-4 py-6 md:px-10 md:py-10 shadow-sm">
          <h2 className="text-[24px] md:text-[36px] font-semibold mb-6 md:mb-10">
            Services we provide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {cleaningServices.map((service) => (
              <div
                key={service.id}
                className="bg-[#F3F4F6] rounded-[32px] p-6 flex flex-col gap-5"
              >
                <div className="w-10 h-10 rounded-full bg-[#FF5252CC] flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>

                <h3 className="text-[24px] md:text-[32px] font-semibold leading-tight">
                  {service.title}
                </h3>
                <p className="text-[15px] md:text-[18px] text-[#6B7280]">
                  {service.short}
                </p>

                <button
                  onClick={() => openModal(service)}
                  className="mt-auto w-full flex items-center justify-between px-6 py-3 rounded-full bg-white text-[14px] font-semibold text-[#3E0C0C] hover:bg-[#3E0C0C] transition"
                >
                  <span>Learn More</span>
                  <span className="text-base ml-2">›</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модалка як була */}
      {modalOpen && modalService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] px-4">
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[20px] font-bold text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h3 className="text-[26px] font-semibold mb-4">{modalService.title}</h3>

            <p className="whitespace-pre-line text-[16px] text-[#444] leading-relaxed">
              {modalService.detailed}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};


export default ServicesProvideCleaning;
