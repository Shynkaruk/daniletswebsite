import React from "react";
import { Link, useLocation } from "react-router-dom";
import IconGuard from "../assets/icons/icon-guard.svg";
import ArrowUpRightIcon from "../assets/icons/arrows/arrow-up-right.svg";

const coreValues = [
  { title: "Matthew 6:33", subtitle: "God First - Christ Led" },
  { title: "Integrity Matters", subtitle: "Even in the small things" },
  { title: "Family First", subtitle: "We treat everyone like family" },
  { title: "GOAT Mentality", subtitle: "We strive for greatness" },
  {
    title: "Clear Communication",
    subtitle: "No room for assumption ONLY clear communication",
  },
  { title: "3 A.M. Mindset", subtitle: "We’ll get it done no matter what" },
  {
    title: "Every. Single. Time.",
    subtitle: "Our promise: customer care and excellent service",
  },
];

const OurCoreValues = ({ className = "" }) => {
  const firstRow = coreValues.slice(0, 4);
  const secondRow = coreValues.slice(4);

  const location = useLocation();

  const handleAboutClick = (e) => {
    if (location.pathname === "/about-us") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    // зовнішня секція — без mx-* і без max-w
    <section className={`w-full mt-10 ${className}`}>
      {/* внутрішня “картка” — займає всю ширину контейнера LayoutContainer */}
      <div className="bg-white rounded-[32px] py-10 md:py-14 px-4 md:px-8 xl:px-10">
        {/* Верхній блок */}
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 w-full">
          <div className="max-w-[880px]">
            <h2 className="text-[40px] md:text-[56px] xl:text-[64px] font-semibold leading-[1.05] text-black">
              Core Values
            </h2>

            <p className="mt-4 text-[15px] md:text-[17px] xl:text-[18px] text-[#555] leading-relaxed">
              These values flow from our deepest story – leaving everything
              behind and rebuilding with nothing but hope and faith. These
              aren&apos;t just words on a page; they&apos;re the backbone of why we do
              what we do. Every detail, every moment, and every connection reflects
              the same love and excellence we pray our own family receives in this
              country we call home.
            </p>
          </div>

          <Link
            to="/about-us"
            onClick={handleAboutClick}
            className="
              bg-[#F4F4F4]
              px-8 py-4
              rounded-full
              flex items-center gap-3
              text-black font-bold
              text-[16px] md:text-[20px]
              whitespace-nowrap
              hover:bg-black hover:text-white
              transition
              self-start
            "
          >
            About Us
            <img src={ArrowUpRightIcon} alt="arrow" className="w-5 h-5" />
          </Link>
        </div>

        {/* до 2xl */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 2xl:hidden">
          {coreValues.map((item) => (
            <Card key={item.title} title={item.title} subtitle={item.subtitle} />
          ))}
        </div>

        {/* 2xl+ */}
        <div className="hidden 2xl:grid mt-10 gap-5">
          <div className="grid grid-cols-4 gap-5">
            {firstRow.map((item) => (
              <Card key={item.title} title={item.title} subtitle={item.subtitle} variant="small" />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5 mt-5">
            {secondRow.map((item) => (
              <Card key={item.title} title={item.title} subtitle={item.subtitle} variant="wide" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Card = ({ title, subtitle, variant }) => {
  // важливо: не треба max-w на карточках, коли вони в grid
  // grid сам задає ширину. max-w часто робить “дірки” і нерівність.
  let sizeClasses = "w-full h-auto";

  if (variant === "small") sizeClasses += " 2xl:h-[153px]";
  if (variant === "wide") sizeClasses += " 2xl:h-[153px]";

  return (
    <div
      className={[
        "bg-[#F7F7F7] rounded-[28px] border border-[#E6E6E6] shadow-sm",
        "p-5 md:p-6 flex flex-col justify-between",
        sizeClasses,
      ].join(" ")}
    >
      <div className="flex items-center gap-1">
        <div className="w-14 h-14 flex items-center justify-center">
          <img src={IconGuard} alt="icon" className="w-9 h-9" />
        </div>

        <h3 className="font-[Manrope] font-bold text-[22px] md:text-[24px] xl:text-[28px] leading-[32px] text-black">
          {title}
        </h3>
      </div>

      <p className="mt-3 font-[Manrope] font-normal text-[15px] md:text-[16px] xl:text-[18px] leading-[100%] text-[#555]">
        {subtitle}
      </p>
    </div>
  );
};

export default OurCoreValues;
