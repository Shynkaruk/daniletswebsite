import React from "react";
import Head from "./../Head.jsx";
import familyPhoto from "../../assets/photo/family-photo.png";
import diamondicon from "../../assets/icons/diamond-icon.svg";

const MainAboutUs = () => {
  return (
    <div className="bg-[rgba(235,235,235,1)] min-h-screen pb-8">
      <Head />

      <main
        className="flex min-h-screen bg-cover bg-center relative z-0"
        style={{ backgroundImage: `url(${familyPhoto})` }}
      >
        <div className="w-[95%] max-w-[1792px] mx-auto mt-[180px] px-4 mb-50">
          <div className="w-full md:w-2/3 lg:w-1/2 space-y-6">
            <h1
              className="
                text-[36px]
                sm:text-[44px]
                md:text-[56px]
                lg:text-[72px]
                xl:text-[90px]
                font-extrabold
                leading-tight
                text-white
              "
            >
              Danilets Family
            </h1>

            <p
              className="
                text-[16px]
                sm:text-[18px]
                md:text-[20px]
                lg:text-[22px]
                xl:text-[24px]
                font-medium
                leading-snug
                text-[rgba(161,161,165,1)]
                max-w-[900px]
              "
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Columbus’ premier destination for bespoke luxury services, tailored
              with precision and delivered with excellence — where every detail
              exceeds expectations
            </p>

            <button
              className="
                border border-white
                px-6 py-3
                rounded-full
                text-white
                text-[16px]
                sm:text-[18px]
                font-semibold
                hover:bg-white hover:text-black
                transition
              "
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Лейбл у правому нижньому кутку */}
        <div
          className="
            absolute bottom-30 right-20
            bg-[rgba(235,176,108,0.15)]
            rounded-full
            px-4 py-3
            flex items-center gap-3
            z-10
          "
        >
          <img
            src={diamondicon}
            alt="Diamond Icon"
            className="w-6 h-6 lg:w-8 lg:h-8"
          />
          <span
            className="
              text-white
              text-[16px]
              sm:text-[18px]
              lg:text-[20px]
              font-semibold
            "
          >
            Clarity is power
          </span>
        </div>
      </main>
    </div>
  );
};

export default MainAboutUs;
