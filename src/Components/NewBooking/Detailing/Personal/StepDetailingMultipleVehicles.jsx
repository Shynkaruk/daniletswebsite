// src/Components/NewBooking/Detailing/Personal/StepDetailingMultipleVehicles.jsx
import React, { useEffect, useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях!

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const SERVICES_OPTIONS = [
  "Interior Only",
  "Exterior Only",
  "Interior & Exterior",
  "Ceramic Coating",
  "Machine Polish and Wax",
  "Glass Coating",
  "Wheel Coating",
  "Headlight Restoration",
  "Trim Restoration",
  "Metal Polish",
  "Decal and Sticker Removal",
  "Window Tinting",
  "PPF/Wrapping",
  "Other",
];

const SEAT_OPTIONS = ["Leather", "Cloth", "Mixed"];

const CONDITION_FLAGS = [
  "Pet Hair",
  "Spills/Stains",
  "Dirt/Mud",
  "Tar/Sap",
  "Paint Overspray",
  "Trash",
  "Other",
];

const CONDITION_RATING = [
  "Very Clean",
  "Clean",
  "Dirty",
  "Very Dirty",
  "Extremely Dirty",
];

export default function StepDetailingMultipleVehicles({
  visible,
  onBack,
  onNext,

  multipleVehicles,
  setMultipleVehicles,
  setMultiple, // fallback

  vehiclesCount,
  setVehiclesCount,

  vehiclesDetails,
  setVehiclesDetails,

  renderProgress,
  progressStepIndex = 6,
  totalSteps = 11,
}) {
  if (!visible) return null;

  const currentMultiple =
    typeof multipleVehicles === "boolean" ? multipleVehicles : null;

  const setMultipleLocal = setMultipleVehicles || setMultiple;

  const vehiclesCountVal = vehiclesCount ?? "";

  const isYes = currentMultiple === true;
  const isNo = currentMultiple === false;

  const parsedCount = useMemo(() => {
    const n = Number(String(vehiclesCountVal).replace(/[^\d]/g, ""));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(50, n));
  }, [vehiclesCountVal]);

  const detailsArr = Array.isArray(vehiclesDetails) ? vehiclesDetails : [];

  // sync масив під введену кількість
  useEffect(() => {
    if (!isYes) return;
    if (!setVehiclesDetails) return;

    setVehiclesDetails((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const next = [];

      for (let i = 0; i < parsedCount; i++) {
        const v = arr[i] || {};
        next.push({
          year: v.year ?? "",
          make: v.make ?? "",
          model: v.model ?? "",
          color: v.color ?? "",
          seatMaterial: v.seatMaterial ?? "",

          service: v.service ?? "",

          conditionFlags: Array.isArray(v.conditionFlags) ? v.conditionFlags : [],
          conditionOther: v.conditionOther ?? "",
          conditionRating: v.conditionRating ?? "",
        });
      }

      return next;
    });
  }, [isYes, parsedCount, setVehiclesDetails]);

  const updateVehicle = (index, patch) => {
    if (!setVehiclesDetails) return;

    setVehiclesDetails((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      while (arr.length < parsedCount) {
        arr.push({
          year: "",
          make: "",
          model: "",
          color: "",
          seatMaterial: "",
          service: "",
          conditionFlags: [],
          conditionOther: "",
          conditionRating: "",
        });
      }
      arr[index] = { ...(arr[index] || {}), ...patch };
      return arr;
    });
  };

  const toggleFlag = (index, flag) => {
    const v = detailsArr[index] || {};
    const flags = Array.isArray(v.conditionFlags) ? v.conditionFlags : [];

    const has = flags.includes(flag);
    const nextFlags = has ? flags.filter((x) => x !== flag) : [...flags, flag];

    const patch = { conditionFlags: nextFlags };
    if (flag === "Other" && has) patch.conditionOther = "";

    updateVehicle(index, patch);
  };

  const handleSelectMultiple = (val) => {
    setMultipleLocal?.(val);

    if (val === false) {
      setVehiclesCount?.("");
      setVehiclesDetails?.([]);
    }
  };

  const inputBase =
    "w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none";

  const selectGold =
    "w-full h-[44px] rounded-[16px] px-4 text-[14px] outline-none border border-[#D6B46A] bg-white/60 backdrop-blur";

  const allVehiclesValid = useMemo(() => {
    if (!isYes) return true;
    if (parsedCount <= 0) return false;
    if (detailsArr.length !== parsedCount) return false;

    return detailsArr.every((v) => {
      const yearOk = String(v?.year ?? "").trim().length === 4;
      const makeOk = String(v?.make ?? "").trim().length > 0;
      const modelOk = String(v?.model ?? "").trim().length > 0;
      const colorOk = String(v?.color ?? "").trim().length > 0;

      const seatOk = String(v?.seatMaterial ?? "").trim().length > 0;
      const serviceOk = String(v?.service ?? "").trim().length > 0;
      const ratingOk = String(v?.conditionRating ?? "").trim().length > 0;

      const flags = Array.isArray(v?.conditionFlags) ? v.conditionFlags : [];
      const otherChosen = flags.includes("Other");
      const otherOk =
        !otherChosen || String(v?.conditionOther ?? "").trim().length > 0;

      return (
        yearOk &&
        makeOk &&
        modelOk &&
        colorOk &&
        seatOk &&
        serviceOk &&
        ratingOk &&
        otherOk
      );
    });
  }, [isYes, parsedCount, detailsArr]);

  const canContinue = isNo || (isYes && parsedCount > 0 && allVehiclesValid);

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
              aria-label="Back"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
          )}
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B] uppercase">
              MULTIPLE VEHICLES
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
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

        {/* QUESTION */}
        <section className="space-y-3 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            Are you interested in detailing multiple vehicles?
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectMultiple(true)}
              className={`h-[44px] rounded-[16px] border text-sm font-semibold
                ${
                  isYes
                    ? "border-transparent text-black"
                    : "border-[#E5E7EB] text-[#4B5563] bg-white"
                }`}
              style={{ background: isYes ? GOLD_GRADIENT : undefined }}
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() => handleSelectMultiple(false)}
              className={`h-[44px] rounded-[16px] border text-sm font-semibold
                ${
                  isNo
                    ? "border-transparent text-black"
                    : "border-[#E5E7EB] text-[#4B5563] bg-white"
                }`}
              style={{ background: isNo ? GOLD_GRADIENT : undefined }}
            >
              No
            </button>
          </div>
        </section>

        {/* IF YES */}
        {isYes && (
          <>
            {/* COUNT */}
            <section className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Approximately how many vehicles?
              </div>
              <input
                type="number"
                min="1"
                value={vehiclesCountVal}
                onChange={(e) => setVehiclesCount?.(e.target.value)}
                className={inputBase}
                placeholder="2"
              />
            </section>

            {/* PER VEHICLE */}
            {parsedCount > 0 && (
              <section className="space-y-3">
                <div className="text-sm text-[#6B7280] font-medium">
                  Please provide details for each vehicle
                </div>

                <div className="space-y-3">
                  {Array.from({ length: parsedCount }).map((_, idx) => {
                    const v = detailsArr[idx] || {};
                    const flags = Array.isArray(v.conditionFlags)
                      ? v.conditionFlags
                      : [];
                    const otherChosen = flags.includes("Other");

                    const missing =
                      String(v.year || "").trim().length !== 4 ||
                      !String(v.make || "").trim() ||
                      !String(v.model || "").trim() ||
                      !String(v.color || "").trim() ||
                      !String(v.seatMaterial || "").trim() ||
                      !String(v.service || "").trim() ||
                      !String(v.conditionRating || "").trim() ||
                      (otherChosen && !String(v.conditionOther || "").trim());

                    return (
                      <div
                        key={idx}
                        className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 space-y-4"
                      >
                        <div className="font-extrabold text-[#18181B]">
                          VEHICLE {idx + 1}
                        </div>

                        {/* VEHICLE INFO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm text-[#6B7280] font-medium">
                              Year
                            </div>
                            <input
                              value={v.year ?? ""}
                              onChange={(e) =>
                                updateVehicle(idx, {
                                  year: e.target.value
                                    .replace(/[^\d]/g, "")
                                    .slice(0, 4),
                                })
                              }
                              className={inputBase}
                              placeholder="2025"
                              inputMode="numeric"
                            />
                          </div>

                          <div>
                            <div className="text-sm text-[#6B7280] font-medium">
                              Make
                            </div>
                            <input
                              value={v.make ?? ""}
                              onChange={(e) =>
                                updateVehicle(idx, { make: e.target.value })
                              }
                              className={inputBase}
                              placeholder="Mercedes"
                            />
                          </div>

                          <div>
                            <div className="text-sm text-[#6B7280] font-medium">
                              Model
                            </div>
                            <input
                              value={v.model ?? ""}
                              onChange={(e) =>
                                updateVehicle(idx, { model: e.target.value })
                              }
                              className={inputBase}
                              placeholder="AMG"
                            />
                          </div>

                          <div>
                            <div className="text-sm text-[#6B7280] font-medium">
                              Vehicle color
                            </div>
                            <input
                              value={v.color ?? ""}
                              onChange={(e) =>
                                updateVehicle(idx, { color: e.target.value })
                              }
                              className={inputBase}
                              placeholder="Blue"
                            />
                          </div>
                        </div>

                        {/* SEAT MATERIAL */}
                        <div className="space-y-2">
                          <div className="text-sm text-[#6B7280] font-medium">
                            Seat material
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {SEAT_OPTIONS.map((opt) => {
                              const active = v.seatMaterial === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    updateVehicle(idx, { seatMaterial: opt })
                                  }
                                  className={`h-[44px] rounded-[16px] border text-[14px] font-medium
                                    ${
                                      active
                                        ? "border-transparent text-black"
                                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                                    }`}
                                  style={{
                                    background: active ? GOLD_GRADIENT : undefined,
                                  }}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* SERVICE */}
                        <div>
                          <div className="text-sm text-[#6B7280] font-medium">
                            Service for this vehicle
                          </div>

                          <select
                            value={v.service ?? ""}
                            onChange={(e) =>
                              updateVehicle(idx, { service: e.target.value })
                            }
                            className={selectGold}
                            style={{
                              boxShadow:
                                "0 0 0 1px rgba(214,180,106,0.35) inset",
                            }}
                          >
                            {/* НЕ “Select service” */}
                            <option value="" disabled hidden>
                              Choose service
                            </option>

                            {SERVICES_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* CONDITION FLAGS */}
                        <div className="space-y-2">
                          <div className="text-sm text-[#6B7280] font-medium">
                            Vehicle condition (select all that apply)
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {CONDITION_FLAGS.map((flag) => {
                              const checked = flags.includes(flag);
                              return (
                                <label
                                  key={flag}
                                  className={`flex items-center gap-2 rounded-[14px] px-3 py-2 cursor-pointer border
                                    ${
                                      checked
                                        ? "border-transparent text-black"
                                        : "border-[#E5E7EB] text-[#111827] bg-white"
                                    }`}
                                  style={{
                                    background: checked ? GOLD_GRADIENT : undefined,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleFlag(idx, flag)}
                                    className="accent-black"
                                  />
                                  <span className="text-[13px] font-medium">
                                    {flag}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          {otherChosen && (
                            <input
                              value={v.conditionOther ?? ""}
                              onChange={(e) =>
                                updateVehicle(idx, {
                                  conditionOther: e.target.value,
                                })
                              }
                              className={inputBase}
                              placeholder="Please specify"
                            />
                          )}
                        </div>

                        {/* CONDITION RATING */}
                        <div className="space-y-2">
                          <div className="text-sm text-[#6B7280] font-medium">
                            Overall condition rating
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {CONDITION_RATING.map((r) => {
                              const active = v.conditionRating === r;
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() =>
                                    updateVehicle(idx, { conditionRating: r })
                                  }
                                  className={`h-[42px] rounded-[14px] border text-[13px] font-semibold
                                    ${
                                      active
                                        ? "border-transparent text-black"
                                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                                    }`}
                                  style={{
                                    background: active ? GOLD_GRADIENT : undefined,
                                  }}
                                >
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {missing && (
                          <p className="text-xs text-red-500">
                            Please complete all fields for this vehicle.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!allVehiclesValid && (
                  <p className="text-xs text-red-500">
                    Please complete details for each vehicle to continue.
                  </p>
                )}
              </section>
            )}
          </>
        )}

        {/* BUTTON */}
        <button
          type="button"
          onClick={() => (canContinue ? onNext?.() : null)}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-between px-6
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
