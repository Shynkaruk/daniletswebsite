// src/pages/Account.jsx
import React, { useEffect, useState } from "react";
import Head from "../Components/Head";
import Footer from "../Components/Footer";
import { meApi } from "../lib/api";
import logo from "../assets/logo/logo.svg";

const gradient =
  "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

export default function Account() {
  return (
    <>
      {/* Фіксований хедер поза контейнером */}
      <Head />

      {/* Фон сторінки */}
      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: "rgba(235, 235, 235, 1)" }}
      >
        {/* Основний контентний контейнер */}
        <main className="max-w-[1720px] mx-auto px-6 md:px-10 pt-48 pb-24">
          <div className="relative bg-white/95 rounded-[40px] shadow-2xl border border-[#ECECEC] p-6 md:p-12">
            {/* Шапка контейнера з великим логотипом */}
            <div className="flex items-start md:items-center gap-6 mb-10">
              <img
                src={logo}
                alt="Logo"
                className="w-[160px] md:w-[190px] h-auto object-contain"
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  My Account
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg md:text-xl">
                  Manage your profile, vehicles and payment methods
                </p>
              </div>
            </div>

            {/* Секції — одна під одною */}
            <div className="space-y-10">
              <SectionCard title="Personal Information">
                <ProfileSection />
              </SectionCard>

              <SectionCard title="Vehicles">
                <VehiclesSection />
              </SectionCard>

              <SectionCard title="Payment Methods (safe)">
                <PaymentsSection />
              </SectionCard>
            </div>
          </div>
        </main>
      </div>

      {/* Футер поза контейнером */}
      <Footer />
    </>
  );
}

/* ============== Обгортка для секцій ============== */
function SectionCard({ title, children, right }) {
  return (
    <div className="bg-white rounded-[28px] border border-[#EFEFEF] shadow-md p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ================= Profile ================= */
function ProfileSection() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    meApi.profile().then((u) => u && setForm(u));
  }, []);

  const onSave = async () => {
    setSaving(true);
    await meApi.updateProfile({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
    });
    setSaving(false);
    alert("Profile saved");
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        <Field
          label="First name"
          value={form.first_name}
          onChange={(v) => setForm({ ...form, first_name: v })}
          large
        />
        <Field
          label="Last name"
          value={form.last_name}
          onChange={(v) => setForm({ ...form, last_name: v })}
          large
        />
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Field
          label="Phone"
          value={form.phone || ""}
          onChange={(v) => setForm({ ...form, phone: v })}
          large
        />
        <Field label="Email" value={form.email || ""} disabled large />
      </div>
      <div className="mt-8">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}

