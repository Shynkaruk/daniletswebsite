// App.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";

// Eager
import Main from "./Components/Main.jsx";
import MainMobile from "./Components/MainMobile.jsx";
import Layout from "./Components/Layout.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import { NavigationGuardProvider } from "./contexts/NavigationGuard.jsx";

// Lazy routes
const AboutUs        = lazy(() => import("./Components/AboutUs.jsx"));
const ContactForm    = lazy(() => import("./Components/ContactForm.jsx"));
const Newsletter     = lazy(() => import("./Components/Newsletter.jsx"));
const PrivacyPolicy  = lazy(() => import("./Components/PrivacyPolicy.jsx"));
const Cleaning       = lazy(() => import("./Components/Services/Cleaning/CleaningPage.jsx"));
const DetailingPage  = lazy(() => import("./Components/Services/Detailing/DetailingPage.jsx"));
const Booking        = lazy(() => import("./Components/Booking.jsx"));
const AdminRequests  = lazy(() => import("./Accounts/AdminRequests.jsx"));
const Account        = lazy(() => import("./Accounts/Account.jsx"));
const BookingSuccess = lazy(() => import("./Components/payments/BookingSuccess.jsx"));
const AuthCallback   = lazy(() => import("./Components/AuthCallback.jsx"));

const PageFallback = () => (
  <div className="min-h-screen bg-[rgba(235,235,235,1)]" />
);

const AppContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [domainType, setDomainType] = useState("main");
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const isDetailingDomain = domainType === "detailing";
    const isCleaningDomain = domainType === "cleaning";
    if (!isDetailingDomain && !isCleaningDomain) return;
    const path = location.pathname;
    if (isDetailingDomain && (path === "/cleaning" || path === "/detailing")) {
      navigate("/", { replace: true });
    }
    if (isCleaningDomain && (path === "/cleaning" || path === "/detailing")) {
      navigate("/", { replace: true });
    }
  }, [domainType, location.pathname, navigate]);

  const getHomeElement = () => {
    if (domainType === "detailing") return <DetailingPage />;
    if (domainType === "cleaning") return <Cleaning />;
    return isMobile ? <MainMobile /> : <Main />;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={getHomeElement()} />
          <Route path="/home" element={getHomeElement()} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/legal/*" element={<PrivacyPolicy />} />
          <Route path="/cleaning" element={getHomeElement()} />
          <Route path="/detailing" element={getHomeElement()} />
          <Route path="/book-online" element={<Booking />} />
          <Route path="/admin" element={<AdminRequests />} />
          <Route path="/account" element={<Account />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
      </Routes>
    </Suspense>
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
