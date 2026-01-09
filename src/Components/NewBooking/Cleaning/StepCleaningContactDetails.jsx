import React, { useMemo, useEffect } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const HEARD_OPTIONS = [
  "Google",
  "Instagram",
  "Facebook",
  "TikTok",
  "Friend / Referral",
  "Other",
];

function HeardRow({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "w-full h-[44px] rounded-[16px] border px-4 text-sm font-semibold text-left transition flex items-center justify-between",
        checked
          ? "border-transparent text-black"
          : "border-[#E5E7EB] bg-white text-[#4B5563]",
      ].join(" ")}
      style={{ background: checked ? GOLD_GRADIENT : undefined }}
    >
      <span>{label}</span>

      <span
        className={[
          "w-5 h-5 rounded-[6px] border flex items-center justify-center",
          checked ? "bg-black border-black" : "bg-white border-[#D1D5DB]",
        ].join(" ")}
      >
        {checked ? <span className="text-white text-[12px] leading-none">✓</span> : null}
      </span>
    </button>
  );
}

export default function StepCleaningContactDetails({
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

  heardAbout,
  setHeardAbout,
  extraInfo,
  setExtraInfo,

  // ✅ ДОДАЄМО user (як у personal contact step)
  user,

  renderProgress,
  progressStepIndex = 9,
  totalSteps = 10,
}) {
  if (!visible) return null;

  const isLoggedIn = !!user;

  // ✅ режим: account / manual
  const [mode, setMode] = React.useState(isLoggedIn ? "account" : "manual");

  // якщо юзер залогінився вже після рендера — переключимо дефолт
  useEffect(() => {
    if (isLoggedIn) setMode((m) => (m ? m : "account"));
  }, [isLoggedIn]);

  // ✅ коли mode=account — підтягнути дані з user
  useEffect(() => {
    if (!isLoggedIn) return;
    if (mode !== "account") return;

    const accFirst = user?.first_name || "";
    const accLast = user?.last_name || "";
    const accPhone = user?.phone || "";
    const accEmail = user?.email || "";

    if (accFirst) setFirstName(accFirst);
    if (accLast) setLastName(accLast);
    if (accPhone) setPhone(accPhone);
    if (accEmail) setEmail(accEmail);
  }, [isLoggedIn, mode, user, setFirstName, setLastName, setPhone, setEmail]);

  const safeHeard = Array.isArray(heardAbout) ? heardAbout : [];

  const toggleHeard = (val) => {
    setHeardAbout((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return base.includes(val) ? base.filter((x) => x !== val) : [...base, val];
    });
  };

  const isEmailOk = (v) => /\S+@\S+\.\S+/.test(v || "");
  const isPhoneOk = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

  const canContinue = useMemo(() => {
    return (
      firstName?.trim() &&
      lastName?.trim() &&
      isPhoneOk(phone) &&
      isEmailOk(email)
    );
  }, [firstName, lastName, phone, email]);

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Contact details
          </h2>
        </div>

        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* ✅ ВСТАВИВ твій блок, адаптований під cleaning */}
        {isLoggedIn && (
          <section className="space-y-3">
            <div className="text-sm text-[#6B7280] font-medium">
              How would you like to provide your contact details?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("account")}
                className={`h-[44px] rounded-[16px] border text-sm font-semibold
                  ${
                    mode === "account"
                      ? "border-transparent text-black"
                      : "border-[#E5E7EB] text-[#4B5563] bg-white"
                  }`}
                style={{
                  background: mode === "account" ? GOLD_GRADIENT : undefined,
                }}
              >
                Use my account
              </button>

              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`h-[44px] rounded-[16px] border text-sm font-semibold
                  ${
                    mode === "manual"
                      ? "border-transparent text-black"
                      : "border-[#E5E7EB] text-[#4B5563] bg-white"
                  }`}
                style={{
                  background: mode === "manual" ? GOLD_GRADIENT : undefined,
                }}
              >
                Enter different details
              </button>
            </div>

            {mode === "account" && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-3 text-[13px] text-[#4B5563]">
                <div className="font-semibold text-[#111827]">
                  {(user?.first_name || firstName || "")}{" "}
                  {(user?.last_name || lastName || "")}
                </div>

                {(user?.phone || phone) && (
                  <div className="mt-1">
                    Phone:{" "}
                    <span className="font-medium">{user?.phone || phone}</span>
                  </div>
                )}

                {(user?.email || email) && (
                  <div>
                    Email:{" "}
                    <span className="font-medium">{user?.email || email}</span>
                  </div>
                )}

                <div className="mt-1 text-[11px] text-[#9CA3AF]">
                  You can still edit these details below before submitting.
                </div>
              </div>
            )}
          </section>
        )}

        {/* форма (залишається як була) */}
        <section className="bg-white rounded-[20px] border border-[#E5E7EB] p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                First name *
              </div>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Last name *
              </div>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">Phone *</div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full"
                placeholder="+1 ..."
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">Email *</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none w-full"
                placeholder="name@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              How did you hear about us?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEARD_OPTIONS.map((x) => (
                <HeardRow
                  key={x}
                  label={x}
                  checked={safeHeard.includes(x)}
                  onToggle={() => toggleHeard(x)}
                />
              ))}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${!canContinue ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
