// src/Components/Booking/StepCleaningDetails.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const AREAS_OPTIONS = [
  "Kitchen",
  "Living Room",
  "Dining Room",
  "Bedrooms",
  "Bathrooms",
  "Basement",
  "Sunroom",
  "Stairs",
  "Other",
];

const GENERAL_TASKS_OPTIONS = [
  "Floor Cleaning",
  "Carpet Vacuuming",
  "Walls",
  "Windows and Sills",
  "Baseboards",
  "Ceiling Fans",
  "Changing Bed Sheets",
  "Dusting Wall and Ceiling Edges",
  "Trash Take-Out",
  "Other",
];

const KITCHEN_TASKS_OPTIONS = [
  "Surface Cleaning (Cabinets, Counters, and Appliances)",
  "Inside Cabinets",
  "Top of Cabinets",
  "Inside Oven",
  "Inside Fridge",
  "Inside Microwave",
  "Other",
];

// окремі списки для Type of Project
const RESIDENTIAL_PROJECT_OPTIONS = [
  { key: "deep_clean", label: "Deep clean" },
  { key: "post_construction", label: "Post construction" },
  { key: "move_in_out", label: "Move in/out" },
  { key: "other", label: "Other" },
];

const COMMERCIAL_PROJECT_OPTIONS = [
  { key: "office", label: "Office" },
  { key: "airbnb", label: "Airbnb/rental properties" },
  { key: "post_construction", label: "Post construction" },
  { key: "other", label: "Other" },
];

const StepCleaningDetails = ({
  visible,
  onBack,
  onNext,

  propertyType,
  setPropertyType,
  projectType,
  setProjectType,

  // residential
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  areas,
  setAreas,
  generalTasks,
  setGeneralTasks,
  kitchenTasks,
  setKitchenTasks,
  resBudget,
  setResBudget,
  extraDetails,
  setExtraDetails,

  // commercial
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  squareFeet,
  setSquareFeet,
  frequency,
  setFrequency,
  comBudget,
  setComBudget,
  comExtraDetails,
  setComExtraDetails,

  // опціонально: якщо передаси з Booking – прогрес буде єдиний для всіх кроків
  renderProgress,
}) => {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const toggleInArray = (arr, value) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  let canContinue = false;
  if (isResidential) {
    canContinue =
      !!propertyType &&
      !!projectType &&
      !!bedrooms &&
      !!bathrooms &&
      areas.length > 0 &&
      generalTasks.length > 0 &&
      !!resBudget;
  } else if (isCommercial) {
    canContinue =
      !!propertyType &&
      !!projectType &&
      !!companyName &&
      !!companyAddress &&
      !!squareFeet &&
      !!frequency &&
      !!comBudget;
  }

  const projectOptions = isResidential
    ? RESIDENTIAL_PROJECT_OPTIONS
    : isCommercial
    ? COMMERCIAL_PROJECT_OPTIONS
    : [];

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Get a quote
          </h2>
        </div>

        {/* Прогрес: Cleaning — 1/3 */}
        {renderProgress ? renderProgress(1) : <ProgressBar activeCount={1} total={3} />}

        {/* Type: Residential / Commercial */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            Type (select one) *
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "residential", label: "Residential" },
              { key: "commercial", label: "Commercial" },
            ].map((opt) => {
              const active = propertyType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPropertyType(opt.key)}
                  className={`h-[44px] rounded-[16px] border text-sm font-semibold
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Type of Project – тільки після вибору Residential/Commercial */}
        {(isResidential || isCommercial) && (
          <section className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Type of project (select one) *
            </div>
            <div className="grid grid-cols-2 gap-2">
              {projectOptions.map((opt) => {
                const active = projectType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setProjectType(opt.key)}
                    className={`h-[44px] rounded-[16px] border text-sm font-semibold
                      ${
                        active
                          ? "border-transparent text-black"
                          : "border-[#E5E7EB] text-[#4B5563] bg-white"
                      }`}
                    style={{ background: active ? GOLD_GRADIENT : undefined }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ------- Residential ------- */}
        {isResidential && (
          <div className="space-y-4">
            {/* Bedrooms/Bathrooms */}
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                How many bedrooms and bathrooms? *
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Bedrooms"                // 🔹 підпис всередині бульки
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
                <input
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Bathrooms"              // 🔹 підпис всередині бульки
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>
            </section>

            {/* Areas */}
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                What areas do you need cleaned? (select all that apply) *
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm text-[#111827] mt-1">
                {AREAS_OPTIONS.map((name) => (
                  <label
                    key={name}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#D4D4D8]"
                      checked={areas.includes(name)}
                      onChange={() =>
                        setAreas((prev) => toggleInArray(prev, name))
                      }
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* General tasks */}
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                What will we be doing? (select all that apply) *
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#111827] mt-1">
                {GENERAL_TASKS_OPTIONS.map((name) => (
                  <label
                    key={name}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#D4D4D8]"
                      checked={generalTasks.includes(name)}
                      onChange={() =>
                        setGeneralTasks((prev) => toggleInArray(prev, name))
                      }
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Kitchen tasks */}
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                What will we be doing in the kitchen? (select all that apply) *
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#111827] mt-1">
                {KITCHEN_TASKS_OPTIONS.map((name) => (
                  <label
                    key={name}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#D4D4D8]"
                      checked={kitchenTasks.includes(name)}
                      onChange={() =>
                        setKitchenTasks((prev) => toggleInArray(prev, name))
                      }
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Budget + notes */}
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  What is your budget? *
                </div>
                <input
                  value={resBudget}
                  onChange={(e) => setResBudget(e.target.value)}
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Is there anything you would like to add?
                </div>
                <textarea
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  rows={3}
                  className="w-full rounded-[16px] bg-[#F4F4F5] px-4 py-2 text-[14px] outline-none resize-none"
                />
              </div>
            </section>
          </div>
        )}

        {/* ------- Commercial ------- */}
        {isCommercial && (
          <div className="space-y-4">
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Company name *
                </div>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Company address *
                </div>
                <input
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  How many square feet? *
                </div>
                <input
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  type="number"
                  min="0"
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                />
              </div>
            </section>

            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-3">
              <div className="text-sm text-[#6B7280] font-medium">
                Frequency *
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#111827] mt-1">
                {[
                  { key: "one_time", label: "One-time" },
                  { key: "daily", label: "Daily" },
                  { key: "weekly", label: "Weekly" },
                  { key: "monthly", label: "Monthly" },
                  { key: "other", label: "Other" },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cleaning-frequency"
                      className="w-4 h-4"
                      checked={frequency === opt.key}
                      onChange={() => setFrequency(opt.key)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Budget (dropdown) + extra details */}
            <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Budget *
                </div>
                <select
                  value={comBudget}
                  onChange={(e) => setComBudget(e.target.value)}
                  className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full"
                >
                  <option value=""></option>
                  <option value="Below $1,000">Below $1,000</option>
                  <option value="Between $1,000-$3,000">
                    Between $1,000-$3,000
                  </option>
                  <option value="Between $3,000-$5,000">
                    Between $3,000-$5,000
                  </option>
                  <option value="$5,000+">$5,000+</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-[#6B7280] font-medium">
                  Any additional details about your project?
                </div>
                <textarea
                  value={comExtraDetails}
                  onChange={(e) => setComExtraDetails(e.target.value)}
                  rows={3}
                  className="w-full rounded-[16px] bg-[#F4F4F5] px-4 py-2 text-[14px] outline-none resize-none"
                />
              </div>
            </section>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepCleaningDetails;
