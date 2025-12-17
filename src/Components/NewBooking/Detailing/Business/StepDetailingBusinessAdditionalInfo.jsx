import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[44px] px-4 rounded-full border text-sm font-semibold transition
        ${
          active
            ? "border-transparent text-black shadow-sm"
            : "border-[#E5E7EB] text-[#111827] bg-white hover:bg-[#F9FAFB]"
        }`}
      style={active ? { background: GOLD_GRADIENT } : undefined}
    >
      {children}
    </button>
  );
}

export default function StepDetailingBusinessAdditionalInfo({
  visible,
  onBack,
  onNext,

  businessNotes,
  setBusinessNotes,

  preferredContactMethod,
  setPreferredContactMethod,

  contactTimePreference,
  setContactTimePreference,

  renderProgress,
  progressStepIndex = 9,
  totalSteps = 11,
}) {
  if (!visible) return null;

  const contactMethodOptions = useMemo(
    () => [
      { key: "phone", label: "Phone call" },
      { key: "text", label: "Text message" },
      { key: "email", label: "Email" },
    ],
    []
  );

  const timeOptions = useMemo(
    () => [
      { key: "morning", label: "Morning" },
      { key: "afternoon", label: "Afternoon" },
      { key: "evening", label: "Evening" },
      { key: "anytime", label: "Anytime" },
    ],
    []
  );

  const canContinue = !!preferredContactMethod && !!contactTimePreference;

  const handleNext = () => {
    // якщо хочеш дозволяти йти далі без вибору — скажи, я зроблю optional
    if (!canContinue) return;
    onNext?.();
  };

  return (
    <div className="w-full text-left">
      <div className="bg-white/90 rounded-[24px] p-6 shadow space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center"
          >
            <FiChevronLeft />
          </button>

          <div>
            <h2 className="text-[22px] font-extrabold">Additional Information</h2>
            <p className="text-[12px] text-[#9CA3AF]">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {renderProgress?.(progressStepIndex)}

        {/* Preferred contact method */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#111827]">
            Preferred contact method <span className="text-[#EF4444]">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {contactMethodOptions.map((o) => (
              <Pill
                key={o.key}
                active={preferredContactMethod === o.key}
                onClick={() => setPreferredContactMethod?.(o.key)}
              >
                {o.label}
              </Pill>
            ))}
          </div>
        </div>

        {/* Best time */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#111827]">
            Best time to reach you <span className="text-[#EF4444]">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {timeOptions.map((o) => (
              <Pill
                key={o.key}
                active={contactTimePreference === o.key}
                onClick={() => setContactTimePreference?.(o.key)}
              >
                {o.label}
              </Pill>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <p className="text-sm text-[#6B7280]">
            Is there anything else you'd like us to know? (optional)
          </p>
          <textarea
            className="w-full border rounded-[16px] px-4 py-3 min-h-[120px]"
            placeholder="Fleet size, turnaround needs, special requirements, etc."
            value={businessNotes}
            onChange={(e) => setBusinessNotes?.(e.target.value)}
          />
        </div>

        {!canContinue && (
          <p className="text-xs text-[#EF4444]">
            Please select your preferred contact method and best time to reach you.
          </p>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] text-black font-semibold shadow transition
            ${!canContinue ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
