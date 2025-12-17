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

function isDetailing(serviceType = "") {
  return String(serviceType).startsWith("detailing_quote");
}
function isCleaning(serviceType = "") {
  return String(serviceType).startsWith("cleaning_quote");
}

function categoryLabelFromServiceType(serviceType = "") {
  const st = String(serviceType);
  const found = MENU_ITEMS.find((i) => i.key === st);
  return found?.label || st || "Unknown";
}

function pickFirst(...vals) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object") return v; // якщо раптом треба
  }
  return "";
}

function getContact(items = {}, row = {}) {
  // можливі структури
  const c1 = items?.contact || {};
  const c2 = items?.contactInfo || {};
  const c3 = items?.customer || {};
  const c4 = items?.business?.contact || {};
  const c5 = items?.personal?.contact || {};
  const c6 = items?.fleet?.contact || {};

  const firstName = pickFirst(c1.firstName, c2.firstName, c3.firstName, c4.firstName, c5.firstName, c6.firstName);
  const lastName  = pickFirst(c1.lastName,  c2.lastName,  c3.lastName,  c4.lastName,  c5.lastName,  c6.lastName);

  const email = pickFirst(
    c1.email, c2.email, c3.email, c4.email, c5.email, c6.email,
    row.user_email
  );

  const phone = pickFirst(
    c1.phone, c2.phone, c3.phone, c4.phone, c5.phone, c6.phone,
    row.user_phone
  );

  const companyName = pickFirst(
    c1.companyName, c2.companyName, c3.companyName, c4.companyName
  );

  const heardAbout = c1.heardAbout ?? c2.heardAbout ?? c3.heardAbout ?? c4.heardAbout ?? "";
  const heardOther = c1.heardOther ?? c2.heardOther ?? c3.heardOther ?? c4.heardOther ?? "";

  const fullName =
    pickFirst(
      `${firstName} ${lastName}`.trim(),
      row.user_full_name
    ) || "—";

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


function summarizeType(serviceType, items) {
  if (isDetailing(serviceType)) {
    const vehicle = items?.vehicle || {};
    const y = vehicle.year || "";
    const m = vehicle.make || "";
    const mo = vehicle.model || "";
    const s = `${y} ${m} ${mo}`.trim();
    return s || "Detailing";
  }

  if (isCleaning(serviceType)) {
    const pt = items?.propertyType;
    const pr = items?.projectType;
    const t = [pt, pr].filter(Boolean).join(" • ");
    return t || "Cleaning";
  }

  return "Request";
}

function stringifyHeardAbout(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  return String(v);
}

function matchesSearch(row, items, term) {
  if (!term) return true;
  const t = term.toLowerCase().trim();
  if (!t) return true;

  const contact = items?.contact || {};
  const vehicle = items?.vehicle || {};
  const notes = row?.notes_customer || "";
  const adminNote = row?.notes_admin || "";

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
    `${vehicle?.year || ""} ${vehicle?.make || ""} ${vehicle?.model || ""}`.trim(),
    notes,
    adminNote,
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();

  return hay.includes(t);
}

// ✅ Витягуємо pickup адрес “де б він не лежав”
function getPickupAddress(items = {}) {
  const loc = items?.location || {};
  const fleet = items?.fleet || {};
  const contact = items?.contact || {};

  // можливі варіанти з твоїх кроків
  return (
    loc?.pickupAddress ||
    loc?.pickup_address ||
    items?.pickupAddress ||
    items?.pickup_address ||
    fleet?.pickupAddress ||
    fleet?.pickup_address ||
    // інколи кладуть в baseAddress, якщо pickup/mobile
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

export default function AdminRequests() {
  const [activeMenu, setActiveMenu] = useState("detailing_quote_personal");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [counts, setCounts] = useState({});
  const activeIsUsers = activeMenu === "users";

  // локальні поля редагування в деталях
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

  // ✅ універсальне збереження (статус + нотатка, якщо бекенд дозволяє)
  const saveEdits = async () => {
    if (!selectedRow) return;

    try {
      await adminReqApi.save({
        id: selectedRow.id,
        status: editStatus,
        notes_admin: editAdminNote, // якщо бекенд підтримує
      });

      await loadBookings();
      await loadCounts();

      // оновлюємо selectedRow по свіжим даним
      const fresh = await adminReqApi.list({
        service_type: selectedRow.service_type,
        status: statusFilter || undefined,
      });
      const found = Array.isArray(fresh)
        ? fresh.find((x) => x.id === selectedRow.id)
        : null;
      if (found) setSelectedRow(found);
    } catch (e) {
      alert(
        e?.error ||
          e?.message ||
          "Failed to save. If you want admin notes editing, we need to support notes_admin in backend."
      );
    }
  };

  const activeTitle =
    MENU_ITEMS.find((i) => i.key === activeMenu)?.label || "Requests";

  const Header = (
    <div className="sticky top-0 z-30 bg-[#F4F4F5]/80 backdrop-blur border-b border-[#E5E7EB]">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        {/* left */}
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

        {/* right */}
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
              <option value="new">new</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
              <option value="rejected">rejected</option>
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
                <span className={`min-w-[32px] h-[22px] px-2 rounded-full text-xs flex items-center justify-center ${active ? "bg-black/10" : "bg-gray-100"}`}>
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
    return <div className="p-6 bg-white rounded-3xl border">No requests found.</div>;
  }

  const openDetails = (row) => {
    setSelectedRow(row);
    setDetailsOpen(true);
  };

  return (
    <>
      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {filtered.map(({ row: r, items }) => {
          const contact = getContact(items, r);
          const serviceType = r.service_type || activeMenu;

          const pickupAddr = getPickupAddress(items);
          const locationType = getServiceLocationType(items, "");

          return (
            <div
              key={r.id}
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
                    <div className="text-xs text-[#6B7280] truncate">{contact.email}</div>
                  ) : null}

                  {contact.phone ? (
                    <div className="text-xs text-[#6B7280] truncate">{contact.phone}</div>
                  ) : null}
                </div>

                <span className="px-2 py-1 rounded-full text-xs border bg-white capitalize">
                  {r.status || "—"}
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

              {(locationType || pickupAddr) && (
                <div className="mt-3 text-xs text-[#4B5563]">
                  {locationType ? <div>Location: {locationType}</div> : null}
                  {pickupAddr ? <div className="truncate">Pickup address: {pickupAddr}</div> : null}
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
      <div className="hidden md:block overflow-x-auto bg-white rounded-3xl border">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-[#6B7280] text-xs">
              <th className="p-3">ID</th>
              <th className="p-3">Created</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Service</th>
              <th className="p-3">Status</th>
              <th className="p-3">Pickup address</th>
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
                  key={r.id}
                  className="border-b hover:bg-[#FAFAFB] cursor-pointer"
                  onClick={() => openDetails(r)}
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
                      <div className="text-xs text-gray-500">{contact.email}</div>
                    ) : null}
                    {contact.phone ? (
                      <div className="text-xs text-gray-500">{contact.phone}</div>
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

                  <td className="p-3 capitalize">{r.status || "—"}</td>

                  <td className="p-3">
                    <div className="text-xs text-[#4B5563] max-w-[260px] truncate">
                      {pickupAddr || "—"}
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


  const DetailsPanel = () => {
    if (!selectedRow) {
      return (
        <div className="hidden lg:flex flex-col w-[420px] shrink-0 border-l bg-white">
          <div className="p-6 border-b">
            <div className="text-xs text-[#9CA3AF] uppercase">
              Details
            </div>
            <div className="text-lg font-extrabold text-[#111827] mt-1">
              Select a request
            </div>
            <div className="text-sm text-[#6B7280] mt-2">
              Click a row to preview and edit status fast.
            </div>
          </div>
          <div className="p-6 text-sm text-[#6B7280]">
            Tip: search by phone/email, then update status in one click.
          </div>
        </div>
      );
    }

    const items = safeJsonParse(selectedRow.items_json, {});
    const serviceType = selectedRow.service_type || "";
    const contact = items?.contact || {};
    const heardAboutText = stringifyHeardAbout(contact?.heardAbout);

    const pickupAddr = getPickupAddress(items);
    const locationType = getServiceLocationType(items, "");

    return (
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 border-l bg-white">
        <div className="p-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-[#6B7280]">
                Request #{selectedRow.id}
              </div>
              <div className="text-lg font-extrabold text-[#111827] truncate">
                {categoryLabelFromServiceType(serviceType)}
              </div>
              <div className="text-xs text-[#9CA3AF] mt-1">
                Created: {formatDateTime(selectedRow.created_at)}
              </div>
            </div>

            <button
              className="h-10 px-4 rounded-2xl border bg-white text-sm font-semibold"
              onClick={() => setSelectedRow(null)}
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-5 overflow-auto flex-1">
          <Card title="Customer">
            <div className="font-semibold text-[#111827]">
              {`${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
                selectedRow.user_full_name ||
                "—"}
            </div>
            <div className="text-sm text-[#4B5563] mt-1 space-y-1">
              {(contact.phone || selectedRow.user_phone) ? (
                <div>📞 {contact.phone || selectedRow.user_phone}</div>
              ) : null}
              {(contact.email || selectedRow.user_email) ? (
                <div>✉️ {contact.email || selectedRow.user_email}</div>
              ) : null}
              {heardAboutText ? <div>Heard: {heardAboutText}</div> : null}
              {contact.extraInfo ? <div>Note: {contact.extraInfo}</div> : null}
            </div>
          </Card>

          {(locationType || pickupAddr) && (
            <Card title="Location">
              {locationType ? <div>Type: {locationType}</div> : null}
              {pickupAddr ? (
                <div className="mt-1">
                  <div className="text-xs text-[#6B7280]">Pick-up address</div>
                  <div className="font-semibold text-[#111827]">{pickupAddr}</div>
                </div>
              ) : (
                <div className="text-sm text-[#6B7280]">—</div>
              )}
            </Card>
          )}

          <Card title="Status & Internal note">
            <div className="grid gap-3">
              <div>
                <div className="text-xs text-[#6B7280] mb-1">Status</div>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="h-11 w-full px-3 rounded-2xl border bg-white text-sm outline-none"
                >
                  <option value="new">new</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <div>
                <div className="text-xs text-[#6B7280] mb-1">
                  Admin note (for staff)
                </div>
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

            {(serviceType === "cleaning_quote_residential" ||
              serviceType === "cleaning_quote_commercial") && (
              <CleaningDetails items={items} />
            )}

            {!serviceType && (
              <pre className="text-xs bg-gray-50 border rounded-2xl p-3 overflow-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
            )}
          </Card>

          {selectedRow.notes_customer ? (
            <Card title="Customer notes">
              <div className="text-sm text-[#4B5563]">
                {selectedRow.notes_customer}
              </div>
            </Card>
          ) : null}

          <div className="mt-4">
            <button
              onClick={() => deleteBooking(selectedRow)}
              className="h-11 w-full rounded-2xl border bg-white text-sm font-semibold"
            >
              Delete request
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile details modal
  const MobileDetailsModal = () => {
    if (!selectedRow) return null;

    const items = safeJsonParse(selectedRow.items_json, {});
    const serviceType = selectedRow.service_type || "";
    const contact = items?.contact || {};
    const heardAboutText = stringifyHeardAbout(contact?.heardAbout);
    const pickupAddr = getPickupAddress(items);
    const locationType = getServiceLocationType(items, "");

    return (
      <Modal onClose={() => setSelectedRow(null)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-[#6B7280]">Request #{selectedRow.id}</div>
            <div className="text-lg font-extrabold text-[#111827]">
              {categoryLabelFromServiceType(serviceType)}
            </div>
            <div className="text-xs text-[#9CA3AF] mt-1">
              Created: {formatDateTime(selectedRow.created_at)}
            </div>
          </div>

          <button
            className="h-10 px-4 rounded-2xl border bg-white text-sm font-semibold"
            onClick={() => setSelectedRow(null)}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <Card title="Customer">
            <div className="font-semibold text-[#111827]">
              {`${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
                selectedRow.user_full_name ||
                "—"}
            </div>
            <div className="text-sm text-[#4B5563] mt-1 space-y-1">
              {(contact.phone || selectedRow.user_phone) ? (
                <div>📞 {contact.phone || selectedRow.user_phone}</div>
              ) : null}
              {(contact.email || selectedRow.user_email) ? (
                <div>✉️ {contact.email || selectedRow.user_email}</div>
              ) : null}
              {heardAboutText ? <div>Heard: {heardAboutText}</div> : null}
            </div>
          </Card>

          {(locationType || pickupAddr) && (
            <Card title="Location">
              {locationType ? <div>Type: {locationType}</div> : null}
              {pickupAddr ? <div>Pickup address: {pickupAddr}</div> : <div>—</div>}
            </Card>
          )}

          <Card title="Status & Internal note">
            <div className="grid gap-3">
              <div>
                <div className="text-xs text-[#6B7280] mb-1">Status</div>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="h-11 w-full px-3 rounded-2xl border bg-white text-sm outline-none"
                >
                  <option value="new">new</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                  <option value="rejected">rejected</option>
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

            {(serviceType === "cleaning_quote_residential" ||
              serviceType === "cleaning_quote_commercial") && (
              <CleaningDetails items={items} />
            )}

            {!serviceType && (
              <pre className="text-xs bg-gray-50 border rounded-2xl p-3 overflow-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
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
    <div className="min-h-screen w-full bg-[#F4F4F5] flex">
      {Sidebar}

      <div className="flex-1 min-w-0">
        {Header}

        <div className="px-4 sm:px-6 py-5">
<div className="grid gap-5">
  <div className="min-w-0">
    <ListArea />
  </div>
</div>
        </div>
      </div>

      {/* mobile drawer + mobile details modal */}
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
  const multiple = items?.multipleVehicles || {};

  const conditionFlags = Array.isArray(history?.conditionFlags)
    ? history.conditionFlags
    : [];
  const selectedServices = Array.isArray(services?.selected)
    ? services.selected
    : [];

    const Block = ({ title, children }) => (
  <div className="border rounded-2xl p-3 bg-[#FAFAFB]">
    <div className="text-xs font-extrabold text-[#111827] uppercase tracking-wide">
      {title}
    </div>
    <div className="mt-2 text-sm text-[#4B5563] space-y-1">{children}</div>
  </div>
);


return (
  <div className="space-y-3">
    <Block title="Vehicle">
      <div className="font-semibold text-[#111827]">
        {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—"}
      </div>
      {vehicle.color && <div>Color: {vehicle.color}</div>}
      {vehicle.seatMaterial && <div>Seat material: {vehicle.seatMaterial}</div>}
    </Block>

    <Block title="Condition">
      {history.lastDetailed && <div>Last detailed: {history.lastDetailed}</div>}
      {history.conditionRating && <div>Condition rating: {history.conditionRating}</div>}
      {conditionFlags.length ? (
        <ul className="list-disc pl-5">
          {conditionFlags.map((f) => <li key={f}>{f}</li>)}
        </ul>
      ) : (
        <div className="text-[#6B7280]">No condition issues selected.</div>
      )}
      {history.other && <div>Other: {history.other}</div>}
    </Block>

    <Block title="Services">
      {selectedServices.length ? (
        <div>{selectedServices.join(", ")}</div>
      ) : (
        <div className="text-[#6B7280]">No services selected.</div>
      )}
      {services.other ? <div>Other: {services.other}</div> : null}
    </Block>
  </div>
);

}

function DetailingBusinessDetails({ items }) {
  const business = items?.business || {};
  const contact = items?.contact || {};
  const fleet = items?.fleet || {};
  const timeline = items?.timeline || {};
  const preferences = items?.preferences || {};

  return (
    <div className="text-sm text-[#4B5563] space-y-3">
      <div>
        <div className="text-xs text-[#6B7280]">Company</div>
        {contact.companyName && <div>Company: {contact.companyName}</div>}
        {contact.companyAddress && <div>Company address: {contact.companyAddress}</div>}
        {(contact.hearAbout || contact.hearAboutOther) ? (
          <div>
            Heard about us:{" "}
            {contact.hearAbout === "Other" && contact.hearAboutOther
              ? `${contact.hearAbout} — ${contact.hearAboutOther}`
              : contact.hearAbout}
          </div>
        ) : null}
      </div>

      <div>
        <div className="text-xs text-[#6B7280]">Business details</div>
        {business.vehiclesCount && <div>Vehicles count: {business.vehiclesCount}</div>}
        {business.businessType && (
          <div>
            Business type:{" "}
            {business.businessType === "Other" && business.businessTypeOther
              ? `${business.businessType} — ${business.businessTypeOther}`
              : business.businessType}
          </div>
        )}
        {business.serviceFrequency && (
          <div>
            Frequency:{" "}
            {business.serviceFrequency === "Other" && business.serviceFrequencyOther
              ? `${business.serviceFrequency} — ${business.serviceFrequencyOther}`
              : business.serviceFrequency}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs text-[#6B7280]">Fleet / Services</div>
        {fleet.serviceLocation && <div>Service location: {fleet.serviceLocation}</div>}
        {Array.isArray(fleet.services) && fleet.services.length ? (
          <div>Services: {fleet.services.join(", ")}</div>
        ) : (
          <div>No services listed.</div>
        )}
        {fleet.servicesOther && <div>Other services: {fleet.servicesOther}</div>}
      </div>

      <div>
        <div className="text-xs text-[#6B7280]">Timeline / Preferences</div>
        {timeline.startDate && <div>Preferred start date: {timeline.startDate}</div>}
        {preferences.preferredContactMethod && (
          <div>Preferred contact method: {preferences.preferredContactMethod}</div>
        )}
        {preferences.contactTimePreference && (
          <div>Best time: {preferences.contactTimePreference}</div>
        )}
        {preferences.notes && <div>Notes: {preferences.notes}</div>}
      </div>
    </div>
  );
}

function CleaningDetails({ items }) {
  const location = items?.location || {};

  return (
    <div className="text-sm text-[#4B5563] space-y-2">
      {items.propertyType && <div>Property type: {items.propertyType}</div>}
      {items.projectType && <div>Project type: {items.projectType}</div>}

      {(items.bedrooms || items.bathrooms) && (
        <div>
          Bedrooms: {items.bedrooms || 0}, Bathrooms: {items.bathrooms || 0}
        </div>
      )}

      {items.companyName && <div>Company: {items.companyName}</div>}
      {items.companyAddress && <div>Company address: {items.companyAddress}</div>}
      {items.squareFeet && <div>Square feet: {items.squareFeet}</div>}
      {items.frequency && <div>Frequency: {items.frequency}</div>}

      {Array.isArray(items.areas) && items.areas.length ? (
        <div>Areas: {items.areas.join(", ")}</div>
      ) : null}

      {Array.isArray(items.generalTasks) && items.generalTasks.length ? (
        <div>General tasks: {items.generalTasks.join(", ")}</div>
      ) : null}

      {Array.isArray(items.kitchenTasks) && items.kitchenTasks.length ? (
        <div>Kitchen tasks: {items.kitchenTasks.join(", ")}</div>
      ) : null}

      {items.resBudget && <div>Budget (res): {items.resBudget}</div>}
      {items.comBudget && <div>Budget (com): {items.comBudget}</div>}
      {items.dueDate && <div>Due date: {items.dueDate}</div>}
      {items.extraDetails && <div>Extra details: {items.extraDetails}</div>}
      {items.comExtraDetails && <div>Commercial details: {items.comExtraDetails}</div>}

      {(location.baseAddress || items?.baseAddress) && (
        <div>Address: {location.baseAddress || items.baseAddress}</div>
      )}
    </div>
  );
}

/* ================== UI HELPERS ================== */

function Card({ title, children, strong = false }) {
  return (
    <div
      className={`border rounded-3xl p-4 shadow-sm ${
        strong ? "bg-white" : "bg-white"
      }`}
      style={
        strong
          ? { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }
          : undefined
      }
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
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      {/* wrapper */}
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 sm:p-6">
        {/* card */}
        <div
          className="
            w-full sm:w-[min(820px,96vw)]
            bg-white border shadow-xl
            rounded-3xl sm:rounded-3xl
            overflow-hidden
          "
          style={{
            maxHeight: "92vh", // ✅ модалка ніколи не вилізе за екран
          }}
        >
          {/* header */}
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
                className="hidden sm:inline-flex h-10 px-4 rounded-2xl border bg-white text-sm font-semibold"
              >
                Close
              </button>

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

          {/* body scroll */}
          <div className="px-4 sm:px-6 py-4 overflow-auto" style={{ maxHeight: "calc(92vh - 70px)" }}>
            {children}
          </div>

          {/* mobile footer close */}
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
