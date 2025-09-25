import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import faqIcon from '../assets/icons/icon-faq.png';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = [
    {
      question: 'What areas do you serve?',
      answer: 'We serve the Greater Columbus area and surrounding communities. Contact us to confirm we service your specific location.',
    },
    {
      question: 'How do I book services with Danilets?',
      answer: 'For detailing services, you can book directly through our online booking system at danilets.com/detailing. For cleaning, media, and pickleball services, please fill out our quote form on the respective service pages. You can also call us at (614) 980-7380 for any service.',
    },
    {
      question: 'Do you handle emergency or last-minute requests?',
      answer: 'We do our best to accommodate urgent situations. While we can’t guarantee immediate availability, call (614) 980-7380 and we’ll see how we can help.',
    },
    {
      question: 'Do you offer custom packages combining multiple services?',
      answer: 'Yes! As a multi-service family business, we can create custom packages that combine our different services for events, businesses, or ongoing needs.',
    },
    {
      question: 'What makes Danilets different from other service providers?',
      answer: 'We’re a family-owned business that combines authentic care with luxury-level service. Our immigrant story and values drive our work ethic, and our diverse services mean you can trust Danilets for multiple needs.',
    },
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative w-full max-w-[1850px] mx-auto mt-4 sm:mt-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] flex flex-col lg:flex-row px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-4">
        {/* Ліва частина: іконка, заголовок, текст */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 sm:gap-6 mb-6 lg:mb-0">
          <img 
            src={faqIcon} 
            alt="FAQ Icon" 
            className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] rounded-[36px]" 
          />
          <h2
            className="text-[28px] sm:text-[36px] lg:text-[48px] font-bold leading-tight text-[#18181B]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-[14px] sm:text-[16px] lg:text-[18px] font-normal leading-[140%] text-[#52525B]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Find clear answers to common questions about our services, scheduling, and everything else you might want to know before getting started.
          </p>
        </div>

        {/* Права частина: випадаючі контейнери */}
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
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {item.question}
                </h3>
                <FaChevronDown
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-[#18181B] transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                  <p
                    className="text-[14px] sm:text-[16px] lg:text-[18px] font-normal leading-[140%] text-[#52525B]"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
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