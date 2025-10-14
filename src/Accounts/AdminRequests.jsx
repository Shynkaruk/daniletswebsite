import React, { useEffect, useMemo, useState } from "react";
import { adminReqApi, cardsApi } from "../lib/api";

const gradient =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// 3 request statuses
const UI_STATUSES = ["confirmed", "cancelled", "done"];
const TABS = ["confirmed", "cancelled", "done", "services"];
const CATEGORIES = [
  { key: "cleaning", label: "Cleaning" },
  { key: "detailing", label: "Detailing" },
  { key: "media", label: "Media" },
  { key: "pickleball", label: "Pickleball" },
];
const TYPE_TABS = ["service", "addon"];

/* ================= MAIN ================= */

export default function AdminRequests() {
  const [activeTab, setActiveTab] = useState("confirmed");
  const [svcTypeTab, setSvcTypeTab] = useState("service"); // "service" | "addon"
  const [svcCategory, setSvcCategory] = useState(""); // "" = All

  // ----- requests state -----
  const [lists, setLists] = useState({
    confirmed: [],
    cancelled: [],
    done: [],
  });
  const [reqLoading, setReqLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  // ----- services state -----
  const [svcLoading, setSvcLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [svcEditing, setSvcEditing] = useState(null); // {id?, title, price, sphere, type}

  /* -------- Requests: load all 3 -------- */
  const loadAllReq = async () => {
    setReqLoading(true);
    try {
      const [cf, cc, dn] = await Promise.all([
        adminReqApi.list({ status: "confirmed" }),
        adminReqApi.list({ status: "cancelled" }),
        adminReqApi.list({ status: "done" }),
      ]);
      setLists({ confirmed: cf || [], cancelled: cc || [], done: dn || [] });
    } finally {
      setReqLoading(false);
    }
  };
  useEffect(() => {
    loadAllReq();
  }, []);

  const upsertReqIntoTab = (row, statusKey) => {
    setLists((prev) => {
      const next = {
        confirmed: prev.confirmed.filter((x) => x.id !== row.id),
        cancelled: prev.cancelled.filter((x) => x.id !== row.id),
        done: prev.done.filter((x) => x.id !== row.id),
      };
      next[statusKey] = [row, ...next[statusKey]];
      return next;
    });
  };

  const onSaveReq = async () => {
    const saved = await adminReqApi.save(editing);
    setEditing(null);
    const key = UI_STATUSES.includes(saved.status) ? saved.status : "confirmed";
    upsertReqIntoTab(saved, key);
  };

  const onNewReq = () =>
    setEditing({
      user_id: "",
      status: "confirmed",
      location_type: "shop",
      items_json: "[]",
    });

  /* -------- Services: load -------- */
  const loadServices = async () => {
    setSvcLoading(true);
    try {
      // тягнемо потрібний тип (service | addon)
      const rows = await cardsApi.list({ type: svcTypeTab });
      const filtered = Array.isArray(rows)
        ? rows
            // фільтр по категорії (slug зберігає category key)
            .filter((r) => !svcCategory || (r.slug || "") === svcCategory)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        : [];
      setServices(filtered);
    } finally {
      setSvcLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "services") loadServices();
  }, [activeTab, svcTypeTab, svcCategory]);

  const onSaveService = async () => {
    try {
      // валідація
      const title = (svcEditing?.title || "").trim();
      const sphere = (svcEditing?.sphere || "").trim(); // cleaning/detailing/media/pickleball
      const price = Number(svcEditing?.price ?? 0);
      if (!title) return alert("Please enter the service title.");
      if (!sphere) return alert("Please select the type (sphere).");
      if (Number.isNaN(price)) return alert("Price must be a number.");

      // визначаємо тип без сюрпризів (враховано add-ons)
      const type = (svcEditing?.type || svcTypeTab || "service").toString();

      // payload — тільки потрібні поля
      const payload = {
        id: svcEditing?.id, // якщо є — оновимо, якщо ні — створимо
        type,               // "service" | "addon"
        title,
        price,
        slug: sphere,       // категорія зберігається у slug
      };

      const saved = await cardsApi.save(payload);
      setSvcEditing(null);
      await loadServices();
      return saved;
    } catch (e) {
      console.error("Save service failed:", e);
      const msg =
        (e && (e.error || e.message)) ||
        "Failed to save the service. Please try again.";
      alert(msg);
    }
  };

  const onDeleteService = async (row) => {
    if (!confirm(`Delete service "${row.title}"?`)) return;
    await cardsApi.remove(row.id);
    await loadServices();
  };

  /* -------- header counters -------- */
  const counters = {
    confirmed: lists.confirmed?.length || 0,
    cancelled: lists.cancelled?.length || 0,
    done: lists.done?.length || 0,
  };

  const activeList = useMemo(
    () => (activeTab === "services" ? [] : lists[activeTab] || []),
    [lists, activeTab]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-28">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-extrabold">Admin • Requests</h1>
        {activeTab !== "services" ? (
          <button
            onClick={onNewReq}
            className="px-5 py-3 rounded-[14px] font-semibold text-black"
            style={{ background: gradient }}
          >
            New Request
          </button>
        ) : (
          <button
            onClick={() =>
              setSvcEditing({
                id: undefined,
                title: "",
                price: 0,
                sphere: svcCategory || "", // підставимо активний фільтр як дефолт
                type: svcTypeTab,          // враховуємо додаткові послуги (add-ons)
              })
            }
            className="px-5 py-3 rounded-[14px] font-semibold text-black"
            style={{ background: gradient }}
          >
            New Service
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="w-full mb-6 overflow-auto">
        <div className="inline-flex gap-2 bg-[#F2F2F2] rounded-full p-1">
          {TABS.map((t) => {
            const isActive = activeTab === t;
            const count =
              t === "services"
                ? undefined
                : counters[t]
                ? ` (${counters[t]})`
                : "";
            const label = t === "services" ? "Services & Prices" : t;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={[
                  "px-6 py-3 rounded-full text-[16px] font-semibold transition whitespace-nowrap",
                  isActive
                    ? "bg-white shadow text-[#18181B]"
                    : "text-[#5E5E61] hover:text-[#18181B]",
                ].join(" ")}
              >
                {label}
                {count || ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------- Requests lists -------- */}
      {activeTab !== "services" &&
        (reqLoading ? (
          <div className="text-[#6B7280]">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {activeList.map((r) => (
              <RequestCard
                key={r.id}
                row={r}
                onEdit={() => setEditing(r)}
                onStatusChange={async (s) => {
                  const updated = await adminReqApi.save({ ...r, status: s });
                  const key = UI_STATUSES.includes(updated.status)
                    ? updated.status
                    : "confirmed";
                  upsertReqIntoTab(updated, key);
                }}
              />
            ))}
            {!activeList.length && (
              <div className="text-[#6B7280]">No requests in this tab.</div>
            )}
          </div>
        ))}

      {/* -------- Services tab -------- */}
      {activeTab === "services" && (
        <div className="bg-white rounded-2xl border border-[#eee] shadow-sm">
          <div className="p-4 flex items-center gap-3 flex-wrap">
            <div className="font-bold mr-auto">Services & Prices</div>

            {/* Type tabs */}
            <div className="inline-flex gap-2 bg-[#F2F2F2] rounded-full p-1">
              {TYPE_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSvcTypeTab(t)}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-semibold",
                    svcTypeTab === t
                      ? "bg-white shadow text-[#18181B]"
                      : "text-[#5E5E61]",
                  ].join(" ")}
                >
                  {t === "service" ? "Services" : "Add-ons"}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="inline-flex gap-2 bg-[#F2F2F2] rounded-full p-1">
              <button
                onClick={() => setSvcCategory("")}
                className={[
                  "px-4 py-2 rounded-full text-sm font-semibold",
                  svcCategory === ""
                    ? "bg-white shadow text-[#18181B]"
                    : "text-[#5E5E61]",
                ].join(" ")}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSvcCategory(c.key)}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-semibold",
                    svcCategory === c.key
                      ? "bg-white shadow text-[#18181B]"
                      : "text-[#5E5E61]",
                  ].join(" ")}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={loadServices}
              className="px-3 py-2 rounded-xl border bg-white"
            >
              Refresh
            </button>
            <button
              onClick={() =>
                setSvcEditing({
                  id: undefined,
                  title: "",
                  price: 0,
                  sphere: svcCategory || "",
                  type: svcTypeTab, // уніфіковано
                })
              }
              className="px-5 py-2 rounded-[12px] font-semibold text-black"
              style={{ background: gradient }}
            >
              New {svcTypeTab === "service" ? "Service" : "Add-on"}
            </button>
          </div>

          {svcLoading ? (
            <div className="px-4 pb-4 text-[#6B7280]">Loading…</div>
          ) : (
            <div className="p-4 pt-0">
              {services.length === 0 ? (
                <div className="text-[#6B7280]">No items yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[860px]">
                    <thead>
                      <tr className="text-[#6B7280] text-sm border-b">
                        <th className="py-3 pr-3">Title</th>
                        <th className="py-3 pr-3">Category</th>
                        <th className="py-3 pr-3">Price</th>
                        <th className="py-3 pr-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr key={s.id} className="border-b last:border-b-0">
                          <td className="py-3 pr-3">{s.title}</td>
                          <td className="py-3 pr-3">
                            {CATEGORIES.find((c) => c.key === (s.slug || ""))?.label || "—"}
                          </td>
                          <td className="py-3 pr-3">
                            ${(s.price ?? 0).toFixed(2)}
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="px-3 py-2 rounded-xl border bg-white"
                                onClick={() =>
                                  setSvcEditing({
                                    id: s.id,
                                    title: s.title || "",
                                    price: s.price ?? 0,
                                    sphere: s.slug || "", // «тип(сфера)»
                                    type: s.type || svcTypeTab, // ✅ зберігаємо тип (service/addon)
                                  })
                                }
                              >
                                Edit
                              </button>
                              <button
                                className="px-3 py-2 rounded-xl border bg-white"
                                onClick={() => onDeleteService(s)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------- Request Modal -------- */}
      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              Edit Request #{editing.id ?? "new"}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl border bg-white"
              >
                Cancel
              </button>
              <button
                onClick={onSaveReq}
                className="px-4 py-2 rounded-xl font-semibold text-black"
                style={{ background: gradient }}
              >
                Save
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="User ID"
              value={editing.user_id || ""}
              onChange={(v) => setEditing({ ...editing, user_id: v })}
            />
            <Select
              label="Status"
              value={editing.status}
              options={UI_STATUSES}
              onChange={(v) => setEditing({ ...editing, status: v })}
            />
            <Select
              label="Location Type"
              value={editing.location_type}
              options={["shop", "mobile", "pickup"]}
              onChange={(v) => setEditing({ ...editing, location_type: v })}
            />
            <Field
              label="Service Date"
              value={editing.service_date || ""}
              onChange={(v) => setEditing({ ...editing, service_date: v })}
            />
            <Field
              label="Time Window"
              value={editing.time_window || ""}
              onChange={(v) => setEditing({ ...editing, time_window: v })}
            />
            <Field
              label="Service address"
              value={editing.service_address || ""}
              onChange={(v) => setEditing({ ...editing, service_address: v })}
            />
            <Field
              label="Pickup address"
              value={editing.pickup_address || ""}
              onChange={(v) => setEditing({ ...editing, pickup_address: v })}
            />
            <Field
              label="Drop-off address"
              value={editing.dropoff_address || ""}
              onChange={(v) => setEditing({ ...editing, dropoff_address: v })}
            />

            <ServicesEditor
              itemsJson={editing.items_json}
              onChange={(json) => setEditing({ ...editing, items_json: json })}
              onTotals={(sub, tax, total) =>
                setEditing({ ...editing, subtotal: sub, tax, total })
              }
            />

            <div className="grid grid-cols-3 gap-3">
              <Field
                label="Subtotal"
                value={editing.subtotal ?? 0}
                onChange={(v) => setEditing({ ...editing, subtotal: +v || 0 })}
              />
              <Field
                label="Tax"
                value={editing.tax ?? 0}
                onChange={(v) => setEditing({ ...editing, tax: +v || 0 })}
              />
              <Field
                label="Total"
                value={editing.total ?? 0}
                onChange={(v) => setEditing({ ...editing, total: +v || 0 })}
              />
            </div>

            <TextArea
              label="Customer notes"
              value={editing.notes_customer || ""}
              onChange={(v) => setEditing({ ...editing, notes_customer: v })}
            />
            <TextArea
              label="Admin notes"
              value={editing.notes_admin || ""}
              onChange={(v) => setEditing({ ...editing, notes_admin: v })}
            />
          </div>
        </Modal>
      )}

      {/* -------- Service Modal (мінімальна) -------- */}
      {svcEditing && (
        <Modal onClose={() => setSvcEditing(null)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {svcEditing.id ? `Edit Service #${svcEditing.id}` : "New Service"}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSvcEditing(null)}
                className="px-4 py-2 rounded-xl border bg-white"
              >
                Cancel
              </button>
              <button
                onClick={onSaveService}
                className="px-4 py-2 rounded-xl font-semibold text-black"
                style={{ background: gradient }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Лише 3 поля: Назва, Тип(сфера), Ціна */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Service title"
              value={svcEditing.title || ""}
              onChange={(v) => setSvcEditing({ ...svcEditing, title: v })}
            />

            <Select
              label="Type (sphere)"
              value={svcEditing.sphere || ""}
              options={CATEGORIES.map((c) => c.key)} // cleaning/detailing/media/pickleball
              onChange={(v) => setSvcEditing({ ...svcEditing, sphere: v })}
            />

            <Field
              label="Price (USD)"
              value={svcEditing.price ?? 0}
              onChange={(v) => setSvcEditing({ ...svcEditing, price: v })}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= REQUEST CARD ================= */

function RequestCard({ row, onEdit, onStatusChange }) {
  const fullName =
    row.user_full_name && row.user_full_name.trim()
      ? row.user_full_name
      : "Unknown name";
  const total = (row.total ?? 0).toFixed(2);
  const phone = normalizePhone(row.user_phone || "");
  const hasPhone = !!phone;

  return (
    <div className="p-4 rounded-2xl bg-white shadow-sm border border-[#eee] overflow-hidden">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-[18px] leading-tight truncate">
            <span className="mr-1">#{row.id}</span>•{" "}
            <span className="ml-1">{fullName}</span>
          </div>
          <div className="text-sm text-[#6B7280] mt-1 break-words">
            {hasPhone ? (
              <a className="underline" href={`tel:${phone}`}>
                {formatDisplayPhone(phone)}
              </a>
            ) : (
              <>No phone</>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-[#6B7280]">Total</div>
          <div className="font-bold text-[22px]">${total}</div>
          <Badge status={row.status} />
        </div>
      </div>

      {/* body */}
      <div className="mt-3 text-[14px] text-[#111] space-y-2 break-words">
        <Section title="Vehicle">
          <div className="text-[14px]">
            {row.vehicle_year || row.vehicle_make || row.vehicle_model ? (
              <>
                <div className="font-medium">
                  {row.vehicle_year ? `${row.vehicle_year} ` : ""}
                  {row.vehicle_make || ""} {row.vehicle_model || ""}
                </div>
                <div className="text-[#6B7280]">
                  ID: {row.vehicle_id ?? "—"}
                </div>
              </>
            ) : (
              <span className="text-[#6B7280]">—</span>
            )}
          </div>
        </Section>

        <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1">
          <span className="text-[#6B7280]">Location:</span>
          <span className="truncate">{row.location_type?.slice(0, 4)}…</span>

          <span className="text-[#6B7280]">Date:</span>
          <span> {row.service_date || "—"} </span>

          <span className="text-[#6B7280]">Time window:</span>
          <span> {row.time_window || "—"} </span>

          <span className="text-[#6B7280]">Email:</span>
          <span className="truncate">{row.user_email || "—"}</span>

          <span className="text-[#6B7280]">Service address:</span>
          <span className="truncate">{row.service_address || "—"} </span>

          {row.pickup_address && (
            <>
              <span className="text-[#6B7280]">Pickup:</span>
              <span className="truncate">{row.pickup_address}</span>
            </>
          )}

          {row.dropoff_address && (
            <>
              <span className="text-[#6B7280]">Drop-off:</span>
              <span className="truncate">{row.dropoff_address}</span>
            </>
          )}
        </div>

        <Section title="Services">
          <ItemsList itemsJson={row.items_json} />
        </Section>
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={onEdit}
          className="w-40 h-12 rounded-2xl font-semibold text-black"
          style={{ background: gradient }}
        >
          Edit
        </button>

        <StatusSelect value={row.status} onChange={onStatusChange} />
      </div>
    </div>
  );
}

/* ================= SMALL PARTS ================= */

function Badge({ status }) {
  const map = {
    confirmed: "bg-[#EEF2FF] text-[#4F46E5]",
    cancelled: "bg-[#FEE2E2] text-[#B91C1C]",
    done: "bg-[#ECFDF5] text-[#059669]",
  };
  const cls = map[status] || "bg-[#F3F4F6] text-[#6B7280]";
  return (
    <div
      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {status || "new"}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-[#eee] p-3 bg-[#FAFAFA]">
      <div className="text-[13px] font-semibold text-[#6B7280] mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function ItemsList({ itemsJson }) {
  let items = [];
  try {
    items = JSON.parse(itemsJson || "[]") || [];
  } catch {}
  if (!items.length) return <div className="text-[#6B7280]">No services</div>;
  return (
    <div className="space-y-1">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 text-[14px]"
        >
          <span className="truncate">{it.title}</span>
          <span className="shrink-0">
            ${(it.price ?? 0).toFixed(2)} × {it.qty ?? 1}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusSelect({ value, onChange }) {
  const val = UI_STATUSES.includes(value) ? value : "confirmed";
  return (
    <div className="relative">
      <select
        value={val}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-12 min-w-[180px] rounded-2xl border px-4 pr-10 bg-white"
      >
        {UI_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        ▾
      </span>
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center overflow-auto">
        <div className="mt-10 mb-10 w-[min(1100px,92vw)] rounded-2xl bg-white p-6 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= REQUEST SERVICES EDITOR ================= */

function ServicesEditor({ itemsJson, onChange, onTotals }) {
  let initial = [];
  try {
    initial = JSON.parse(itemsJson || "[]") || [];
  } catch {}
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    const json = JSON.stringify(rows);
    onChange?.(json);
    const sub = rows.reduce(
      (s, r) => s + (Number(r.price) || 0) * (Number(r.qty) || 1),
      0
    );
    const tax = +(sub * 0.07).toFixed(2);
    const total = +(sub + tax).toFixed(2);
    onTotals?.(sub, tax, total);
  }, [rows]);

  const update = (i, patch) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );
  const add = () =>
    setRows((prev) => [...prev, { title: "", price: 0, qty: 1 }]);
  const remove = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="md:col-span-2">
      <div className="text-sm font-semibold mb-2">Services & Prices</div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_120px_100px_36px] gap-2">
            <input
              className="h-11 rounded-xl bg-[#F4F4F5] px-3 outline-none"
              placeholder="Service title"
              value={r.title}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <input
              className="h-11 rounded-xl bg-[#F4F4F5] px-3 outline-none"
              placeholder="Price"
              value={r.price}
              onChange={(e) => update(i, { price: +e.target.value || 0 })}
            />
            <input
              className="h-11 rounded-xl bg-[#F4F4F5] px-3 outline-none"
              placeholder="Qty"
              value={r.qty}
              onChange={(e) => update(i, { qty: +e.target.value || 1 })}
            />
            <button
              onClick={() => remove(i)}
              className="h-11 rounded-xl border"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
        <button onClick={add} className="px-4 h-11 rounded-xl border">
          Add service
        </button>
      </div>
    </div>
  );
}

/* ================= INPUTS ================= */

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm mb-1">{label}</div>
      <input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-11 rounded-xl bg-[#F4F4F5] px-3 outline-none"
      />
    </label>
  );
}
function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm mb-1">{label}</div>
      <textarea
        rows={4}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl bg-[#F4F4F5] px-3 py-2 outline-none"
      />
    </label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-sm mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-11 rounded-xl bg-[#F4F4F5] px-3 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ================= PHONE HELPERS ================= */

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.length === 10) return "+1" + digits;
  if (digits.startsWith("1") && digits.length === 11) return "+" + digits;
  if (!digits.startsWith("+")) return "+" + digits;
  return raw;
}
function formatDisplayPhone(p) {
  const d = p.replace(/\D+/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    const a = d.slice(1, 4),
      b = d.slice(4, 7),
      c = d.slice(7);
    return `+1 (${a}) ${b}-${c}`;
  }
  if (d.length === 10) {
    const a = d.slice(0, 3),
      b = d.slice(3, 6),
      c = d.slice(6);
    return `+1 (${a}) ${b}-${c}`;
  }
  return p;
}
