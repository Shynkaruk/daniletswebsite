// src/Components/Booking/StepDetailingBusinessDetails.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// Section 3: Business Details
const BUSINESS_TYPE_OPTIONS = [
  "Dealership",
  "Fleet Company",
  "Rental Car Company",
  "Corporate Fleet",
  "Other",
];

// Section 4: Service Frequency
const SERVICE_FREQUENCY_OPTIONS = [
  "One-Time",
  "Weekly",
  "Bi-Weekly",
  "Monthly",
  "Quarterly",
  "Other",
];

const StepDetailingBusinessDetails = ({
  visible,
  onBack,
  onNext,

  // стейти з Booking для Business/Fleet
  businessVehiclesCount,         // string | number
  setBusinessVehiclesCount,
  businessType,                  // string з BUSINESS_TYPE_OPTIONS
  setBusinessType,
  businessTypeOther,             // string для "Other"
  setBusinessTypeOther,
  serviceFrequency,              // string з SERVICE_FREQUENCY_OPTIONS
  setServiceFrequency,
  serviceFrequencyOther,         // string для "Other"
  setServiceFrequencyOther,

  renderProgress,
  totalSteps = 6,                // скільки всього кроків у бізнес-флоу
}) => {
  if (!visible) return null;

  const vehiclesNum = Number(businessVehiclesCount) || 0;
  const isBusinessTypeOther = businessType === "Other";
  const isFrequencyOther = serviceFrequency === "Other";

  const hasValidBusinessType =
    !!businessType && (!isBusinessTypeOther || businessTypeOther.trim().length > 0);

  const hasValidFrequency =
    !!serviceFrequency && (!isFrequencyOther || serviceFrequencyOther.trim().length > 0);

  const canContinue =
    vehiclesNum > 0 && hasValidBusinessType && hasValidFrequency;

  const handleVehiclesCountChange = (value) => {
    const num = Number(value) || "";
    setBusinessVehiclesCount(value);
  };

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
            Business details
          </h2>
        </div>

        {/* Прогрес: я пропоную зробити це першим бізнес-кроком */}
        {renderProgress ? (
          renderProgress(1)
        ) : (
          <ProgressBar activeCount={1} total={totalSteps} />
        )}

        {/* Section 3: How many vehicles need detailing? */}
        <section className="space-y-2 mt-1">
          <div className="text-sm text-[#6B7280] font-medium">
            How many vehicles need detailing? *
          </div>
          <input
            type="number"
            min="1"
            value={businessVehiclesCount}
            onChange={(e) => handleVehiclesCountChange(e.target.value)}
            placeholder="Enter number of vehicles"
            className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
          />
          {vehiclesNum <= 0 && (
            <p className="text-[12px] text-red-500 mt-1">
              Please enter at least 1 vehicle.
            </p>
          )}
        </section>

        {/* Section 3: What type of business are you? */}
        <section className="space-y-2">
          <div className="text-sm text-[#6B7280] font-medium">
            What type of business are you? *
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BUSINESS_TYPE_OPTIONS.map((opt) => {
              const active = businessType === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBusinessType(opt)}
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

          {isBusinessTypeOther && (
            <input
              type="text"
              value={businessTypeOther}
              onChange={(e) => setBusinessTypeOther(e.target.value)}
              placeholder="Please specify your business type"
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none mt-2"
            />
          )}
        </section>

        {/* Section 4: Service Frequency */}
        <section className="space-y-2">
          <div className="text-sm text-[#6B7280] font-medium">
            How often do you need detailing services?
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICE_FREQUENCY_OPTIONS.map((opt) => {
              const active = serviceFrequency === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setServiceFrequency(opt)}
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

          {isFrequencyOther && (
            <input
              type="text"
              value={serviceFrequencyOther}
              onChange={(e) => setServiceFrequencyOther(e.target.value)}
              placeholder="Please specify the frequency you need"
              className="w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none mt-2"
            />
          )}
        </section>

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

export default StepDetailingBusinessDetails;
