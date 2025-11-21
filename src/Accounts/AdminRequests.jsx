// src/pages/AdminRequests.jsx (можеш перейменувати в AdminServices.jsx, якщо треба)
import React, { useEffect, useState } from "react";
import { cardsApi } from "../lib/api";

const gradient =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// працюємо тільки з detailing
const DETAILING_SLUG = "detailing";

/* ================= MAIN ================= */

export default function AdminRequests() {
  const [svcLoading, setSvcLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [svcEditing, setSvcEditing] = useState(null); // {id?, title, price}

  // завантажити всі detailing-послуги
  const loadServices = async () => {
    setSvcLoading(true);
    try {
      const rows = await cardsApi.list({ type: "service" });
      const filtered = Array.isArray(rows)
        ? rows
            .filter((r) => (r.slug || "") === DETAILING_SLUG)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        : [];
      setServices(filtered);
    } finally {
      setSvcLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const onSaveService = async () => {
    try {
      const title = (svcEditing?.title || "").trim();
      const price = Number(svcEditing?.price ?? 0);

      if (!title) return alert("Please enter the service title.");
      if (Number.isNaN(price)) return alert("Price must be a number.");

      const payload = {
        id: svcEditing?.id,        // якщо є — оновимо, якщо ні — створимо
        type: "service",
        title,
        price,
        slug: DETAILING_SLUG,      // завжди detailing
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
    if (!window.confirm(`Delete service "${row.title}"?`)) return;
    await cardsApi.remove(row.id);
    await loadServices();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-28">
      {/* header */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-extrabold">
          Admin • Detailing Services
        </h1>

        <button
          onClick={() =>
            setSvcEditing({
              id: undefined,
              title: "",
              price: 0,
            })
          }
          className="px-5 py-3 rounded-[14px] font-semibold text-black"
          style={{ background: gradient }}
        >
          New Service
        </button>
      </div>

      {/* cards list */}
      <div className="bg-white rounded-2xl border border-[#eee] shadow-sm">
        <div className="p-4 flex items-center gap-3 flex-wrap">
          <div className="font-bold mr-auto">Services & Prices (Detailing)</div>
          <button
            onClick={loadServices}
            className="px-3 py-2 rounded-xl border bg-white"
          >
            Refresh
          </button>
        </div>

        {svcLoading ? (
          <div className="px-4 pb-4 text-[#6B7280]">Loading…</div>
        ) : (
          <div className="p-4 pt-0">
            {services.length === 0 ? (
              <div className="text-[#6B7280]">No services yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="text-[#6B7280] text-sm border-b">
                      <th className="py-3 pr-3">Title</th>
                      <th className="py-3 pr-3">Price</th>
                      <th className="py-3 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id} className="border-b last:border-b-0">
                        <td className="py-3 pr-3">{s.title}</td>
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

      {/* modal для створення/редагування сервісу */}
      {svcEditing && (
        <Modal onClose={() => setSvcEditing(null)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {svcEditing.id
                ? `Edit Service #${svcEditing.id}`
                : "New Detailing Service"}
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

          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Service title"
              value={svcEditing.title || ""}
              onChange={(v) =>
                setSvcEditing((prev) => ({ ...prev, title: v }))
              }
            />

            <Field
              label="Price (USD)"
              value={svcEditing.price ?? 0}
              onChange={(v) =>
                setSvcEditing((prev) => ({
                  ...prev,
                  price: v,
                }))
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center overflow-auto">
        <div className="mt-10 mb-10 w-[min(600px,92vw)] rounded-2xl bg-white p-6 shadow-xl">
          {children}
        </div>
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
