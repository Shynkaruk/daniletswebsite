// src/pages/Account.jsx
import React, { useEffect, useState } from "react";
import Head from "../Components/Head";
import Footer from "../Components/Footer";
import { meApi, reqApi } from "../lib/api";
import fon from "../assets/photo/fon-account.png";

const GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const TABS = [
  { key: "profile", label: "Personal Information" },
  { key: "car", label: "Vehicle Information" },
  { key: "payment", label: "Payment Information" },
  { key: "orders", label: "Past Orders" },
];

export default function Account() {
  const [active, setActive] = useState("profile");

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

          {/* Tabs — centered under Profile + mobile-friendly */}
          <div className="max-w-[1160px] mx-auto px-4 mb-5 md:mb-6">
            <div className="w-full flex justify-center">
              {/* wrapper with horizontal scroll on small screens */}
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
              {active === "profile" && <ProfileCard />}
              {active === "car" && <CarCard />}
              {active === "payment" && <PaymentCard />}
              {active === "orders" && <OrdersCard />}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

/* ======================= Personal Information ======================= */
function ProfileCard() {
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
      alert("Profile saved");
    } catch {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Personal Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
          placeholder="Birthday"
          value={form.birthday}
          onChange={(v) => setForm({ ...form, birthday: v })}
        />
        <Input
          className="md:col-span-2"
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
function CarCard() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const canSave = year.trim() || make.trim() || model.trim();

  const onSave = async () => {
    try {
      await meApi.saveVehicle({ year, make, model });
      alert("Vehicle saved");
    } catch {
      alert("Failed to save vehicle");
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

/* ======================= Payment Information ======================= */
function PaymentCard() {
  const [holder, setHolder] = useState("");
  const [cvc, setCvc] = useState("");
  const [exp, setExp] = useState("");
  const [card, setCard] = useState("");

  const onSave = () => {
    alert("Demo only. Integrate your PSP (e.g., Stripe) to save cards securely.");
  };

  return (
    <Section title="Payment Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Input
          className="md:col-span-2"
          placeholder="Card Holder Name"
          value={holder}
          onChange={setHolder}
        />
        <Input placeholder="CVV / CVC" value={cvc} onChange={setCvc} />
        <Input
          placeholder="Expiration Date"
          value={exp}
          onChange={setExp}
        />
        <Input
          className="md:col-span-2"
          placeholder="Card Number"
          value={card}
          onChange={setCard}
        />
      </div>

      <Actions onChange={() => {}} onSave={onSave} />
    </Section>
  );
}

/* ======================= Past Orders ======================= */
function OrdersCard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const COMPLETED = "done";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let orders = [];
        if (typeof reqApi.listMine === "function") {
          orders = (await reqApi.listMine({ status: COMPLETED })) || [];
        } else {
          orders = [];
        }

        const normalized = (orders || []).map((o) => {
          const items = safeParseJSON(o.items_json) || [];
          return {
            id: o.id ?? o._id,
            title: items[0]?.title || o.service_title || "Service",
            total: Number(o.total || 0),
            status: (o.status || o.state || "").toString().toLowerCase(),
            created_at: o.created_at || o.createdAt || o.date || null,
            updated_at: o.updated_at || o.updatedAt || null,
          };
        });

        const completedOnly = normalized.filter(
          (o) => o.status === COMPLETED
        );

        completedOnly.sort((a, b) => {
          const aT = new Date(a.updated_at || a.created_at || 0).getTime();
          const bT = new Date(b.updated_at || b.created_at || 0).getTime();
          return bT - aT;
        });

        setList(completedOnly);
      } catch (e) {
        console.error(e);
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Section title="Past Orders">
      {loading ? (
        <div className="text-[#6B7280]">Loading…</div>
      ) : list.length === 0 ? (
        <div className="text-[#6B7280]">
          You don’t have any past orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((o, i) => (
            <div
              key={o.id ?? i}
              className={[
                "w-full rounded-[16px] border px-4 py-3 flex items-center justify-between gap-3",
                i === 0
                  ? "bg-[#FAF3E6] border-[#F0E1C8]"
                  : "bg-white border-[#EAEAEA]",
              ].join(" ")}
            >
              <div className="min-w-0">
                <div className="font-semibold text-[#18181B] truncate">
                  {o.title}
                </div>
                <div className="text-sm text-[#6B7280]">
                  {formatDate(o.updated_at || o.created_at)}
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">
                  Status: done
                </div>
              </div>
              <div className="shrink-0 text-sm text-[#111] font-semibold">
                ${o.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <GrayButton>Previous Order Details</GrayButton>
        <GoldButton>Repeat Order</GoldButton>
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
      onClick={onClick}
      disabled={disabled}
      className="h-[44px] sm:h-[48px] md:h-[56px] rounded-[14px] sm:rounded-[16px] px-4 sm:px-6 font-semibold text-black disabled:opacity-60 w-full"
      style={{ background: GRADIENT }}
    >
      {children}
    </button>
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
