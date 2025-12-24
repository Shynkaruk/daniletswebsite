import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";

const HEAR_OPTIONS = [
  { key: "google", label: "Google Search" },
  { key: "facebook", label: "Facebook" },
  { key: "returning", label: "Returning Client" },
  { key: "instagram", label: "Instagram" },
  { key: "referral", label: "Referral/Friend" },
  { key: "other", label: "Other (please specify)" },
];

export default function StepCleaningCommercialContactInfo({
  visible,
  onBack,
  onNext,

  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  email,
  setEmail,

  hearAbout,
  setHearAbout, // string
  referralName,
  setReferralName,
  hearOther,
  setHearOther,

  renderProgress,
  progressStepIndex = 2,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const canContinue = useMemo(() => {
    const base =
      String(firstName || "").trim() &&
      String(lastName || "").trim() &&
      String(phone || "").trim() &&
      String(email || "").trim() &&
      String(hearAbout || "").trim();

    if (!base) return false;

    if (hearAbout === "referral") return String(referralName || "").trim();
    if (hearAbout === "other") return String(hearOther || "").trim();

    return true;
  }, [firstName, lastName, phone, email, hearAbout, referralName, hearOther]);

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
              Contact Information
            </h2>
          </div>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#111827]">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#111827]">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
              inputMode="tel"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#111827]">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
              inputMode="email"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-[#111827]">
              How did you hear about us?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEAR_OPTIONS.map((opt) => {
                const active = hearAbout === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setHearAbout(opt.key);
                      if (opt.key !== "referral") setReferralName("");
                      if (opt.key !== "other") setHearOther("");
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

            {hearAbout === "referral" && (
              <div className="pt-2">
                <label className="text-sm font-semibold text-[#111827]">
                  Name
                </label>
                <input
                  value={referralName}
                  onChange={(e) => setReferralName(e.target.value)}
                  className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                  placeholder="Name of that person"
                />
              </div>
            )}

            {hearAbout === "other" && (
              <div className="pt-2">
                <label className="text-sm font-semibold text-[#111827]">
                  Please specify
                </label>
                <input
                  value={hearOther}
                  onChange={(e) => setHearOther(e.target.value)}
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
