import React from "react";
import IconGuard from "../assets/icons/icon-guard.png";
import ArrowUpRightIcon from "../assets/icons/arrows/arrow-up-right.svg";

const coreValues = [
  {
    title: "Matthew 6:33",
    description: "God First - Christ Led",
  },
  {
    title: "Integrity Matters",
    description: "Even in the small things",
  },
  {
    title: "Family First",
    description: "We treat everyone like family",
  },
  {
    title: "GOAT Mentality",
    description: "We strive for greatness",
  },
  {
    title: "Clear Communication",
    description: "No room for assumption ONLY clear communication",
  },
  {
    title: "3 A.M. Mindset",
    description: "We’ll get it done no matter what",
  },
  {
    title: "Every. Single. Time.",
    description: "Our promise: customer care and excellent service",
  },
];

const OurCoreValues = () => {
  return (
    <section className="bg-white mx-4 md:mx-8 rounded-[32px] px-4 md:px-6 py-8 md:py-12 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-4 md:gap-6">
        <div>
          <h2 className="text-[28px] md:text-[56px] font-bold leading-[32px] md:leading-[64px] text-[#18181B] md:px-12">
            Our Core Values
          </h2>
          <p className="text-[18px] md:text-[16px] text-[#52525B] max-w-[1000px] mt-3 md:mt-4 leading-[24px] md:leading-[28px] font-normal md:px-12">
            These values flow from our deepest story – leaving everything behind
            to rebuilding with nothing but hope and faith. These heartfelt
            commitments ensure every detail, every moment, and every connection
            reflects the same love and excellence we pray our own family
            receives in this country we call home.
          </p>
        </div>

        {/* Кнопка тільки для ПК */}
        <div className="hidden md:block">
          <button
            className="w-full bg-[rgba(242,242,242,1)] text-black rounded-[32px] font-medium transition text-[18px] md:text-[20px] flex items-center justify-center gap-2 py-4 px-8"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            About Us
            <img
              src={ArrowUpRightIcon}
              alt="Arrow Up Right"
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
        {coreValues.slice(0, 4).map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 bg-[#F2F2F2] w-full sm:w-[303px] md:w-[410px] h-[120px] md:h-[153px] rounded-[20px] p-4 md:p-6"
          >
            <img
              src={IconGuard}
              alt="IconGuard"
              className="w-10 h-10 md:w-12 md:h-12"
            />
            <div className="relative">
              <h3
                className="text-[24px] md:text-[28px] font-bold text-[#18181B] leading-tight pt-2 md:pt-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.title}
              </h3>
              <p
                className="text-[18px] md:text-[18px] text-[#52525B] absolute top-[60px] md:top-[80px] left-[-60px] md:left-[-75px] w-[260px] md:w-[300px]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}

        {coreValues.slice(4).map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 bg-[#F2F2F2] w-full sm:w-[303px] md:w-[553px] sm: h-[150px] h-[120px] md:h-[153px] rounded-[20px] p-4 md:p-6"
          >
            <img
              src={IconGuard}
              alt="IconGuard"
              className="w-10 h-10 md:w-12 md:h-12"
            />
            <div className="relative">
              <h3
                className="text-[24px] md:text-[28px] font-bold text-[#18181B] leading-tight pt-1 md:pt-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.title}
              </h3>
              <p
                className="text-[18px] md:text-[18px] text-[#52525B] absolute top-[60px] md:top-[80px] left-[-60px] md:left-[-75px] w-[240px] md:w-[600px]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка тільки для мобільної версії */}
      <div className="mt-8 md:hidden flex justify-center">
        <button
          className="w-full sm:w-[303px] bg-[rgba(242,242,242,1)] text-black rounded-[20px] font-medium transition text-[18px] flex items-center justify-center gap-2 py-4"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          About Us
          <img
            src={ArrowUpRightIcon}
            alt="Arrow Up Right"
            className="w-5 h-5"
          />
        </button>
      </div>
    </section>
  );
};

export default OurCoreValues;
