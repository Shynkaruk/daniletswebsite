// src/Components/Booking/Detailing/Personal/StepDetailingVehicleInfo.jsx
import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronDown } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import CarPhoto from "../../../CarPhoto";
import AutocompleteInput from "../../../AutocompleteInput";
import { meApi } from "../../../../lib/api";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const SEAT_OPTIONS = ["Leather", "Cloth", "Mixed"];

// ── Popular makes sold in the US ──────────────────────────────────────────────
const MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi",
  "Bentley", "BMW", "Buick",
  "Cadillac", "Chevrolet", "Chrysler",
  "Dodge",
  "Ferrari", "Fiat", "Ford",
  "Genesis", "GMC",
  "Honda", "Hummer", "Hyundai",
  "Infiniti",
  "Jaguar", "Jeep",
  "Kia",
  "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Lucid",
  "Maserati", "Mazda", "Mercedes-Benz", "MINI", "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram", "Rivian", "Rolls-Royce",
  "Subaru",
  "Tesla", "Toyota",
  "Volkswagen", "Volvo",
];

// ── Standard vehicle colors ───────────────────────────────────────────────────
const COLORS = [
  "White", "Pearl White", "Off White",
  "Black", "Gloss Black", "Matte Black",
  "Silver", "Gray", "Dark Gray", "Charcoal",
  "Red", "Dark Red", "Burgundy", "Maroon",
  "Blue", "Dark Blue", "Navy", "Sky Blue",
  "Green", "Dark Green", "Forest Green", "Olive",
  "Yellow", "Gold", "Champagne", "Cream",
  "Orange", "Brown", "Tan", "Beige",
  "Purple", "Bronze", "Copper", "Pink",
];

// ── Model years (next year → 1980) ────────────────────────────────────────────
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1979 }, (_, i) =>
  String(THIS_YEAR + 1 - i)
);

// ── Fetch models from free NHTSA API (no key required) ────────────────────────
async function fetchNhtsaModels(make) {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return [
      ...new Set(
        (data.Results || []).map((r) => r.Model_Name).filter(Boolean)
      ),
    ].sort();
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const StepDetailingVehicleInfo = ({
  visible,
  onBack,
  onNext,

  year,        setYear,
  make,        setMake,
  model,       setModel,
  color,       setColor,
  seatMaterial, setSeatMaterial,

  renderProgress,
  progressStepIndex = 2,
  totalSteps = 11,
}) => {
  // ── Saved vehicles from account ─────────────────────────────────────────────
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);

  useEffect(() => {
    meApi.myVehicles()
      .then((rows) => setSavedVehicles(Array.isArray(rows) ? rows : []))
      .catch(() => {});
  }, []);

  const applySavedVehicle = (v) => {
    setYear?.(String(v.year || ""));
    setMake?.(v.make || "");
    setModel?.(v.model || "");
    setColor?.(v.color || "");
    setShowSavedDropdown(false);
  };

  // ── Models autocomplete state (fetched from NHTSA per make) ─────────────────
  const [models, setModels]               = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const makeVal = make ?? "";

  useEffect(() => {
    if (!makeVal.trim()) {
      setModels([]);
      return;
    }
    let cancelled = false;
    // Debounce: wait 400 ms after user stops typing before fetching
    const timer = setTimeout(async () => {
      setModelsLoading(true);
      const result = await fetchNhtsaModels(makeVal);
      if (!cancelled) {
        setModels(result);
        setModelsLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [makeVal]);

  // ── Early return after hooks ─────────────────────────────────────────────────
  if (!visible) return null;

  const yearVal  = year  ?? "";
  const modelVal = model ?? "";
  const colorVal = color ?? "";
  const seatVal  = seatMaterial ?? "";

  const canContinue =
    yearVal.trim() &&
    makeVal.trim() &&
    modelVal.trim() &&
    colorVal.trim() &&
    seatVal.trim();

  const inputCls =
    "w-full h-[48px] sm:h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 sm:px-5 text-[14px] sm:text-[15px] outline-none";

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 lg:p-8 shadow space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
          )}
          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Vehicle information
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF] mt-0.5">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* USE SAVED VEHICLE */}
        {savedVehicles.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSavedDropdown((v) => !v)}
              className="w-full h-[48px] sm:h-[52px] rounded-[16px] border border-[#E5E7EB] bg-white px-4 flex items-center justify-between text-[14px] text-[#4B5563] font-medium hover:border-[#A8834E] transition"
            >
              <span>Use a saved vehicle</span>
              <FiChevronDown className={`transition-transform ${showSavedDropdown ? "rotate-180" : ""}`} />
            </button>

            {showSavedDropdown && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-[16px] border border-[#E5E7EB] shadow-lg overflow-hidden">
                {savedVehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => applySavedVehicle(v)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF7E6] transition text-left border-b border-[#F3F4F6] last:border-0"
                  >
                    {v.photo_url ? (
                      <img src={v.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#F0F0F2] flex items-center justify-center text-lg shrink-0">
                        {v.category === "commercial" ? "🏢" : "🚗"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-[#18181B] truncate">
                        {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Unnamed vehicle"}
                      </div>
                      {v.color && <div className="text-[12px] text-[#9CA3AF]">{v.color}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INPUTS */}
        <section className="space-y-4">

          {/* Year */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Year</div>
            <AutocompleteInput
              value={yearVal}
              onChange={(v) => setYear?.(v)}
              options={YEARS}
              placeholder="2025"
              inputClassName={inputCls}
            />
          </div>

          {/* Make */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Make</div>
            <AutocompleteInput
              value={makeVal}
              onChange={(v) => {
                setMake?.(v);
                setModel?.(""); // reset model when make changes
              }}
              options={MAKES}
              placeholder="Toyota, BMW, Mercedes-Benz…"
              inputClassName={inputCls}
            />
          </div>

          {/* Model — loaded from NHTSA based on make */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Model</div>
            <AutocompleteInput
              value={modelVal}
              onChange={(v) => setModel?.(v)}
              options={models}
              loading={modelsLoading}
              disabled={!makeVal.trim()}
              placeholder={makeVal.trim() ? "Start typing…" : "Select make first"}
              inputClassName={`${inputCls} ${!makeVal.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Color */}
          <div className="space-y-1">
            <div className="text-sm text-[#6B7280] font-medium">Vehicle color</div>
            <AutocompleteInput
              value={colorVal}
              onChange={(v) => setColor?.(v)}
              options={COLORS}
              placeholder="White, Black, Blue…"
              inputClassName={inputCls}
            />
          </div>

          {/* Car Photo Preview */}
          {makeVal.trim() && yearVal.trim() && (
            <div className="space-y-1">
              <div className="text-sm text-[#6B7280] font-medium">Vehicle preview</div>
              <CarPhoto
                make={makeVal}
                model={modelVal}
                year={yearVal}
                color={colorVal}
                className="w-full"
              />
            </div>
          )}

          {/* Seat Material */}
          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Seat material (required)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SEAT_OPTIONS.map((opt) => {
                const active = seatVal === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSeatMaterial?.(opt)}
                    className={`
                      h-[44px] sm:h-[48px] rounded-[16px] border text-[14px] font-medium
                      ${active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"}
                    `}
                    style={{ background: active ? GOLD_GRADIENT : undefined }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

        </section>

        {/* CONTINUE */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={`
            w-full h-[52px] sm:h-[56px] rounded-[88px] font-semibold text-black shadow
            inline-flex items-center justify-between px-6
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}
          `}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>

      </div>
    </div>
  );
};

export default StepDetailingVehicleInfo;
