// src/Components/NewBooking/Cleaning/StepCleaningPropertyDetails.jsx
import React, { useMemo } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

export default function StepCleaningPropertyDetails({
  visible,
  onBack,
  onNext,
  propertyType,

  // ✅ residential (НЕ ЗМІНЮЄМО)
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,

  // ✅ commercial (Contact Information — як в документації)
  firstName,
  setFirstName,
  lastName,
  setLastName,
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  phoneNumber,
  setPhoneNumber,
  email,
  setEmail,
  hearAboutUs,
  setHearAboutUs,

  renderProgress,
  progressStepIndex = 3,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const isResidential = propertyType === "residential";
  const isCommercial = propertyType === "commercial";

  const canContinue = useMemo(() => {
    if (isResidential) {
      return (
        String(bedrooms || "").trim() &&
        String(bathrooms || "").trim()
      );
    }
    if (isCommercial) {
      return (
        String(firstName || "").trim() &&
        String(lastName || "").trim() &&
        String(companyName || "").trim() &&
        String(companyAddress || "").trim() &&
        String(phoneNumber || "").trim() &&
        String(email || "").trim() &&
        String(hearAboutUs || "").trim()
      );
    }
    return false;
  }, [
    isResidential,
    isCommercial,
    bedrooms,
    bathrooms,
    firstName,
    lastName,
    companyName,
    companyAddress,
    phoneNumber,
    email,
    hearAboutUs,
  ]);

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        {/* Header */}
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
            {/* ✅ Residential НЕ чіпаємо: як було “Property details” */}
            {isResidential ? (
              <>
                <h2 className="text-[26px] font-extrabold text-[#111827]">
                  Property details
                </h2>
              </>
            ) : (
              <>
                {/* ✅ Commercial: заголовок/секція як в документації */}
                <h2 className="text-[26px] font-extrabold text-[#111827]">
                  Contact Information
                </h2>
                <p className="text-[14px] text-[#6B7280] mt-1">
                  Please provide your contact details.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress MUST be under title */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* Fields */}
        {isResidential ? (
          // ✅ Residential block — НЕ ЗМІНЮЄМО
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[#111827]">
                Bedrooms
              </label>
              <input
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="e.g. 3"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">
                Bathrooms
              </label>
              <input
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="e.g. 2"
                inputMode="numeric"
              />
            </div>
          </div>
        ) : (
          // ✅ Commercial block — Contact Information (без зірочок)
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
                  placeholder="First name"
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
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">
                Company Name
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">
                Company Address
              </label>
              <input
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="Company address"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">
                Phone Number
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="Phone number"
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
                placeholder="Email"
                inputMode="email"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#111827]">
                How did you hear about us?
              </label>
              <input
                value={hearAboutUs}
                onChange={(e) => setHearAboutUs(e.target.value)}
                className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                placeholder="Google, referral, social media..."
              />
            </div>
          </div>
        )}

        {/* Bottom nav */}
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
