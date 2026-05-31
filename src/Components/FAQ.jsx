import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import faqIcon from "../assets/icons/icon-faq.png";

const FAQ = ({ className = "" }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const location = useLocation();

  const isDetailingPage = location.pathname.startsWith("/detailing");
  const isCleaningPage = location.pathname.startsWith("/cleaning");
  const isLegalFaqPage = location.pathname.startsWith("/legal/faq");

  const defaultFaqItems = [
    {
      question: "What areas do you serve?",
      answer:
        "We serve the Greater Columbus area and surrounding communities. Contact us to confirm if we service your specific location.",
    },
    {
      question: "Do you handle emergency or last-minute requests?",
      answer:
        "We do our best to accommodate urgent situations. While we can't guarantee immediate availability, call (614) 980-7380 and we'll see how we can help.",
    },
    {
      question: "Do you offer custom packages combining multiple services?",
      answer:
        "Yes! As a multi-service family business, we can create custom packages that combine our different services.",
    },
    {
      question: "What makes Danilets different?",
      answer:
        "We're a family-owned business that combines authentic care with luxury-level service. Our immigrant story and values drive our work ethic, and our diverse services mean you can trust Danilets for multiple needs.",
    },
  ];

  const detailingFaqItems = [
    {
      question: "What detailing services do you provide?",
      answer: `We provide comprehensive detailing services including but not limited to interior and exterior detailing, ceramic coating, paint protection film (PPF), vehicle wraps, window tinting, decal removal headlight restoration, trim restoration, glass coating and wheel coating.

We specialize in dealership inventory prep, fleet services, and premium detailing for individual vehicle owners.`,
    },
    {
      question: "How long does detailing take?",
      answer: `Timing depends on the service and your vehicle's condition.
• Exterior: 30 minutes to 2 hours 
• Interior and exterior: 2–8 hours 
• Ceramic Coating: 1–3 days 

We'll provide a more accurate timeframe when you book and keep you updated throughout the process.`,
    },
    {
      question: "Do you offer mobile detailing?",
      answer: `We operate from our facility for most services to ensure optimal results.  
However, we do offer mobile detailing for fleets/dealerships and clients with multiple vehicles at one location. Contact us at (614) 980-7380 to discuss your specific needs.`,
    },
    {
      question: "How often should I get my vehicle detailed?",
      answer: `We recommend detailing every 3–6 months depending on usage, conditions and preference. Regular washes and monthly maintenance help protect your investment.

Vehicles with ceramic coating require less frequent washes but benefit from periodic maintenance.`,
    },
    {
      question: "Do you work with dealerships and fleets?",
      answer: `Yes! We serve dealerships and fleet clients with volume pricing, flexible scheduling, and consistent quality. Contact us at (614) 980-7380 or detailing@danilets.com to discuss your commercial needs.`,
    },
  ];

  const cleaningFaqItems = [
    {
      question: "What types of commercial spaces do you clean?",
      answer:
        "We clean offices, retail spaces, corporate buildings, Airbnb properties, and more. Whether you need regular maintenance or one-time deep cleaning, we tailor our services to your business needs.",
    },
    {
      question: "How do I get a quote for cleaning services?",
      answer:
        "Simply fill out our interest form with details about your space and cleaning needs. We'll get back to you as soon as possible, then set up a meeting to see the facility and provide a detailed quote. You can also call or text us at (614) 980-7380 for immediate assistance.",
    },
    {
      question: "Do you provide cleaning supplies and equipment?",
      answer:
        "Yes, we provide all supplies and equipment needed for the job. If you have specific product preferences or requirements, we can use your equipment as well.",
    },
    {
      question: "Can you work around our business hours?",
      answer:
        "Absolutely. We offer flexible scheduling including after-hours, early morning, and weekend services to minimize disruption to your business operations.",
    },
    {
      question: "Do you offer recurring cleaning services?",
      answer:
        "Yes, we provide customized recurring cleaning schedules—daily, weekly, bi-weekly, or monthly—whatever works best for your business. Consistent service, reliable results, every single time.",
    },
  ];

  let faqItems;
  if (isLegalFaqPage) {
    faqItems = [...defaultFaqItems, ...detailingFaqItems, ...cleaningFaqItems];
  } else if (isDetailingPage) {
    faqItems = detailingFaqItems;
  } else if (isCleaningPage) {
    faqItems = cleaningFaqItems;
  } else {
    faqItems = defaultFaqItems;
  }

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className={`relative w-full mt-4 sm:mt-8 ${className}`}>
      <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] flex flex-col lg:flex-row px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-4">
        {/* Left */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 sm:gap-6 mb-6 lg:mb-0">
          <img
            src={faqIcon}
            alt="FAQ Icon"
            className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px]"
          />

          <h2 className="text-[28px] sm:text-[36px] lg:text-[48px] font-bold text-[#18181B]">
            Frequently Asked Questions
          </h2>

          <p className="text-[14px] sm:text-[16px] lg:text-[18px] text-[#52525B]">
            {isLegalFaqPage
              ? "All of our most common questions in one place — general, detailing, and cleaning."
              : isDetailingPage
              ? "Find answers to the most common questions about our detailing services."
              : isCleaningPage
              ? "Find answers to the most common questions about our cleaning services."
              : "Find clear answers to common questions about our services, scheduling, and more."}
          </p>
        </div>

        {/* Right */}
        <div className="w-full lg:flex-1 flex flex-col gap-3 sm:gap-4 lg:ml-12">
          {faqItems.map((item, index) => (
            <div
              key={`${item.question}-${index}`}
              className="bg-[#F2F2F2] rounded-[16px] sm:rounded-[24px] transition-all"
            >
              <button
                type="button"
                className="w-full flex justify-between items-center py-3 sm:py-4 lg:py-5 px-4 sm:px-6 cursor-pointer text-left"
                onClick={() => toggleAccordion(index)}
                aria-expanded={openIndex === index}
              >
                <h3 className="text-[18px] sm:text-[24px] lg:text-[28px] font-bold">
                  {item.question}
                </h3>

                <FaChevronDown
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                  <p className="text-[14px] sm:text-[16px] lg:text-[18px] leading-[140%] text-[#52525B] whitespace-pre-line">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
