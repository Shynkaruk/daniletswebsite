import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import faqIcon from "../assets/icons/icon-faq.png";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const location = useLocation();

  const isDetailingPage = location.pathname.startsWith("/services/detailing");
  const isCleaningPage = location.pathname.startsWith("/services/cleaning");

  // ⭐ Default FAQ (використовується на головних сторінках)
  const defaultFaqItems = [
    {
      question: "What areas do you serve? ",
      answer:
        "We serve the Greater Columbus area and surrounding communities. Contact us to confirm we service your specific location.",
    },
    {
      question: "How do I book services with Danilets?",
      answer:
        "For detailing services, you can book directly through our online booking system at danilets.com/detailing. For cleaning, media, and pickleball services, please fill out our quote form on the respective service pages. You can also call us at (614) 980-7380 for any service.",
    },
    {
      question: "Do you handle emergency or last-minute requests?",
      answer:
        "We do our best to accommodate urgent situations. While we can’t guarantee immediate availability, call (614) 980-7380 and we’ll see how we can help.",
    },
    {
      question: "Do you offer custom packages combining multiple services?",
      answer:
        "Yes! As a multi-service family business, we can create custom packages that combine our different services for events, businesses, or ongoing needs.",
    },
    {
      question: "What makes Danilets different from other service providers?",
      answer:
        "We’re a family-owned business that combines authentic care with luxury-level service. Our immigrant story and values drive our work ethic, and our diverse services mean you can trust Danilets for multiple needs.",
    },
  ];

  // ⭐ FAQ — Detailing Page
  const detailingFaqItems = [
    {
      question: "What detailing services do you provide?",
      answer: `We provide comprehensive detailing services including interior and exterior detailing, ceramic coating, paint protection film (PPF), vehicle wraps, window tinting, headlight restoration, trim restoration, glass coating, wheel coating, and decal removal.

We specialize in dealership inventory prep, fleet services, and premium detailing for individual vehicle owners.`,
    },
    {
      question: "How long does detailing take?",
      answer: `Timing depends on the service and your vehicle's condition. Basic exterior details take 1–2 hours, full interior/exterior details take 3–5 hours, and ceramic coating applications require 1–3 days.

We'll provide an accurate timeframe when you book and keep you updated throughout the process.`,
    },
    {
      question: "Do you offer mobile detailing or do I bring my vehicle to you?",
      answer: `We operate from our professional facility for most services to ensure optimal results. However, we do offer mobile detailing for dealerships and fleet clients with multiple vehicles.

Contact us at (614) 980-7380 to discuss your specific needs.`,
    },
    {
      question: "How often should I get my vehicle detailed?",
      answer: `We recommend full detailing every 3–6 months depending on usage and conditions. Regular maintenance washes every 2–4 weeks help protect your investment between details.

Vehicles with ceramic coating require less frequent detailing but benefit from periodic maintenance.`,
    },
    {
      question: "Do you work with dealerships and fleet accounts?",
      answer: `Yes! We serve dealerships and fleet clients with volume pricing, flexible scheduling, and consistent quality.

Contact us at (614) 980-7380 or detailing@danilets.com to discuss your commercial needs.`,
    },
  ];

  // ⭐ FAQ — Cleaning Page
  const cleaningFaqItems = [
    {
      question: "What types of commercial spaces do you clean?",
      answer: `We clean offices, retail spaces, corporate buildings, Airbnb properties, and more. Whether you need regular maintenance or one-time deep cleaning, we tailor our services to your business needs.`,
    },
    {
      question: "How do I get a quote for cleaning services?",
      answer: `Simply fill out our interest form with details about your space and cleaning needs. We'll get back to you as soon as possible, then set up a meeting to see the facility and provide a detailed quote.

You can also call or text us at (614) 980-7380 for immediate assistance.`,
    },
    {
      question: "Do you provide cleaning supplies and equipment?",
      answer: `Yes, we provide all supplies and equipment needed for the job. If you have specific product preferences or requirements, we can use your equipment as well.`,
    },
    {
      question: "Can you work around our business hours?",
      answer: `Absolutely. We offer flexible scheduling including after-hours, early morning, and weekend services to minimize disruption to your business operations.`,
    },
    {
      question: "Do you offer recurring cleaning services?",
      answer: `Yes, we provide customized recurring cleaning schedules—daily, weekly, bi-weekly, or monthly—whatever works best for your business.

Consistent service, reliable results, every single time.`,
    },
  ];

  // ⭐ Вибираємо потрібний набір FAQ залежно від маршруту
  const faqItems = isDetailingPage
    ? detailingFaqItems
    : isCleaningPage
    ? cleaningFaqItems
    : defaultFaqItems;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative w-full max-w-[1850px] mx-auto mt-4 sm:mt-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] flex flex-col lg:flex-row px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-4">
        
        {/* Ліва частина */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 sm:gap-6 mb-6 lg:mb-0">
          <img
            src={faqIcon}
            alt="FAQ Icon"
            className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] rounded-[36px]"
          />
          <h2
            className="text-[28px] sm:text-[36px] lg:text-[48px] font-bold leading-tight text-[#18181B]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-[14px] sm:text-[16px] lg:text-[18px] font-normal leading-[140%] text-[#52525B]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {isDetailingPage
              ? "Clear answers about our detailing services, timing, and booking."
              : isCleaningPage
              ? "Find answers to the most common questions about our commercial cleaning services."
              : "Find clear answers to common questions about our services, scheduling, and more."}
          </p>
        </div>

        {/* Права частина */}
        <div className="w-full lg:flex-1 flex flex-col gap-3 sm:gap-4 lg:ml-12">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="w-full bg-[#F2F2F2] rounded-[16px] sm:rounded-[24px] transition-all duration-300"
            >
              <div
                className="flex justify-between items-center py-3 sm:py-4 lg:py-5 px-4 sm:px-6 cursor-pointer"
                onClick={() => toggleAccordion(index)}
              >
                <h3
                  className="text-[18px] sm:text-[24px] lg:text-[28px] font-bold leading-tight text-[#18181B]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {item.question}
                </h3>
                <FaChevronDown
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-[#18181B] transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                  <p
                    className="text-[14px] sm:text-[16px] lg:text-[18px] font-normal leading-[140%] text-[#52525B] whitespace-pre-line"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FAQ;
