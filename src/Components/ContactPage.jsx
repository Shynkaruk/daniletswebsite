import React from "react";
import { Link } from "react-router-dom";
import Head from "../Components/Head";
import ContactForm from "../Components/ContactForm";
import Footer from "../Components/Footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      {/* Header */}
      <Head />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-10 lg:py-16">
        <div className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-white rounded-[32px] shadow-sm flex flex-col lg:flex-row gap-10 lg:gap-16 p-6 sm:p-8 lg:p-12">
            {/* Left side – текстовий блок */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center gap-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7EAD4] text-sm font-medium text-[#7A5A23]">
                <span className="h-2 w-2 rounded-full bg-[#E0B452]" />
                Experience the Danilets Difference
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] leading-tight font-semibold text-[#111111]">
                Stay in the
                <br />
                Loop with Danilets
              </h1>

              {/* 🔹 Оновлений текст — "our services" замість "detailing services" */}
              <p className="text-base sm:text-lg text-[#555555] max-w-[520px]">
                Have questions about our services, pricing, or availability? 
                Leave your contact information and a short message in the form on the right, 
                and we&apos;ll get back to you promptly.
              </p>

              {/* 🔹 Кнопка тепер веде на About Us сторінку */}
              <Link
                to="/about"
                className="mt-2 inline-flex items-center justify-center w-fit rounded-full border border-[#D7D7D7] px-6 py-2 text-sm font-medium text-[#111111] hover:bg-[#F5F5F5] transition"
              >
                About Us
                <span className="ml-2 text-lg">↗</span>
              </Link>
            </div>

            {/* Right side – form */}
            <div className="w-full lg:w-1/2">
              <div className="bg-[#F7F7F7] rounded-[32px] p-6 sm:p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;
