// src/pages/AdminRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import { adminReqApi } from "../lib/api";

const gradient =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const MENU_ITEMS = [
  { key: "detailing_quote_personal", label: "Detailing — Personal" },
  { key: "detailing_quote_business", label: "Detailing — Business" },
  { key: "cleaning_quote_residential", label: "Cleaning — Residential" },
  { key: "cleaning_quote_commercial", label: "Cleaning — Commercial" },

  { key: "forms_clients", label: "Forms Clients" },

  { key: "users", label: "Users" },
];

function safeJsonParse(text, fallback = {}) {
  try {
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/* ================== HUMANIZATION (EN) ================== */

const STATUS_LABELS = {
  new: "New",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
};

const HEARD_ABOUT_LABELS = {
  google: "Google search",
  facebook: "Facebook",
  instagram: "Instagram",
  returning: "Returning customer",
  referral: "Referral",
  friend: "Friend / Family",
  yelp: "Yelp",
  tiktok: "TikTok",
  other: "Other",
};

const CLEANING_PROJECT_TYPE_LABELS = {
  office: "Office",
  airbnb: "Airbnb / Short-term rentals",
  post_construction: "Post-construction",
  other: "Other",
};

const FREQUENCY_LABELS = {
  one_time: "One-time",
  weekly: "Weekly",
  bi_weekly: "Bi-weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  as_needed: "As needed",
  other: "Other",
};

const BUDGET_LABELS = {
  under_1000: "Under $1,000",
  "1000_2500": "$1,000 – $2,500",
  "2500_5000": "$2,500 – $5,000",
  "2500_5000_month": "$2,500 – $5,000 / month",
  "5000_10000": "$5,000 – $10,000",
  "10000_plus": "$10,000+",
  custom: "Custom / discuss with client",
};

const YES_NO_LABELS = {
  yes: "Yes",
  no: "No",
  true: "Yes",
  false: "No",
};

const SERVICE_LOCATION_LABELS = {
  on_site: "On-site",
  drop_off: "Drop-off",
  pickup_dropoff: "Pick-up & drop-off",
  other: "Other",
};

const CONTACT_METHOD_LABELS = {
  call: "Phone call",
  text: "Text message",
  sms: "Text message",
  email: "Email",
};

const CONTACT_TIME_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};

/* Optional: If your lists are stored as keys, map them here.
   If they are already human strings, the fallback will show them nicely anyway.
*/
const OFFICE_AREAS_LABELS = {
  offices: "Office areas",
  restrooms: "Restrooms",
  kitchen: "Kitchen",
  conference_rooms: "Conference rooms",
  common_areas: "Common areas",
  lobby: "Lobby",
  break_room: "Break room",
  other: "Other",
};

const RES_PROPERTY_TYPE_LABELS = {
  house: "House",
  apartment: "Apartment",
  condo: "Condo",
  townhouse: "Townhouse",
  other: "Other",
};

const RES_PROJECT_TYPE_LABELS = {
  standard: "Standard cleaning",
  deep: "Deep cleaning",
  move_in_out: "Move-in / Move-out",
  post_construction: "Post-construction",
  other: "Other",
};

const PC_CONSTRUCTION_TYPE_LABELS = {
  renovation: "Renovation",
  new_build: "New build",
  remodel: "Remodel",
  other: "Other",
};

const AIRBNB_TURNOVER_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  as_needed: "As needed",
  other: "Other",
};

const AIRBNB_LINEN_LABELS = {
  yes: "Yes",
  no: "No",
  unsure: "Not sure",
};

