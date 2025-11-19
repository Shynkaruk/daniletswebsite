import React, { useEffect, useRef, useState } from "react";
import {
  FaGoogle,
  FaTiktok,
  FaYoutube,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

const TABs = ["Detailing", "Cleaning"];

// === Замінити посилання на ваші реальні ===
const SOCIALS = {
  Detailing: [
    // { label: "Google", icon: FaGoogle, href: "#" },
    { label: "Instagram", icon: FaInstagram, href: "https://www.instagram.com/daniletsdetailing?igsh=MWphOGk5MGc2bHBvNg==" },
    // { label: "TikTok", icon: FaTiktok, href: "#" },
    // { label: "YouTube", icon: FaYoutube, href: "#" },
    // { label: "Facebook", icon: FaFacebookF, href: "#" },
  ],
  Cleaning: [
    // { label: "Google", icon: FaGoogle, href: "#" },
    { label: "Instagram", icon: FaInstagram, href: "https://www.instagram.com/daniletscleaning?igsh=ajcwdW9uZGxkb2M5" },
    // { label: "TikTok", icon: FaTiktok, href: "#" },
    // { label: "YouTube", icon: FaYoutube, href: "#" },
    // { label: "Facebook", icon: FaFacebookF, href: "#" },
  ],
};

const pillGradient =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

export default function SocialModal({ open, onClose, initialTab = "Detailing" }) {
  const [tab, setTab] = useState(initialTab);
  const boxRef = useRef(null);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed z-[101] inset-0 flex items-center justify-center px-4"
        aria-modal="true"
        role="dialog"
      >
        <div
          ref={boxRef}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[560px] rounded-[24px] bg-white shadow-2xl border border-[#E6E6EA] p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Social Media</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#A1A1A5] text-[#A1A1A5] hover:bg-gray-50"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-[#F5F6F8] p-1 rounded-full w-fit mb-5">
            {TABs.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    active
                      ? "text-[rgba(62,38,12,1)] shadow"
                      : "text-[#6F6F77] hover:text-black"
                  }`}
                  style={active ? { background: pillGradient } : undefined}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Social list */}
          <div className="flex flex-col gap-3">
            {SOCIALS[tab]?.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full px-5 py-3 flex items-center gap-3 font-semibold text-[rgba(62,38,12,1)] shadow-sm hover:opacity-95 transition"
                style={{ background: pillGradient }}
              >
                <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-black/10">
                  <Icon className="text-sm" />
                </span>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
