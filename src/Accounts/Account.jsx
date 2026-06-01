// src/pages/Account.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Head from "../Components/Head";
import Footer from "../Components/Footer";
import { meApi, reqApi } from "../lib/api";
import fon from "../assets/photo/fon-account.webp";
import SEO from "../Components/SEO.jsx";

const GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const TABS = [
  { key: "profile", label: "Personal Information" },
  { key: "car",     label: "Vehicle Information" },
  { key: "orders",  label: "Past Orders" },
];

export default function Account() {
  const [active, setActive] = useState("profile");

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    content: null,
  });

  const openModal = useCallback((type, title, message, content = null) => {
    setModal({ open: true, type, title, message, content });
  }, []);

  const closeModal = useCallback(() => {
    setModal((m) => ({ ...m, open: false }));
  }, []);

  return (
    <>
      <SEO title="My Account" description="Manage your Danilets account — profile, vehicles, orders and payment methods." noIndex={true} />
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

          {/* Content */}
          <div className="max-w-[1160px] mx-auto px-3 sm:px-4 pb-16">
            <div className="bg-white/95 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] shadow-[0_8px_26px_rgba(0,0,0,0.08)] border border-[#ECECEC] p-4 sm:p-5 md:p-8">
              {active === "profile" && <ProfileCard openModal={openModal} />}
              {active === "car"     && <CarCard openModal={openModal} />}
              {active === "orders"  && <OrdersCard />}
            </div>
          </div>
        </main>

        <Footer />
      </div>

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
const ADDRESS_MODES = ["Personal", "Commercial", "Both"];

function ProfileCard({ openModal }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    personal_address: "",
    commercial_address: "",
  });
  const [addressMode, setAddressMode] = useState("Personal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await meApi.profile();
        if (u) {
          setForm({
            first_name:          u.first_name          || "",
            last_name:           u.last_name           || "",
            phone:               u.phone               || "",
            email:               u.email               || "",
            personal_address:    u.personal_address    || "",
            commercial_address:  u.commercial_address  || "",
          });
          // Auto-select mode based on saved data
          const hasPers = !!(u.personal_address);
          const hasCom  = !!(u.commercial_address);
          if (hasPers && hasCom)  setAddressMode("Both");
          else if (hasCom)        setAddressMode("Commercial");
          else                    setAddressMode("Personal");
        }
      } catch {}
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await meApi.updateProfile({
        first_name:         form.first_name,
        last_name:          form.last_name,
        phone:              form.phone,
        personal_address:   addressMode === "Commercial" ? "" : form.personal_address,
        commercial_address: addressMode === "Personal"   ? "" : form.commercial_address,
      });
      openModal?.("success", "Saved", "Your profile has been saved.");
    } catch (e) {
      openModal?.("error", "Save failed", e?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const showPersonal   = addressMode === "Personal"   || addressMode === "Both";
  const showCommercial = addressMode === "Commercial" || addressMode === "Both";

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

      {/* Address section */}
      <div className="mt-5">
        <div className="text-[13px] font-semibold text-[#6B7280] mb-3 uppercase tracking-wide">
          Address
        </div>

        {/* Mode toggle */}
        <div className="inline-flex bg-[#F4F4F5] rounded-[14px] p-1 gap-1 mb-4">
          {ADDRESS_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAddressMode(mode)}
              className={[
                "h-9 px-4 rounded-[10px] text-[13px] font-semibold transition whitespace-nowrap",
                addressMode === mode
                  ? "bg-white shadow text-[#18181B]"
                  : "text-[#6B7280] hover:text-[#18181B]",
              ].join(" ")}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {showPersonal && (
            <Input
              placeholder="Personal Address (e.g. 123 Main St, Columbus, OH)"
              value={form.personal_address}
              onChange={(v) => setForm({ ...form, personal_address: v })}
            />
          )}
          {showCommercial && (
            <Input
              placeholder="Commercial / Business Address"
              value={form.commercial_address}
              onChange={(v) => setForm({ ...form, commercial_address: v })}
            />
          )}
        </div>
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
const VEHICLE_CATEGORIES = ["personal", "commercial"];

const EMPTY_VEHICLE = { make: "", model: "", year: "", color: "", plate: "", notes: "", category: "personal", photo_url: "" };

function CarCard({ openModal }) {
  const [vehicles,    setVehicles]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("personal");
  const [editing,     setEditing]     = useState(null); // null | vehicle obj
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await meApi.myVehicles();
      setVehicles(Array.isArray(rows) ? rows : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visibleVehicles = vehicles.filter((v) => (v.category || "personal") === activeTab);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.make?.trim() && !editing.model?.trim()) {
      openModal?.("error", "Incomplete", "Please enter at least Make and Model.");
      return;
    }
    setSaving(true);
    try {
      await meApi.saveVehicle({ ...editing, category: activeTab });
      await load();
      setEditing(null);
      openModal?.("success", "Saved", "Vehicle saved successfully.");
    } catch (e) {
      openModal?.("error", "Save failed", e?.message || "Failed to save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this vehicle from your account?")) return;
    try {
      await meApi.deleteVehicle(id);
      await load();
      if (editing?.id === id) setEditing(null);
    } catch (e) {
      openModal?.("error", "Error", e?.message || "Failed to delete vehicle.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const result = await meApi.uploadVehiclePhoto(file);
      const url = result?.url || "";
      setEditing((v) => ({ ...v, photo_url: url }));
      if (editing.id) await meApi.saveVehicle({ ...editing, photo_url: url });
    } catch {
      openModal?.("error", "Upload failed", "Could not upload photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Section title="Vehicle Information">
      {/* Category tabs */}
      <div className="inline-flex bg-[#F4F4F5] rounded-[14px] p-1 gap-1 mb-5">
        {VEHICLE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => { setActiveTab(cat); setEditing(null); }}
            className={[
              "h-9 px-5 rounded-[10px] text-[13px] font-semibold capitalize transition",
              activeTab === cat ? "bg-white shadow text-[#18181B]" : "text-[#6B7280] hover:text-[#18181B]",
            ].join(" ")}
          >
            {cat === "personal" ? "🚗 Personal" : "🏢 Commercial"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[#6B7280] py-4">Loading vehicles…</div>
      ) : (
        <>
          {/* Vehicle list */}
          {visibleVehicles.length > 0 && (
            <div className="space-y-3 mb-4">
              {visibleVehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-[16px] bg-[#F9F9FB] border border-[#EAEAEA] px-4 py-3"
                >
                  {v.photo_url ? (
                    <img src={v.photo_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#F0F0F2] flex items-center justify-center text-2xl shrink-0">
                      {activeTab === "commercial" ? "🏢" : "🚗"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#18181B] text-[14px] truncate">
                      {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Unnamed vehicle"}
                    </div>
                    {v.color && (
                      <div className="text-[12px] text-[#9CA3AF]">{v.color}</div>
                    )}
                    {v.plate && (
                      <div className="text-[12px] text-[#9CA3AF]">Plate: {v.plate}</div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <GrayButton onClick={() => setEditing({ ...v })}>Edit</GrayButton>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="h-9 px-3 rounded-[12px] text-red-600 text-sm font-semibold bg-red-50 hover:bg-red-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new button */}
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing({ ...EMPTY_VEHICLE, category: activeTab })}
              className="flex items-center gap-2 h-11 px-5 rounded-[14px] border-2 border-dashed border-[#D1D5DB] text-[#6B7280] text-sm font-semibold hover:border-[#A8834E] hover:text-[#A8834E] transition w-full justify-center"
            >
              + Add {activeTab === "commercial" ? "Commercial" : "Personal"} Vehicle
            </button>
          )}

          {/* Edit / Add form */}
          {editing && (
            <div className="rounded-[20px] border border-[#E5E7EB] p-4 sm:p-5 bg-[#FAFAFA] mt-4 space-y-4">
              <div className="font-semibold text-[14px] text-[#18181B]">
                {editing.id ? "Edit Vehicle" : `Add ${activeTab === "commercial" ? "Commercial" : "Personal"} Vehicle`}
              </div>

              {/* Photo */}
              <div>
                <div className="text-[12px] font-semibold text-[#6B7280] mb-2 uppercase tracking-wide">Vehicle Photo</div>
                <div className="flex items-center gap-3">
                  {editing.photo_url ? (
                    <div className="relative">
                      <img src={editing.photo_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditing((p) => ({ ...p, photo_url: "" }))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111] text-white text-[10px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#F0F0F2] flex items-center justify-center text-3xl">
                      {activeTab === "commercial" ? "🏢" : "🚗"}
                    </div>
                  )}
                  <label className="flex-1 flex items-center gap-2 h-10 px-4 rounded-[12px] border border-dashed border-[#D1D5DB] cursor-pointer hover:border-[#A8834E] transition">
                    <span className="text-[13px] text-[#6B7280]">
                      {uploading ? "Uploading…" : "Upload photo"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Year"  value={editing.year  || ""} onChange={(v) => setEditing((p) => ({ ...p, year: v }))} />
                <Input placeholder="Make"  value={editing.make  || ""} onChange={(v) => setEditing((p) => ({ ...p, make: v }))} />
                <Input className="col-span-2" placeholder="Model" value={editing.model || ""} onChange={(v) => setEditing((p) => ({ ...p, model: v }))} />
                <Input placeholder="Color" value={editing.color || ""} onChange={(v) => setEditing((p) => ({ ...p, color: v }))} />
                <Input placeholder="Plate" value={editing.plate || ""} onChange={(v) => setEditing((p) => ({ ...p, plate: v }))} />
                <Input className="col-span-2" placeholder="Notes (optional)" value={editing.notes || ""} onChange={(v) => setEditing((p) => ({ ...p, notes: v }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <GoldButton onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : editing.id ? "Save Changes" : "Add Vehicle"}
                </GoldButton>
                <GrayButton onClick={() => setEditing(null)}>Cancel</GrayButton>
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}

/* ======================= Past Orders ======================= */
function OrdersCard() {
  const [list,     setList]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const raw = await reqApi.listMine();
      const orders =
        Array.isArray(raw)          ? raw
        : Array.isArray(raw?.data)    ? raw.data
        : Array.isArray(raw?.results) ? raw.results
        : Array.isArray(raw?.items)   ? raw.items
        : [];

      const normalized = orders.map((o) => {
        const items = safeParseJSON(o.items_json);
        return {
          raw:        o,
          id:         o.id ?? o._id ?? null,
          title:      humanServiceTitle(o, items),
          created_at: o.created_at || o.createdAt || null,
          updated_at: o.updated_at || o.updatedAt || null,
          status:     o.status || "processing",
          items,
        };
      });

      normalized.sort((a, b) =>
        new Date(b.updated_at || b.created_at || 0) -
        new Date(a.updated_at || a.created_at || 0)
      );
      setList(normalized);
    } catch (e) {
      console.error(e);
      if (!silent) setList([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 30 s to pick up status changes made in the admin panel
    const timer = setInterval(() => fetchOrders(true), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section title="Past Orders">
      {loading ? (
        <div className="text-[#6B7280] py-4">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-[#6B7280] py-4">You don&apos;t have any orders yet.</div>
      ) : (
        <div className="space-y-3">
          {list.map((o, i) => (
            <button
              key={o.id ?? i}
              type="button"
              onClick={() => setSelected(o)}
              className={[
                "w-full text-left rounded-[18px] border px-4 py-4 flex items-center justify-between gap-3 transition",
                "hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]",
                i === 0 ? "bg-[#FAF3E6] border-[#F0E1C8]" : "bg-white border-[#EAEAEA]",
              ].join(" ")}
            >
              <div className="min-w-0 flex items-center gap-3">
                <span className="text-2xl shrink-0">{serviceIcon(o.raw?.service_type)}</span>
                <div>
                  <div className="font-extrabold text-[#18181B] text-[16px] leading-snug">
                    {o.title}
                  </div>
                  <div className="text-sm text-[#6B7280] mt-0.5">
                    {formatDateHuman(o.updated_at || o.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={o.status} />
                <span className="text-[#9CA3AF] text-[20px] leading-none">&#8250;</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
      )}
    </Section>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    processing:  { label: "Processing", bg: "bg-blue-50",    text: "text-blue-700"   },
    confirmed:   { label: "Confirmed",  bg: "bg-amber-50",   text: "text-amber-700"  },
    rejected:    { label: "Rejected",   bg: "bg-red-50",     text: "text-red-600"    },
    completed:   { label: "Completed",  bg: "bg-emerald-50", text: "text-emerald-700"},
    // legacy
    new:         { label: "Processing", bg: "bg-blue-50",    text: "text-blue-700"   },
    in_progress: { label: "Confirmed",  bg: "bg-amber-50",   text: "text-amber-700"  },
    done:        { label: "Completed",  bg: "bg-emerald-50", text: "text-emerald-700"},
    cancelled:   { label: "Rejected",   bg: "bg-red-50",     text: "text-red-600"    },
  };
  const s = map[status] || map.processing;
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

/* ── Order Detail Modal ── */
function OrderDetailModal({ order, onClose }) {
  const sections = buildOrderSections(order);
  const raw = order.raw || {};

  return (
    <div className="fixed inset-0 z-[300000] bg-black/40 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-white rounded-t-[28px] sm:rounded-[24px] shadow-xl w-full sm:max-w-[560px] max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-[#F3F4F6]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{serviceIcon(raw.service_type)}</span>
              <h3 className="text-[17px] font-extrabold text-[#18181B] leading-tight">
                {order.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[#6B7280]">
                {formatDateHuman(order.updated_at || order.created_at)}
              </span>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center shrink-0 mt-0.5"
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {sections.map((sec, si) => (
            <div key={si} className="rounded-[16px] bg-[#F9F9F9] border border-[#EFEFEF] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F3F4F6] border-b border-[#EBEBEB]">
                <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  {sec.icon} {sec.title}
                </span>
              </div>
              <div className="divide-y divide-[#F0F0F0]">
                {sec.rows.map((row, ri) =>
                  row.type === "list" ? (
                    <div key={ri} className="px-4 py-3">
                      <div className="text-[12px] text-[#9CA3AF] font-medium mb-1.5">{row.label}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {row.items.map((item, ii) => (
                          <span key={ii} className="text-[12px] bg-white border border-[#E5E7EB] rounded-full px-2.5 py-0.5 text-[#374151] font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div key={ri} className="px-4 py-2.5 flex items-start justify-between gap-3">
                      <span className="text-[13px] text-[#9CA3AF] shrink-0 pt-px">{row.label}</span>
                      <span className="text-[13px] font-semibold text-[#18181B] text-right leading-snug">
                        {row.value}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-[#F3F4F6]">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[48px] rounded-full border border-[#D4D4D8] text-sm font-semibold text-[#18181B]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
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

/* ======================= Info Modal ======================= */
function Modal({ title, message, type = "info", onClose, children }) {
  const accent =
    type === "success" ? "border-green-200"
    : type === "error" ? "border-red-200"
    : "border-[#E5E7EB]";

  return (
    <div className="fixed inset-0 z-[300000] bg-black/40 flex items-center justify-center px-4">
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
              <p className="text-sm text-[#4B5563] mt-1 whitespace-pre-line">{message}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#111827]"
            aria-label="Close"
          >
            &#10005;
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
  try { return JSON.parse(v); } catch { return null; }
}

function formatDateHuman(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function humanServiceTitle(order, items) {
  const map = {
    detailing_quote_personal:    "Detailing - Personal Quote",
    detailing_quote_business:    "Detailing - Business / Fleet Quote",
    cleaning_quote_residential:  "Cleaning - Residential",
    cleaning_quote_commercial:   "Cleaning - Commercial",
  };
  const st = map[(order?.service_type || "").trim().toLowerCase()];
  if (st) return st;
  if (items?.quoteType === "personal")        return "Detailing - Personal Quote";
  if (items?.quoteType === "business")        return "Detailing - Business / Fleet Quote";
  if (items?.propertyType === "residential")  return "Cleaning - Residential";
  if (items?.propertyType === "commercial")   return "Cleaning - Commercial";
  return order?.service_title || order?.serviceType || "Service";
}

function serviceIcon(serviceType) {
  const t = (serviceType || "").toLowerCase();
  if (t.includes("personal"))    return "🚗";  /* car */
  if (t.includes("business"))    return "🏢";  /* office */
  if (t.includes("residential")) return "🏠";  /* house */
  if (t.includes("commercial"))  return "🏗️"; /* construction */
  return "📋";
}

/* Returns [{title, icon, rows:[{label,value}|{label,type:"list",items:[]}]}] */
function buildOrderSections(order) {
  const o   = order?.raw  || {};
  const it  = order?.items || {};
  const st  = (o.service_type || "").toLowerCase();
  const sections = [];

  const row     = (label, value) => value ? { label, value: String(value) } : null;
  const list    = (label, arr)   => arr?.length ? { label, type: "list", items: arr.map(String) } : null;
  const compact = (rows) => rows.filter(Boolean);

  /* ====== DETAILING PERSONAL ====== */
  if (st === "detailing_quote_personal" || it?.quoteType === "personal") {
    const contact = it?.contact  || {};
    const vehicle = it?.vehicle  || {};
    const history = it?.history  || {};
    const svc     = it?.services || {};
    const loc     = it?.location || {};
    const multi   = it?.multipleVehicles || {};

    const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    const heardAboutRaw = Array.isArray(contact.heardAbout)
      ? contact.heardAbout
      : contact.heardAbout ? [contact.heardAbout] : [];
    sections.push({ title: "Contact", icon: "👤", rows: compact([
      row("Name",  name),
      row("Phone", contact.phone),
      row("Email", contact.email),
      list("Heard about us", heardAboutRaw.map(heardAboutLabel)),
    ])});

    const carLabel = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
    if (carLabel || vehicle.color || vehicle.seatMaterial) {
      sections.push({ title: "Vehicle", icon: "🚗", rows: compact([
        row("Car",           carLabel),
        row("Color",         vehicle.color),
        row("Seat material", vehicle.seatMaterial),
      ])});
    }

    if (history.lastDetailed || history.conditionRating || history.conditionFlags?.length) {
      const flagsRaw = Array.isArray(history.conditionFlags) ? history.conditionFlags : [];
      sections.push({ title: "Condition", icon: "🔍", rows: compact([
        row("Last professionally detailed", lastDetailedLabel(history.lastDetailed)),
        row("Condition rating (1–10)",       history.conditionRating),
        list("Condition issues",             flagsRaw.map(conditionFlagLabel)),
        row("Additional details",            history.other),
      ])});
    }

    const selectedSvc = Array.isArray(svc.selected) ? svc.selected : [];
    if (selectedSvc.length) {
      sections.push({ title: "Services", icon: "✨", rows: compact([
        list("Requested services", selectedSvc.map(detailingServiceLabel)),
        row("Other services",      svc.other),
      ])});
    }

    if (multi.enabled && multi.vehicles?.length) {
      sections.push({ title: "Multiple Vehicles", icon: "🚘", rows: compact([
        row("Total vehicles", multi.count),
        list("Fleet", multi.vehicles.map((v) => [v.year, v.make, v.model].filter(Boolean).join(" ") || v)),
      ])});
    }

    const addr = o.service_address || loc.baseAddress || "";
    sections.push({ title: "Location & Timeline", icon: "📍", rows: compact([
      row("Service type",  locLabel(o.location_type)),
      row("Address",       addr),
      row("Completion by", it?.location?.completionDate || o.service_date),
    ])});

    const notes = [it?.additionalInfo, contact.extraInfo].filter(Boolean).join("\n");
    if (notes) sections.push({ title: "Additional Notes", icon: "📝", rows: [{ label: "", value: notes }] });
  }

  /* ====== DETAILING BUSINESS ====== */
  else if (st === "detailing_quote_business" || it?.business) {
    const contact  = it?.contact     || {};
    const biz      = it?.business    || {};
    const fleet    = it?.fleet       || {};
    const prefs    = it?.preferences || {};
    const timeline = it?.timeline    || {};
    const loc      = it?.location    || {};

    const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    sections.push({ title: "Contact", icon: "👤", rows: compact([
      row("Name",            name),
      row("Phone",           contact.phone),
      row("Email",           contact.email),
      row("Company",         contact.companyName),
      row("Company address", contact.companyAddress),
    ])});

    const bizTypeRaw = biz.businessType;
    const bizTypeVal = bizTypeRaw === "Other" && biz.businessTypeOther
      ? `Other — ${biz.businessTypeOther}`
      : businessTypeLabel(bizTypeRaw);
    const freqRaw = biz.serviceFrequency;
    const freqVal = freqRaw === "Other" && biz.serviceFrequencyOther
      ? `Other — ${biz.serviceFrequencyOther}`
      : serviceFrequencyLabel(freqRaw);
    sections.push({ title: "Business Details", icon: "🏢", rows: compact([
      row("Business type",      bizTypeVal),
      row("Number of vehicles", biz.vehiclesCount),
      row("Service frequency",  freqVal),
    ])});

    const vt = fleet.vehicleTypes || {};
    const vtRows = Object.entries(vt)
      .filter(([, v]) => Number(v) > 0)
      .map(([k, v]) => `${vehicleTypeLabel(k)}: ${v}`);
    const fleetSvcs = Array.isArray(fleet.services)
      ? fleet.services.map(detailingServiceLabel)
      : [];
    if (vtRows.length || fleetSvcs.length) {
      sections.push({ title: "Fleet & Services", icon: "🚛", rows: compact([
        list("Vehicle types",    vtRows),
        row("Service location",  serviceLocationLabel(fleet.serviceLocation)),
        list("Services",         fleetSvcs),
        row("Other services",    fleet.servicesOther),
      ])});
    }

    const addr = o.service_address || loc.baseAddress || "";
    sections.push({ title: "Location & Timeline", icon: "📍", rows: compact([
      row("Address",    addr),
      row("Start date", timeline.startDate),
    ])});

    if (prefs.preferredContactMethod || prefs.contactTimePreference) {
      sections.push({ title: "Contact Preferences", icon: "📞", rows: compact([
        row("Preferred contact method", humanizeCode(prefs.preferredContactMethod)),
        row("Best time to reach",       humanizeCode(prefs.contactTimePreference)),
        row("Notes",                    prefs.notes),
      ])});
    }
  }

  /* ====== CLEANING RESIDENTIAL ====== */
  else if (st === "cleaning_quote_residential" || it?.propertyType === "residential") {
    const contact = it?.contact  || {};
    const loc     = it?.location || {};

    const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    sections.push({ title: "Contact", icon: "👤", rows: compact([
      row("Name",    name),
      row("Phone",   contact.phone),
      row("Email",   contact.email),
      row("Address", o.service_address || loc.baseAddress),
    ])});

    const ptRaw = it?.projectType;
    const ptVal = ptRaw === "other" && it?.projectTypeOther
      ? `Other — ${it.projectTypeOther}`
      : projectTypeLabel(ptRaw);
    sections.push({ title: "Property", icon: "🏠", rows: compact([
      row("Property type", "Residential"),
      row("Project type",  ptVal),
      row("Bedrooms",      it?.bedrooms),
      row("Bathrooms",     it?.bathrooms),
    ])});

    if (it?.areas?.length || it?.generalTasks?.length || it?.kitchenTasks?.length) {
      sections.push({ title: "Cleaning Scope", icon: "🧹", rows: compact([
        list("Areas to clean",  it?.areas?.map(humanizeCode) || []),
        row("Other areas",      it?.areasOther),
        list("General tasks",   it?.generalTasks?.map(humanizeCode) || []),
        row("Other tasks",      it?.generalTasksOther),
        list("Kitchen tasks",   it?.kitchenTasks?.map(humanizeCode) || []),
        row("Other kitchen",    it?.kitchenTasksOther),
      ])});
    }

    if (it?.resBudget || it?.extraDetails) {
      sections.push({ title: "Budget & Notes", icon: "💰", rows: compact([
        row("Budget",     budgetLabel(it?.resBudget)),
        row("Extra info", it?.extraDetails),
      ])});
    }
  }

  /* ====== CLEANING COMMERCIAL ====== */
  else if (st === "cleaning_quote_commercial" || it?.propertyType === "commercial") {
    const contact = it?.contact             || {};
    const c       = it?.cleaningCommercial  || {};
    const loc     = it?.location            || {};

    const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    sections.push({ title: "Contact", icon: "👤", rows: compact([
      row("Name",  name),
      row("Phone", contact.phone),
      row("Email", contact.email),
    ])});

    const bizType = c.businessType === "other" && c.businessTypeOther
      ? `Other — ${c.businessTypeOther}`
      : businessTypeLabel(c.businessType);
    sections.push({ title: "Company", icon: "🏗️", rows: compact([
      row("Company name",    c.companyName),
      row("Company address", c.companyAddress),
      row("Business type",   bizType),
    ])});

    const prefTimes = (Array.isArray(c.preferredDaysTimes) ? c.preferredDaysTimes : [])
      .map(preferredTimesLabel);
    sections.push({ title: "Project Details", icon: "📋", rows: compact([
      row("Project type",    projectTypeLabel(it?.projectType)),
      row("Project summary", projectSummaryHuman(c.projectSummary)),
      row("Supplies provided by us", c.supplies === "yes" ? "Yes — we bring supplies" : c.supplies === "no" ? "No — client provides supplies" : c.supplies),
      list("Preferred schedule", prefTimes),
    ])});

    const addr = o.service_address || loc.baseAddress || "";
    if (addr) sections.push({ title: "Location", icon: "📍", rows: [row("Address", addr)] });
  }

  /* ====== FALLBACK ====== */
  else {
    const contact = it?.contact || {};
    const name    = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    const addr    = o.service_address || "";

    sections.push({ title: "Details", icon: "📋", rows: compact([
      row("Customer", name || undefined),
      row("Phone",    contact.phone),
      row("Email",    contact.email),
      row("Address",  addr),
    ])});
  }

  return sections.filter((s) => s.rows.filter(Boolean).length > 0);
}

/* ======================= Human-readable label helpers ======================= */

function locLabel(t) {
  const m = {
    shop:   "Drop-off at shop",
    mobile: "Mobile (at your location)",
    pickup: "Pickup & delivery",
  };
  return m[t] || humanizeCode(t);
}

function vehicleTypeLabel(k) {
  const m = {
    sedans:        "Sedans",
    suvs:          "SUVs",
    pickups:       "Pick-Up Trucks",
    minivans:      "Mini-Vans / 3-Row SUVs",
    transit_vans:  "Transit Vans",
    semi_trucks:   "Semi-Trucks",
    other:         "Other",
  };
  return m[k] || humanizeCode(k);
}

function serviceLocationLabel(k) {
  const m = {
    mobile:           "Mobile (at your location)",
    customer_dropoff: "Drop-off at shop",
    pickup_dropoff:   "Pickup & delivery",
  };
  return m[k] || humanizeCode(k);
}

function humanizeCode(s) {
  if (!s) return "";
  return String(s)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function projectTypeLabel(t) {
  const m = {
    deep_clean:         "Deep Clean",
    recurring:          "Recurring / Maintenance",
    move_in_out:        "Move-In / Move-Out",
    post_construction:  "Post-Construction Clean",
    airbnb:             "Airbnb / Short-Term Rental",
    standard:           "Standard Cleaning",
    other:              "Other",
  };
  return m[t] || humanizeCode(t);
}

function businessTypeLabel(t) {
  const m = {
    property_mgmt:    "Property Management",
    dealership:       "Auto Dealership",
    office:           "Office / Corporate",
    restaurant:       "Restaurant / Food Service",
    retail:           "Retail Store",
    warehouse:        "Warehouse / Industrial",
    medical:          "Medical / Healthcare",
    school:           "School / Educational",
    hotel:            "Hotel / Hospitality",
    construction:     "Construction Company",
    other:            "Other",
  };
  return m[t] || humanizeCode(t);
}

function serviceFrequencyLabel(f) {
  const m = {
    weekly:      "Weekly",
    biweekly:    "Bi-Weekly (Every 2 Weeks)",
    monthly:     "Monthly",
    quarterly:   "Quarterly",
    one_time:    "One-Time",
    as_needed:   "As Needed",
    other:       "Other",
  };
  return m[f] || humanizeCode(f);
}

function budgetLabel(b) {
  const m = {
    "1000_2500_month": "$1,000 – $2,500 per month",
    "2500_5000_month": "$2,500 – $5,000 per month",
    "5000_plus_month": "$5,000+ per month",
    "200_350":         "$200 – $350 per unit",
    "500_1000":        "$500 – $1,000",
    "1000_2000":       "$1,000 – $2,000",
    "2000_3000":       "$2,000 – $3,000",
    "3000_5000":       "$3,000 – $5,000",
    "5000_10000":      "$5,000 – $10,000",
    "under_500":       "Under $500",
    "over_10000":      "Over $10,000",
  };
  return m[b] || humanizeCode(b);
}

function detailingServiceLabel(s) {
  const m = {
    exterior_wash:          "Exterior Hand Wash",
    interior_vacuum:        "Interior Vacuum",
    full_detail:            "Full Detail (Interior + Exterior)",
    ceramic_coating:        "Ceramic Coating",
    paint_correction:       "Paint Correction",
    paint_protection_film:  "Paint Protection Film (PPF)",
    window_tinting:         "Window Tinting",
    headlight_restoration:  "Headlight Restoration",
    odor_elimination:       "Odor Elimination",
    engine_bay:             "Engine Bay Cleaning",
    leather_conditioning:   "Leather Conditioning",
    trim_restoration:       "Exterior Trim Restoration",
    other:                  "Other",
  };
  return m[s] || humanizeCode(s);
}

function conditionFlagLabel(f) {
  const m = {
    pet_hair:       "Pet Hair",
    heavy_stains:   "Heavy Stains",
    mold:           "Mold / Mildew",
    smoke_smell:    "Smoke Odor",
    mud_dirt:       "Mud / Heavy Dirt",
    scratches:      "Paint Scratches",
    swirl_marks:    "Swirl Marks",
    water_spots:    "Water Spots",
    oxidation:      "Paint Oxidation",
  };
  return m[f] || humanizeCode(f);
}

function lastDetailedLabel(v) {
  const m = {
    never:          "Never professionally detailed",
    less_3mo:       "Less than 3 months ago",
    "3_6mo":        "3 – 6 months ago",
    "6_12mo":       "6 – 12 months ago",
    over_1yr:       "Over a year ago",
  };
  return m[v] || humanizeCode(v);
}

function heardAboutLabel(v) {
  const m = {
    google:         "Google Search",
    instagram:      "Instagram",
    facebook:       "Facebook",
    tiktok:         "TikTok",
    youtube:        "YouTube",
    referral:       "Friend / Family Referral",
    yelp:           "Yelp",
    nextdoor:       "Nextdoor",
    other:          "Other",
  };
  return m[v] || humanizeCode(v);
}

function preferredTimesLabel(v) {
  const m = {
    weekdays:       "Weekdays",
    weekends:       "Weekends",
    mornings:       "Mornings",
    afternoons:     "Afternoons",
    evenings:       "Evenings",
    flexible:       "Flexible / Anytime",
  };
  return m[v] || humanizeCode(v);
}

function projectSummaryHuman(summary) {
  if (!summary) return "";
  // Parse auto-generated summary strings like:
  // "Post-construction • 2 sqft • one_time_final • budget: 3000_5000"
  return summary
    .split("•")
    .map((part) => {
      const trimmed = part.trim();
      if (/^budget:/i.test(trimmed)) {
        const code = trimmed.replace(/^budget:\s*/i, "").trim();
        return `Budget: ${budgetLabel(code)}`;
      }
      if (/^\d+\s*sqft$/i.test(trimmed)) return `${trimmed.toUpperCase()}`;
      return humanizeCode(trimmed);
    })
    .join(" · ");
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
