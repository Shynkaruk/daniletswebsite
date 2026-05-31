// src/Components/Booking/StepDetailingServices.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// основні послуги зі списку
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

const StepDetailingServices = ({
  visible,
  onBack,
  onNext,

  // стейти з Booking
  services, // array of strings
  setServices,
  multipleVehicles, // boolean
  setMultipleVehicles,
  vehiclesCount, // number | string
  setVehiclesCount,
  vehicles, // [{ model: "", services: [] }, ...]
  setVehicles,

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const toggleInArray = (arr, value) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const onToggleService = (name) => {
    setServices((prev) => toggleInArray(prev, name));
  };

  // коли міняється кількість авто — підганяємо масив
  const handleVehiclesCountChange = (value) => {
    const num = Number(value) || 0;
    setVehiclesCount(value);

    if (num <= 0) {
      setVehicles([]);
      return;
    }

    setVehicles((prev) => {
      const copy = [...prev];
      if (copy.length < num) {
        // додаємо порожні
        while (copy.length < num) {
          copy.push({ model: "", services: [] });
        }
      } else if (copy.length > num) {
        copy.length = num;
      }
      return copy;
    });
  };

  const updateVehicleModel = (index, value) => {
    setVehicles((prev) => {
      const copy = [...prev];
      if (!copy[index]) copy[index] = { model: "", services: [] };
      copy[index] = { ...copy[index], model: value };
      return copy;
    });
  };

  const toggleVehicleService = (index, serviceName) => {
    setVehicles((prev) => {
      const copy = [...prev];
      if (!copy[index]) copy[index] = { model: "", services: [] };
      const vehicle = copy[index];
      const newServices = vehicle.services?.includes(serviceName)
        ? vehicle.services.filter((s) => s !== serviceName)
        : [...(vehicle.services || []), serviceName];
      copy[index] = { ...vehicle, services: newServices };
      return copy;
    });
  };

  // валідація перед Continue
  const baseOk = services.length > 0; // хоча б одна послуга для основного авто

  let multiOk = true;
  if (multipleVehicles) {
    const num = Number(vehiclesCount) || 0;
    multiOk =
      num > 0 &&
      vehicles.length === num &&
      vehicles.every(
        (v) => v.model && v.model.trim().length > 0 && (v.services || []).length
      );
  }

  const canContinue = baseOk && (!multipleVehicles || multiOk);

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
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
            Services you&apos;re interested in
          </h2>
        </div>

        {/* Прогрес: 3 секція */}
        {renderProgress ? (
          renderProgress(3)
        ) : (
          <ProgressBar activeCount={3} total={totalSteps} />
        )}

        {/* Основні послуги (для поточного авто) */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            What services are you interested in? (select all that apply) *
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES_OPTIONS.map((opt) => {
              const active = services.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onToggleService(opt)}
                  className={`min-h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] font-medium px-3 py-1 text-left
                    ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </section>

        {/* Multiple vehicles toggle */}
        <section className="space-y-3">
          <div className="text-sm text-[#6B7280] font-medium">
            Are you interested in detailing multiple vehicles?
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: false, label: "No" },
              { key: true, label: "Yes" },
            ].map((opt) => {
              const active = multipleVehicles === opt.key;
              return (
                <button
                  key={String(opt.key)}
                  type="button"
                  onClick={() => setMultipleVehicles(opt.key)}
                  className={`h-[40px] rounded-[999px] border text-[13px] sm:text-[14px] font-medium
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

        {/* Якщо обрали Yes → кількість авто + дані по кожному */}
        {multipleVehicles && (
          <section className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                How many vehicles? *
              </div>
              <input
                type="number"
                min="1"
                value={vehiclesCount}
                onChange={(e) => handleVehiclesCountChange(e.target.value)}
                className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              />
            </div>

            {Number(vehiclesCount) > 0 && (
              <div className="space-y-3">
                {Array.from({ length: Number(vehiclesCount) }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[20px] border border-[#E5E7EB] p-3 sm:p-4 space-y-3"
                  >
                    <div className="text-sm font-semibold text-[#111827]">
                      Vehicle {i + 1}
                    </div>
                    <input
                      placeholder="Year, make, and model"
                      value={vehicles[i]?.model || ""}
                      onChange={(e) =>
                        updateVehicleModel(i, e.target.value)
                      }
                      className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
                    />

                    <div className="text-xs sm:text-sm text-[#6B7280] font-medium mt-1">
                      What services for this vehicle? (select all that apply) *
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SERVICES_OPTIONS.map((opt) => {
                        const active = vehicles[i]?.services?.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleVehicleService(i, opt)}
                            className={`min-h-[36px] rounded-[999px] border text-[12px] sm:text-[13px] font-medium px-3 py-1 text-left
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
                ))}
              </div>
            )}
          </section>
        )}

        {/* Кнопка Continue */}
        <button
          onClick={onNext}
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
};

export default StepDetailingServices;
