// src/pages/AdminRequests.jsx
import React, { useEffect, useState } from "react";
import { cardsApi } from "../lib/api";

const gradient =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// працюємо тільки з detailing
const DETAILING_SLUG = "detailing";
// додаткові послуги для детейлінгу
const DETAILING_ADDON_SLUG = "detailing_addon";

/* ================= MAIN ================= */

export default function AdminRequests() {
  const [svcLoading, setSvcLoading] = useState(false);

  // окремо основні та додаткові послуги
  const [services, setServices] = useState([]); // main
  const [extraServices, setExtraServices] = useState([]); // addons

  // {id?, title, price, slug}
  const [svcEditing, setSvcEditing] = useState(null);

  // завантажити всі detailing-послуги
  const loadServices = async () => {
    setSvcLoading(true);
    try {
      const rows = await cardsApi.list({ type: "service" });
      const safe = Array.isArray(rows) ? rows : [];

      const main = safe
        .filter((r) => (r.slug || "") === DETAILING_SLUG)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      const addons = safe
        .filter((r) => (r.slug || "") === DETAILING_ADDON_SLUG)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      setServices(main);
      setExtraServices(addons);
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

      // визначаємо, до якої групи належить послуга
      const slug =
        svcEditing?.slug === DETAILING_ADDON_SLUG
          ? DETAILING_ADDON_SLUG
          : DETAILING_SLUG;

      const payload = {
        id: svcEditing?.id, // якщо є — оновимо, якщо ні — створимо
        type: "service",
        title,
        price,
        slug,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-extrabold">
          Admin • Detailing Services
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              setSvcEditing({
                id: undefined,
                title: "",
                price: 0,
                slug: DETAILING_SLUG,
              })
            }
            className="px-5 py-3 rounded-[14px] font-semibold text-black text-sm sm:text-base"
            style={{ background: gradient }}
          >
            New Service
          </button>

          <button
            onClick={() =>
              setSvcEditing({
                id: undefined,
                title: "",
                price: 0,
                slug: DETAILING_ADDON_SLUG,
              })
            }
            className="px-5 py-3 rounded-[14px] font-semibold text-black text-sm sm:text-base"
            style={{ background: gradient }}
          >
            New Additional Service
          </button>
        </div>
      </div>

      {/* блок основних послуг */}
      <ServicesBlock
        title="Services & Prices (Detailing)"
        loading={svcLoading}
        rows={services}
        onRefresh={loadServices}
        onEdit={(s) =>
          setSvcEditing({
            id: s.id,
            title: s.title || "",
            price: s.price ?? 0,
            slug: s.slug || DETAILING_SLUG,
          })
        }
        onDelete={onDeleteService}
      />

      {/* блок додаткових послуг */}
      <div className="mt-8">
        <ServicesBlock
          title="Additional Services (Detailing)"
          loading={svcLoading}
          rows={extraServices}
          onRefresh={loadServices}
          onEdit={(s) =>
            setSvcEditing({
              id: s.id,
              title: s.title || "",
              price: s.price ?? 0,
              slug: s.slug || DETAILING_ADDON_SLUG,
            })
          }
          onDelete={onDeleteService}
          emptyText="No additional services yet."
        />
      </div>

      {/* modal для створення/редагування сервісу */}
      {svcEditing && (
        <Modal onClose={() => setSvcEditing(null)}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <h3 className="text-xl font-bold">
              {svcEditing.id
                ? `Edit ${
                    svcEditing.slug === DETAILING_ADDON_SLUG
                      ? "Additional Service"
                      : "Service"
                  } #${svcEditing.id}`
                : svcEditing.slug === DETAILING_ADDON_SLUG
                ? "New Additional Service"
                : "New Detailing Service"}
            </h3>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSvcEditing(null)}
                className="px-4 py-2 rounded-xl border bg-white text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={onSaveService}
                className="px-4 py-2 rounded-xl font-semibold text-black text-sm md:text-base"
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

/* ============= BLOCK WITH TABLE ============= */

function ServicesBlock({
  title,
  loading,
  rows,
  onRefresh,
  onEdit,
  onDelete,
  emptyText = "No services yet.",
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#eee] shadow-sm">
      <div className="p-4 flex items-center gap-3 flex-wrap">
        <div className="font-bold mr-auto">{title}</div>
        <button
          onClick={onRefresh}
          className="px-3 py-2 rounded-xl border bg-white text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="px-4 pb-4 text-[#6B7280]">Loading…</div>
      ) : (
        <div className="p-4 pt-0">
          {rows.length === 0 ? (
            <div className="text-[#6B7280]">{emptyText}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px] text-sm">
                <thead>
                  <tr className="text-[#6B7280] text-xs sm:text-sm border-b">
                    <th className="py-3 pr-3">Title</th>
                    <th className="py-3 pr-3">Price</th>
                    <th className="py-3 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3 align-middle">
                        <div className="max-w-xs sm:max-w-none break-words">
                          {s.title}
                        </div>
                      </td>
                      <td className="py-3 pr-3 align-middle whitespace-nowrap">
                        ${(Number(s.price ?? 0)).toFixed(2)}
                      </td>
                      <td className="py-3 pr-3 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm"
                            onClick={() => onEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm"
                            onClick={() => onDelete(s)}
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
        className="w-full h-11 rounded-xl bg-[#F4F4F5] px-3 outline-none text-sm"
      />
    </label>
  );
}
