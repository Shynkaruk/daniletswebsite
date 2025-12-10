// src/Components/NewBooking/StepConctactDetails.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "./ProgressBar"; // шлях як у тебе

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const StepContactDetails = ({
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

  user,
  isCleaning = false,

  // для контролю прогрес-бару ззовні
  renderProgress,
  progressStepIndex,
  totalSteps,
}) => {
  const isLoggedIn = !!user;

  // режим: "account" | "manual"
  const [mode, setMode] = React.useState(
    isLoggedIn ? "account" : "manual"
  );

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v || "");
  const isPhone = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

  const canContinue =
    firstName?.trim() &&
    lastName?.trim() &&
    isPhone(phone) &&
    isEmail(email);

  // дефолтні значення прогресу
  const defaultIndex = isCleaning ? 4 : 6;
  const defaultTotal = isCleaning ? 4 : 7;

  const activeIndex = progressStepIndex || defaultIndex;
  const stepsTotal = totalSteps || defaultTotal;

  // коли вибираємо "Use my account" – підтягуємо дані з user (якщо є)
  React.useEffect(() => {
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

  const handleContinue = () => {
    if (!canContinue) return;
    onNext?.();
  };

  if (!visible) return null;

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
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Contact details
          </h2>
        </div>

        {/* PROGRESS */}
        {renderProgress ? (
          renderProgress(activeIndex)
        ) : (
          <ProgressBar activeCount={activeIndex} total={stepsTotal} />
        )}

        {/* Якщо юзер залогінений — вибір: аккаунт чи нові дані */}
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
                    Phone: <span className="font-medium">
                      {user?.phone || phone}
                    </span>
                  </div>
                )}
                {(user?.email || email) && (
                  <div>
                    Email: <span className="font-medium">
                      {user?.email || email}
                    </span>
                  </div>
                )}
                <div className="mt-1 text-[11px] text-[#9CA3AF]">
                  You can still edit these details below before submitting.
                </div>
              </div>
            )}
          </section>
        )}

        {/* Ім’я + прізвище */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm text-[#6B7280] font-medium">
                First name *
              </div>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-[#6B7280] font-medium">
                Last name *
              </div>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              />
            </div>
          </div>

          {/* Phone + email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm text-[#6B7280] font-medium">
                Phone number *
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(xxx) xxx-xxxx"
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              />
              {!isPhone(phone) && phone && (
                <p className="text-[11px] text-red-500 mt-0.5">
                  Please enter a valid phone number.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm text-[#6B7280] font-medium">
                Email *
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
              />
              {!isEmail(email) && email && (
                <p className="text-[11px] text-red-500 mt-0.5">
                  Please enter a valid email.
                </p>
              )}
            </div>
          </div>
        </section>

{/* Heard about us + extra info */}
<section className="space-y-3">
  {/* HEARD ABOUT US — CHECKBOXES */}
  <div className="space-y-1">
    <div className="text-sm text-[#6B7280] font-medium">
      How did you hear about us?
    </div>

    {[
      "Instagram",
      "Google Search",
      "Friend / Referral",
      "Facebook",
      "TikTok",
      "Returning customer",
      "Other",
    ].map((item) => {
      const checked = Array.isArray(heardAbout)
        ? heardAbout.includes(item)
        : false;

      return (
        <label
          key={item}
          className="flex items-center gap-2 cursor-pointer text-[14px] text-[#111827]"
        >
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[#D4D4D8]"
            checked={checked}
            onChange={() => {
              const prev = Array.isArray(heardAbout) ? heardAbout : [];
              if (checked) {
                setHeardAbout(prev.filter((v) => v !== item));
              } else {
                setHeardAbout([...prev, item]);
              }
            }}
          />
          <span>{item}</span>
        </label>
      );
    })}

    {/* If "Other" is selected → show input */}
    {Array.isArray(heardAbout) && heardAbout.includes("Other") && (
      <input
        className="mt-2 w-full h-[44px] rounded-[16px] bg-[#F4F4F5] px-4 text-[14px] outline-none"
        placeholder="Please specify"
        value={extraInfo}
        onChange={(e) => setExtraInfo(e.target.value)}
      />
    )}
  </div>

  {/* EXTRA NOTES */}
  <div className="space-y-1">
    <div className="text-sm text-[#6B7280] font-medium">
      Anything else we should know?
    </div>
    <textarea
      value={extraInfo}
      onChange={(e) => setExtraInfo(e.target.value)}
      rows={3}
      className="w-full rounded-[16px] bg-[#F4F4F5] px-4 py-2 text-[14px] outline-none resize-none"
    />
  </div>
</section>


        {/* BUTTON */}
        <button
          type="button"
          onClick={handleContinue}
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

export default StepContactDetails;
