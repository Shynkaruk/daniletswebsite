import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar"; // перевір шлях

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// Сервіси строго з анкети (Section 5)
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

  services,              // array of strings
  setServices,
  otherServiceText,      // string
  setOtherServiceText,

  renderProgress,
  totalSteps = 6,
}) => {
  if (!visible) return null;

  const toggleService = (name) => {
    if (services.includes(name)) {
      setServices(services.filter((s) => s !== name));
    } else {
      setServices([...services, name]);
    }
  };

  const hasOther = services.includes("Other");
  const baseOk = services.length > 0;
  const otherOk = !hasOther || (hasOther && otherServiceText.trim().length > 0);

  const canContinue = baseOk && otherOk;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
          >
            <FiChevronLeft className="text-[18px]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Select services
            </h2>
            <p className="text-[12px] text-[#9CA3AF]">
              Step 5 of {totalSteps}
            </p>
          </div>
        </div>

        {/* Progress */}
        {renderProgress ? (
          renderProgress(5)
        ) : (
          <ProgressBar activeCount={5} total={totalSteps} />
        )}

        {/* Services list */}
        <section className="space-y-3 pt-1">
          <p className="text-sm text-[#6B7280] font-medium">
            What services are you interested in? (select all that apply){" "}
            <span className="text-red-500">*</span>
          </p>

          <div className="flex flex-col gap-2">
            {SERVICES_OPTIONS.map((name) => {
              const active = services.includes(name);

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleService(name)}
                  className={`w-full rounded-[20px] border px-4 py-3 sm:px-5 sm:py-4 text-left text-[13px] sm:text-[14px] font-medium
                    ${
                      active
                        ? "border-transparent text-black shadow-sm"
                        : "border-[#E5E7EB] text-[#111827] bg-white"
                    }`}
                  style={{ background: active ? GOLD_GRADIENT : undefined }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{name}</span>

                    {/* “чекбокс” справа, як у макеті */}
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center text-[12px]
                        ${
                          active
                            ? "border-black bg-black text-white"
                            : "border-[#D4D4D8] bg-white text-transparent"
                        }`}
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Other text field */}
          {hasOther && (
            <div className="space-y-1">
              <label className="text-[12px] text-[#6B7280]">
                Please specify other services you&apos;re interested in *
              </label>
              <textarea
                rows={3}
                value={otherServiceText}
                onChange={(e) => setOtherServiceText(e.target.value)}
                className="w-full rounded-[16px] bg-[#F4F4F5] px-4 py-2 text-[14px] outline-none resize-none"
                placeholder="Describe any additional services or special requests"
              />
            </div>
          )}

          {!otherOk && (
            <p className="text-[12px] text-red-500">
              Please specify what &quot;Other&quot; service you need.
            </p>
          )}
        </section>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow 
          inline-flex items-center justify-between px-6 mt-2
          ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          <span>Next</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default StepDetailingServices;
