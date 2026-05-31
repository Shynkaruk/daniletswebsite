import React, { useEffect, useState } from "react";
import Head from "./Head";
import { Outlet, useLocation } from "react-router-dom";
import ContactForm from "./ContactForm.jsx";
import AuthModal from "./AuthModal.jsx";
import SocialModal from "./SocialModal.jsx";
import CompleteProfileModal from "./CompleteProfileModal.jsx";
import { auth } from "../lib/api";

export default function Layout() {
  const location = useLocation();

  const [contactOpen, setContactOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  // Profile completion modal (after Google/Apple OAuth)
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileInitialData, setProfileInitialData] = useState({});

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

  // Called by AuthModal after Google OAuth when profile is incomplete
  const openProfileCompletion = (userData) => {
    setProfileInitialData(userData || {});
    setAuthOpen(false);
    setProfileOpen(true);
  };

  // Detect ?need_profile=1 set by AuthCallback after Apple OAuth.
  // Runs every time the location changes (Layout stays mounted across navigations).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("need_profile") === "1") {
      const user = auth.getUser();
      setProfileInitialData({
        first_name: user?.first_name || "",
        last_name:  user?.last_name  || "",
        phone:      user?.phone      || "",
        email:      user?.email      || "",
      });
      setProfileOpen(true);
      // Remove the param from the URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("need_profile");
      window.history.replaceState({}, "", url.toString());
    }
  }, [location]);

  const anyModalOpen = contactOpen || authOpen || socialOpen || profileOpen;

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
        onNeedsProfileCompletion={openProfileCompletion}
      />
      <SocialModal
        open={socialOpen}
        onClose={() => setSocialOpen(false)}
        initialTab="Detailing"
      />
      <CompleteProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        initialData={profileInitialData}
        onDone={() => {
          setProfileOpen(false);
          window.location.href = "/account";
        }}
      />
    </>
  );
}