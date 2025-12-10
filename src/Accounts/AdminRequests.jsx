// src/pages/AdminRequests.jsx
import React, { useEffect, useState } from "react";
import { reqApi } from "../lib/api";

const gradient =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const MENU_ITEMS = [
  { key: "detailing", label: "Detailing Booking" },
  { key: "cleaning", label: "Cleaning Booking" },
  { key: "users", label: "Users" },
];

export default function AdminRequests() {
  const [activeMenu, setActiveMenu] = useState("detailing");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  /* ---------------------- LOAD BOOKINGS ---------------------- */

  const loadBookings = async () => {
    setLoading(true);
    try {
      const type =
        activeMenu === "detailing"
          ? "detailing_quote"
          : activeMenu === "cleaning"
          ? "cleaning_quote"
          : null;

      if (!type) {
        setRows([]);
        return;
      }

      const data = await reqApi.list({ service_type: type });
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [activeMenu]);

  /* --------------------------- DELETE ------------------------- */

  const deleteBooking = async (row) => {
    if (!window.confirm("Delete this request?")) return;
    await reqApi.remove(row.id);
    await loadBookings();
  };

  /* --------------------------- UPDATE STATUS ------------------ */

  const updateStatus = async (id, status) => {
    await reqApi.save({ id, status });
    await loadBookings();
  };

  /* ----------------------- RENDER SECTION ---------------------- */

  const renderTable = () => {
    if (loading) return <div className="p-6">Loading…</div>;
    if (!rows.length) return <div className="p-6">No requests found.</div>;

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-[#6B7280] text-xs">
              <th className="p-3">ID</th>
              <th className="p-3">Created</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const info = JSON.parse(r.items_json || "{}");
              const contact = info?.contact || {};
              const vehicle = info?.vehicle || {};

              return (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.id}</td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {contact.firstName} {contact.lastName}
                    <br />
                    <span className="text-xs text-gray-500">
                      {contact.email}
                    </span>
                  </td>

                  <td className="p-3 capitalize">
                    {activeMenu === "detailing"
                      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                      : "Cleaning"}
                  </td>

                  <td className="p-3 capitalize">{r.status}</td>

                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedRow(r)}
                      className="px-3 py-1 border rounded-lg mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteBooking(r)}
                      className="px-3 py-1 border rounded-lg"
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
    );
  };

  /* ------------------------- DETAILS MODAL --------------------- */

  const renderDetailsModal = () => {
    if (!selectedRow) return null;

    const data = JSON.parse(selectedRow.items_json || "{}");
    const contact = data.contact || {};
    const vehicle = data.vehicle || {};
    const history = data.history || {};
    const location = data.location || {};

    return (
      <Modal onClose={() => setSelectedRow(null)}>
        <h2 className="text-xl font-bold mb-4">Request #{selectedRow.id}</h2>

        <div className="space-y-4 text-sm">

          {/* Customer */}
          <Section title="Customer">
            <p>
              {contact.firstName} {contact.lastName}
            </p>
            <p>{contact.phone}</p>
            <p>{contact.email}</p>
            {contact.heardAbout && <p>Heard about us: {contact.heardAbout}</p>}
            {contact.extraInfo && <p>Note: {contact.extraInfo}</p>}
          </Section>

          {/* Vehicle */}
          {activeMenu === "detailing" && (
            <>
              <Section title="Vehicle">
                <p>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </Section>

              <Section title="Condition">
                <p>Last detailed: {history.lastDetailed}</p>
                <p>Condition rating: {history.conditionRating}</p>

                {history.conditionFlags?.length ? (
                  <ul className="list-disc pl-5">
                    {history.conditionFlags.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No condition issues selected.</p>
                )}
              </Section>

              {/* Services */}
              <Section title="Selected Services">
                {data.services?.length ? (
                  <ul className="list-disc pl-5">
                    {data.services.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No services.</p>
                )}

                {data.multipleVehicles && (
                  <div className="mt-3">
                    <p className="font-semibold">Additional vehicles:</p>
                    {data.vehicles?.map((v, i) => (
                      <div key={i} className="ml-4 mt-2 p-2 bg-gray-100 rounded">
                        <p className="font-medium">
                          {v.year} {v.make} {v.model}
                        </p>

                        {v.services?.length ? (
                          <ul className="list-disc pl-5">
                            {v.services.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No services.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Location */}
              <Section title="Location">
                <p>Type: {location.location_type}</p>
                <p>
                  Preferred completion date:{" "}
                  {location.completionDate || "not specified"}
                </p>

                <p>Address: {location.baseAddress}</p>
              </Section>
            </>
          )}
        </div>

        {/* status update */}
        <div className="flex justify-end gap-2 mt-6">
          {["new", "in_progress", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              className="px-3 py-2 border rounded-lg text-sm"
              onClick={() => updateStatus(selectedRow.id, st)}
            >
              {st}
            </button>
          ))}
        </div>
      </Modal>
    );
  };

  /* ---------------------- MAIN RENDER ---------------------- */

  return (
    <div className="min-h-screen w-full bg-[#F4F4F5] flex">

      {/* ====== SIDEBAR ====== */}
      <aside className="w-64 hidden md:flex flex-col border-r border-[#E5E7EB] bg-white">
        <div className="px-5 py-6 border-b">
          <div className="text-xs text-[#9CA3AF] uppercase">Admin Panel</div>
          <div className="text-lg font-extrabold text-[#111827]">
            Danilets Dashboard
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const active = activeMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold text-left
                  ${
                    active
                      ? "text-black shadow-sm"
                      : "text-[#4B5563] hover:text-[#111827] hover:bg-gray-100"
                  }`}
                style={{ background: active ? gradient : undefined }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-extrabold mb-6">
          {activeMenu === "detailing"
            ? "Detailing Booking Requests"
            : activeMenu === "cleaning"
            ? "Cleaning Booking Requests"
            : "Users"}
        </h1>

        {renderTable()}
      </div>

      {renderDetailsModal()}
    </div>
  );
}

/* ========== COMPONENTS ========== */

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-start justify-center overflow-auto">
        <div className="mt-10 mb-10 bg-white rounded-2xl p-6 w-[min(600px,90vw)] shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <div className="text-sm text-[#4B5563]">{children}</div>
    </div>
  );
}
