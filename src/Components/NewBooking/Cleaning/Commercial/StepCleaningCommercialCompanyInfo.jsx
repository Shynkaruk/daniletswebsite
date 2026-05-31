import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";
import { AddressAutocomplete } from "../../Detailing/Business/AddressAutocomplete";

const BUSINESS_TYPES = [
  { key: "office", label: "Office" },
  { key: "retail", label: "Retail" },
  { key: "medical", label: "Medical" },
  { key: "hospitality", label: "Hospitality" },
  { key: "property_mgmt", label: "Property Management" },
  { key: "other", label: "Other (please specify)" },
];

export default function StepCleaningCommercialCompanyInfo({
  visible,
  onBack,
  onNext,

  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,

  businessType,
  setBusinessType, // string
  businessTypeOther,
  setBusinessTypeOther,

  renderProgress,
  progressStepIndex = 3,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const canContinue = useMemo(() => {
    const base =
      String(companyName || "").trim() && String(companyAddress || "").trim();

    if (!base) return false;

    if (businessType === "other") return String(businessTypeOther || "").trim();

    // Type of Business не позначений як required у твоєму описі,
    // але якщо хочеш примусити вибір — скажеш, і я зроблю.
    return true;
  }, [companyName, companyAddress, businessType, businessTypeOther]);

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
              Company Information
            </h2>
          </div>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#111827]">
              Company Name
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#111827]">
              Company Address
            </label>
            <AddressAutocomplete
              value={companyAddress}
              onChange={setCompanyAddress}
              inputClass="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-[#111827]">
              Type of Business
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((opt) => {
                const active = businessType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setBusinessType(opt.key);
                      if (opt.key !== "other") setBusinessTypeOther("");
                    }}
                    className={`min-h-[44px] rounded-[16px] border text-sm font-semibold px-3 text-left
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

            {businessType === "other" && (
              <div className="pt-2">
                <label className="text-sm font-semibold text-[#111827]">
                  Please specify
                </label>
                <input
                  value={businessTypeOther}
                  onChange={(e) => setBusinessTypeOther(e.target.value)}
                  className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                />
              </div>
            )}
          </div>
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
