import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import cleaningIcon from "../assets/icons/services/cleaning.svg";
import detailingIcon from "../assets/icons/services/detailing.svg";
import arrowRightIcon from "../assets/icons/arrows/arrow_right_black.svg";

const Services = ({ className = "" }) => {
  const navigate = useNavigate();

  const domainType = useMemo(() => {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("daniletsdetailing")) return "detailing";
    if (host.includes("daniletscleaning")) return "cleaning";
    return "main";
  }, []);

  const allServices = [
    {
      title: "Auto and Dealership Detailing",
      description:
        "Premium automotive detailing that enhances, protects, and perfects every detail of your vehicle. From dealerships to individual clients, we deliver excellence with precision.",
      icon: detailingIcon,
      link: "/detailing",
      domain: "detailing",
    },
    {
      title: "Commercial and Residential Cleaning",
      description:
        "Professional cleaning services specializing in commercial spaces, offices, Airbnb properties, and deep cleans. We deliver meticulous results that transform your environment.",
      icon: cleaningIcon,
      link: "/cleaning",
      domain: "cleaning",
    },
  ];

  // On a domain-specific site show only that service; main domain shows both
  const services = useMemo(
    () =>
      domainType === "main"
        ? allServices
        : allServices.filter((s) => s.domain === domainType),
    [domainType]
  );

  return (
    <section className={`w-full ${className}`}>
      <div className="bg-white rounded-[24px] md:rounded-[32px] pt-10 pb-16 px-4 md:px-6 shadow-md">
        {/* Заголовок і кнопка */}
        <div className="flex flex-row flex-wrap justify-between items-center gap-4 mb-6 px-2 md:px-4">
          <h2 className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[60px] font-bold text-black">
            Services
          </h2>

          <button className="w-[48px] h-[48px] md:w-[80px] md:h-[64px] rounded-full border border-black flex items-center justify-center">
            <img
              src={arrowRightIcon}
              alt="Arrow Right"
              className="w-4 h-4 md:w-7 md:h-7"
            />
          </button>
        </div>

        {/* Картки сервісів */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service, idx) => {
            const [firstWord, ...restWords] = service.title.split(" ");
            const serviceName = restWords.join(" ");

            return (
              <div
                key={idx}
                className="flex flex-col bg-[rgba(242,242,242,1)] rounded-[24px] md:rounded-[32px] p-3 md:p-6 w-full min-h-[300px] md:min-h-[340px] transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="mb-4">
                  <img
                    src={service.icon}
                    alt={`${service.title} icon`}
                    className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] object-contain"
                  />
                </div>

                <h3
                  className="text-[28px] sm:text-[28px] md:text-[32px] lg:text-[40px] font-bold leading-[110%] text-black mb-6 break-words"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {firstWord}
                  <br />
                  {serviceName}
                </h3>

                <p
                  className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-normal leading-snug text-gray-600 mb-10"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {service.description}
                </p>

                <button
                  onClick={() => navigate(service.link)}
                  className="flex items-center justify-between w-full h-[40px] md:h-[52px] rounded-[88px] text-[16px] sm:text-[18px] md:text-[20px] px-3 md:px-5 mt-auto transition-transform hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Learn More
                  <img
                    src={arrowRightIcon}
                    alt="Arrow Right"
                    className="ml-2 w-4 h-4 md:w-6 md:h-6"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;