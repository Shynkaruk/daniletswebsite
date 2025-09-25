import React from "react";

// Підставиш свої файли іконок
import iconSay from "./../assets/icons/icon_say.svg";
import iconArrow from "./../assets/icons/icon_arrow.svg";
import iconWarning from "./../assets/icons/icon_warning.svg";
import arrow from "./../assets/icons/arrow_right_button_sumbit_icon.svg";

const ContactSection = () => {
  return (
    <section className="px-5 md:px-10 lg:px-20 py-10 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* Ліва колонка (текст + CTA) */}
          <div className="max-w-[560px] lg:col-span-5">
            {/* Badge — не на всю ширину */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(235,176,108,0.25)]">
              <img src={iconSay} alt="" className="w-6 h-6" />
              <span className="text-base font-semibold text-[#1c1c1c]">
                Stay Informed
              </span>
            </div>

            {/* Title & description */}
            <h2 className="mt-6 text-[36px] leading-[1.1] sm:text-[44px] lg:text-[56px] font-extrabold text-black tracking-[-0.02em]">
              Stay in the
              <br />
              Loop with Danilets
            </h2>

            <p className="mt-4 text-[15px] leading-6 text-[#6b6b6b] max-w-[520px]">
              Want to learn more or stay updated? Drop your email and we’ll keep
              you posted about our latest services, events, and news
            </p>

            {/* About Us — теж не на всю ширину */}
            <a
              href="#about"
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-neutral-300 shadow-sm text-base font-semibold text-black hover:bg-neutral-100 transition"
            >
              About Us
              <img src={iconArrow} alt="" className="w-4 h-4" />
            </a>
          </div>

          {/* Права колонка (картка з формою) */}
          <div className="mt-8 lg:mt-0 lg:col-span-7">
            <div className="bg-white rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5 sm:p-7 lg:p-10">
              <h3 className="text-[28px] sm:text-[32px] font-extrabold text-black mb-6">
                Contact Us
              </h3>

              <form className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className="h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#EBAE6C]"
                />
                <input
                  type="text"
                  placeholder="Enter your last name"
                  className="h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#EBAE6C]"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="lg:col-span-2 h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#EBAE6C]"
                />

                <textarea
                  placeholder="Description"
                  className="lg:col-span-2 min-h-[96px] px-4 py-3 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#EBAE6C] resize-none"
                />

                {/* Info badge */}
                <div className="lg:col-span-2 flex items-center gap-3 px-4 py-3 rounded-[16px] bg-[rgba(235,176,108,0.2)]">
                  <img src={iconWarning} alt="" className="w-7 h-7" />
                  <span className="text-[14px] text-[#333]">
                    We’ll send all updates and information to this email address
                  </span>
                </div>

                {/* Submit — на всю ширину, градієнт */}
                <button
                  type="submit"
                  className="lg:col-span-2 h-12 rounded-[24px] font-semibold text-[#1c1c1c] flex items-center justify-between px-6 transition"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  <span>Submit</span>
                  <img src={arrow} alt="arrow" className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
