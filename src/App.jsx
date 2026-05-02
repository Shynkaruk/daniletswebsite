// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Main from "./Components/Main.jsx";
import MainMobile from "./Components/MainMobile.jsx";
import AboutUs from "./Components/AboutUs.jsx";
import ContactForm from "./Components/ContactForm.jsx";
import Newsletter from "./Components/Newsletter.jsx";
import PrivacyPolicy from "./Components/PrivacyPolicy.jsx";
import Cleaning from "./Components/Services/Cleaning/CleaningPage.jsx";
import Booking from "./Components/Booking.jsx";
import DetailingPage from "./Components/Services/Detailing/DetailingPage.jsx";
import AdminRequests from "./Accounts/AdminRequests.jsx";
import Account from "./Accounts/Account.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import BookingSuccess from "./Components/payments/BookingSuccess.jsx";
import Layout from "./Components/Layout.jsx";

const App = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  const [domainType, setDomainType] = useState("main"); // main | cleaning | detailing

  // Визначення домену
  useEffect(() => {
    const host = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";

    if (host === "daniletsdetailing.com" || host === "www.daniletsdetailing.com") {
      setDomainType("detailing");
    } else if (host === "daniletscleaning.com" || host === "www.daniletscleaning.com") {
      setDomainType("cleaning");
    } else {
      setDomainType("main");
    }
  }, []);

  // Головна сторінка залежно від домену
  const getHomeElement = () => {
    if (domainType === "detailing") return <DetailingPage />;
    if (domainType === "cleaning") return <Cleaning />;
    return isMobile ? <MainMobile /> : <Main />;
  };

  // Resize для мобільної версії
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Головна сторінка */}
          <Route path="/" element={getHomeElement()} />
          <Route path="/home" element={getHomeElement()} />

          {/* === DETAILING === */}
          <Route path="/services/detailing" element={<DetailingPage />} />
          <Route path="/detailing" element={<Navigate to="/services/detailing" replace />} />
          <Route path="/detail" element={<Navigate to="/services/detailing" replace />} />

          {/* === CLEANING === */}
          <Route path="/services/cleaning" element={<Cleaning />} />

          {/* Спільні сторінки */}
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/newsletter" element={<Newsletter />} />

          {/* Legal pages */}
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms-conditions" element={<PrivacyPolicy />} />
          <Route path="/legal/faq" element={<PrivacyPolicy />} />

          {/* Інші сторінки */}
          <Route path="/book-online" element={<Booking />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/admin" element={<AdminRequests />} />
          <Route path="/account" element={<Account />} />

          {/* Якщо хтось зайде на неіснуючий маршрут — можна додати 404 пізніше */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;