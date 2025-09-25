import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Head from './Head';
import Footer from '../Components/Footer';

const PrivacyPolicy = () => {
  const [selectedService, setSelectedService] = useState('Privacy Policy');
  const buttonRefs = useRef({});
  const location = useLocation();

  const [activePosition, setActivePosition] = useState({ left: 0, width: 0 });

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/legal/terms-conditions') setSelectedService('Terms & Conditions');
    else if (path === '/legal/faq') setSelectedService('FAQ');
    else setSelectedService('Privacy Policy');
  }, [location]);

  useEffect(() => {
    const button = buttonRefs.current[selectedService];
    if (button) {
      setActivePosition({
        left: button.offsetLeft - 2,
        width: button.offsetWidth,
      });
    }
  }, [selectedService]);

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {isMobile ? <Head title={selectedService} /> : <Head />}

      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        {/* Навігація */}
        <nav className="text-gray-600 text-sm mb-4">
          <Link to="/" className="hover:text-yellow-600">Home</Link> / <span>{selectedService}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#18181B] mb-6">Legal</h1>

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
            {['Privacy Policy', 'Terms & Conditions', 'FAQ'].map((item) => (
              <Link
                key={item}
                to={`/legal/${item.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}
                ref={(el) => (buttonRefs.current[item] = el)}
                className="text-[16px] sm:text-[18px] font-bold leading-[38px] text-[#18181B] py-[10px] sm:py-[14px] px-6 sm:px-10 rounded-[88px] z-10 whitespace-nowrap"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-[#18181B] space-y-6 max-w-full sm:max-w-[800px] lg:max-w-full">
          <h2 className="font-bold text-2xl sm:text-3xl lg:text-[48px]">Privacy Policy</h2>
          <p className="text-sm">Effective date: <strong>28.05.2025</strong></p>

          <p className="text-sm w-full text-justify sm:text-base">
            This Privacy Policy explains how [Company Name]("we", "our", or "the service") collects, uses, stores, and protects your personal information when you visit our website [insert domain] and interact with any of our services — including but not limited to car detailing, interior cleaning, residential and commercial cleaning, and car wash services. By using our website, you agree to the terms of this Privacy Policy.
          </p>

          <h3 className="font-semibold text-lg sm:text-xl">What Information We Collect</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li>Personal Identification Information (e.g., name, address, company name)</li>
            <li>Technical Data (IP address, browser type, device type, time zone, referring URL)</li>
          </ul>

          <h3 className="font-semibold text-lg sm:text-xl">How We Use Your Information</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li>To respond to service requests and provide our services</li>
            <li>To communicate important details and appointments</li>
          </ul>

          <h3 className="font-semibold text-lg sm:text-xl">Data Sharing</h3>
          <p className="text-sm sm:text-base">
            We may share information only under these conditions: with trusted third-party service providers (e.g., CRM, email delivery systems, payment processors) for operational needs.
          </p>

          <h3 className="font-semibold text-lg sm:text-xl">Cookies and Analytics</h3>
          <p className="text-sm sm:text-base">
            We use cookies and analytics tools (e.g., Google Analytics, Facebook Pixel) to understand user behavior and improve website performance.
          </p>

          <p className="text-sm sm:text-base">
            Changes to This Policy: We reserve the right to modify this Privacy Policy at any time. Any changes will be posted on this page with an updated effective date. We recommend reviewing this page regularly to stay informed.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;