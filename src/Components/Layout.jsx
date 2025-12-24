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

  const anyModalOpen = contactOpen || authOpen || socialOpen;

  // Можна ще й скролл блокувати (корисно)
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
      {/* Ховаємо Head, коли модалка відкрита */}
      {!anyModalOpen && (
        <Head
          onOpenContact={() => setContactOpen(true)}
          onOpenAuth={showAuth}
          onOpenSocial={() => setSocialOpen(true)}
        />
      )}

      <div className="pt-[0px] md:pt-[0px]">
        <Outlet />
      </div>

      {/* Модалки завжди зверху (і незалежні від Head) */}
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
