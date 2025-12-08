// src/components/detailing/ServicesProvide.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import carRed from "../../../assets/icons/carred.svg";
import arrowRightIcon from "../../../assets/icons/arrows/arrow_right_black.svg";

// ==== МЕДІА ДЛЯ КОЖНОГО СЕРВІСУ ====
// Шляхи розраховані під те, що фото/відео лежать у public/Services we provide/...
// Якщо вони в іншій папці — просто підкоригуй шляхи.
const mediaByServiceId = {
  // Dealerships (поки без медіа)
  1: {
    images: [],
    videos: [],
  },

  // Fleets
  2: {
    images: [
      "/Services we provide/Fleets/IMG_0529.JPG",
      "/Services we provide/Fleets/IMG_0530.JPG",
      "/Services we provide/Fleets/IMG_0639.jpg",
      "/Services we provide/Fleets/IMG_8378.JPG",
      "/Services we provide/Fleets/IMG_8380.JPG",
    ],
    videos: [
      "/Services we provide/Fleets/IMG_0674.MOV",
      "/Services we provide/Fleets/IMG_8974.mov",
    ],
  },

  // Interior & Exterior Detailing
  3: {
    images: [
      "/Services we provide/Interior and Exterior Detailing/ELI02869.JPG",
      "/Services we provide/Interior and Exterior Detailing/ELI02878.JPG",
      "/Services we provide/Interior and Exterior Detailing/ELI02886.JPG",
      "/Services we provide/Interior and Exterior Detailing/TIM06143 copy.JPG",
      "/Services we provide/Interior and Exterior Detailing/TIM06149 copy.JPG",
      // можеш додати й скріни, якщо хочеш:
      // "/Services we provide/Interior and Exterior Detailing/Screenshot 2025-04-10 at 10.46.32.png",
    ],
    videos: [],
  },

  // Ceramic
  4: {
    images: [
      "/Services we provide/Ceramic/Copy of A7R04034 copy.JPG",
      "/Services we provide/Ceramic/Copy of A7R04116 copy.JPG",
      "/Services we provide/Ceramic/Copy of A7R04173 copy.JPG",
    ],
    videos: [],
  },

  // Wrap / PPF (поки без медіа — за бажанням додаси)
  5: {
    images: [],
    videos: [],
  },

  // Other Services
  6: {
    images: [],
    videos: [
      "/Services we provide/Other Services/01 - IMG_2127.mov",
      "/Services we provide/Other Services/02 - 0cd9e35030f340adba9c26.mov",
    ],
  },
};

// ==== ТЕКСТОВИЙ КОНТЕНТ СЕРВІСІВ (Я НЕ ЧІПАВ СТРУКТУРУ) ====
const services = [
  {
    id: 1,
    title: "Dealerships",
    shortDescription:
      "Comprehensive detailing services for dealership inventory. Fast turnaround, consistent quality, volume pricing. Keep your lot looking showroom-ready.",
    detailedDescription: `
Professional detailing services designed specifically for automotive dealerships. We understand 
the importance of presentation in vehicle sales—first impressions matter. Our team provides 
fast, efficient, and consistent detailing for your entire inventory, from trade-ins to premium 
vehicles. Services include but are not limited to full exterior wash and wax, interior cleaning and 
conditioning, and final inspection prep. Volume pricing available. We work with your schedule to 
ensure vehicles are ready when you need them.
    `,
  },
  {
    id: 2,
    title: "Fleets",
    shortDescription:
      "Professional fleet detailing for businesses. Maintain your company's image with clean, well-maintained vehicles. Scheduled service, competitive rates.",
    detailedDescription: `
Keep your company fleet looking professional with our specialized fleet detailing services. 
Whether you have delivery vehicles, company cars, or commercial trucks, we provide 
consistent, reliable detailing that maintains your brand image on the road. Services include 
exterior wash and protection, interior cleaning and sanitization, and scheduled maintenance 
programs. We offer flexible scheduling and on-site service options. Your vehicles represent your 
business—let us help you make the right impression.
    `,
  },
  {
    id: 3,
    title: "Interior & Exterior Detailing",
    shortDescription:
      "Complete interior and exterior detailing for all vehicle types. Meticulous cleaning, conditioning, and protection. Transform your vehicle inside and out.",
    detailedDescription: `
Our comprehensive interior and exterior detailing service covers every aspect of your vehicle. 
Exterior services include hand washing, clay bar treatment, paint correction, trim restoration, 
wax application, wheel and tire cleaning, and glass polishing. Interior services include deep 
vacuuming, seat and carpet shampooing, leather conditioning, thorough plastic cleaning, plastic 
protection, and glass cleaning. We use professional-grade products and techniques to restore 
your vehicle to like-new condition. Perfect for personal vehicles, luxury cars, or any vehicle 
deserving premium care. 
    `,
  },
  {
    id: 4,
    title: "Ceramic Coating",
    shortDescription:
      "Professional ceramic coating application with up to 5-year protection. Superior gloss, hydrophobic properties, and lasting paint protection.",
    detailedDescription: `
Protect your investment with professional ceramic coating application. Our team applies 
premium Gtechniq ceramic coatings that create a durable, glass-like protective layer chemically 
bonded to your vehicle's paint. Benefits include superior UV protection, resistance to 
environmental contaminants, enhanced gloss and depth, hydrophobic water-beading properties, 
and easier maintenance. Complimentary add-on services include Exo, glass coating and wheel 
coating. This is the ultimate protection for your vehicle's finish. 
    `,
  },
  {
    id: 5,
    title: "Wrap / PPF (Paint Protection Film)",
    shortDescription:
      "Paint protection film and vehicle wrap services through our trusted partner. Protect your paint or transform your vehicle's appearance.",
    detailedDescription: `
Protect your vehicle's paint or completely transform its appearance with professional wrap and 
paint protection film (PPF) services. Through our trusted partner network, we offer clear PPF for 
invisible protection against rock chips, scratches, and road debris, as well as full or partial 
vehicle wraps in any color or finish. Wraps offer unlimited customization options for personal 
style or business branding. Expert installation with warranty coverage. Consultation available to 
determine the best solution for your needs.
    `,
  },
  {
    id: 6,
    title: "Other Services",
    shortDescription:
      "Glass Coating, Wheel Coating, Headlight Restoration, Trim Restoration, Decal and Sticker Removal, Window Tinting, and more. Complete solutions for all of your vehicle care needs.",
    items: [
      {
        title: "Glass Coating",
        description:
          "Ultra-hydrophobic barrier applied to glass that causes rainwater to bead and roll off instantly. Dramatically improves visibility during storms and makes glass easier to clean.",
      },
      {
        title: "Wheel Coating",
        description:
          "Durable protection specifically formulated for wheels that repels brake dust and road grime. Creates a heat-resistant barrier that prevents corrosion and makes wheels significantly easier to maintain.",
      },
      {
        title: "Headlight Restoration",
        description:
          "Removes yellowing, oxidation, and haziness from headlight lenses. Restores clarity, improves nighttime visibility, and enhances vehicle appearance. Includes protective coating.",
      },
      {
        title: "Trim Restoration",
        description:
          "Revives faded and discolored exterior plastic and rubber trim to a rich, like-new appearance. Penetrates surfaces to restore color depth while providing UV protection against future fading.",
      },
      {
        title: "Decal and Sticker Removal",
        description:
          "Professional removal of unwanted decals, stickers, and adhesive residue from vehicle surfaces. Safe techniques that protect your paint while completely eliminating stubborn graphics and markings.",
      },
      {
        title: "Window Tinting",
        description:
          "Professional tint installation for UV protection, heat reduction, privacy, and enhanced appearance. Multiple shade options available.",
      },
    ],
  },
];

