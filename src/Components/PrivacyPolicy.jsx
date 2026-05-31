import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import Head from "./Head";
import Footer from "../Components/Footer";
import FAQ from "./FAQ";

const PrivacyPolicy = () => {
  const [selectedService, setSelectedService] = useState("Terms & Conditions");
  const buttonRefs = useRef({});
  const location = useLocation();

  const [activePosition, setActivePosition] = useState({ left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Визначаємо активну вкладку за маршрутом
  useEffect(() => {
    const path = location.pathname;
    if (path === "/legal/privacy-policy") setSelectedService("Privacy Policy");
    else if (path === "/legal/faq") setSelectedService("FAQ");
    else setSelectedService("Terms & Conditions");
  }, [location]);

  // Рух активного бейджа під кнопками
  useEffect(() => {
    const button = buttonRefs.current[selectedService];
    if (button) {
      setActivePosition({
        left: button.offsetLeft - 2,
        width: button.offsetWidth,
      });
    }
  }, [selectedService, isMobile]);

  // ✅ Явні роуті (без replace-логіки)
  const TABS = [
    { label: "Privacy Policy", to: "/legal/privacy-policy" },
    { label: "Terms & Conditions", to: "/legal/terms-conditions" },
    { label: "FAQ", to: "/legal/faq" },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {isMobile ? <Head title={selectedService} /> : <Head />}

      {/* ✅ Компенсація fixed Header: опускаємо весь контент нижче */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 pt-[92px] md:pt-[120px]">
        {/* Навігація */}
        <nav className="text-gray-600 text-sm mb-4">
          <Link to="/" className="hover:text-yellow-600">
            Home
          </Link>{" "}
          / <span>{selectedService}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#18181B] mb-6">
          Legal
        </h1>

        {/* Tabs */}
        <div className="relative w-full max-w-full md:max-w-[600px] h-[76px] bg-white rounded-[174px] p-2 overflow-x-auto md:overflow-hidden scrollbar-hide mb-8">
          <div
            className="absolute h-[60px] bg-[rgba(242,242,242,1)] rounded-[88px] transition-all duration-300 ease-in-out z-0"
            style={{
              left: `${activePosition.left}px`,
              width: `${activePosition.width}px`,
            }}
          />
          <div className="flex space-x-[10px] z-10 min-w-max">
            {TABS.map((tab) => (
              <Link
                key={tab.label}
                to={tab.to}
                ref={(el) => (buttonRefs.current[tab.label] = el)}
                className="text-[16px] sm:text-[18px] font-bold leading-[38px] text-[#18181B] py-[10px] sm:py-[14px] px-6 sm:px-10 rounded-[88px] z-10 whitespace-nowrap"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-[#18181B] space-y-6 max-w-full sm:max-w-[850px] lg:max-w-full pb-10">
          {selectedService === "FAQ" ? (
            <FAQ />
          ) : selectedService === "Terms & Conditions" ? (
            <>
              <h2 className="font-bold text-2xl sm:text-3xl lg:text-[48px]">
                Terms and Conditions
              </h2>

              <h3 className="font-semibold text-xl mt-4">
                1. Acceptance of Terms
              </h3>
              <p>
                By booking or using any services provided by Danilets Detailing
                LLC and Timils Cleaning LLC (collectively "Danilets," "we,"
                "us," or "our"), you ("Customer," "you," or "your") agree to be
                bound by these Terms and Conditions. If you do not agree to
                these terms, please do not use our services.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                2. Services Provided
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Cleaning Services:</strong> Commercial cleaning,
                  office cleaning, Airbnb cleaning, and deep cleaning.
                </li>
                <li>
                  <strong>Detailing Services:</strong> Interior and exterior
                  detailing, ceramic coating, PPF, wraps, tinting, headlight and
                  trim restoration, glass and wheel coating, decal removal.
                </li>
                <li>
                  <strong>Dealership & Fleet:</strong> Inventory prep and fleet
                  maintenance.
                </li>
              </ul>
              <p>
                Service descriptions and pricing may change. Final price is
                confirmed after inspection and job assessment.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                3. Booking & Scheduling
              </h3>
              <p>
                <strong>3.1 Booking:</strong> You may book online (detailing) or
                via consultation (cleaning). You can also call/text (614)
                980-7380.
              </p>
              <p>
                <strong>3.2 Confirmation:</strong> Appointments are valid only
                after confirmation by our team.
              </p>
              <p>
                <strong>3.3 Cancellation:</strong> 24-hour notice required to
                cancel or reschedule. Late cancellations may incur a fee.
                Danilets may reschedule due to weather or other reasons.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                4. Pricing & Payment
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Prices are estimates and may vary based on condition and
                  scope.
                </li>
                <li>
                  Deposits may be required and are non-refundable if late.
                </li>
                <li>
                  Payment is due upon completion unless otherwise agreed in
                  writing.
                </li>
              </ul>

              <h3 className="font-semibold text-xl mt-4">
                5. Customer Responsibilities
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Provide property or vehicle access; remove personal
                  belongings.
                </li>
                <li>Provide accurate information about condition and needs.</li>
                <li>Disclose hazards, damages, or special conditions.</li>
              </ul>

              <h3 className="font-semibold text-xl mt-4">
                6. Service Guarantee & Satisfaction
              </h3>
              <p>
                Contact us within 48 hours if not satisfied. If our review
                confirms an issue, we will re-service at no charge. Guarantee
                excludes pre-existing damage, misuse, or normal wear and tear.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                7. Liability & Limitations
              </h3>
              <p>
                We are not responsible for pre-existing damage or undisclosed
                issues. Liability is limited to the amount paid for the service.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                8. Products & Materials
              </h3>
              <p>
                We use professional-grade products. Customer allergies or
                product preferences must be communicated beforehand.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                9. Intellectual Property
              </h3>
              <p>
                All website content (text, graphics, logos, etc.) is the
                property of Danilets Detailing LLC and Timils Cleaning LLC.
                Reproduction without permission is prohibited.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                10. Privacy & Data Protection
              </h3>
              <p>
                Customer data is collected only to provide and improve our
                services and is never sold. You may opt out of marketing
                communications anytime.
              </p>

              <h3 className="font-semibold text-xl mt-4">11. Force Majeure</h3>
              <p>
                Danilets is not liable for delays caused by weather, disasters,
                government actions, or other uncontrollable events.
              </p>

              <h3 className="font-semibold text-xl mt-4">
                12. Dispute Resolution
              </h3>
              <p>
                Please contact us in good faith to resolve any disputes:{" "}
                <strong>info@danilets.com</strong> or{" "}
                <strong>(614) 980-7380</strong>. These terms follow the laws of
                the State of Ohio, USA.
              </p>

              <h3 className="font-semibold text-xl mt-4">13. Modifications</h3>
              <p>
                We may modify these Terms at any time. Continued use of our
                services indicates acceptance of updates.
              </p>

              <h3 className="font-semibold text-xl mt-4">14. Contact</h3>
              <p>
                <strong>Phone:</strong> (614) 980-7380 <br />
                <strong>Email:</strong> info@danilets.com <br />
                <strong>Cleaning:</strong> cleaning@danilets.com <br />
                <strong>Detailing:</strong> detailing@danilets.com <br />
                <strong>Website:</strong> www.danilets.com
              </p>

              <p className="text-sm text-gray-600">
                © 2025 Danilets Detailing LLC & Timils Cleaning LLC. All rights
                reserved.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-bold text-2xl sm:text-3xl lg:text-[48px]">
                Privacy Policy
              </h2>

              <p className="mt-4">
                This Privacy Policy explains how Danilets (“we”, “our”, or “the
                service”) collects, uses, stores, and protects your personal
                information when you visit our website or interact with any of
                our services — including but not limited to car detailing,
                interior cleaning, residential and commercial cleaning services.
              </p>

              <p className="mt-4">
                By using our website, you agree to the terms of this Privacy
                Policy.
              </p>

              <h3 className="font-semibold text-xl mt-6">
                What Information We Collect
              </h3>

              <p className="mt-2">We may collect two categories of data:</p>

              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Personal identification information</strong> (e.g.,
                  your name, email address, phone number, company name)
                </li>
                <li>
                  <strong>Project information</strong> (description, budget,
                  goals, deadlines)
                </li>
                <li>
                  <strong>Technical data</strong> (IP address, browser type,
                  device type, time zone, referring URLs)
                </li>
                <li>
                  <strong>Usage data</strong> (pages visited, time spent on
                  pages, click behavior)
                </li>
              </ul>

              <p className="mt-2">
                We collect this data directly from you (via forms), or
                automatically (via cookies and analytics tools).
              </p>

              <h3 className="font-semibold text-xl mt-6">
                How We Use Your Information
              </h3>

              <p className="mt-2">We use the collected data exclusively for:</p>

              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  Responding to service requests and providing our services
                </li>
                <li>Coordinating on-site visits or appointments</li>
                <li>Communicating important updates or confirmations</li>
                <li>Sending operational notifications</li>
                <li>Analyzing demand and improving user experience</li>
                <li>
                  Maintaining internal records and meeting legal obligations
                </li>
              </ul>

              <p className="mt-2">
                We do not sell or share your personal information with third
                parties without your explicit consent or a legal requirement.
              </p>

              <h3 className="font-semibold text-xl mt-6">Data Sharing</h3>

              <p className="mt-2">
                We may share your information only under these conditions:
              </p>

              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  With trusted <strong>third-party service providers</strong>{" "}
                  (CRM tools, email delivery systems, payment processors)
                  strictly for operational needs.
                </li>
                <li>With authorities if required by law.</li>
                <li>
                  With <strong>IT specialists</strong> for site maintenance —
                  under confidentiality agreements.
                </li>
              </ul>

              <h3 className="font-semibold text-xl mt-6">
                Cookies and Analytics
              </h3>

              <p className="mt-2">
                We use cookies and analytics tools (e.g., Google Analytics,
                Facebook Pixel) to:
              </p>

              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Understand user behavior and website performance</li>
                <li>Improve navigation and content</li>
                <li>Analyze marketing campaign efficiency</li>
                <li>Personalize user experience</li>
              </ul>

              <p className="mt-2">
                You can disable cookies in your browser settings. We do not use
                cookies to sell or disclose your personal data.
              </p>

              <h3 className="font-semibold text-xl mt-6">
                Changes to This Policy
              </h3>

              <p className="mt-2">
                We reserve the right to modify this Privacy Policy at any time.
                Any changes will be posted on this page with an updated
                effective date. We recommend reviewing this page regularly to
                stay informed.
              </p>

              <h3 className="font-semibold text-xl mt-6">
                Contact Information
              </h3>

              <p className="mt-2">
                If you have questions about this Privacy Policy, contact us:
              </p>

              <p className="mt-2">
                <strong>Email:</strong> info@danilets.com <br />
                <strong>Phone:</strong> (614) 980-7380
              </p>

              <p className="text-sm text-gray-600 mt-6">
                © 2025 Danilets Detailing LLC & Timils Cleaning LLC. All rights
                reserved.
              </p>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
