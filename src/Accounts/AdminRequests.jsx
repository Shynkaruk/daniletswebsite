// src/Accounts/AdminRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminReqApi } from "../lib/api";
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
  { key: "detailing_quote_personal", label: "Detailing — Personal" },
  { key: "detailing_quote_business", label: "Detailing — Business" },
  { key: "cleaning_quote_residential", label: "Cleaning — Residential" },
  { key: "cleaning_quote_commercial", label: "Cleaning — Commercial" },
  { key: "forms_clients", label: "Forms Clients" },
  { key: "users", label: "Users" },
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

      {/* Main Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
}2