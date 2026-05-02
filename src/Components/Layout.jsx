import React, { useEffect, useState } from "react";
import Head from "./Head";
import { Outlet } from "react-router-dom";
import ContactForm from "./ContactForm.jsx";
import AuthModal from "./AuthModal.jsx";
import SocialModal from "./SocialModal.jsx";

export default function Layout() {
  const [contactOpen, setContactOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  // === Domain detection (дублюємо, бо Layout вище роутів) ===
  const [domainType, setDomainType] = useState("main");

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

  const anyModalOpen = contactOpen || authOpen || socialOpen;

  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [anyModalOpen]);

  const showAuth = (tab = "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <>
      {!anyModalOpen && (
        <Head
          onOpenContact={() => setContactOpen(true)}
          onOpenAuth={showAuth}
          onOpenSocial={() => setSocialOpen(true)}
          domainType={domainType}        // ← передаємо
        />
      )}

      <div className="pt-[0px] md:pt-[0px]">
        <Outlet />
      </div>

      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
      <SocialModal
        open={socialOpen}
        onClose={() => setSocialOpen(false)}
        initialTab="Detailing"
      />
    </>
  );
}