/* ================= Vehicles ================= */
function VehiclesSection() {
  const empty = {
    id: null,
    make: "",
    model: "",
    year: "",
    color: "",
    plate: "",
    vin: "",
    notes: "",
  };
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await meApi.myVehicles();
    setList(r || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    await meApi.saveVehicle(form);
    setForm(empty);
    load();
  };
  const onDelete = async (id) => {
    await meApi.deleteVehicle(id);
    load();
  };

  return (
    <div className="space-y-8">
      {/* Список */}
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">
          Saved vehicles
        </h3>
        {loading ? (
          <div className="text-xl">Loading…</div>
        ) : (
          <ul className="space-y-4">
            {list.map((v) => (
              <li
                key={v.id}
                className="p-5 rounded-2xl bg-[#F8F8F8] border shadow-sm flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-2xl font-semibold">
                    {v.year} {v.make} {v.model}
                  </div>
                  <div className="text-[#6B7280] text-lg">
                    {v.color || "-"}
                    {v.plate ? ` • ${v.plate}` : ""}
                  </div>
                  {v.notes && (
                    <div className="text-base text-[#6B7280] mt-1">{v.notes}</div>
                  )}
                </div>
                <div className="flex gap-3 shrink-0">
                  <SmallButton onClick={() => setForm(v)}>Edit</SmallButton>
                  <SmallButton onClick={() => onDelete(v.id)}>Delete</SmallButton>
                </div>
              </li>
            ))}
            {list.length === 0 && (
              <li className="text-lg text-[#6B7280]">No vehicles yet</li>
            )}
          </ul>
        )}
      </div>

      {/* Форма */}
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">
          {form.id ? "Edit vehicle" : "Add vehicle"}
        </h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Make"
              value={form.make}
              onChange={(v) => setForm({ ...form, make: v })}
              large
            />
            <Field
              label="Model"
              value={form.model}
              onChange={(v) => setForm({ ...form, model: v })}
              large
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Field
              label="Year"
              value={form.year}
              onChange={(v) => setForm({ ...form, year: v })}
              large
            />
            <Field
              label="Color"
              value={form.color}
              onChange={(v) => setForm({ ...form, color: v })}
              large
            />
            <Field
              label="Plate"
              value={form.plate}
              onChange={(v) => setForm({ ...form, plate: v })}
              large
            />
          </div>
          <Field
            label="VIN"
            value={form.vin}
            onChange={(v) => setForm({ ...form, vin: v })}
            large
          />
          <TextArea
            label="Notes"
            value={form.notes || ""}
            onChange={(v) => setForm({ ...form, notes: v })}
            large
          />
          <div className="flex gap-3">
            <Button onClick={onSave}>
              {form.id ? "Save Changes" : "Add Vehicle"}
            </Button>
            {form.id && (
              <OutlineButton onClick={() => setForm(empty)}>
                Cancel
              </OutlineButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Payments (safe) ================= */
function PaymentsSection() {
  const empty = {
    id: null,
    brand: "visa",
    last4: "",
    exp_month: "",
    exp_year: "",
    is_default: false,
  };
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const r = await meApi.myPaymentMethods();
    setList(r || []);
  };
  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    if (!/^\d{4}$/.test(String(form.last4))) {
      alert("Enter last 4 digits only");
      return;
    }
    await meApi.savePaymentMethod(form);
    setForm(empty);
    load();
  };
  const onDelete = async (id) => {
    await meApi.deletePaymentMethod(id);
    load();
  };

  return (
    <div className="space-y-8">
      {/* Список */}
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">Saved cards</h3>
        <ul className="space-y-4">
          {list.map((pm) => (
            <li
              key={pm.id}
              className="p-5 rounded-2xl bg-[#F8F8F8] border shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="text-2xl font-semibold uppercase">
                  {pm.brand} •••• {pm.last4}{" "}
                  {pm.is_default ? (
                    <span className="text-base font-normal text-[#6B7280]">
                      (default)
                    </span>
                  ) : null}
                </div>
                <div className="text-lg text-[#6B7280]">
                  exp {pm.exp_month}/{pm.exp_year}
                </div>
              </div>
              <div className="flex gap-3">
                <SmallButton onClick={() => setForm(pm)}>Edit</SmallButton>
                <SmallButton onClick={() => onDelete(pm.id)}>Delete</SmallButton>
              </div>
            </li>
          ))}
          {list.length === 0 && (
            <li className="text-lg text-[#6B7280]">No cards saved</li>
          )}
        </ul>
      </div>

      {/* Форма */}
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">
          {form.id ? "Edit card (safe fields)" : "Add card (safe fields)"}
        </h3>
        <div className="space-y-4">
          <Field
            label="Brand"
            value={form.brand}
            onChange={(v) => setForm({ ...form, brand: v })}
            large
          />
          <div className="grid md:grid-cols-3 gap-4">
            <Field
              label="Last 4"
              value={form.last4}
              onChange={(v) => setForm({ ...form, last4: v })}
              large
            />
            <Field
              label="Exp Month"
              value={form.exp_month}
              onChange={(v) => setForm({ ...form, exp_month: v })}
              large
            />
            <Field
              label="Exp Year"
              value={form.exp_year}
              onChange={(v) => setForm({ ...form, exp_year: v })}
              large
            />
          </div>
          <label className="inline-flex items-center gap-3 text-lg">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={form.is_default}
              onChange={(e) =>
                setForm({ ...form, is_default: e.target.checked })
              }
            />
            <span>Set as default</span>
          </label>
          <div className="flex gap-3">
            <Button onClick={onSave}>
              {form.id ? "Save Changes" : "Save Card"}
            </Button>
            {form.id && (
              <OutlineButton onClick={() => setForm(empty)}>
                Cancel
              </OutlineButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= UI helpers ================= */
function Field({ label, value, onChange, disabled, large }) {
  return (
    <label className="block">
      <div className="text-xl md:text-2xl mb-2 font-semibold">{label}</div>
      <input
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-[16px] bg-[#F4F4F5] px-4 outline-none font-semibold
          ${large ? "h-14 text-lg" : "h-12 text-base"} disabled:opacity-60`}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, large }) {
  return (
    <label className="block">
      <div className="text-xl md:text-2xl mb-2 font-semibold">{label}</div>
      <textarea
        rows={large ? 5 : 4}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-[16px] bg-[#F4F4F5] px-4 py-3 outline-none font-semibold
          ${large ? "text-lg" : "text-base"}`}
      />
    </label>
  );
}

function Button({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-14 px-7 rounded-[16px] text-lg font-semibold text-black disabled:opacity-60"
      style={{ background: gradient }}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-14 px-7 rounded-[16px] text-lg font-semibold border"
    >
      {children}
    </button>
  );
}

function SmallButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-11 px-5 rounded-[12px] text-base font-semibold border"
    >
      {children}
    </button>
  );
}
