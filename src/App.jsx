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
import ScrollToTop from "./ScrollToTop.jsx";
import BookingSuccess from "./Components/payments/BookingSuccess.jsx";
import Layout from "./Components/Layout.jsx";
import { NavigationGuardProvider } from "./contexts/NavigationGuard.jsx";

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

  // === Редирект на головну сторінку для спеціалізованих доменів ===
  useEffect(() => {
    const isDetailingDomain = domainType === "detailing";
    const isCleaningDomain = domainType === "cleaning";

    if (!isDetailingDomain && !isCleaningDomain) return;

    const path = location.pathname;

    // Якщо на detailing-домені заходять на /cleaning або /detailing — редирект на /
    if (isDetailingDomain && (path === "/cleaning" || path === "/detailing")) {
      navigate("/", { replace: true });
    }

    // Якщо на cleaning-домені заходять на /cleaning або /detailing — редирект на /
    if (isCleaningDomain && (path === "/cleaning" || path === "/detailing")) {
      navigate("/", { replace: true });
    }

    // Якщо хтось зайшов на будь-який інший шлях (крім / і /home) — теж можна редиректити, але залишимо для гнучкості
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

        {/* Ці два роути залишаємо, але вони будуть редиректитись через useEffect */}
        <Route path="/cleaning" element={getHomeElement()} />
        <Route path="/detailing" element={getHomeElement()} />

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
    <NavigationGuardProvider>
      <AppContent />
    </NavigationGuardProvider>
  </Router>
);

export default App;