import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const VEHICLE_TYPE_CONFIG = [
  { key: "sedans", label: "Sedans" },
  { key: "suvs", label: "SUVs" },
  { key: "pickups", label: "Pick-Ups" },
  { key: "minivans", label: "Mini-Vans/3-Row SUVs" },
  { key: "transit_vans", label: "Transit Vans" },
  { key: "semi_trucks", label: "Semi-Trucks" },
  { key: "other", label: "Other (please specify)" },
];

function GoldDropdown({
  value,
  placeholder = "Select quantity",
  options,
  onSelect,
  onCustom,
  open,
  onToggle,
  onClose,
}) {
  const ref = useRef(null);

  // ✅ ВАЖЛИВО: слухач на документі тільки коли dropdown відкритий
  useEffect(() => {
    if (!open) return;

    function onDocPointerDown(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose?.();
    }

    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open, onClose]);

  const shownText = value ? String(value) : placeholder;

  return (
    <div ref={ref} className="relative w-full" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="
          w-full h-[44px] rounded-[14px] px-3 text-[14px] text-left
          bg-white/60 backdrop-blur
          border border-[#D6B46A]
          shadow-sm hover:bg-white/70
          focus:outline-none
        "
        style={{ boxShadow: "0 0 0 1px rgba(214,180,106,0.35) inset" }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={value ? "text-[#111827]" : "text-[#6B7280]"}>
            {shownText}
          </span>
          <span className="text-[#8B6134] text-[18px] leading-none">▾</span>
        </div>
      </button>

      {open && (
        <div
          className="
            absolute z-50 mt-2 w-full overflow-hidden
            rounded-[14px] border border-[#D6B46A]
            bg-white shadow-lg
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-[220px] overflow-auto">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-[14px] hover:bg-[#FFF3D6] text-[#6B7280]"
              onClick={(e) => {
                e.stopPropagation();
                onSelect("");
                onClose?.();
              }}
            >
              {placeholder}
            </button>

            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full text-left px-3 py-2 text-[14px] hover:bg-[#FFF3D6] text-[#111827]"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(opt);
                  onClose?.();
                }}
              >
                {opt}
              </button>
            ))}

            <div className="h-[1px] bg-[#F1E2B8]" />

            <button
              type="button"
              className="w-full text-left px-3 py-2 text-[14px] hover:bg-[#FFF3D6] text-[#8B6134] font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                onCustom();
                onClose?.();
              }}
            >
              Custom…
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StepDetailingBusinessVehicleTypes({
  visible,
  onBack,
  onNext,

  businessVehicleTypes,
  setBusinessVehicleTypes,
  businessVehicleOtherLabel,
  setBusinessVehicleOtherLabel,

  renderProgress,
  progressStepIndex = 5,
  totalSteps = 11,
}) {
  const safeTypes = businessVehicleTypes || {};
  const allKeys = useMemo(() => VEHICLE_TYPE_CONFIG.map((x) => x.key), []);

  const [selectedMap, setSelectedMap] = useState({});
  const [openKey, setOpenKey] = useState(null);
  const [customKeys, setCustomKeys] = useState({});

  const inputClass =
    "w-full h-[44px] rounded-[14px] bg-white/60 backdrop-blur px-3 text-[14px] outline-none border border-[#D6B46A]";

  useEffect(() => {
    if (!visible) return;

    const keysInState = Object.keys(safeTypes);
    const hasAll = allKeys.every((k) => keysInState.includes(k));
    const allEmpty =
      keysInState.length > 0 &&
      keysInState.every((k) => String(safeTypes[k] ?? "") === "");

    if (hasAll && allEmpty) {
      setSelectedMap({});
      return;
    }

    const picked = {};
    keysInState.forEach((k) => {
      if (allKeys.includes(k)) picked[k] = true;
    });
    setSelectedMap(picked);
  }, [visible]); // спеціально тільки visible

  const isSelected = (key) => !!selectedMap[key];
  const getCount = (key) => safeTypes[key] ?? "";

  const setCount = (key, value) => {
    const numeric = String(value).replace(/[^\d]/g, "");
    setBusinessVehicleTypes((prev) => ({
      ...(prev || {}),
      [key]: numeric,
    }));
  };

  const toggleType = (key) => {
    setOpenKey(null);

    const active = isSelected(key);

    if (active) {
      setSelectedMap((prev) => {
        const next = { ...(prev || {}) };
        delete next[key];
        return next;
      });

      setBusinessVehicleTypes((prev) => {
        const n = { ...(prev || {}) };
        delete n[key];
        return n;
      });

      setCustomKeys((prev) => {
        const n = { ...(prev || {}) };
        delete n[key];
        return n;
      });

      if (key === "other") setBusinessVehicleOtherLabel("");
    } else {
      setSelectedMap((prev) => ({ ...(prev || {}), [key]: true }));
      setBusinessVehicleTypes((prev) => ({
        ...(prev || {}),
        [key]: prev?.[key] ?? "",
      }));
    }
  };

  const countOptions = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= 20; i++) arr.push(String(i));
    return arr;
  }, []);

  const selectedKeysArr = Object.keys(selectedMap);

  const allSelectedHaveCounts = selectedKeysArr.every(
    (k) => Number(getCount(k) || 0) > 0
  );

  const otherSelected = isSelected("other");
  const otherCount = Number(getCount("other") || 0);

  const otherValid = !otherSelected
    ? true
    : businessVehicleOtherLabel.trim().length > 0 && otherCount > 0;

  const canContinue =
    selectedKeysArr.length > 0 && allSelectedHaveCounts && otherValid;

  if (!visible) return null;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-5 sm:p-6 lg:p-8 shadow space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Vehicle Types
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF]">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <section className="space-y-4">
          <div className="text-sm text-[#6B7280] font-medium">
            What types of vehicles need detailing? (Select all that apply)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VEHICLE_TYPE_CONFIG.map(({ key, label }) => {
              const active = isSelected(key);
              const isCustom = !!customKeys[key];

              return (
                <div
                  key={key}
                  className={`rounded-[18px] border p-3 sm:p-4 space-y-2 transition
                    ${
                      active
                        ? "border-transparent text-[#111827]"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {/* ✅ toggle тільки по хедеру */}
                  <div
                    className="flex items-center justify-between gap-2 cursor-pointer"
                    onClick={() => toggleType(key)}
                  >
                    <div className="text-[14px] sm:text-[15px] font-semibold">
                      {label}
                    </div>
                    <div className="text-[11px] text-[#4B5563] sm:text-[12px]">
                      {active ? "Selected" : "Tap to select"}
                    </div>
                  </div>

                  {key !== "other" && active && (
                    <div className="mt-2">
                      <div className="text-[12px] text-[#6B7280] mb-1">
                        Approx. number of vehicles
                      </div>

                      <GoldDropdown
                        value={isCustom ? "" : getCount(key)}
                        placeholder="Select quantity"
                        options={countOptions}
                        open={openKey === key}
                        onToggle={() =>
                          setOpenKey((prev) => (prev === key ? null : key))
                        }
                        onClose={() => setOpenKey(null)}
                        onSelect={(v) => {
                          setCustomKeys((p) => {
                            const n = { ...(p || {}) };
                            delete n[key];
                            return n;
                          });
                          setCount(key, v);
                        }}
                        onCustom={() =>
                          setCustomKeys((p) => ({ ...(p || {}), [key]: true }))
                        }
                      />

                      {isCustom && (
                        <div className="mt-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={getCount(key)}
                            onChange={(e) => setCount(key, e.target.value)}
                            className={inputClass}
                            placeholder="Type any number"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {key === "other" && active && (
                    <div className="space-y-2 mt-2">
                      <div>
                        <div className="text-[12px] text-[#6B7280] mb-1">
                          What other vehicle type?
                        </div>
                        <input
                          value={businessVehicleOtherLabel}
                          onChange={(e) =>
                            setBusinessVehicleOtherLabel(e.target.value)
                          }
                          className={inputClass}
                          placeholder="e.g. Buses, trailers, etc."
                        />
                      </div>

                      <div>
                        <div className="text-[12px] text-[#6B7280] mb-1">
                          Approx. number of these vehicles
                        </div>

                        <GoldDropdown
                          value={customKeys.other ? "" : getCount("other")}
                          placeholder="Select quantity"
                          options={countOptions}
                          open={openKey === "other"}
                          onToggle={() =>
                            setOpenKey((prev) =>
                              prev === "other" ? null : "other"
                            )
                          }
                          onClose={() => setOpenKey(null)}
                          onSelect={(v) => {
                            setCustomKeys((p) => {
                              const n = { ...(p || {}) };
                              delete n.other;
                              return n;
                            });
                            setCount("other", v);
                          }}
                          onCustom={() =>
                            setCustomKeys((p) => ({ ...(p || {}), other: true }))
                          }
                        />

                        {customKeys.other && (
                          <div className="mt-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={getCount("other")}
                              onChange={(e) => setCount("other", e.target.value)}
                              className={inputClass}
                              placeholder="Type any number"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedKeysArr.length === 0 && (
            <p className="text-xs text-red-500">
              Please select at least one vehicle type.
            </p>
          )}

          {selectedKeysArr.length > 0 && !allSelectedHaveCounts && (
            <p className="text-xs text-red-500">
              Please specify quantity for each selected vehicle type.
            </p>
          )}

          {otherSelected &&
            (!businessVehicleOtherLabel.trim() || otherCount === 0) && (
              <p className="text-xs text-red-500">
                Please specify what &quot;Other&quot; vehicle type is and how many.
              </p>
            )}
        </section>

        <button
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
}
