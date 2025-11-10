import React, { useEffect, useRef, useState } from "react";

const ContactForm = ({ open, onClose }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "Danilets Cleaning",
    description: "",
  });
  const dialogRef = useRef(null);

  // ESC
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Click outside
  useEffect(() => {
    const onClick = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose?.();
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  const services = [
    "Danilets Detailing",
    "Danilets Pickleball",
    "Danilets Cleaning",
    "Danilets Media",
  ];

  const submit = (e) => {
    e.preventDefault();
    console.log("Contact form:", form);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

        <h2 className="mb-4 text-xl sm:text-2xl font-semibold text-black">Contact Us</h2>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Enter your first name"
              className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
              value={form.firstName}
              onChange={(e) =>
                setForm((s) => ({ ...s, firstName: e.target.value }))
              }
            />
            <input
              placeholder="Enter your last name"
              className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
              value={form.lastName}
              onChange={(e) =>
                setForm((s) => ({ ...s, lastName: e.target.value }))
              }
            />
          </div>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />

          <input
            type="tel"
            placeholder="Enter your phone number"
            className="w-full rounded-2xl bg-black/5 px-4 py-3 outline-none placeholder-[rgba(122,122,122,1)] text-black"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
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
            placeholder="Description"
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

          <button
            type="submit"
            className="w-full rounded-2xl px-5 py-3 text-[15px] font-semibold text-[#1d1d1f]"
            style={{
              background:
                "linear-gradient(135deg,#F5E7B9 0%,#E9CB7A 45%,#D6B15E 65%,#C79B47 100%)",
            }}
          >
            Submit →
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
