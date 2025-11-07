import React from "react";
import SpongeRed from "../../../assets/icons/spongered.svg";
import ChairRed from "../../../assets/icons/chairred.svg";
import CarRed from "../../../assets/icons/carred.svg"; // виправлено

const services = [
  {
    title: "Complete Exterior Restoration",
    desc: "We don’t just wash — we decontaminate, polish...",
    icon: SpongeRed,
  },
  {
    title: "Interior Deep Clean & Refreshn",
    desc: "Vacuuming, steaming, and odor removal.",
    icon: ChairRed,
  },
  {
    title: "Mobile Detailing for Fleets & Groups",
    desc: "Ceramic coating and wax protection.",
    icon: CarRed,
  },
  {
    title: "Complete Exterior Restoration",
    desc: "We don’t just wash — we decontaminate, polish...",
    icon: SpongeRed,
  },
  {
    title: "Interior Deep Clean & Refreshn",
    desc: "Vacuuming, steaming, and odor removal.",
    icon: ChairRed,
  },
  {
    title: "Mobile Detailing for Fleets & Groups",
    desc: "Ceramic coating and wax protection.",
    icon: CarRed,
  },
];

const ServicesProvide = () => {
  return (
    <section className="py-8 px-4 mx-4 md:mx-20 rounded-[36px] shadow-md bg-white">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 md:ml-10 md:mt-3">
        Services we provide
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 auto-rows-fr">
        {services.map((service, i) => (
          <article
            key={i}
            className="bg-[#EFEFEF] rounded-[28px] p-5 md:p-7 flex flex-col gap-4 h-full shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          >
            {/* Іконка зверху зліва без фону */}
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
              <img
                src={service.icon}
                alt={service.title}
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
            </div>

            <div className="mt-1">
              <h3 className="text-[22px] md:text-4xl font-extrabold leading-tight">
                {service.title}
              </h3>
              <p className="mt-2 md:mt-3 text-[14px] md:text-[18px] text-[#6B7280]">
                {service.desc}
              </p>
            </div>

            <button className="mt-auto w-full inline-flex items-center justify-between rounded-full bg-white px-5 py-3 md:px-6 md:py-4 text-[14px] md:text-[15px] font-semibold text-[#3E0C0C] shadow-sm hover:shadow-md transition">
              <span>Learn More</span>
              <span className="text-[18px] md:text-[20px]">›</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ServicesProvide;
