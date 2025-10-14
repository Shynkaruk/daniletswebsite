import React from "react";
import IconGuard from "../assets/icons/icon-guard.png";
import ArrowUpRightIcon from "../assets/icons/arrows/arrow-up-right.svg";

const coreValues = [
  { title: "Matthew 6:33", description: "God First - Christ Led" },
  { title: "Integrity Matters", description: "Even in the small things" },
  { title: "Family First", description: "We treat everyone like family" },
  { title: "GOAT Mentality", description: "We strive for greatness" },
  { title: "Clear Communication", description: "No room for assumption ONLY clear communication" },
  { title: "3 A.M. Mindset", description: "We’ll get it done no matter what" },
  { title: "Every. Single. Time.", description: "Our promise: customer care and excellent service" },
];

const OurCoreValues = () => {
  return (
    <section className="bg-white mx-4 md:mx-8 rounded-[32px] px-4 md:px-10 py-8 md:py-14 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-4 md:gap-6">
        <div className="md:pl-8 lg:pl-12">
          <h2 className="text-[28px] md:text-[56px] font-bold leading-[32px] md:leading-[64px] text-[#18181B]">
            Our Core Values
          </h2>
          <p className="text-[18px] md:text-[18px] text-[#52525B] max-w-[1300px] mt-3 md:mt-4 leading-[26px] md:leading-[30px] font-normal">
            These values flow from our deepest story – leaving everything behind to rebuilding with nothing but hope and faith. These heartfelt
            commitments ensure every detail, every moment, and every connection reflects the same love and excellence we pray our own family
            receives in this country we call home.
          </p>
        </div>

        {/* Кнопка тільки для ПК */}
        <div className="hidden md:block md:pr-8 lg:pr-12">
          <button
            className="bg-[rgba(242,242,242,1)] text-black rounded-[32px] font-medium transition text-[18px] md:text-[20px] flex items-center justify-center gap-2 py-4 px-10"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            About
            <img src={ArrowUpRightIcon} alt="Arrow Up Right" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Контейнер + сітка */}
      <div className="w-[95%] max-w-[1760px] mx-auto">
        {/* ПК: фіксована 12-колонна сітка; мобільний: стек/флекс */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-5">
          {coreValues.map((item, idx) => {
            const span = idx < 4 ? "md:col-span-3" : "md:col-span-4"; // 4×3 + 3×4
            return (
              <div
                key={idx}
                className={`flex items-start gap-5 bg-[#F2F2F2] rounded-[24px] p-5 md:p-7 h-[130px] md:h-[160px] ${span}`}
              >
                <img src={IconGuard} alt="IconGuard" className="w-10 h-10 md:w-12 md:h-12 shrink-0" />
                <div className="min-w-0">
                  <h3
                    className="text-[24px] md:text-[30px] font-bold text-[#18181B] leading-tight pt-1 md:pt-2 truncate"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[16px] md:text-[18px] text-[#52525B] leading-[22px] md:leading-[26px] mt-2 line-clamp-2"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Кнопка тільки для мобільної версії */}
      <div className="mt-8 md:hidden flex justify-center">
        <button
          className="w-full sm:w-[303px] bg-[rgba(242,242,242,1)] text-black rounded-[20px] font-medium transition text-[18px] flex items-center justify-center gap-2 py-4"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          About Us
          <img src={ArrowUpRightIcon} alt="Arrow Up Right" className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default OurCoreValues;
