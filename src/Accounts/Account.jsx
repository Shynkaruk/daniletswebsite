// src/pages/Account.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Head from "../Components/Head";
import Footer from "../Components/Footer";
import { meApi, reqApi } from "../lib/api";
import fon from "../assets/photo/fon-account.png";

const GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const TABS = [
  { key: "profile", label: "Personal Information" },
  { key: "car", label: "Vehicle Information" },
  { key: "orders", label: "Past Orders" },
];

export default function Account() {
  const [active, setActive] = useState("profile");

  // ✅ кастомний modal (замість alert)
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info", // info | success | error
    content: null, // jsx
  });

  const openModal = useCallback((type, title, message, content = null) => {
    setModal({ open: true, type, title, message, content });
  }, []);

  const closeModal = useCallback(() => {
    setModal((m) => ({ ...m, open: false }));
  }, []);

  return (
    <>
      <Head />

      <div
        className="min-h-[100dvh] w-full flex flex-col"
        style={{
          backgroundImage: `url(${fon})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <main className="w-full flex-1">
          {/* Top spacing from Header */}
          <div className="max-w-[1160px] mx-auto px-4 pt-24 md:pt-40 pb-3 md:pb-6 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#18181B]">
              Profile
            </h1>
          </div>

          {/* Tabs */}
          <div className="max-w-[1160px] mx-auto px-4 mb-5 md:mb-6">
            <div className="w-full flex justify-center">
              <div className="max-w-full overflow-x-auto no-scrollbar">
                <div className="inline-flex items-center bg-white/95 rounded-[999px] p-1 md:p-1.5 shadow-[0_6px_22px_rgba(0,0,0,0.07)] border border-[#ECECEC] gap-1 min-w-max">
                  {TABS.map((t) => {
                    const isActive = active === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setActive(t.key)}
                        className={[
                          "h-10 xs:h-11 md:h-14 px-3 xs:px-4 md:px-6 rounded-[999px]",
                          "text-[12px] xs:text-[13px] md:text-[15px] font-semibold transition whitespace-nowrap",
                          isActive
                            ? "bg-white shadow text-[#18181B]"
                            : "text-[#5E5E61] hover:text-[#18181B]",
                        ].join(" ")}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content container */}
          <div className="max-w-[1160px] mx-auto px-3 sm:px-4 pb-16">
            <div className="bg-white/95 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] shadow-[0_8px_26px_rgba(0,0,0,0.08)] border border-[#ECECEC] p-4 sm:p-5 md:p-8">
              {active === "profile" && <ProfileCard openModal={openModal} />}
              {active === "car" && <CarCard openModal={openModal} />}
              {active === "orders" && <OrdersCard openModal={openModal} />}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* ✅ Custom Modal */}
      {modal.open && (
        <Modal
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={closeModal}
        >
          {modal.content}
        </Modal>
      )}
    </>
  );
}

/* ======================= Personal Information ======================= */
function ProfileCard({ openModal }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    birthday: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await meApi.profile();
        if (u) {
          setForm((f) => ({
            ...f,
            first_name: u.first_name || "",
            last_name: u.last_name || "",
            phone: u.phone || "",
            email: u.email || "",
          }));
        }
      } catch {}
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await meApi.updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      });
      openModal?.("success", "Saved", "Your profile has been saved.");
    } catch (e) {
      openModal?.(
        "error",
        "Save failed",
        e?.message || "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Personal Information">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Input
          placeholder="First Name"
          value={form.first_name}
          onChange={(v) => setForm({ ...form, first_name: v })}
        />
        <Input
          placeholder="Last Name"
          value={form.last_name}
          onChange={(v) => setForm({ ...form, last_name: v })}
        />
        <Input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
        <Input
          className="md:col-span-3"
          placeholder="Email"
          value={form.email}
          disabled
        />
      </div>

      <Actions
        onChange={() => window.location.reload()}
        onSave={onSave}
        saveLabel={saving ? "Saving..." : "Save"}
      />
    </Section>
  );
}

/* ======================= Vehicle Information ======================= */
function CarCard({ openModal }) {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const canSave = (year.trim() || make.trim() || model.trim())?.length > 0;

  const onSave = async () => {
    try {
      await meApi.saveVehicle({ year, make, model });
      openModal?.("success", "Saved", "Vehicle information saved.");
    } catch (e) {
      openModal?.(
        "error",
        "Save failed",
        e?.message || "Failed to save vehicle."
      );
    }
  };

  return (
    <Section title="Vehicle Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Input placeholder="Year" value={year} onChange={setYear} />
        <Input placeholder="Make" value={make} onChange={setMake} />
        <Input
          className="md:col-span-2"
          placeholder="Model"
          value={model}
          onChange={setModel}
        />
      </div>

      <Actions
        onChange={() => {
          setYear("");
          setMake("");
          setModel("");
        }}
        onSave={onSave}
        saveDisabled={!canSave}
      />
    </Section>
  );
}

/* ======================= Past Orders ======================= */
function OrdersCard({ openModal }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // тут ми показуємо ВСІ, не фільтруємо по done
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (typeof reqApi.listMine !== "function") {
          setList([]);
          openModal?.("error", "Orders", "reqApi.listMine is not a function.");
          return;
        }

        const raw = await reqApi.listMine();

        const orders =
          Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.results)
            ? raw.results
            : Array.isArray(raw?.items)
            ? raw.items
            : [];

        const normalized = (orders || []).map((o) => {
          const items = safeParseJSON(o.items_json);

          return {
            raw: o,
            id: o.id ?? o._id ?? o.uuid ?? null,
            title: humanServiceTitle(o, items),
            created_at: o.created_at || o.createdAt || o.date || null,
            updated_at: o.updated_at || o.updatedAt || null,
            items,
          };
        });

        normalized.sort((a, b) => {
          const aT = new Date(a.updated_at || a.created_at || 0).getTime();
          const bT = new Date(b.updated_at || b.created_at || 0).getTime();
          return bT - aT;
        });

        setList(normalized);
      } catch (e) {
        console.error(e);
        setList([]);
        openModal?.(
          "error",
          "Orders",
          e?.message || "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [openModal]);

  const onOpenDetails = (order) => {
    const details = buildOrderDetails(order);

    openModal?.(
      "info",
      "Order details",
      "",
      <div className="space-y-3">
        <div className="text-sm text-[#6B7280]">
          {formatDate(order.updated_at || order.created_at)}
        </div>

        <div className="rounded-[16px] bg-[#F4F4F5] p-4">
          <div className="text-[16px] font-extrabold text-[#111827]">
            {order.title}
          </div>
          {details?.length ? (
            <div className="mt-3 space-y-2">
              {details.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="text-[13px] text-[#6B7280]">{row.label}</div>
                  <div className="text-[13px] font-semibold text-[#111827] text-right whitespace-pre-line">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-[13px] text-[#6B7280]">
              No additional details.
            </div>
          )}
        </div>

        {/* debug (можеш прибрати потім) */}
        <details className="text-xs text-[#6B7280]">
          <summary className="cursor-pointer select-none">Raw JSON</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">
            {JSON.stringify(order.raw, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <Section title="Past Orders">
      {loading ? (
        <div className="text-[#6B7280]">Loading…</div>
      ) : list.length === 0 ? (
        <div className="text-[#6B7280]">You don’t have any orders yet.</div>
      ) : (
        <div className="space-y-3">
          {list.map((o, i) => (
            <button
              key={o.id ?? i}
              type="button"
              onClick={() => onOpenDetails(o)}
              className={[
                "w-full text-left rounded-[16px] border px-4 py-4 flex items-center justify-between gap-3 transition",
                "hover:shadow-[0_8px_26px_rgba(0,0,0,0.06)]",
                i === 0
                  ? "bg-[#FAF3E6] border-[#F0E1C8]"
                  : "bg-white border-[#EAEAEA]",
              ].join(" ")}
            >
              <div className="min-w-0">
                <div className="font-extrabold text-[#18181B] truncate text-[18px]">
                  {o.title}
                </div>
                <div className="text-sm text-[#6B7280] mt-1">
                  {formatDate(o.updated_at || o.created_at)}
                </div>
              </div>

              <div className="shrink-0 text-[#111827] text-[22px] leading-none">
                ›
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <GrayButton
          onClick={() =>
            openModal?.(
              "info",
              "Previous Order Details",
              "Tap on any order card to view details."
            )
          }
        >
          Previous Order Details
        </GrayButton>

        <GoldButton
          onClick={() =>
            openModal?.(
              "info",
              "Repeat Order",
              "This can be implemented next: prefill Booking from selected order."
            )
          }
        >
          Repeat Order
        </GoldButton>
      </div>
    </Section>
  );
}

/* ======================= Reusable UI ======================= */
function Section({ title, children }) {
  return (
    <div>
      <div className="text-[14px] sm:text-[15px] md:text-base font-semibold text-[#111] mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, disabled, className }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={[
        "w-full rounded-[14px] sm:rounded-[16px] bg-[#F4F4F5] outline-none",
        "h-[48px] sm:h-[52px] md:h-[60px] px-3 sm:px-4 md:px-5 text-[14px] sm:text-[15px] md:text-[16px] font-medium",
        "placeholder:text-[#9CA3AF] text-[#18181B]",
        "disabled:opacity-60",
        className || "",
      ].join(" ")}
    />
  );
}

function Actions({ onChange, onSave, saveLabel = "Save", saveDisabled }) {
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <GrayButton onClick={onChange}>Change</GrayButton>
      <GoldButton onClick={onSave} disabled={saveDisabled}>
        {saveLabel}
      </GoldButton>
    </div>
  );
}

function GrayButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-[44px] sm:h-[48px] md:h-[56px] rounded-[14px] sm:rounded-[16px] px-4 sm:px-6 font-semibold text-[#111] bg-[#E9E9EB] hover:bg-[#E4E4E6] disabled:opacity-60 w-full"
    >
      {children}
    </button>
  );
}

function GoldButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-[44px] sm:h-[48px] md:h-[56px] rounded-[14px] sm:rounded-[16px] px-4 sm:px-6 font-semibold text-black disabled:opacity-60 w-full"
      style={{ background: GRADIENT }}
    >
      {children}
    </button>
  );
}

/* ======================= Modal ======================= */
function Modal({ title, message, type = "info", onClose, children }) {
  const accent =
    type === "success"
      ? "border-green-200"
      : type === "error"
      ? "border-red-200"
      : "border-[#E5E7EB]";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4">
      <div
        className={[
          "bg-white rounded-2xl shadow-lg max-w-[560px] w-full p-5 sm:p-6 border",
          accent,
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-[#18181B]">{title}</h3>
            {message ? (
              <p className="text-sm text-[#4B5563] mt-1 whitespace-pre-line">
                {message}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#111827]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[44px] rounded-full border border-[#D4D4D8] text-sm font-semibold text-[#18181B]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================= Helpers ======================= */
function safeParseJSON(v) {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function formatDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ✅ “людські” назви з service_type
function humanServiceType(service_type) {
  const v = (service_type || "").toString().trim().toLowerCase();

  const map = {
    detailing_quote_personal: "Detailing — Personal quote",
    detailing_quote_business: "Detailing — Business / Fleet quote",
    cleaning_quote_residential: "Cleaning — Residential quote",
    cleaning_quote_commercial: "Cleaning — Commercial quote",
  };

  return map[v] || "";
}

// ✅ дістати нормальний title з замовлення
function humanServiceTitle(order, items) {
  // 1) беремо service_type якщо є
  const st = humanServiceType(order?.service_type);
  if (st) return st;

  // 2) пробуємо з items_json (нові payload-и)
  // detailing
  if (items?.quoteType === "personal") return "Detailing — Personal quote";
  if (items?.quoteType === "business") return "Detailing — Business / Fleet quote";

  // cleaning
  if (items?.propertyType === "residential") return "Cleaning — Residential quote";
  if (items?.propertyType === "commercial") return "Cleaning — Commercial quote";

  // 3) fallback
  return order?.service_title || order?.serviceType || "Service";
}

// ✅ Деталі для модалки
function buildOrderDetails(order) {
  const o = order?.raw || {};
  const items = order?.items || {};

  // service address (у тебе часто є service_address / notes / items.location.baseAddress)
  const addr =
    o.service_address ||
    items?.location?.baseAddress ||
    items?.location?.service_address ||
    "";

  // contact (детейлінг payload має items.contact..., cleaning теж має)
  const contact =
    items?.contact ||
    items?.cleaningCommercial?.contact ||
    items?.cleaningCommercial ||
    {};

  const fullName =
    [contact.firstName || contact.first_name, contact.lastName || contact.last_name]
      .filter(Boolean)
      .join(" ") || "";

  const phone = contact.phone || "";
  const email = contact.email || "";

  // extra notes
  const notes =
    items?.additionalInfo ||
    items?.extraDetails ||
    items?.contact?.extraInfo ||
    o.notes_customer ||
    "";

  const rows = [];

  if (addr) rows.push({ label: "Service address", value: addr });
  if (fullName) rows.push({ label: "Customer", value: fullName });
  if (phone) rows.push({ label: "Phone", value: phone });
  if (email) rows.push({ label: "Email", value: email });

  // показати тип/ключові штуки, якщо вони є
  if (items?.propertyType) rows.push({ label: "Property type", value: String(items.propertyType) });
  if (items?.projectType) rows.push({ label: "Project type", value: String(items.projectType) });

  // якщо це commercial cleaning
  if (items?.cleaningCommercial) {
    const c = items.cleaningCommercial || {};
    if (c.companyName) rows.push({ label: "Company name", value: c.companyName });
    if (c.companyAddress) rows.push({ label: "Company address", value: c.companyAddress });
    if (c.projectSummary) rows.push({ label: "Project summary", value: c.projectSummary });
  }

  // якщо detailing
  if (items?.vehicle) {
    const v = items.vehicle;
    const car = [v.year, v.make, v.model].filter(Boolean).join(" ");
    if (car) rows.push({ label: "Vehicle", value: car });
    if (v.color) rows.push({ label: "Color", value: v.color });
    if (v.seatMaterial) rows.push({ label: "Seat material", value: v.seatMaterial });
  }

  if (notes) rows.push({ label: "Notes", value: String(notes) });

  return rows;
}
