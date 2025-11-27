// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

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

const App = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

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
        <Route path="/" element={isMobile ? <MainMobile /> : <Main />} />
        <Route path="/home" element={isMobile ? <MainMobile /> : <Main />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms-conditions" element={<PrivacyPolicy />} />
        <Route path="/legal/faq" element={<PrivacyPolicy />} />
        <Route path="/services/cleaning" element={<Cleaning />} />
        <Route path="/services/detailing" element={<DetailingPage />} />
        <Route path="/book-online" element={<Booking />} />
        <Route path="/admin" element={<AdminRequests />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
};

export default App;
