import React, { useEffect, useRef, useState } from "react";
import { apiSend } from "../lib/api";
import { useLocation } from "react-router-dom";

const ContactForm = ({ open, onClose, initialService = "Danilets Detailing" }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: initialService || "Danilets Detailing",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const dialogRef = useRef(null);

const location = useLocation();

useEffect(() => {
  if (location.pathname.includes("/services/detailing")) {
    setForm((s) => ({ ...s, service: "Danilets Detailing" }));
  } else if (location.pathname.includes("/services/cleaning")) {
    setForm((s) => ({ ...s, service: "Danilets Cleaning" }));
  }
}, [location.pathname]);


  // ESC
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Click outside
  useEffect(() => {
    const onClick = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  const services = ["Danilets Detailing", "Danilets Cleaning"];

const submit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess(false);

  if (!form.email || !form.description) {
    setError("Please enter your email and a message.");
    return;
  }

  try {
    setLoading(true);

    await apiSend("/api/contactsform", "POST", {
      ...form,
      pagePath: location.pathname, // корисно в адмінці
    });

    setSuccess(true);

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: initialService || "Danilets Detailing",
      description: "",
    });

    setTimeout(() => onClose?.(), 1500);
  } catch (err) {
    console.error(err);
    setError(err?.error || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="relative w-[92%] max-w-[560px] rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
      >
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/5 text-black/70"
        >
          ✕
        </button>

        <h2 className="mb-4 text-xl sm:text-2xl font-semibold text-black">
          Contact Us
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="First name"
              className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
              value={form.firstName}
              onChange={(e) =>
                setForm((s) => ({ ...s, firstName: e.target.value }))
              }
            />
            <input
              placeholder="Last name"
              className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
              value={form.lastName}
              onChange={(e) =>
                setForm((s) => ({ ...s, lastName: e.target.value }))
              }
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
            value={form.email}
            onChange={(e) =>
              setForm((s) => ({ ...s, email: e.target.value }))
            }
          />

          <input
            type="tel"
            placeholder="Phone number"
            className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
            value={form.phone}
            onChange={(e) =>
              setForm((s) => ({ ...s, phone: e.target.value }))
            }
          />

          <select
            className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none text-[rgba(28,28,28,1)]"
            value={form.service}
            onChange={(e) =>
              setForm((s) => ({ ...s, service: e.target.value }))
            }
          >
            {services.map((s) => (
              <option key={s} value={s} className="text-[rgba(28,28,28,1)]">
                {s}
              </option>
            ))}
          </select>

          <textarea
            rows={4}
            placeholder="Message"
            className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none resize-none placeholder-[rgba(122,122,122,1)] text-black"
            value={form.description}
            onChange={(e) =>
              setForm((s) => ({ ...s, description: e.target.value }))
            }
          />

          <div className="flex items-start gap-3 rounded-xl bg-[#F7F5F0] px-3 py-3 text-[13px]">
            <span>⚠️</span>
            <p className="text-black">
              We’ll send all updates and information to this email address
            </p>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          {success && (
            <div className="text-sm text-green-600">
              Your message has been sent. We&apos;ll contact you shortly.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl px-5 py-3 text-[15px] font-semibold text-[#1d1d1f] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg,#F5E7B9 0%,#E9CB7A 45%,#D6B15E 65%,#C79B47 100%)",
            }}
          >
            {loading ? "Sending..." : "Submit →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
