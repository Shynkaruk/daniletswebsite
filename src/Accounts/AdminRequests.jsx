// src/Accounts/AdminRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminReqApi, adminUsersApi, cardsApi } from "../lib/api";
import PushNotificationToggle from "../Components/PushNotificationToggle";
import CarPhoto from "../Components/CarPhoto";
import SEO from "../Components/SEO.jsx";

function safeJsonParse(text, fallback = {}) {
  try {
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

const gradient = "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const MENU_ITEMS = [
  { key: "detailing_quote_personal",   label: "Detailing — Personal" },
  { key: "detailing_quote_business",   label: "Detailing — Business" },
  { key: "cleaning_quote_residential", label: "Cleaning — Residential" },
  { key: "cleaning_quote_commercial",  label: "Cleaning — Commercial" },
  { key: "forms_clients",              label: "Forms Clients" },
  { key: "users",                      label: "Users" },
  { key: "special_offers",             label: "🏷 Special Offers" },
];

const STATUS_META = {
  processing: { label: "Processing",  cls: "bg-blue-50 text-blue-700 border-blue-200"     },
  confirmed:  { label: "Confirmed",   cls: "bg-amber-50 text-amber-700 border-amber-200"  },
  rejected:   { label: "Rejected",    cls: "bg-red-50 text-red-700 border-red-200"        },
  completed:  { label: "Completed",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  // legacy values kept for backward compat display
  new:        { label: "Processing",  cls: "bg-blue-50 text-blue-700 border-blue-200"     },
  in_progress:{ label: "Confirmed",   cls: "bg-amber-50 text-amber-700 border-amber-200"  },
  done:       { label: "Completed",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
}

function formatBudget(budgetCode) {
  if (!budgetCode) return "";
  const map = {
    "1000_2500_month": "$1,000 – $2,500 per month",
    "2500_5000_month": "$2,500 – $5,000 per month",
    "5000_plus_month": "$5,000+ per month",
    "200_350": "$200 – $350 per unit",
    "5000_10000": "$5,000 – $10,000",
    "3000_5000": "$3,000 – $5,000",
  };
  return map[budgetCode] || budgetCode.replace(/_/g, " ");
}

// ================== UI COMPONENTS ==================
const Section = ({ title, children }) => (
  <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 shadow-sm">
    <div className="text-xs font-extrabold tracking-wide text-[#111827] uppercase mb-4">{title}</div>
    {children}
  </div>
);

const Field = ({ label, value }) => {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div>
      <div className="text-[11px] font-extrabold tracking-wide text-[#6B7280] uppercase">{label}</div>
      <div className="text-sm font-semibold text-[#111827] mt-1 break-words">{value}</div>
    </div>
  );
};

const Chips = ({ label, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[11px] font-extrabold tracking-wide text-[#6B7280] uppercase mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ================== MAIN COMPONENT ==================
export default function AdminRequests() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("detailing_quote_personal");
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await adminReqApi.list({ service_type: activeMenu });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu !== "users") loadBookings();
  }, [activeMenu]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase().trim();
    return rows.filter(row =>
      (row.user_full_name || "").toLowerCase().includes(term) ||
      (row.user_email || "").toLowerCase().includes(term)
    );
  }, [rows, search]);

  const saveEdits = async (row, newStatus, newNote) => {
    const id = row?.id || row?._id;
    if (!id) return;
    try {
      await adminReqApi.save({ id, status: newStatus, notes_admin: newNote });
      loadBookings();
      setSelectedRow(null);
    } catch (e) {
      alert("Save error: " + (e.message || e));
    }
  };

  const deleteRequest = async (row) => {
    const id = row?.id || row?._id;
    if (!id) return;
    if (!window.confirm("Delete this request permanently? This action cannot be undone.")) return;
    try {
      await adminReqApi.remove(id);
      loadBookings();
      setSelectedRow(null);
    } catch (e) {
      alert("Delete error: " + (e.message || e));
    }
  };

  return (
    <>
    <SEO title="Admin — CRM Panel" description="Danilets internal CRM panel." noIndex={true} />
    <div className="flex h-screen bg-[#F4F4F5] overflow-hidden pt-20">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col border-r border-[#E5E7EB] bg-white overflow-y-auto">
        <div className="px-6 py-8 border-b">
          <div className="text-xs text-[#9CA3AF] uppercase tracking-widest">Danilets</div>
          <div className="text-2xl font-extrabold text-[#111827]">CRM Panel</div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveMenu(item.key); setSelectedRow(null); }}
              style={activeMenu === item.key ? { background: gradient } : {}}
              className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeMenu === item.key ? "text-black shadow" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Кнопка переходу на сторінку налаштувань бізнесу */}
        <div className="px-4 pb-6 pt-2 border-t border-[#F3F4F6]">
          <button
            onClick={() => navigate("/admin/settings")}
            className="w-full text-left px-5 py-3 rounded-2xl text-sm font-semibold text-[#6B7280] hover:bg-gray-100 hover:text-[#111827] transition-all flex items-center gap-2"
          >
            ⚙ Business Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Users CRM panel */}
        {activeMenu === "users" ? (
          <UsersPanel />
        ) : activeMenu === "special_offers" ? (
          <SpecialOffersPanel />
        ) : (
          <>
            <div className="p-6 border-b bg-white flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-[#111827]">
                  {MENU_ITEMS.find(m => m.key === activeMenu)?.label}
                </h1>
                <p className="text-gray-500">Total requests: <span className="font-semibold">{rows.length}</span></p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email..."
                  className="flex-1 sm:w-80 h-11 px-5 rounded-2xl border focus:border-[#A8834E] outline-none"
                />
                <PushNotificationToggle />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              {loading ? (
                <p className="text-center py-12 text-gray-500">Loading requests...</p>
              ) : (
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                        <th className="text-left pl-8 py-5">Date</th>
                        <th className="text-left">Client</th>
                        <th className="text-left">Contact</th>
                        <th className="text-left">Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row) => {
                        const itemsData = safeJsonParse(row.items_json, {});
                        const contact = itemsData.contact || itemsData.guest || {};
                        const fullName = row.user_full_name ||
                          `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Guest";
                        const phone = contact.phone || row.user_phone || "—";

                        return (
                          <tr
                            key={row.id || row._id}
                            onClick={() => setSelectedRow(row)}
                            className="border-b hover:bg-[#FFF7E6] cursor-pointer transition"
                          >
                            <td className="pl-8 py-5 text-sm font-medium">{formatDate(row.created_at || row.createdAt)}</td>
                            <td className="text-sm font-semibold">{fullName}</td>
                            <td className="text-sm text-gray-600">{phone}</td>
                            <td>
                              <span className={`inline-flex items-center px-4 h-7 rounded-full text-xs font-semibold border ${STATUS_META[row.status]?.cls || "bg-gray-100"}`}>
                                {STATUS_META[row.status]?.label || row.status || "New"}
                              </span>
                            </td>
                            <td className="pr-6 text-right text-gray-400">⋯</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedRow && (
        <DetailModal
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSave={saveEdits}
          onDelete={deleteRequest}
        />
      )}
    </div>
    </>
  );
}

// ================== USERS PANEL ==================

function UsersPanel() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null); // user id for drawer
  const [debounced,  setDebounced]  = useState("");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await adminUsersApi.list({ search: debounced, limit: 200 });
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [debounced]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-white flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827]">Users</h1>
          <p className="text-gray-500">Total: <span className="font-semibold">{users.length}</span></p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="w-full sm:w-80 h-11 px-5 rounded-2xl border focus:border-[#A8834E] outline-none"
        />
      </div>

      {/* Table */}
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No users found.</p>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                  <th className="text-left pl-6 py-4 w-10"></th>
                  <th className="text-left py-4">Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Phone</th>
                  <th className="text-left">Joined</th>
                  <th className="text-left">Vehicles</th>
                  <th className="text-left">Requests</th>
                  <th className="text-left">Auth</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const initials = [u.first_name?.[0], u.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
                  const authBadge = u.google_id ? "Google" : u.apple_id ? "Apple" : "Email";
                  const authColor = u.google_id ? "bg-blue-50 text-blue-700" : u.apple_id ? "bg-gray-100 text-gray-700" : "bg-purple-50 text-purple-700";
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelected(u.id)}
                      className="border-b hover:bg-[#FFF7E6] cursor-pointer transition"
                    >
                      {/* Avatar */}
                      <td className="pl-6 py-4">
                        <div
                          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-extrabold text-black shrink-0"
                          style={{ background: gradient }}
                        >
                          {u.avatar
                            ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                            : initials
                          }
                        </div>
                      </td>
                      <td className="py-4 pr-3 font-semibold text-[#111827] text-sm">
                        {[u.first_name, u.last_name].filter(Boolean).join(" ") || <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="pr-3 text-sm text-gray-600">{u.email || "—"}</td>
                      <td className="pr-3 text-sm text-gray-600">{u.phone || "—"}</td>
                      <td className="pr-3 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                      <td className="pr-3 text-sm text-center font-semibold text-[#111827]">{u.vehicles_count}</td>
                      <td className="pr-3 text-sm text-center font-semibold text-[#111827]">{u.requests_count}</td>
                      <td className="pr-4">
                        <span className={`inline-flex items-center px-2.5 h-6 rounded-full text-[11px] font-semibold ${authColor}`}>
                          {authBadge}
                        </span>
                      </td>
                      <td className="pr-6 text-right text-gray-400">⋯</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <UserDrawer userId={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ---- User Detail Drawer ----
function UserDrawer({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    adminUsersApi.get(userId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const initials = data
    ? [data.first_name?.[0], data.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?"
    : "?";

  return (
    <div className="fixed inset-0 z-[300000] flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* drawer */}
      <div className="w-full max-w-[520px] bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <span className="text-[15px] font-extrabold text-[#111827]">User Profile</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#374151] hover:bg-[#E5E7EB] transition"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center text-red-500">Failed to load user.</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Avatar + основна інфо */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-[26px] font-extrabold text-black shrink-0"
                style={{ background: gradient }}
              >
                {data.avatar
                  ? <img src={data.avatar} alt="" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              <div>
                <div className="text-[20px] font-extrabold text-[#111827] leading-tight">
                  {[data.first_name, data.last_name].filter(Boolean).join(" ") || <span className="text-gray-400 italic">No name</span>}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{data.email}</div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Auth badge */}
                  {data.google_id && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">Google</span>}
                  {data.apple_id  && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">Apple</span>}
                  {!data.google_id && !data.apple_id && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">Email</span>}
                  {/* Verified badge */}
                  {data.email_verified
                    ? <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">✓ Verified</span>
                    : <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600">✗ Not verified</span>
                  }
                </div>
              </div>
            </div>

            {/* Контактна інформація */}
            <DrawerSection title="Contact Information">
              <DrawerRow label="Phone"   value={data.phone   || "—"} />
              <DrawerRow label="Email"   value={data.email   || "—"} />
              <DrawerRow label="Joined"  value={formatDate(data.created_at)} />
            </DrawerSection>

            {/* Адреси */}
            {(data.personal_address || data.commercial_address) && (
              <DrawerSection title="Addresses">
                {data.personal_address   && <DrawerRow label="Personal"   value={data.personal_address} />}
                {data.commercial_address && <DrawerRow label="Commercial" value={data.commercial_address} />}
              </DrawerSection>
            )}

            {/* Автомобілі */}
            <DrawerSection title={`Vehicles (${data.vehicles?.length || 0})`}>
              {!data.vehicles?.length ? (
                <p className="text-sm text-gray-400 italic">No vehicles added.</p>
              ) : (
                <div className="space-y-3">
                  {data.vehicles.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 rounded-[14px] bg-[#F9F9FB] border border-[#EAEAEA] px-3 py-2.5">
                      {v.photo_url ? (
                        <img src={v.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#F0F0F2] flex items-center justify-center text-xl shrink-0">
                          {v.category === "commercial" ? "🏢" : "🚗"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[#111827] truncate">
                          {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Unnamed"}
                        </div>
                        <div className="text-[12px] text-gray-400">
                          {[v.color, v.plate && `Plate: ${v.plate}`].filter(Boolean).join(" · ")}
                        </div>
                        {v.notes && <div className="text-[11px] text-gray-400 italic truncate">{v.notes}</div>}
                      </div>
                      <span className={`ml-auto shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${v.category === "commercial" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                        {v.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>

            {/* Запити / Замовлення */}
            <DrawerSection title={`Requests (${data.requests?.length || 0})`}>
              {!data.requests?.length ? (
                <p className="text-sm text-gray-400 italic">No requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.requests.map((r) => {
                    const sm = STATUS_META[r.status] || STATUS_META.processing;
                    const svcLabel = {
                      detailing_quote_personal:   "Detailing — Personal",
                      detailing_quote_business:   "Detailing — Business",
                      cleaning_quote_residential: "Cleaning — Residential",
                      cleaning_quote_commercial:  "Cleaning — Commercial",
                    }[r.service_type] || r.service_type;
                    return (
                      <div key={r.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F9F9FB] border border-[#EAEAEA] px-3 py-2.5">
                        <div>
                          <div className="text-[13px] font-semibold text-[#111827]">{svcLabel}</div>
                          <div className="text-[11px] text-gray-400">{formatDate(r.created_at)}</div>
                        </div>
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border ${sm.cls}`}>
                          {sm.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </DrawerSection>

          </div>
        )}
      </div>
    </div>
  );
}

function DrawerSection({ title, children }) {
  return (
    <div>
      <div className="text-[11px] font-extrabold tracking-widest text-[#9CA3AF] uppercase mb-2">{title}</div>
      <div className="rounded-[16px] bg-[#F9F9FB] border border-[#EAEAEA] p-4 space-y-2">
        {children}
      </div>
    </div>
  );
}

function DrawerRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[12px] text-gray-400 shrink-0 pt-px">{label}</span>
      <span className="text-[13px] font-semibold text-[#111827] text-right break-all leading-snug">{value}</span>
    </div>
  );
}

// ================== SPECIAL OFFERS PANEL ==================
const EMPTY_OFFER = { title: "", body: "", price: "", subtitle: "", image_url: "", published: true };

function SpecialOffersPanel() {
  const [offers, setOffers]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null); // null | EMPTY_OFFER | existing offer
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await cardsApi.list({ type: "special_offer" });
      setOffers(rows || []);
    } catch (e) {
      setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing?.title?.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      await cardsApi.save({
        ...editing,
        type: "special_offer",
        price: Number(editing.price) || 0,
      });
      await load();
      setEditing(null);
    } catch (e) {
      setError(e?.error || "Failed to save offer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer permanently?")) return;
    try {
      await cardsApi.remove(id);
      await load();
      if (editing?.id === id) setEditing(null);
    } catch (e) {
      setError("Failed to delete offer.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await cardsApi.upload(file);
      setEditing((prev) => ({ ...prev, image_url: result?.url || "" }));
    } catch {
      setError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827]">Special Offers</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage promotional offers displayed on the website.</p>
        </div>
        <button
          onClick={() => { setEditing({ ...EMPTY_OFFER }); setError(null); }}
          className="h-11 px-6 rounded-2xl text-sm font-semibold text-black"
          style={{ background: gradient }}
        >
          + Add Offer
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center py-12 text-gray-500">Loading offers...</p>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <p className="text-[#6B7280] text-lg font-semibold">No special offers yet</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Click "Add Offer" to create your first promotion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {offers.map((offer) => {
              const expiry = offer.subtitle ? new Date(offer.subtitle) : null;
              const expired = expiry && expiry < new Date();
              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-3 ${expired ? "opacity-60" : ""}`}
                >
                  {offer.image_url && (
                    <img src={offer.image_url} alt="" className="w-full h-36 object-cover rounded-xl" />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-[#111827] text-base leading-tight truncate">
                        {offer.title}
                      </div>
                      {offer.body && (
                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{offer.body}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        offer.published ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {offer.published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {offer.price > 0 && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full text-[#3E260C]" style={{ background: gradient }}>
                        {offer.price}% OFF
                      </span>
                    )}
                    {expiry && (
                      <span className={`text-xs px-3 py-1 rounded-full border ${expired ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {expired ? "Expired" : "Expires"} {expiry.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-[#F3F4F6]">
                    <button
                      onClick={() => { setEditing({ ...offer }); setError(null); }}
                      className="flex-1 h-9 rounded-xl text-sm font-semibold bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="h-9 px-4 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#111827]">
                {editing.id ? "Edit Offer" : "New Special Offer"}
              </h2>
              <button onClick={() => setEditing(null)} className="text-2xl text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Summer Detailing Deal"
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#A8834E]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1">Description</label>
                <textarea
                  value={editing.body}
                  onChange={(e) => setEditing((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Get 20% off any full detail service this summer…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#A8834E] resize-none"
                />
              </div>

              {/* Discount + Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editing.price}
                    onChange={(e) => setEditing((p) => ({ ...p, price: e.target.value }))}
                    placeholder="20"
                    className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#A8834E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editing.subtitle ? editing.subtitle.slice(0, 10) : ""}
                    onChange={(e) => setEditing((p) => ({ ...p, subtitle: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#A8834E]"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1">Image (optional)</label>
                {editing.image_url && (
                  <div className="relative mb-2">
                    <img src={editing.image_url} alt="" className="w-full h-32 object-cover rounded-xl" />
                    <button
                      onClick={() => setEditing((p) => ({ ...p, image_url: "" }))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-3 h-11 px-4 rounded-xl border border-dashed border-[#D1D5DB] cursor-pointer hover:border-[#A8834E] transition">
                  <span className="text-sm text-[#6B7280]">
                    {uploading ? "Uploading…" : "Click to upload image"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditing((p) => ({ ...p, published: !p.published }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${editing.published ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.published ? "translate-x-7" : "translate-x-1"}`} />
                </button>
                <span className="text-sm font-medium text-[#374151]">
                  {editing.published ? "Published (visible on site)" : "Draft (hidden from site)"}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3 bg-white">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-12 rounded-2xl text-sm font-semibold text-black disabled:opacity-50"
                style={{ background: gradient }}
              >
                {saving ? "Saving…" : editing.id ? "Save Changes" : "Create Offer"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 h-12 rounded-2xl border text-sm font-semibold text-[#374151]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================== STATUS ACTIONS ==================
function StatusActions({ status, onChange }) {
  const normalised = status === "new" ? "processing" : status === "in_progress" ? "confirmed" : status === "done" ? "completed" : status;

  if (normalised === "processing") {
    return (
      <div className="space-y-3">
        <div className={`inline-flex items-center px-4 h-8 rounded-full text-xs font-semibold border ${STATUS_META.processing.cls}`}>
          Processing
        </div>
        <p className="text-xs text-gray-500">Choose an action for this request:</p>
        <div className="flex gap-3">
          <button
            onClick={() => onChange("confirmed")}
            className="flex-1 h-12 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
          >
            ✓ Confirm Request
          </button>
          <button
            onClick={() => onChange("rejected")}
            className="flex-1 h-12 rounded-2xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition"
          >
            ✕ Reject Request
          </button>
        </div>
      </div>
    );
  }

  if (normalised === "confirmed") {
    return (
      <div className="space-y-3">
        <div className={`inline-flex items-center px-4 h-8 rounded-full text-xs font-semibold border ${STATUS_META.confirmed.cls}`}>
          Confirmed
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onChange("completed")}
            className="flex-1 h-12 rounded-2xl bg-[#111827] text-white font-semibold text-sm hover:brightness-110 transition"
          >
            ✓ Mark as Completed
          </button>
          <button
            onClick={() => onChange("rejected")}
            className="h-12 px-5 rounded-2xl border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-50 transition"
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  if (normalised === "rejected") {
    return (
      <div className="space-y-3">
        <div className={`inline-flex items-center px-4 h-8 rounded-full text-xs font-semibold border ${STATUS_META.rejected.cls}`}>
          Rejected
        </div>
        <button
          onClick={() => onChange("processing")}
          className="h-10 px-5 rounded-2xl border text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          ↩ Reopen as Processing
        </button>
      </div>
    );
  }

  if (normalised === "completed") {
    return (
      <div className="space-y-3">
        <div className={`inline-flex items-center px-4 h-8 rounded-full text-xs font-semibold border ${STATUS_META.completed.cls}`}>
          Completed
        </div>
        <button
          onClick={() => onChange("processing")}
          className="h-10 px-5 rounded-2xl border text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          ↩ Reopen as Processing
        </button>
      </div>
    );
  }

  // Fallback: plain select for unknown statuses
  return (
    <select value={status} onChange={e => onChange(e.target.value)}
      className="w-full h-12 rounded-2xl border px-5 font-medium focus:border-[#A8834E]">
      <option value="processing">Processing</option>
      <option value="confirmed">Confirmed</option>
      <option value="rejected">Rejected</option>
      <option value="completed">Completed</option>
    </select>
  );
}

// ================== DETAIL MODAL ==================
function DetailModal({ row, onClose, onSave, onDelete }) {
  const [editStatus, setEditStatus] = useState(row.status || "processing");
  const [editAdminNote, setEditAdminNote] = useState(row.notes_admin || "");
  const items = safeJsonParse(row.items_json, {});

  const handleSave = (statusOverride) => onSave(row, statusOverride ?? editStatus, editAdminNote);
  const handleDelete = () => onDelete?.(row);
  const handleStatusAction = (newStatus) => { setEditStatus(newStatus); onSave(row, newStatus, editAdminNote); };

  const contact = items.contact || items.guest || {};
  const vehicle = items.vehicle || {};
  const business = items.business || {};
  const fleet = items.fleet || {};
  const location = items.location || {};
  const services = items.services || {};
  const multipleVehicles = items.multipleVehicles || { enabled: false };
  const commercial = items.cleaningCommercial || {};

  const fullName = row.user_full_name || 
    `${contact.firstName || contact.name || ""} ${contact.lastName || ""}`.trim() || "Guest";

  // Визначаємо тип без залежності від activeMenu
  const serviceType = row.service_type || "";
  const isPersonal = serviceType === "detailing_quote_personal";
  const isBusiness = serviceType === "detailing_quote_business";
  const isResidential = items.propertyType === "residential";
  const isCommercial = items.propertyType === "commercial";

  const isOffice = isCommercial && (commercial.businessType === "office" || commercial.projectTypeText?.toLowerCase().includes("office"));
  const isAirbnb = isCommercial && (commercial.businessType === "retail" || commercial.projectTypeText?.toLowerCase().includes("airbnb"));
  const isPostConstruction = isCommercial && 
    (commercial.businessType === "medical" || 
     commercial.businessType === "property_mgmt" || 
     commercial.businessTypeText?.toLowerCase().includes("medical") ||
     commercial.businessTypeText?.toLowerCase().includes("property"));

  return (
    <div className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        <div className="px-6 py-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500">REQUEST DETAILS</div>
            <div className="font-extrabold text-xl">#{String(row.id || row._id).slice(0, 8)}</div>
          </div>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-black">✕</button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Status */}
          <Section title="Request Status">
            <StatusActions status={editStatus} onChange={handleStatusAction} />
          </Section>

          {/* Client Information */}
          <Section title="Client Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Full Name" value={fullName} />
              <Field label="Email" value={contact.email || row.user_email} />
              <Field label="Phone" value={contact.phone || row.user_phone} />
              <Field label="Company Name" value={contact.companyName || business.companyName || commercial.companyName} />
            </div>
          </Section>

          {/* Detailing Personal */}
          {isPersonal && (
            <Section title="Vehicle & Requested Services">
              {/* Car photo — auto-loads from imagin.studio based on make + year */}
              {vehicle.make && vehicle.year && (
                <CarPhoto
                  make={vehicle.make}
                  model={vehicle.model}
                  year={vehicle.year}
                  color={vehicle.color}
                  className="w-full mb-6"
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <Field label="Year" value={vehicle.year} />
                <Field label="Make" value={vehicle.make} />
                <Field label="Model" value={vehicle.model} />
                <Field label="Color" value={vehicle.color} />
                <Field label="Seat Material" value={vehicle.seatMaterial} />
              </div>
              {services.selected && services.selected.length > 0 && (
                <Chips label="Services Requested" items={services.selected} />
              )}
            </Section>
          )}

          {/* Detailing Business */}
          {isBusiness && (
            <Section title="Business Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Company Name" value={contact.companyName || business.companyName} />
                <Field label="Company Address" value={contact.companyAddress} />
                <Field label="Vehicles Count" value={business.vehiclesCount} />
                <Field label="Business Type" value={business.businessType} />
                <Field label="Service Frequency" value={business.serviceFrequency} />
              </div>
              {fleet.services && fleet.services.length > 0 && (
                <Chips label="Services Requested" items={fleet.services} />
              )}
            </Section>
          )}

          {/* Multiple Vehicles */}
          {multipleVehicles.enabled === true && (
            <Section title="Multiple Vehicles">
              <Field label="Number of Vehicles" value={multipleVehicles.count} />
              {multipleVehicles.vehicles && multipleVehicles.vehicles.length > 0 && (
                <div className="mt-6 space-y-6">
                  {multipleVehicles.vehicles.map((v, index) => (
                    <div key={index} className="border rounded-2xl p-5 bg-gray-50">
                      <div className="font-semibold mb-3">Vehicle #{index + 1}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Field label="Year" value={v.year} />
                        <Field label="Make" value={v.make} />
                        <Field label="Model" value={v.model} />
                        <Field label="Color" value={v.color} />
                        <Field label="Seat Material" value={v.seatMaterial} />
                        <Field label="Service" value={v.service} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Cleaning Residential */}
          {isResidential && (
            <Section title="Property & Project Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Property Type" value={items.propertyType} />
                <Field label="Project Type" value={items.projectType} />
                <Field label="Bedrooms" value={items.bedrooms} />
                <Field label="Bathrooms" value={items.bathrooms} />
                <Field label="Budget" value={items.resBudget} />
              </div>
              <Chips label="Areas to Clean" items={items.areas} />
              <Chips label="General Tasks" items={items.generalTasks} />
              <Chips label="Kitchen Tasks" items={items.kitchenTasks} />
              {items.extraDetails && <Field label="Extra Details from Client" value={items.extraDetails} />}
            </Section>
          )}

          {/* Cleaning Commercial */}
          {isCommercial && (
            <Section title="Commercial Cleaning">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Company Name" value={commercial.companyName} />
                <Field label="Company Address" value={commercial.companyAddress} />
                <Field label="Business Type" value={commercial.businessTypeText || commercial.businessType} />
                <Field label="Project Type" value={commercial.projectTypeText || items.projectType} />
              </div>

              {/* Office */}
              {isOffice && (
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Square Footage" value={commercial.officeSquareFootage} />
                    <Field label="Number of Floors" value={commercial.officeFloors} />
                    <Field label="Private Offices" value={commercial.officePrivateOffices} />
                    <Field label="Restrooms" value={commercial.officeRestrooms} />
                    <Field label="Conference Rooms" value={commercial.officeConferenceRooms} />
                    <Field label="Frequency" value={commercial.officeFrequency} />
                    <Field label="Budget" value={formatBudget(commercial.officeBudget)} />
                  </div>
                  <Chips label="Areas" items={commercial.officeAreas} />
                </div>
              )}

              {/* Airbnb */}
              {isAirbnb && (
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Number of Units" value={commercial.airbnbUnits} />
                    <Field label="Average Sqft per Unit" value={commercial.airbnbAvgSqft} />
                    <Field label="Average Bedrooms" value={commercial.airbnbAvgBedrooms} />
                    <Field label="Average Bathrooms" value={commercial.airbnbAvgBathrooms} />
                    <Field label="Turnover" value={commercial.airbnbTurnover} />
                    <Field label="Budget per Unit" value={formatBudget(commercial.airbnbBudgetPerUnit)} />
                    <Field label="Linen & Laundry" value={commercial.airbnbLinenLaundry === "yes" ? "Yes" : "No"} />
                  </div>
                  <Chips label="Property Types" items={commercial.airbnbPropertyTypes} />
                  <Chips label="Areas" items={commercial.airbnbAreas} />
                  <Chips label="Kitchen Tasks" items={commercial.airbnbKitchenTasks} />
                  <Chips label="Preferred Days & Times" items={commercial.preferredDaysTimes} />

                  {commercial.projectSummary && <Field label="Project Summary" value={commercial.projectSummary} />}
                  {commercial.productPreferences && <Field label="Product Preferences" value={commercial.productPreferences} />}
                  {commercial.additionalInfo && <Field label="Additional Information" value={commercial.additionalInfo} />}
                  {commercial.accessInstructions && <Field label="Access Instructions" value={commercial.accessInstructions} />}
                </div>
              )}

              {/* Post-Construction */}
              {isPostConstruction && (
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Construction Type" value={commercial.pcConstructionType} />
                    <Field label="Square Footage" value={commercial.pcSquareFootage} />
                    <Field label="Number of Floors" value={commercial.pcFloors} />
                    <Field label="Property Type" value={commercial.pcPropertyType} />
                    <Field label="Frequency" value={commercial.pcFrequency} />
                    <Field label="Budget" value={formatBudget(commercial.pcBudget)} />
                    <Field label="Completion Date" value={commercial.pcCompletionDate} />
                  </div>

                  <Chips label="Surfaces to Clean" items={commercial.pcSurfaces} />

                  {commercial.pcSurfacesOther && (
                    <Field label="Other Surfaces" value={commercial.pcSurfacesOther} />
                  )}
                  {commercial.projectSummary && (
                    <Field label="Project Summary" value={commercial.projectSummary} />
                  )}
                  {commercial.productPreferences && (
                    <Field label="Product Preferences" value={commercial.productPreferences} />
                  )}
                  {commercial.additionalInfo && (
                    <Field label="Additional Information" value={commercial.additionalInfo} />
                  )}
                  {commercial.accessInstructions && (
                    <Field label="Access Instructions" value={commercial.accessInstructions} />
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Forms Clients */}
          {row.service_type === "forms_clients" && (
            <Section title="Form Submission Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="First Name" value={items.firstName} />
                <Field label="Last Name" value={items.lastName} />
                <Field label="Email" value={items.email} />
                <Field label="Phone" value={items.phone} />
                <Field label="Service" value={items.service} />
              </div>

              {items.description && (
                <div className="mt-6">
                  <div className="text-[11px] font-extrabold tracking-wide text-[#6B7280] uppercase mb-2">
                    Description / Message from Client
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl text-sm leading-relaxed border border-gray-200">
                    {items.description}
                  </div>
                </div>
              )}

              <Field label="Page Path" value={items.pagePath} />
              <Field label="Source" value={items.source} />
            </Section>
          )}

          {/* Service Location */}
          <Section title="Service Location">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Service Address" value={location.service_address || row.service_address} />
              <Field label="Pickup Address" value={location.pickup_address} />
              <Field label="Dropoff Address" value={location.dropoff_address} />
            </div>
          </Section>

          {/* Admin Notes */}
          <Section title="Admin Notes">
            <textarea
              value={editAdminNote}
              onChange={e => setEditAdminNote(e.target.value)}
              className="w-full h-52 p-5 border rounded-3xl focus:border-[#A8834E] outline-none resize-y text-sm"
              placeholder="Internal notes, follow-up tasks, discounts..."
            />
          </Section>
        </div>

        <div className="p-6 border-t flex gap-3 bg-white">
          <button onClick={() => handleSave()} className="flex-1 h-14 rounded-3xl bg-[#111827] text-white font-semibold hover:brightness-110 transition">
            Save Notes
          </button>
          <button onClick={onClose} className="flex-1 h-14 rounded-3xl border font-semibold">Close</button>
          <button
            onClick={handleDelete}
            className="h-14 px-6 rounded-3xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            title="Delete this request permanently"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}