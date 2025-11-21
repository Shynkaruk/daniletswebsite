// src/Components/Booking/Step7ContactDetails.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import DatePicker from "./DatePicker";

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
  birthday,
  setBirthday,
  email,
  setEmail,
  canContinueContact,
  onNext,
  onBack,
  progressActive = 6, // для Cleaning 4, для Detailing 6
}) => {
  if (!visible) return null;

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
            Your Contact Details
          </h2>
        </div>

        {/* Прогрес */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full flex-[1.2]"
              style={{
                background: i < progressActive ? GOLD_GRADIENT : "#E5E7EB",
              }}
            />
          ))}
        </div>

        <div className="space-y-3">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Enter your phone number"
            className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
          />
          <DatePicker
            label={null} // лейбл уже є в заголовку блоку, якщо потрібно – додай
            value={birthday}
            onChange={setBirthday}
            placeholder="Your birthday"
            disableFuture={true} // дня народження в майбутньому не даємо вибрати
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
            className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
          />
        </div>

        <button
          onClick={onNext}
          disabled={!canContinueContact}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${!canContinueContact ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: GOLD_GRADIENT }}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default Step7ContactDetails;