function prettifyKey(v) {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function humanize(value, map) {
  if (value === undefined || value === null) return "";
  const key = String(value);
  return map?.[key] || prettifyKey(key);
}

function humanizeList(arr, map) {
  if (!Array.isArray(arr) || !arr.length) return [];
  return arr.map((x) => (map ? humanize(x, map) : prettifyKey(x)));
}

/* ================== UI PRIMITIVES ================== */

const isFilled = (v) => {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

const Field = ({ label, value }) => {
  if (!isFilled(value)) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-extrabold tracking-wide text-[#6B7280] uppercase">
        {label}
      </div>
      <div className="text-sm font-semibold text-[#111827] break-words">
        {String(value)}
      </div>
    </div>
  );
};

const FieldRow = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
);

const Section = ({ title, children, right }) => (
  <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-extrabold tracking-wide text-[#111827] uppercase">
        {title}
      </div>
      {right || null}
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const Chips = ({ label, items }) => {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div>
      <div className="text-[11px] font-extrabold tracking-wide text-[#6B7280] uppercase">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((x, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full border text-xs font-semibold text-[#111827] bg-[#FAFAFB]"
          >
            {x}
          </span>
        ))}
      </div>
    </div>
  );
};

const PrimaryText = ({ children }) => {
  if (!isFilled(children)) return null;
  return (
    <div className="rounded-2xl bg-[#FFF7E6] border border-[#F3E3B9] p-4">
      <div className="text-sm font-bold text-[#111827] whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
};

/* ================== TYPE HELPERS ================== */

function isDetailing(serviceType = "") {
  return String(serviceType).startsWith("detailing_quote");
}
function isCleaning(serviceType = "") {
  return String(serviceType).startsWith("cleaning_quote");
}
function isFormsClients(serviceType = "") {
  return String(serviceType) === "forms_clients";
}

function categoryLabelFromServiceType(serviceType = "") {
  const st = String(serviceType);
  const found = MENU_ITEMS.find((i) => i.key === st);
  return found?.label || st || "Unknown";
}

function pickFirst(...vals) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object") return v;
  }
  return "";
}

function getContact(items = {}, row = {}) {
  const c1 = items?.contact || {};
  const c2 = items?.contactInfo || {};
  const c3 = items?.customer || {};
  const c4 = items?.business?.contact || {};
  const c5 = items?.personal?.contact || {};
  const c6 = items?.fleet?.contact || {};

  const c7 = items || {};

  const firstName = pickFirst(
    c1.firstName,
    c2.firstName,
    c3.firstName,
    c4.firstName,
    c5.firstName,
    c6.firstName,
    c7.firstName
  );
  const lastName = pickFirst(
    c1.lastName,
    c2.lastName,
    c3.lastName,
    c4.lastName,
    c5.lastName,
    c6.lastName,
    c7.lastName
  );

  const email = pickFirst(
    c1.email,
    c2.email,
    c3.email,
    c4.email,
    c5.email,
    c6.email,
    c7.email,
    row.user_email
  );

  const phone = pickFirst(
    c1.phone,
    c2.phone,
    c3.phone,
    c4.phone,
    c5.phone,
    c6.phone,
    c7.phone,
    row.user_phone
  );

  const companyName = pickFirst(
    c1.companyName,
    c2.companyName,
    c3.companyName,
    c4.companyName
  );

  const heardAbout =
    c1.heardAbout ?? c2.heardAbout ?? c3.heardAbout ?? c4.heardAbout ?? "";
  const heardOther =
    c1.heardOther ?? c2.heardOther ?? c3.heardOther ?? c4.heardOther ?? "";

  const fullName =
    pickFirst(`${firstName} ${lastName}`.trim(), row.user_full_name) || "—";

  return {
    fullName,
    firstName,
    lastName,
    email,
    phone,
    companyName,
    heardAbout,
    heardOther,
  };
}

function stringifyHeardAbout(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  return String(v);
}

function summarizeType(serviceType, items) {
  if (isFormsClients(serviceType)) return items?.service || "Client Form";

  if (isDetailing(serviceType)) {
    const vehicle = items?.vehicle || {};
    const s = `${vehicle.year || ""} ${vehicle.make || ""} ${
      vehicle.model || ""
    }`.trim();
    return s || "Detailing request";
  }

  if (isCleaning(serviceType)) {
    const pt = items?.propertyType ? prettifyKey(items.propertyType) : "";
    const pr = items?.projectType
      ? humanize(items.projectType, CLEANING_PROJECT_TYPE_LABELS)
      : "";
    const t = [pt, pr].filter(Boolean).join(" • ");
    return t || "Cleaning request";
  }

  return "Request";
}

function matchesSearch(row, items, term) {
  if (!term) return true;
  const t = term.toLowerCase().trim();
  if (!t) return true;

  const contact = items?.contact || {};
  const vehicle = items?.vehicle || {};
  const notes = row?.notes_customer || "";
  const adminNote = row?.notes_admin || "";

  const formService = items?.service || "";
  const formDesc = items?.description || items?.message || "";
  const formPath = items?.pagePath || items?.page_path || "";

  const hay = [
    row?.id,
    row?._id,
    row?.service_type,
    row?.status,
    row?.user_full_name,
    row?.user_email,
    row?.user_phone,

    contact?.firstName,
    contact?.lastName,
    contact?.email,
    contact?.phone,
    stringifyHeardAbout(contact?.heardAbout),

    `${vehicle?.year || ""} ${vehicle?.make || ""} ${
      vehicle?.model || ""
    }`.trim(),

    items?.firstName,
    items?.lastName,
    items?.email,
    items?.phone,
    formService,
    formDesc,
    formPath,

    notes,
    adminNote,
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();

  return hay.includes(t);
}

function getPickupAddress(items = {}) {
  const loc = items?.location || {};
  const fleet = items?.fleet || {};
  const contact = items?.contact || {};

  return (
    loc?.pickupAddress ||
    loc?.pickup_address ||
    items?.pickupAddress ||
    items?.pickup_address ||
    fleet?.pickupAddress ||
    fleet?.pickup_address ||
    loc?.baseAddress ||
    items?.baseAddress ||
    contact?.pickupAddress ||
    ""
  );
}

function getServiceLocationType(items = {}, fallback = "") {
  const loc = items?.location || {};
  const fleet = items?.fleet || {};
  return (
    loc?.location_type ||
    loc?.locationType ||
    fleet?.serviceLocation ||
    items?.serviceLocation ||
    fallback
  );
}

function formatDateTime(v) {
  try {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v || "—");
  }
}

/* ================== PAGE ================== */

export default function AdminRequests() {
  const [activeMenu, setActiveMenu] = useState("detailing_quote_personal");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [counts, setCounts] = useState({});
  const activeIsUsers = activeMenu === "users";

  const [editStatus, setEditStatus] = useState("");
  const [editAdminNote, setEditAdminNote] = useState("");

  useEffect(() => {
    if (!selectedRow) return;
    setEditStatus(selectedRow.status || "new");
    setEditAdminNote(selectedRow.notes_admin || "");
  }, [selectedRow]);

  const loadCounts = async () => {
    const items = MENU_ITEMS.filter((x) => x.key !== "users");
    try {
      const results = await Promise.all(
        items.map(async (it) => {
          const params = { service_type: it.key };
          if (statusFilter) params.status = statusFilter;
          const data = await adminReqApi.list(params);
          return [it.key, Array.isArray(data) ? data.length : 0];
        })
      );
      const map = {};
      for (const [k, v] of results) map[k] = v;
      setCounts(map);
    } catch (e) {
      console.error("Failed to load counts:", e);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      if (activeIsUsers) {
        setRows([]);
        return;
      }

      const params = { service_type: activeMenu };
      if (statusFilter) params.status = statusFilter;

      const data = await adminReqApi.list(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e?.error || e?.message || "Failed to load admin requests. Check API.";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, statusFilter]);

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const rowsWithParsed = useMemo(() => {
    return rows.map((r) => ({
      row: r,
      items: safeJsonParse(r.items_json, {}),
    }));
  }, [rows]);

  const filtered = useMemo(() => {
    return rowsWithParsed.filter(({ row, items }) =>
      matchesSearch(row, items, search)
    );
  }, [rowsWithParsed, search]);

  const deleteBooking = async (row) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await adminReqApi.remove(row.id);
      if (selectedRow?.id === row.id) setSelectedRow(null);
      await loadBookings();
      await loadCounts();
    } catch (e) {
      alert(e?.error || e?.message || "Failed to delete request.");
    }
  };

  const saveEdits = async () => {
    if (!selectedRow) return;

    try {
      await adminReqApi.save({
        id: selectedRow.id,
        status: editStatus,
        notes_admin: editAdminNote,
      });

      await loadBookings();
      await loadCounts();

      const fresh = await adminReqApi.list({
        service_type: selectedRow.service_type,
        status: statusFilter || undefined,
      });
      const found = Array.isArray(fresh)
        ? fresh.find((x) => x.id === selectedRow.id)
        : null;
      if (found) setSelectedRow(found);
    } catch (e) {
      alert(e?.error || e?.message || "Failed to save changes.");
    }
  };

  const activeTitle =
    MENU_ITEMS.find((i) => i.key === activeMenu)?.label || "Requests";

  const Header = (
    <div className="sticky top-0 z-30 bg-[#F4F4F5]/80 backdrop-blur border-b border-[#E5E7EB]">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden w-10 h-10 rounded-2xl bg-white border flex items-center justify-center"
            aria-label="Open menu"
          >
            <span className="text-xl">≡</span>
          </button>

          <div>
            <div className="text-[11px] text-[#9CA3AF] uppercase">
              Admin Panel
            </div>
            <div className="text-[18px] sm:text-[20px] font-extrabold text-[#111827]">
              {activeTitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadBookings();
              loadCounts();
            }}
            className="h-10 px-4 rounded-2xl bg-white border text-sm font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search: id, name, email, phone, vehicle, notes…"
            className="w-full sm:max-w-[420px] h-11 px-4 rounded-2xl border bg-white text-sm outline-none"
          />

          <div className="flex gap-2 items-center">
            <span className="text-sm text-[#4B5563]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3 rounded-2xl border bg-white text-sm outline-none"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="w-full lg:max-w-[520px] p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );

  const Sidebar = (
    <aside className="w-80 hidden md:flex flex-col border-r border-[#E5E7EB] bg-white">
      <div className="px-5 py-6 border-b">
        <div className="text-xs text-[#9CA3AF] uppercase">Admin Panel</div>
        <div className="text-lg font-extrabold text-[#111827]">
          Danilets Dashboard
        </div>
        <div className="text-xs text-[#6B7280] mt-2">
          Fast view • edit status • mobile friendly
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const active = activeMenu === item.key;
          const c = counts[item.key] ?? 0;

          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveMenu(item.key);
                setSelectedRow(null);
              }}
              className={`w-full px-3 py-2 rounded-2xl text-sm font-semibold text-left flex items-center justify-between gap-2
                ${
                  active
                    ? "text-black shadow-sm"
                    : "text-[#4B5563] hover:text-[#111827] hover:bg-gray-100"
                }`}
              style={{ background: active ? gradient : undefined }}
            >
              <span>{item.label}</span>

              {item.key !== "users" ? (
                <span
                  className={`min-w-[32px] h-[22px] px-2 rounded-full text-xs flex items-center justify-center
                    ${active ? "bg-black/10" : "bg-gray-100"}`}
                >
                  {c}
                </span>
              ) : (
                <span className="text-xs text-[#9CA3AF]">soon</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  const MobileDrawer = (
    <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <div className="p-4 border-b">
        <div className="text-xs text-[#9CA3AF] uppercase">Admin Panel</div>
        <div className="text-lg font-extrabold text-[#111827]">
          Danilets Dashboard
        </div>
      </div>

      <div className="p-3 space-y-2">
        {MENU_ITEMS.map((item) => {
          const active = activeMenu === item.key;
          const c = counts[item.key] ?? 0;

          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveMenu(item.key);
                setSelectedRow(null);
                setDrawerOpen(false);
              }}
              className={`w-full px-3 py-3 rounded-2xl text-sm font-semibold text-left flex items-center justify-between gap-2 border
                ${active ? "border-transparent" : "border-[#E5E7EB] bg-white"}`}
              style={{ background: active ? gradient : undefined }}
            >
              <span>{item.label}</span>
              {item.key !== "users" ? (
                <span
                  className={`min-w-[32px] h-[22px] px-2 rounded-full text-xs flex items-center justify-center ${
                    active ? "bg-black/10" : "bg-gray-100"
                  }`}
                >
                  {c}
                </span>
              ) : (
                <span className="text-xs text-[#9CA3AF]">soon</span>
              )}
            </button>
          );
        })}
      </div>
    </Drawer>
  );

  const ListArea = () => {
    if (activeIsUsers) {
      return (
        <div className="p-6 bg-white rounded-3xl border">
          Users: coming soon
        </div>
      );
    }

    if (loading) {
      return <div className="p-6 bg-white rounded-3xl border">Loading…</div>;
    }

    if (!filtered.length) {
      return (
        <div className="p-6 bg-white rounded-3xl border">
          No requests found.
        </div>
      );
    }

    const openDetails = (row) => {
      setSelectedRow(row);
    };

    return (
      <>
        {/* Mobile cards */}
        <div className="grid gap-3 md:hidden">
          {filtered.map(({ row: r, items }) => {
            const contact = getContact(items, r);
            const serviceType = r.service_type || activeMenu;

            const pickupAddr = getPickupAddress(items);
            const locationTypeRaw = getServiceLocationType(items, "");
            const locationType = locationTypeRaw
              ? humanize(locationTypeRaw, SERVICE_LOCATION_LABELS)
              : "";

            return (
              <div
                key={String(
                  r.id ?? r._id ?? `${r.created_at}-${contact?.email ?? ""}`
                )}
                role="button"
                tabIndex={0}
                onClick={() => openDetails(r)}
                onKeyDown={(e) => e.key === "Enter" && openDetails(r)}
                className="text-left bg-white border rounded-3xl p-4 shadow-sm active:scale-[0.995] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] text-[#6B7280]">
                      #{r.id} • {formatDateTime(r.created_at)}
                    </div>

                    <div className="font-extrabold text-[#111827] mt-1 truncate">
                      {contact.fullName || "—"}
                    </div>

                    {contact.email ? (
                      <div className="text-xs text-[#6B7280] truncate">
                        {contact.email}
                      </div>
                    ) : null}

                    {contact.phone ? (
                      <div className="text-xs text-[#6B7280] truncate">
                        {contact.phone}
                      </div>
                    ) : null}
                  </div>

                  <span className="px-2 py-1 rounded-full text-xs border bg-white capitalize">
                    {humanize(r.status || "—", STATUS_LABELS)}
                  </span>
                </div>

                <div className="mt-3 text-sm">
                  <div className="font-semibold text-[#111827]">
                    {summarizeType(serviceType, items)}
                  </div>
                  <div className="text-xs text-[#6B7280]">
                    {categoryLabelFromServiceType(serviceType)}
                  </div>
                </div>

                {(locationType || pickupAddr) &&
                  !isFormsClients(serviceType) && (
                    <div className="mt-3 text-xs text-[#4B5563]">
                      {locationType ? (
                        <div>Location: {locationType}</div>
                      ) : null}
                      {pickupAddr ? (
                        <div className="truncate">Pickup: {pickupAddr}</div>
                      ) : null}
                    </div>
                  )}

                {isFormsClients(serviceType) && (
                  <div className="mt-3 text-xs text-[#4B5563]">
                    <div className="truncate">
                      Page: {items?.pagePath || "—"}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBooking(r);
                    }}
                    className="h-9 px-3 rounded-2xl border bg-white text-sm font-semibold"
                  >
                    Delete
                  </button>

                  <div className="flex-1" />
                  <span className="text-sm font-semibold">View →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block w-full overflow-x-auto bg-white rounded-3xl border">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-[#6B7280] text-xs">
                <th className="p-3">ID</th>
                <th className="p-3">Created</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Service</th>
                <th className="p-3">Status</th>
                <th className="p-3">Pickup / Page</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(({ row: r, items }) => {
                const contact = getContact(items, r);
                const serviceType = r.service_type || activeMenu;
                const pickupAddr = getPickupAddress(items);

                return (
                  <tr
                    key={String(
                      r.id ?? r._id ?? `${r.created_at}-${contact?.email ?? ""}`
                    )}
                    className="border-b hover:bg-[#FAFAFB] cursor-pointer"
                    onClick={() => setSelectedRow(r)}
                  >
                    <td className="p-3">{r.id}</td>

                    <td className="p-3 whitespace-nowrap">
                      {formatDateTime(r.created_at)}
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-[#111827]">
                        {contact.fullName || "—"}
                      </div>
                      {contact.email ? (
                        <div className="text-xs text-gray-500">
                          {contact.email}
                        </div>
                      ) : null}
                      {contact.phone ? (
                        <div className="text-xs text-gray-500">
                          {contact.phone}
                        </div>
                      ) : null}
                    </td>

                    <td className="p-3">
                      <div className="font-medium text-[#111827]">
                        {summarizeType(serviceType, items)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {categoryLabelFromServiceType(serviceType)}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="capitalize">
                        {humanize(r.status || "—", STATUS_LABELS)}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="text-xs text-[#4B5563] max-w-[260px] truncate">
                        {isFormsClients(serviceType)
                          ? items?.pagePath || "—"
                          : pickupAddr || "—"}
                      </div>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBooking(r);
                        }}
                        className="px-3 py-2 border rounded-2xl bg-white text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  function ContactInfoCard({ items, row }) {
    const c = getContact(items, row);

    const heard =
      c.heardAbout === "Other" && c.heardOther
        ? `Other — ${c.heardOther}`
        : c.heardAbout;

    return (
      <Card title="Contact Information">
        <FieldRow>
          <Field label="Full name" value={c.fullName} />
          <Field label="Phone" value={c.phone} />
          <Field label="Email" value={c.email} />
          <Field label="Company" value={c.companyName} />
        </FieldRow>

        {isFilled(heard) ? (
          <div className="mt-4">
            <Field label="How did you hear about us?" value={heard} />
          </div>
        ) : null}
      </Card>
    );
  }

  const MobileDetailsModal = () => {
    if (!selectedRow) return null;

    const items = safeJsonParse(selectedRow.items_json, {});
    const serviceType = selectedRow.service_type || "";

    const isCleaningCommercial =
      selectedRow?.service_type === "cleaning_quote_commercial" ||
      items?.propertyType === "commercial";

    return (
      <Modal onClose={() => setSelectedRow(null)} title="Request details">
        <div className="grid gap-3">
          <Card title="Overview" strong>
            <div className="text-xs text-[#6B7280]">
              Request #{selectedRow.id}
            </div>
            <div className="text-lg font-extrabold text-[#111827] mt-1">
              {categoryLabelFromServiceType(serviceType)}
            </div>
            <div className="text-xs text-[#9CA3AF] mt-1">
              Created: {formatDateTime(selectedRow.created_at)}
            </div>
            <div className="mt-3 inline-flex px-3 py-1 rounded-full border bg-white text-sm font-semibold">
              Status: {humanize(selectedRow.status || "—", STATUS_LABELS)}
            </div>
          </Card>

          <Card title="Status & Internal note">
            <div className="grid gap-3">
              <div>
                <div className="text-xs text-[#6B7280] mb-1">Status</div>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="h-11 w-full px-3 rounded-2xl border bg-white text-sm outline-none"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <div className="text-xs text-[#6B7280] mb-1">Admin note</div>
                <textarea
                  value={editAdminNote}
                  onChange={(e) => setEditAdminNote(e.target.value)}
                  className="w-full min-h-[90px] px-3 py-2 rounded-2xl border bg-white text-sm outline-none resize-none"
                  placeholder="Write internal note…"
                />
              </div>

              <button
                type="button"
                onClick={saveEdits}
                className="h-12 rounded-2xl font-semibold text-black shadow"
                style={{ background: gradient }}
              >
                Save changes
              </button>
            </div>
          </Card>

          <Card title="Details">
            {serviceType === "detailing_quote_personal" && (
              <DetailingPersonalDetails items={items} />
            )}

            {serviceType === "detailing_quote_business" && (
              <DetailingBusinessDetails items={items} />
            )}

            {serviceType === "cleaning_quote_residential" && (
              <CleaningResidentialBlocks items={items} />
            )}

            {isCleaningCommercial && <CleaningCommercialBlocks items={items} />}

            {serviceType === "forms_clients" && (
              <FormsClientsDetails items={items} row={selectedRow} />
            )}
          </Card>

          <button
            onClick={() => deleteBooking(selectedRow)}
            className="h-11 w-full rounded-2xl border bg-white text-sm font-semibold"
          >
            Delete request
          </button>
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F4F5] flex pt-[90px]">
      {Sidebar}

      <div className="flex-1 min-w-0">
        {Header}

        <div className="px-4 sm:px-6 py-5 w-full">
          <div className="w-full">
            <ListArea />
          </div>
        </div>
      </div>

      {MobileDrawer}
      <MobileDetailsModal />
    </div>
  );
}

/* ================== DETAILS BLOCKS ================== */

function DetailingPersonalDetails({ items }) {
  const vehicle = items?.vehicle || {};
  const history = items?.history || {};
  const services = items?.services || {};
  const contact = items?.contact || items?.personal?.contact || {};

  const conditionFlags = Array.isArray(history?.conditionFlags)
    ? history.conditionFlags
    : [];
  const selectedServices = Array.isArray(services?.selected)
    ? services.selected
    : [];

  const conditionFlagsHuman = conditionFlags.map(prettifyKey);
  const selectedServicesHuman = selectedServices.map(prettifyKey);

  const vehicleTitle =
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    "—";

  return (
    <div className="space-y-4">
      <Section title="Contact information">
        {contact.firstName || contact.lastName ? (
          <div className="font-semibold text-[#111827]">
            {`${contact.firstName || ""} ${contact.lastName || ""}`.trim()}
          </div>
        ) : null}

        {contact.phone ? <div>Phone: {contact.phone}</div> : null}
        {contact.email ? <div>Email: {contact.email}</div> : null}

        {contact.heardAbout ? (
          <div>
            How did you hear:{" "}
            <span className="font-semibold text-[#111827]">
              {contact.heardAbout === "Other" && contact.heardOther
                ? `Other — ${contact.heardOther}`
                : contact.heardAbout}
            </span>
          </div>
        ) : null}
      </Section>

      <Section title="Vehicle">
        <FieldRow>
          <Field label="Vehicle" value={vehicleTitle} />
          <Field label="Color" value={prettifyKey(vehicle.color)} />
          <Field
            label="Seat material"
            value={prettifyKey(vehicle.seatMaterial)}
          />
        </FieldRow>
      </Section>

      <Section title="Condition">
        <FieldRow>
          <Field
            label="Last detailed"
            value={prettifyKey(history.lastDetailed)}
          />
          <Field
            label="Condition rating"
            value={prettifyKey(history.conditionRating)}
          />
          <Field label="Other notes" value={history.other} />
        </FieldRow>

        <div className="mt-4">
          <Chips label="Selected condition flags" items={conditionFlagsHuman} />
        </div>
      </Section>

      <Section title="Requested services">
        <Chips label="Services" items={selectedServicesHuman} />
        <div className="mt-3">
          <Field label="Other service requests" value={services.other} />
        </div>
      </Section>
    </div>
  );
}

function DetailingBusinessDetails({ items }) {
  const business = items?.business || {};
  const contact = items?.contact || {};
  const fleet = items?.fleet || {};
  const timeline = items?.timeline || {};
  const preferences = items?.preferences || {};

  const businessType = business.businessTypeOther
    ? `${prettifyKey(business.businessType)} — ${business.businessTypeOther}`
    : prettifyKey(business.businessType);

  const frequency = business.serviceFrequencyOther
    ? `${humanize(business.serviceFrequency, FREQUENCY_LABELS)} — ${
        business.serviceFrequencyOther
      }`
    : humanize(business.serviceFrequency, FREQUENCY_LABELS);

  const serviceLocation = humanize(
    fleet.serviceLocation,
    SERVICE_LOCATION_LABELS
  );

  const contactMethod = humanize(
    preferences.preferredContactMethod,
    CONTACT_METHOD_LABELS
  );

  const bestTime = humanize(
    preferences.contactTimePreference,
    CONTACT_TIME_LABELS
  );

  return (
    <div className="space-y-4">
      <Section title="Company">
        <FieldRow>
          <Field label="Company name" value={contact.companyName} />
          <Field label="Company address" value={contact.companyAddress} />
          <Field
            label="How did you hear"
            value={
              contact.hearAbout === "Other" && contact.hearAboutOther
                ? `Other — ${contact.hearAboutOther}`
                : humanize(contact.hearAbout, HEARD_ABOUT_LABELS)
            }
          />
        </FieldRow>
      </Section>
      <Section title="Contact information">
        <FieldRow>
          <Field
            label="Full name"
            value={`${contact.firstName || ""} ${
              contact.lastName || ""
            }`.trim()}
          />
          <Field label="Phone" value={contact.phone} />
          <Field label="Email" value={contact.email} />
        </FieldRow>
      </Section>

      <Section title="Business details">
        <FieldRow>
          <Field label="Vehicles count" value={business.vehiclesCount} />
          <Field label="Business type" value={businessType} />
          <Field label="Service frequency" value={frequency} />
        </FieldRow>
      </Section>

      <Section title="Fleet / service setup">
        <FieldRow>
          <Field label="Service location" value={serviceLocation} />
          <Field
            label="Services"
            value={
              Array.isArray(fleet.services) && fleet.services.length
                ? fleet.services.map(prettifyKey).join(", ")
                : ""
            }
          />
          <Field label="Other services" value={fleet.servicesOther} />
        </FieldRow>
      </Section>

      <Section title="Timeline / preferences">
        <FieldRow>
          <Field label="Preferred start date" value={timeline.startDate} />
          <Field label="Preferred contact method" value={contactMethod} />
          <Field label="Best time to contact" value={bestTime} />
        </FieldRow>
        <div className="mt-3">
          <PrimaryText>{preferences.notes}</PrimaryText>
        </div>
      </Section>
    </div>
  );
}

function CleaningResidentialBlocks({ items }) {
  const location = items?.location || {};
  const contact = items?.contact || {};

  const propertyType = humanize(items?.propertyType, RES_PROPERTY_TYPE_LABELS);
  const projectType = humanize(items?.projectType, RES_PROJECT_TYPE_LABELS);

  const areas = Array.isArray(items?.areas) ? items.areas : [];
  const generalTasks = Array.isArray(items?.generalTasks)
    ? items.generalTasks
    : [];
  const kitchenTasks = Array.isArray(items?.kitchenTasks)
    ? items.kitchenTasks
    : [];

  const frequency = humanize(items?.frequency, FREQUENCY_LABELS);
  const budget = humanize(items?.resBudget || items?.budget, BUDGET_LABELS);

  const summaryLines = [
    propertyType && projectType ? `${projectType} (${propertyType}).` : "",
    items?.bedrooms ? `Bedrooms: ${items.bedrooms}.` : "",
    items?.bathrooms ? `Bathrooms: ${items.bathrooms}.` : "",
    frequency ? `Frequency: ${frequency}.` : "",
    budget ? `Estimated budget: ${budget}.` : "",
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <Section
        title="Main info"
        right={
          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-[#FAFAFB] text-[#111827]">
            Cleaning — Residential
          </span>
        }
      >
        <PrimaryText>{summaryLines.join("\n")}</PrimaryText>

        <div className="mt-4">
          <FieldRow>
            <Field label="Property type" value={propertyType} />
            <Field label="Project type" value={projectType} />
            <Field label="Bedrooms" value={items?.bedrooms} />
            <Field label="Bathrooms" value={items?.bathrooms} />
          </FieldRow>
        </div>
      </Section>

      <Section title="Client & Contact">
        <FieldRow>
          <Field
            label="Full name"
            value={`${contact.firstName || ""} ${
              contact.lastName || ""
            }`.trim()}
          />
          <Field label="Phone" value={contact.phone} />
          <Field label="Email" value={contact.email} />
          <Field
            label="How did you hear"
            value={humanize(contact.heardAbout, HEARD_ABOUT_LABELS)}
          />
        </FieldRow>
      </Section>

      <Section title="Address">
        <FieldRow>
          <Field
            label="Base address"
            value={location.baseAddress || items?.baseAddress}
          />
          <Field label="Service address" value={location.service_address} />
          <Field label="Pickup address" value={location.pickup_address} />
          <Field label="Dropoff address" value={location.dropoff_address} />
        </FieldRow>
      </Section>

      <Section title="Areas & Tasks">
        <div className="space-y-4">
          <Chips label="Areas" items={areas.map(prettifyKey)} />
          <Chips label="General tasks" items={generalTasks.map(prettifyKey)} />
          <Chips label="Kitchen tasks" items={kitchenTasks.map(prettifyKey)} />
        </div>
      </Section>

      <Section title="Additional notes">
        <PrimaryText>{items?.extraDetails}</PrimaryText>
      </Section>

      <Section title="Debug">
        <details>
          <summary className="cursor-pointer text-sm font-bold text-[#111827]">
            Show raw form data
          </summary>
          <pre className="mt-3 text-xs bg-[#FAFAFB] border rounded-2xl p-3 overflow-auto">
            {JSON.stringify(items, null, 2)}
          </pre>
        </details>
      </Section>
    </div>
  );
}

function CleaningCommercialBlocks({ items }) {
  const c = items?.cleaningCommercial || {};
  const contact = items?.contact || c?.contact || {};
  const location = items?.location || {};

  const projectTypeKey = items?.projectType;
  const projectType = humanize(projectTypeKey, CLEANING_PROJECT_TYPE_LABELS);

  // Build a client-friendly summary per project type
  const lines = [];

  if (projectTypeKey === "office") {
    const sqft = c.officeSquareFootage ? `${c.officeSquareFootage} sq ft` : "";
    if (sqft) lines.push(`Office cleaning, ${sqft}.`);
    const freq = humanize(c.officeFrequency, FREQUENCY_LABELS);
    if (isFilled(c.officeFrequency)) lines.push(`Frequency: ${freq}.`);
    const bud = humanize(c.officeBudget, BUDGET_LABELS);
    if (isFilled(c.officeBudget)) lines.push(`Estimated budget: ${bud}.`);
    if (isFilled(c.officeStartDate))
      lines.push(`Start date: ${c.officeStartDate}.`);
  }

  if (projectTypeKey === "airbnb") {
    if (isFilled(c.airbnbUnits))
      lines.push(`Airbnb turnover for ${c.airbnbUnits} unit(s).`);
    if (isFilled(c.airbnbTurnover))
      lines.push(
        `Turnover: ${humanize(c.airbnbTurnover, AIRBNB_TURNOVER_LABELS)}.`
      );
    if (isFilled(c.airbnbBudgetPerUnit))
      lines.push(
        `Budget per unit: ${humanize(c.airbnbBudgetPerUnit, BUDGET_LABELS)}.`
      );
    if (isFilled(c.airbnbStartDate))
      lines.push(`Start date: ${c.airbnbStartDate}.`);
  }

  if (projectTypeKey === "post_construction") {
    if (isFilled(c.pcSquareFootage))
      lines.push(`Post-construction cleaning, ${c.pcSquareFootage} sq ft.`);
    if (isFilled(c.pcConstructionType))
      lines.push(
        `Construction type: ${humanize(
          c.pcConstructionType,
          PC_CONSTRUCTION_TYPE_LABELS
        )}.`
      );
    if (isFilled(c.pcFrequency))
      lines.push(`Frequency: ${humanize(c.pcFrequency, FREQUENCY_LABELS)}.`);
    if (isFilled(c.pcBudget))
      lines.push(`Estimated budget: ${humanize(c.pcBudget, BUDGET_LABELS)}.`);
    if (isFilled(c.pcCompletionDate))
      lines.push(`Completion date: ${c.pcCompletionDate}.`);
  }

  if (projectTypeKey === "other") {
    if (isFilled(c.otherProjectOther))
      lines.push(`Commercial cleaning — ${prettifyKey(c.otherProjectOther)}.`);
    if (isFilled(c.otherSquareFootage))
      lines.push(`Approx. size: ${c.otherSquareFootage} sq ft.`);
    if (isFilled(c.otherFrequency))
      lines.push(`Frequency: ${humanize(c.otherFrequency, FREQUENCY_LABELS)}.`);
    if (isFilled(c.otherBudget))
      lines.push(
        `Estimated budget: ${humanize(c.otherBudget, BUDGET_LABELS)}.`
      );
    if (isFilled(c.otherStartDate))
      lines.push(`Start date: ${c.otherStartDate}.`);
  }

  // fallback to any textual summary/description
  const extraText =
    c.projectSummary ||
    c.otherProjectDescription ||
    c.comExtraDetails ||
    items?.comExtraDetails ||
    "";

  const officeAreas = humanizeList(c.officeAreas, OFFICE_AREAS_LABELS);

  return (
    <div className="space-y-4">
      <Section
        title="Main info"
        right={
          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-[#FAFAFB] text-[#111827]">
            {prettifyKey(items?.propertyType || "commercial")} /{" "}
            {projectType || "—"}
          </span>
        }
      >
        <FieldRow>
          <Field label="Company" value={c.companyName || items?.companyName} />
          <Field
            label="Company address"
            value={c.companyAddress || items?.companyAddress}
          />
        </FieldRow>

        <div className="mt-4 space-y-3">
          <PrimaryText>{lines.join("\n")}</PrimaryText>
        </div>
      </Section>

      <Section title="Client & Contact">
        <FieldRow>
          <Field
            label="Full name"
            value={`${contact.firstName || ""} ${
              contact.lastName || ""
            }`.trim()}
          />
          <Field label="Phone" value={contact.phone} />
          <Field label="Email" value={contact.email} />
          <Field
            label="How did you hear"
            value={humanize(c.hearAboutText || c.hearAbout, HEARD_ABOUT_LABELS)}
          />
        </FieldRow>
      </Section>

      <Section title="Address & Logistics">
        <FieldRow>
          <Field
            label="Base address"
            value={location.baseAddress || items?.baseAddress}
          />
          <Field label="Service address" value={location.service_address} />
          <Field label="Pickup address" value={location.pickup_address} />
          <Field label="Dropoff address" value={location.dropoff_address} />
        </FieldRow>
      </Section>

      <Section title="Project details">
        {projectTypeKey === "office" && (
          <>
            <FieldRow>
              <Field label="Square footage" value={c.officeSquareFootage} />
              <Field label="Floors" value={c.officeFloors} />
              <Field label="Restrooms" value={c.officeRestrooms} />
              <Field label="Private offices" value={c.officePrivateOffices} />
              <Field label="Conference rooms" value={c.officeConferenceRooms} />
              <Field
                label="Frequency"
                value={humanize(c.officeFrequency, FREQUENCY_LABELS)}
              />
              <Field
                label="Budget"
                value={humanize(c.officeBudget, BUDGET_LABELS)}
              />
              <Field
                label="One-time budget"
                value={humanize(c.officeOneTimeBudget, BUDGET_LABELS)}
              />
              <Field label="Start date" value={c.officeStartDate} />
            </FieldRow>
            <div className="mt-4">
              <Chips label="Office areas" items={officeAreas} />
            </div>
          </>
        )}

        {projectTypeKey === "airbnb" && (
          <>
            <FieldRow>
              <Field label="Units" value={c.airbnbUnits} />
              <Field label="Avg. sq ft" value={c.airbnbAvgSqft} />
              <Field label="Avg. bedrooms" value={c.airbnbAvgBedrooms} />
              <Field label="Avg. bathrooms" value={c.airbnbAvgBathrooms} />
              <Field
                label="Turnover"
                value={humanize(c.airbnbTurnover, AIRBNB_TURNOVER_LABELS)}
              />
              <Field
                label="Budget per unit"
                value={humanize(c.airbnbBudgetPerUnit, BUDGET_LABELS)}
              />
              <Field
                label="Linen / Laundry"
                value={humanize(c.airbnbLinenLaundry, AIRBNB_LINEN_LABELS)}
              />
              <Field label="Start date" value={c.airbnbStartDate} />
            </FieldRow>
            <div className="mt-4 space-y-4">
              <Chips
                label="Property types"
                items={humanizeList(c.airbnbPropertyTypes)}
              />
              <Chips label="Areas" items={humanizeList(c.airbnbAreas)} />
              <Chips
                label="Kitchen tasks"
                items={humanizeList(c.airbnbKitchenTasks)}
              />
            </div>
          </>
        )}

        {projectTypeKey === "post_construction" && (
          <>
            <FieldRow>
              <Field
                label="Construction type"
                value={humanize(
                  c.pcConstructionType,
                  PC_CONSTRUCTION_TYPE_LABELS
                )}
              />
              <Field label="Square footage" value={c.pcSquareFootage} />
              <Field label="Floors" value={c.pcFloors} />
              <Field
                label="Frequency"
                value={humanize(c.pcFrequency, FREQUENCY_LABELS)}
              />
              <Field
                label="Budget"
                value={humanize(c.pcBudget, BUDGET_LABELS)}
              />
              <Field label="Completion date" value={c.pcCompletionDate} />
            </FieldRow>
            <div className="mt-4">
              <Chips label="Surfaces" items={humanizeList(c.pcSurfaces)} />
            </div>
          </>
        )}

        {projectTypeKey === "other" && (
          <>
            <FieldRow>
              <Field
                label="Project type"
                value={prettifyKey(c.otherProjectOther)}
              />
              <Field label="Square footage" value={c.otherSquareFootage} />
              <Field label="Floors" value={c.otherFloors} />
              <Field label="Restrooms" value={c.otherRestrooms} />
              <Field
                label="Service type"
                value={prettifyKey(c.otherCleaningService)}
              />
              <Field
                label="Frequency"
                value={humanize(c.otherFrequency, FREQUENCY_LABELS)}
              />
              <Field
                label="Budget"
                value={humanize(c.otherBudget, BUDGET_LABELS)}
              />
              <Field
                label="Contract type"
                value={prettifyKey(c.otherContractType)}
              />
              <Field label="Start date" value={c.otherStartDate} />
              <Field
                label="Urgent"
                value={humanize(String(c.otherUrgent), YES_NO_LABELS)}
              />
            </FieldRow>

            <div className="mt-4 space-y-4">
              <PrimaryText>{c.otherProjectDescription}</PrimaryText>
              <Chips label="Areas" items={humanizeList(c.otherAreas)} />
            </div>
          </>
        )}

        {!projectTypeKey && (
          <PrimaryText>
            Project type is missing. Check request payload.
          </PrimaryText>
        )}
      </Section>

      <Section title="Debug">
        <details>
          <summary className="cursor-pointer text-sm font-bold text-[#111827]">
            Show raw form data
          </summary>
          <pre className="mt-3 text-xs bg-[#FAFAFB] border rounded-2xl p-3 overflow-auto">
            {JSON.stringify(items, null, 2)}
          </pre>
        </details>
      </Section>
    </div>
  );
}

function FormsClientsDetails({ items, row }) {
  const firstName = items?.firstName || items?.contact?.firstName || "";
  const lastName = items?.lastName || items?.contact?.lastName || "";
  const email = items?.email || row?.user_email || "";
  const phone = items?.phone || row?.user_phone || "";

  const service = items?.service || "—";
  const pagePath = items?.pagePath || items?.page_path || "—";
  const desc = items?.description || items?.message || "—";

  return (
    <div className="space-y-4">
      <Section title="Client">
        <FieldRow>
          <Field
            label="Full name"
            value={
              `${firstName} ${lastName}`.trim() || row?.user_full_name || "—"
            }
          />
          <Field label="Email" value={email} />
          <Field label="Phone" value={phone} />
        </FieldRow>
      </Section>

      <Section title="Form">
        <FieldRow>
          <Field label="Service" value={service} />
          <Field label="Page" value={pagePath} />
        </FieldRow>
      </Section>

      <Section title="Message">
        <PrimaryText>{desc}</PrimaryText>
      </Section>
    </div>
  );
}

/* ================== UI HELPERS ================== */

function Card({ title, children, strong = false }) {
  return (
    <div
      className={`border rounded-3xl p-4 shadow-sm bg-white`}
      style={strong ? { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[12px] text-[#6B7280] uppercase font-extrabold tracking-wide">
          {title}
        </div>
      </div>

      <div className="mt-3">{children}</div>
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-[99999999]">
      {/* Backdrop: dark + blur */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 sm:p-6">
        <div
          className="
            w-full sm:w-[min(820px,96vw)]
            bg-white border shadow-2xl
            rounded-3xl
            overflow-hidden
          "
          style={{ maxHeight: "92vh" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b bg-white">
            <div className="min-w-0">
              <div className="text-[12px] text-[#6B7280] uppercase font-semibold">
                {title || "Details"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 rounded-2xl border bg-white text-lg leading-none font-semibold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            className="px-4 sm:px-6 py-4 overflow-auto"
            style={{ maxHeight: "calc(92vh - 70px)" }}
          >
            {children}
          </div>

          <div className="sm:hidden px-4 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-2xl border bg-white text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-[min(360px,88vw)] bg-white shadow-xl border-r">
        <div className="p-3 flex justify-end border-b">
          <button
            className="h-10 px-4 rounded-2xl border bg-white text-sm font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
