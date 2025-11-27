import React, { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import DatePicker from "./../DatePicker";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const Step7ContactCleaning = ({
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
  user = null,
  serviceDate,
  setServiceDate,
}) => {
  if (!visible) return null;

  const isLoggedIn = !!user;
  const [enterNew, setEnterNew] = useState(false);

  const showAccountCard = isLoggedIn && !enterNew;
  const hasDate = !!serviceDate;
  const canProceed = canContinueContact && hasDate;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Contact Details
          </h2>
        </div>

        {/* PROGRESS — ОБОВʼЯЗКОВО 3 СМУЖКИ */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full flex-[1.2]"
              style={{
                background: i < 2 ? GOLD_GRADIENT : "#E5E7EB",
              }}
            />
          ))}
        </div>

        {/* DATE PICKER */}
        <div className="space-y-2">
          <p className="text-[15px] font-semibold text-[#18181B]">
            Preferred service date
          </p>
          <DatePicker value={serviceDate} onChange={setServiceDate} />

          {!hasDate && (
            <p className="text-[12px] text-red-500">
              Please select the date for your cleaning service.
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
                <span className="text-[16px] font-semibold">{firstName} {lastName}</span>
                <span className="text-[14px] text-[#4B5563]">{email}</span>
              </div>
            </div>

            <button
              onClick={onNext}
              disabled={!canProceed}
              className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow disabled:opacity-60"
              style={{ background: GOLD_GRADIENT }}
            >
              Use this account
            </button>

            <button
              onClick={() => setEnterNew(true)}
              className="w-full h-[52px] rounded-[88px] border border-[#D4D4D8] font-semibold"
            >
              Enter new details
            </button>
          </div>
        )}

        {/* MANUAL FORM */}
        {!showAccountCard && (
          <>
            <div className="space-y-3">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4"
              />

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4"
              />
            </div>

            <button
              onClick={onNext}
              disabled={!canProceed}
              className="w-full h-[52px] rounded-[88px] text-black font-semibold shadow disabled:opacity-60"
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

export default Step7ContactCleaning;