const ServicesProvide = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState(null);

  const openModal = (service) => {
    setModalService(service);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalService(null);
    setModalOpen(false);
  };

  return (
    <section className="relative w-[95%] max-w-[1792px] mx-auto bg-white rounded-[32px] py-10 px-4 md:px-10 shadow-md">
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-black">
          Services We Provide
        </h2>
      </div>

      {/* Картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col bg-[#F5F5F5] rounded-[24px] p-5 md:p-6 min-h-[220px] hover:shadow-lg transition-transform duration-200 hover:scale-[1.01]"
          >
            <div className="flex flex-col items-start mb-4">
              <img
                src={carRed}
                alt=""
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
              />

              <h3
                className="text-[24px] md:text-[36px] font-bold mt-3 text-black"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {service.title}
              </h3>
            </div>

            <p
              className="text-[15px] md:text-[18px] text-[#4B4B4F] mb-6 flex-1"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {service.shortDescription}
            </p>

            <button
              onClick={() => openModal(service)}
              className="flex items-center justify-between w-full h-[44px] md:h-[48px] rounded-[999px] text-[15px] md:text-[16px] px-5 font-semibold mt-auto"
              style={{
                background:
                  "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)",
                fontFamily: "Manrope, sans-serif",
              }}
              type="button"
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
            </button>
          </div>
        ))}
      </div>

      {/* Модалка через портал у body */}
      {modalOpen &&
        modalService &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] px-4">
            <div className="bg-white rounded-[24px] max-w-xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-[20px] font-bold text-gray-500 hover:text-black"
              >
                ✕
              </button>

              {/* ГАЛЕРЕЯ ФОТО / ВІДЕО */}
              {(() => {
                const media = mediaByServiceId[modalService.id] || {};
                const hasMedia =
                  (media.images && media.images.length > 0) ||
                  (media.videos && media.videos.length > 0);

                if (!hasMedia) return null;

                return (
                  <div className="mb-5">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {media.images &&
                        media.images.map((src) => (
                          <div
                            key={src}
                            className="w-full overflow-hidden rounded-[16px] bg-black/5"
                          >
                            <img
                              src={src}
                              alt={`${modalService.title} photo`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}

                      {media.videos &&
                        media.videos.map((src) => (
                          <div
                            key={src}
                            className="w-full overflow-hidden rounded-[16px] bg-black/5"
                          >
                            <video
                              src={src}
                              controls
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}

              {/* ТЕКСТ (СТРУКТУРУ НЕ ЧІПАВ) */}
              <div className="text-[16px] leading-relaxed text-[#333] space-y-4">
                <h3 className="font-bold text-[20px]">{modalService.title}</h3>

                {modalService.id === 6 && modalService.items ? (
                  <div className="space-y-4">
                    {modalService.items.map((item) => (
                      <div key={item.title}>
                        <p className="font-bold text-[16px] mb-1">
                          {item.title}
                        </p>
                        <p className="text-[16px] leading-[1.55]">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  modalService.detailedDescription &&
                  modalService.detailedDescription
                    .trim()
                    .split(/\n\s*\n/)
                    .map((paragraph, idx) => (
                      <p key={idx} className="text-[16px] leading-[1.55]">
                        {paragraph.trim()}
                      </p>
                    ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 rounded-full border border-[#D4D4D8] text-sm md:text-[15px] hover:bg-[#F4F4F5] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default ServicesProvide;
