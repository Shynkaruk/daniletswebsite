// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";

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
import ScrollToTop from "./ScrollToTop.jsx";     // ← імпорт
import BookingSuccess from "./Components/payments/BookingSuccess.jsx";
import Layout from "./Components/Layout.jsx";

const AppContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [domainType, setDomainType] = useState("main");
  const location = useLocation();
  const navigate = useNavigate();

  // === Визначення домену ===
  useEffect(() => {
    const host = window.location.hostname.toLowerCase();

    if (host === "daniletsdetailing.com" || host === "www.daniletsdetailing.com") {
      setDomainType("detailing");
    } else if (host === "daniletscleaning.com" || host === "www.daniletscleaning.com") {
      setDomainType("cleaning");
    } else {
      setDomainType("main");
    }
  }, []);

  // Примусовий редирект на root для detailing/cleaning доменів
  useEffect(() => {
    if ((domainType === "detailing" || domainType === "cleaning") && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [domainType, location.pathname, navigate]);

  const getHomeElement = () => {
    if (domainType === "detailing") return <DetailingPage />;
    if (domainType === "cleaning") return <Cleaning />;
    return isMobile ? <MainMobile /> : <Main />;
  };

  // Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={getHomeElement()} />
        <Route path="/home" element={getHomeElement()} />

        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/legal/*" element={<PrivacyPolicy />} />

        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/detailing" element={<DetailingPage />} />

        <Route path="/book-online" element={<Booking />} />
        <Route path="/admin" element={<AdminRequests />} />
        <Route path="/account" element={<Account />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <Router>
    <ScrollToTop />        
    <AppContent />
  </Router>
);

export default App;