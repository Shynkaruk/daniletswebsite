// src/Components/Booking/Step7ContactDetails.jsx
import React, { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import DatePicker from "./DatePicker";
import ProgressBar from "./ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const Step7ContactDetails = ({
  visible,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  email,
  setEmail,
  canContinueContact,
  onNext,
  onBack,
  progressActive = 6,
  user = null,
  serviceDate,
  setServiceDate,
  // якщо захочеш передавати явно з Booking:
  isCleaning = false,
}) => {
  if (!visible) return null;

  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Cleaning рахуємо по URL або по пропсу isCleaning
  const isCleaningFlow =
    isCleaning ||
    path.includes("cleaning") ||
    path.includes("/cleaning");

  const isLoggedIn = !!user;
  const [enterNew, setEnterNew] = useState(false);

  const showAccountCard = isLoggedIn && !enterNew;

  const hasDate = !!serviceDate;
  const canProceed = canContinueContact && hasDate;

  const handleUseAccount = () => {
    if (!canProceed) return;
    onNext();
  };

  const handleContinueNew = () => {
    if (!canProceed) return;
    onNext();
  };

  // 👇 тут головне — різна кількість полосок
  const progressActiveCount = isCleaningFlow ? 2 : progressActive;
  const progressTotal = isCleaningFlow ? 3 : 6;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Contact Details
          </h2>
        </div>

        {/* PROGRESS */}
        <ProgressBar
          activeCount={progressActiveCount}
          total={progressTotal}
        />

        {/* DATE PICKER */}
        <div className="space-y-2">
          <p className="text-[15px] font-semibold text-[#18181B]">
            Preferred service date
          </p>
          <DatePicker value={serviceDate} onChange={setServiceDate} />
          {!hasDate && (
            <p className="text-[12px] text-red-500">
              Please select the date for your service.
            </p>
          )}
        </div>

        {/* ACCOUNT CARD */}
        {showAccountCard && (
          <div className="space-y-4">
            <div className="w-full rounded-[20px] border border-[#E5E7EB] bg-white p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[20px] font-bold text-[#18181B]">
                {firstName?.[0] || "U"}
              </div>

              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-[#18181B]">
                  {firstName} {lastName}
                </span>
                <span className="text-[14px] text-[#4B5563]">{email}</span>
              </div>
            </div>

            <button
              onClick={handleUseAccount}
              disabled={!canProceed}
              className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow
                ${!canProceed ? "opacity-60 cursor-not-allowed" : ""}`}
              style={{ background: GOLD_GRADIENT }}
            >
              Use this account
            </button>

            <button
              onClick={() => setEnterNew(true)}
              className="w-full h-[52px] rounded-[88px] font-semibold text-[#18181B] border border-[#D4D4D8]"
            >
              Enter new details
            </button>
          </div>
        )}

        {/* NEW DETAILS FORM */}
        {!showAccountCard && (
          <>
            <div className="space-y-3">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
              />

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="Phone number"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
              />
            </div>

            <button
              onClick={handleContinueNew}
              disabled={!canProceed}
              className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
                ${!canProceed ? "opacity-60 cursor-not-allowed" : ""}`}
              style={{ background: GOLD_GRADIENT }}
            >
              Continue <span className="text-lg">›</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Step7ContactDetails;
