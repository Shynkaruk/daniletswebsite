import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";

function OptionButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-[44px] rounded-[16px] border text-sm font-semibold px-3 text-left",
        active
          ? "border-transparent text-black"
          : "border-[#E5E7EB] text-[#4B5563] bg-white",
      ].join(" ")}
      style={{ background: active ? GOLD_GRADIENT : undefined }}
    >
      {children}
    </button>
  );
}

const DAY_TIME_OPTIONS = [
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
  { key: "mornings", label: "Mornings" },
  { key: "afternoons", label: "Afternoons" },
  { key: "evenings", label: "Evenings" },
  { key: "flexible", label: "Flexible" },
];

export default function StepCleaningCommercialAccess({
  visible,
  onBack,
  onNext,

  cleaningCommercial,
  setCleaningCommercial,

  renderProgress,
  progressStepIndex = 7,
  totalSteps = 9,
}) {
  if (!visible) return null;

  const preferred = Array.isArray(cleaningCommercial?.preferredDaysTimes)
    ? cleaningCommercial.preferredDaysTimes
    : [];

  const accessInstructions = cleaningCommercial?.accessInstructions || "";

  const canContinue = useMemo(() => {
    // По документації не написано required, але це ключове — просимо хоча б 1 варіант
    return preferred.length > 0;
  }, [preferred]);

  const setField = (key, value) =>
    setCleaningCommercial((prev) => ({ ...(prev || {}), [key]: value }));

  const toggle = (k) => {
    const next = preferred.includes(k)
      ? preferred.filter((x) => x !== k)
      : [...preferred, k];
    setField("preferredDaysTimes", next);
  };

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[26px] font-extrabold text-[#111827]">
              Access & Scheduling
            </h2>
          </div>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold text-[#111827]">
            Preferred cleaning days/times? (Select all that apply)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DAY_TIME_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.key}
                active={preferred.includes(opt.key)}
                onClick={() => toggle(opt.key)}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="text-sm font-semibold text-[#111827]">
            Is there a security system or special access instructions? (please specify)
          </div>
          <textarea
            value={accessInstructions}
            onChange={(e) => setField("accessInstructions", e.target.value)}
            className="w-full min-h-[110px] rounded-[18px] border border-[#E5E7EB] px-4 py-3 outline-none"
            placeholder="Type here..."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="h-[46px] px-6 rounded-full border border-[#D1D5DB] text-sm font-semibold text-[#111827]"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className={[
              "h-[46px] px-8 rounded-full text-sm font-semibold text-black",
              !canContinue ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
            style={{ background: GOLD_GRADIENT }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
