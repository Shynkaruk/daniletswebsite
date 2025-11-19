import React from "react";
import { useLocation } from "react-router-dom";

import iconSay from "../assets/icons/icon_say.svg";
import iconArrow from "../assets/icons/icon_arrow.svg";
import iconWarning from "../assets/icons/icon_warning.svg";
import iconWarningRed from "../assets/icons/warning_red_icon.svg";
import iconSayRed from "../assets/icons/information_red_icon.svg";
import iconWarningGreen from '../assets/icons/iconWarningGreen.svg'
import iconSayGreen from '../assets/icons/iconSayGreen.svg'
import arrow from "../assets/icons/arrow_right_button_sumbit_icon.svg";

const ContactSection = () => {
  const location = useLocation();

  const isDetailingPage = location.pathname.startsWith("/services/detailing");
  const isCleaningPage = location.pathname.startsWith("/services/cleaning");

  // 🎨 Кольори та іконки для різних сторінок
  const theme = isDetailingPage
    ? {
        // Detailing (червона тема)
        badgeBg: "#FF525226",
        infoBg: "#FF525226",
        focus: "#FF9E9E",
        submitGradient:
          "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)",
        iconSay: iconSayRed,
        iconWarning: iconWarningRed,
      }
    : isCleaningPage
    ? {
        // Cleaning (зелена тема)
        badgeBg: "#9AD81E26", // бейдж "Lets Connect"
        infoBg: "#9AD81E26", // попередження над кнопкою
        focus: "#9AD81E", // зелений outline на інпутах
        submitGradient:
          "linear-gradient(107.27deg, #3D8B34 -27.97%, #6CA84E -12.13%, #9FF292 22.69%, #A8FF9E 45.99%, #98E17B 77.51%)",
        iconSay: iconSayGreen,
        iconWarning: iconWarningGreen,
      }
    : {
        // Базова (золота) тема для інших сторінок
        badgeBg: "rgba(235,176,108,0.25)",
        infoBg: "rgba(235,176,108,0.25)",
        focus: "#EBAE6C",
        submitGradient:
          "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
        iconSay: iconSay,
        iconWarning: iconWarning,
      };

  return (
    <section className="px-5 md:px-10 lg:px-20 py-10 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* Ліва частина */}
          <div className="max-w-[560px] lg:col-span-5">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: theme.badgeBg }}
            >
              <img src={theme.iconSay} alt="" className="w-6 h-6" />
              <span className="text-base font-semibold text-[#1c1c1c]">
                Lets Connect
              </span>
            </div>

            <h2 className="mt-6 text-[36px] leading-[1.1] sm:text-[44px] lg:text-[56px] font-extrabold text-black tracking-[-0.02em]">
              Experience the
              <br />
              Danilets Difference
            </h2>

            <p className="mt-4 text-[15px] leading-6 text-[#6b6b6b] max-w-[520px]">
              Interested in our detailing services? Fill out your information
              and let us know how we can help. We&apos;ll get back to you
              promptly.
            </p>

            <p className="mt-2 text-[13px] leading-5 text-[#8a8a8a] max-w-[520px]">
              Note: This is NOT a subscription section – it&apos;s for people to
              reach out about services.
            </p>

            <a
              href="#about"
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-neutral-300 shadow-sm text-base font-semibold text-black hover:bg-neutral-100 transition"
            >
              About Us
              <img src={iconArrow} alt="" className="w-4 h-4" />
            </a>
          </div>

          {/* Права частина */}
          <div className="mt-8 lg:mt-0 lg:col-span-7">
            <div className="bg-white rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5 sm:p-7 lg:p-10">
              <h3 className="text-[28px] sm:text-[32px] font-extrabold text-black mb-6">
                Interest Form
              </h3>

              <form className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none"
                  style={{ transition: "0.2s" }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${theme.focus}`)
                  }
                  onBlur={(e) =>
                    (e.target.style.boxShadow = "0 0 0 2px transparent")
                  }
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none"
                  style={{ transition: "0.2s" }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${theme.focus}`)
                  }
                  onBlur={(e) =>
                    (e.target.style.boxShadow = "0 0 0 2px transparent")
                  }
                />

                {/* Phone Number (REQUIRED) */}
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="lg:col-span-2 h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none"
                  style={{ transition: "0.2s" }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${theme.focus}`)
                  }
                  onBlur={(e) =>
                    (e.target.style.boxShadow = "0 0 0 2px transparent")
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="lg:col-span-2 h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none"
                  style={{ transition: "0.2s" }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${theme.focus}`)
                  }
                  onBlur={(e) =>
                    (e.target.style.boxShadow = "0 0 0 2px transparent")
                  }
                />

                <textarea
                  placeholder="Message"
                  className="lg:col-span-2 min-h-[96px] px-4 py-3 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none resize-none"
                  style={{ transition: "0.2s" }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${theme.focus}`)
                  }
                  onBlur={(e) =>
                    (e.target.style.boxShadow = "0 0 0 2px transparent")
                  }
                />

                {/* Info badge */}
                <div
                  className="lg:col-span-2 flex items-center gap-3 px-4 py-3 rounded-[16px]"
                  style={{ background: theme.infoBg }}
                >
                  <img src={theme.iconWarning} alt="" className="w-7 h-7" />
                  <span className="text-[14px] text-[#333]">
                    We’ll contact you using the phone number or email you
                    provide.
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="lg:col-span-2 h-12 rounded-[24px] font-semibold text-[#1c1c1c] flex items-center justify-between px-6 transition"
                  style={{ background: theme.submitGradient }}
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
