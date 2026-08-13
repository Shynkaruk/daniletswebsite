import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { apiSend } from "../lib/api";

import iconSay from "../assets/icons/icon_say.svg";
import iconArrow from "../assets/icons/icon_arrow.svg";
import iconWarning from "../assets/icons/icon_warning.svg";
import iconWarningRed from "../assets/icons/warning_red_icon.svg";
import iconSayRed from "../assets/icons/information_red_icon.svg";
import iconWarningGreen from "../assets/icons/iconWarningGreen.svg";
import arrow from "../assets/icons/arrow_right_button_sumbit_icon.svg";

const ContactSection = () => {
  const location = useLocation();

  const isDetailingPage = location.pathname.startsWith("/detailing");
  const isCleaningPage = location.pathname.startsWith("/cleaning");
  const isAboutPage = location.pathname === "/about-us";

  const theme = isDetailingPage
    ? {
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
        badgeBg: "#FF525226",
        infoBg: "#FF525226",
        focus: "#FF9E9E",
        submitGradient:
          "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)",
        iconSay: iconSayRed,
        iconWarning: iconWarningRed,
      }
    : {
        badgeBg: "rgba(235,176,108,0.25)",
        infoBg: "rgba(235,176,108,0.25)",
        focus: "#EBAE6C",
        submitGradient:
          "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
        iconSay: iconSay,
        iconWarning: iconWarning,
      };

  const descriptionText = isDetailingPage
    ? "Interested in our detailing services? Fill out your information and let us know what your vehicle needs. We’ll get back to you promptly."
    : isCleaningPage
    ? "Interested in our cleaning services? Fill out your information and let us know how we can help. We’ll get back to you promptly."
    : "Interested in our services? Fill out your information and let us know how we can help. We’ll get back to you promptly.";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    contact: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      contact: "",
    }));
    setSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSent(false);

    const newErrors = {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
      contact: "",
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    }

    const hasError = Object.values({
      firstName: newErrors.firstName,
      lastName: newErrors.lastName,
      phone: newErrors.phone,
      email: newErrors.email,
      message: newErrors.message,
    }).some(Boolean);

    if (hasError) {
      newErrors.contact = "Please fill out all fields before submitting.";
      setErrors(newErrors);
      return;
    }

    const service = isDetailingPage
      ? "Danilets Detailing"
      : isCleaningPage
      ? "Danilets Cleaning"
      : "General";

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      service,
      description: formData.message,
    };

    try {
      setIsSubmitting(true);
      await apiSend("/api/contactsform", "POST", payload);
      setSent(true);

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
      });
      setErrors({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
        contact: "",
      });
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        contact: err?.error || "Something went wrong. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "h-12 px-4 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none";

  return (
    <section className="px-5 md:px-10 lg:px-20 py-10 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* LEFT SIDE */}
          <div className="max-w-[560px] lg:col-span-5">
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
              {descriptionText}
            </p>

            <Link
              to={isAboutPage ? "/" : "/about-us"}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full text-base font-semibold transition hover:opacity-90"
              style={
                isDetailingPage || isCleaningPage
                  ? { background: "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)", color: "#1c1c1c" }
                  : { background: "#fff", border: "1px solid #d4d4d4", color: "#000" }
              }
            >
              {isAboutPage ? "Home" : "About Us"}
              <img src={iconArrow} alt="" className="w-4 h-4" />
            </Link>
          </div>

          {/* RIGHT SIDE — FORM */}
          <div className="mt-8 lg:mt-0 lg:col-span-7">
            <div className="bg-white rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5 sm:p-7 lg:p-10">
              <h3 className="text-[28px] sm:text-[32px] font-extrabold text-black mb-6">
                Interest Form
              </h3>

              <form
                noValidate
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4"
              >
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.firstName ? "border border-red-500" : ""
                  }`}
                />

                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.lastName ? "border border-red-500" : ""
                  }`}
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.phone ? "border border-red-500" : ""
                  }`}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputBase} lg:col-span-2 ${
                    errors.email ? "border border-red-500" : ""
                  }`}
                />

                {errors.contact && (
                  <div className="lg:col-span-2">
                    <p className="text-sm text-red-600">{errors.contact}</p>
                  </div>
                )}

                <textarea
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`lg:col-span-2 min-h-[96px] px-4 py-3 rounded-[20px] bg-[#efefef] text-[15px] placeholder:text-[#a0a0a0] focus:outline-none resize-none ${
                    errors.message ? "border border-red-500" : ""
                  }`}
                />

                {sent && (
                  <div className="lg:col-span-2 flex items-center gap-3 px-4 py-3 rounded-[16px] bg-[#ecfdf3]">
                    <img src={iconWarningGreen} alt="" className="w-6 h-6" />
                    <span className="text-[14px] text-[#166534]">
                      Thank you! Your message has been sent.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lg:col-span-2 h-12 rounded-[24px] font-semibold text-[#1c1c1c] flex items-center justify-between px-6 transition disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: theme.submitGradient }}
                >
                  <span>{isSubmitting ? "Sending..." : "Submit"}</span>
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
