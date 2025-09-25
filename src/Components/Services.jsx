import React from "react";
import cleaningIcon from "../assets/icons/services/cleaning.svg";
import detailingIcon from "../assets/icons/services/detailing.svg";
import mediaIcon from "../assets/icons/services/media.svg";
import pickleballIcon from "../assets/icons/services/pickleball.svg";
import arrowRightIcon from "../assets/icons/arrows/arrow_right_black.svg";

const Services = ({ className }) => {
  const services = [
    {
      title: "Danilets Cleaning",
      description:
        "Expert cleaning services for commercial and residential spaces, delivering results that exceed expectations",
      icon: cleaningIcon,
    },
    {
      title: "Danilets Detailing",
      description:
        "High-end automotive detailing designed to enhance, protect, and perfect every detail of your vehicle",
      icon: detailingIcon,
    },
    {
      title: "Danilets Media",
      description:
        "Authentic visual storytelling that captures your moments with professional excellence",
      icon: mediaIcon,
    },
    {
      title: "Danilets Pickleball",
      description:
        "Top-tier pickleball programming and coaching tailored for both fun and performance",
      icon: pickleballIcon,
    },
  ];

  return (
    <section
      className={`bg-white rounded-[24px] md:rounded-[32px] pt-10 pb-16 w-[95%] max-w-[1792px] mx-auto px-4 md:px-6 shadow-md ${className}`}
    >
      {/* Заголовок і кнопка */}
      <div className="flex flex-row flex-wrap justify-between items-center gap-4 mb-6 px-2 md:px-4">
        <h2 className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[60px] font-bold text-black">
          Our Services
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 group">
        {services.map((service, idx) => {
          const [danilets, serviceName] = service.title.split(" ");

          return (
            <div
              key={idx}
              className="flex flex-col bg-[rgba(242,242,242,1)] rounded-[24px] md:rounded-[32px] p-3 md:p-6 w-full min-h-[300px] md:min-h-[340px] transform transition-all duration-300 ease-in-out group-hover:scale-90 md:group-hover:scale-100 md:hover:scale-110 md:hover:z-10 md:hover:shadow-lg"
            >
{/* Іконка */}
<div className="mb-4">
  <img
    src={service.icon}
    alt={`${serviceName} icon`}
    className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] object-contain"
  />
</div>


              {/* Назва */}
              <h3
                className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[40px] font-bold leading-[110%] text-black mb-6 break-words"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {danilets}
                <br />
                {serviceName}
              </h3>

              {/* Опис */}
              <p
                className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-normal leading-snug text-gray-600 mb-4"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {service.description}
              </p>

              {/* Кнопка */}
              <button
                className="flex items-center justify-between w-full h-[40px] md:h-[52px] rounded-[88px] text-[16px] sm:text-[18px] md:text-[20px] px-3 md:px-5 mt-auto"
                style={{
                  background:
                    "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 600,
                }}
              >
                Book Now
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
    </section>
  );
};

export default Services;
