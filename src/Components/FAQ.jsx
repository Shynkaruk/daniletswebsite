import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import faqIcon from "../assets/icons/icon-faq.png";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const location = useLocation();

  const isDetailingPage = location.pathname.startsWith("/services/detailing");
  const isCleaningPage = location.pathname.startsWith("/services/cleaning");
  const isLegalFaqPage = location.pathname.startsWith("/legal/faq");

  // ⭐ DEFAULT FAQ (Home)
  const defaultFaqItems = [
    {
      question: "What areas do you serve? ",
      answer:
        "We serve the Greater Columbus area and surrounding communities. Contact us to confirm if we service your specific location.",
    },
    {
      question: "How do I book services with Danilets?",
      answer:
        "For detailing services, you can book directly through our online booking system at danilets.com/detailing. For cleaning, media, and pickleball services, please fill out our quote form on their pages. You can also call us at (614) 980-7380.",
    },
    {
      question: "Do you handle emergency or last-minute requests?",
      answer:
        "We do our best to accommodate urgent situations. Call (614) 980-7380 and we’ll check availability.",
    },
    {
      question: "Do you offer custom packages combining multiple services?",
      answer:
        "Yes! We can combine detailing, cleaning, media, or sports services under one package for businesses or events.",
    },
    {
      question: "What makes Danilets different?",
      answer:
        "We’re a family-owned multi-service company built on care, integrity, and excellence. You're treated like family — every single time.",
    },
  ];

  // ⭐ DETAILING FAQ (Corrected)
  const detailingFaqItems = [
    {
      question: "What detailing services do you provide?",
      answer: `We offer full interior and exterior detailing, ceramic coating, paint protection film (PPF), vehicle wraps, window tinting, headlight restoration, trim restoration, glass coating, wheel coating, and decal removal.

We also provide dealership inventory prep and fleet services with consistent quality and flexible scheduling.`,
    },
    {
      question: "How long does detailing take?",
      answer: `Timing depends on the service and your vehicle's condition.

• Exterior details: **30 minutes to 2 hours**
• Interior/exterior details: **2 to 8 hours**
• Ceramic coating: **1 to 3 days**

We’ll provide a more accurate estimate when you book and keep you updated throughout the process.`,
    },
    {
      question: "Do you offer mobile detailing?",
      answer: `We perform most services at our professional facility.  
However, we offer mobile detailing for dealerships and fleet clients with multiple vehicles.  
Call (614) 980-7380 for details.`,
    },
    {
      question: "How often should I get my vehicle detailed?",
      answer: `Full detailing is recommended every 3–6 months.  
Maintenance washes every 2–4 weeks help protect your vehicle.  
Ceramic-coated vehicles require less frequent detailing but benefit from scheduled maintenance.`,
    },
    {
      question: "Do you work with dealerships and fleets?",
      answer: `Yes! We provide volume pricing, fast turnaround times, and consistent professional quality for dealerships and fleets.

Contact us at detailing@danilets.com.`,
    },
  ];

  // ⭐ CLEANING FAQ (Corrected)
  const cleaningFaqItems = [
    {
      question: "What types of commercial spaces do you clean?",
      answer: `We clean offices, retail stores, Airbnb units, apartment complexes, corporate spaces, and more.  
We tailor each service to your business needs.`,
    },
    {
      question: "How do I get a quote?",
      answer: `Fill out the request form on our cleaning page and provide details about your space.  
We’ll reach out quickly to schedule a walkthrough and provide a customized quote.

For urgent inquiries, call or text (614) 980-7380.`,
    },
    {
      question: "Do you bring your own supplies?",
      answer: `Yes — we bring all equipment and supplies.  
If your workspace requires specific products, we can use your preferred items.`,
    },
    {
      question: "Can you work around our business hours?",
      answer: `Absolutely.  
We offer flexible scheduling including after-hours, overnight, early morning, and weekend cleaning.`,
    },
    {
      question: "Do you offer recurring cleaning?",
      answer: `Yes — daily, weekly, bi-weekly, or monthly service plans are available.

Reliable cleaning, consistent quality — every single time.`,
    },
  ];

  // ⭐ SELECT WHICH FAQ TO DISPLAY
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
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative w-full max-w-[1850px] mx-auto mt-4 sm:mt-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] flex flex-col lg:flex-row px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-4">

        {/* Left section */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 sm:gap-6 mb-6 lg:mb-0">
          <img src={faqIcon} alt="FAQ Icon" className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px]" />

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

        {/* Right section */}
        <div className="w-full lg:flex-1 flex flex-col gap-3 sm:gap-4 lg:ml-12">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-[#F2F2F2] rounded-[16px] sm:rounded-[24px] transition-all">

              {/* QUESTION */}
              <div
                className="flex justify-between items-center py-3 sm:py-4 lg:py-5 px-4 sm:px-6 cursor-pointer"
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-[18px] sm:text-[24px] lg:text-[28px] font-bold">
                  {item.question}
                </h3>

                <FaChevronDown
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* ANSWER */}
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
    </div>
  );
};

export default FAQ;
