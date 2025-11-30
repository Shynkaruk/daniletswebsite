// src/Components/Booking/Step8Checkout.jsx
import React from "react";
import { FiChevronLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";
import ProgressBar from "./ProgressBar";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const Step8Checkout = ({
  visible,
  isCleaning,

  // common
  firstName,
  lastName,
  phone,
  birthday,
  email,

  // detailing only
  vehicleYear,
  vehicleMake,
  vehicleModel,
  TIP_PRESETS,
  tip,
  setTip,
  subTotal,
  tax,
  total,
  depositAmount,
  includeExtraAddress,
  setIncludeExtraAddress,
  selectedServiceObj,
  addonsDb,
  selectedAddOns,
  receiptOnly,
  setReceiptOnly,
  submitting,
  submitRequest,
  onBack,
  onEditPersonal,
  onEditCar,
  onAddMoreServices,
  progressActive = 6,
}) => {
  const location = useLocation();
  const stripe = useStripe();

  if (!visible) return null;

  const isCleaningFlow =
    isCleaning || location.pathname.toLowerCase().includes("cleaning");

  const selectedAddOnsArray = Array.from(selectedAddOns || new Set());

  // ===== ДЕТАЙЛІНГ: Submit → Stripe Checkout page =====
  const handleSubmitWithStripeCheckout = async () => {
    if (submitting) return;
    if (!stripe) {
      console.error("Stripe is not ready");
      return;
    }

    try {
      // 1) Створюємо Checkout Session на бекенді
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depositAmount,
          currency: "usd",
          firstName,
          lastName,
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.sessionId) {
        console.error("Create checkout session error:", data);
        return;
      }

      const sessionId = data.sessionId;

      // 2) Редірект на Stripe Checkout (карта / Apple Pay / Google Pay)
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe redirectToCheckout error:", error);
      }
    } catch (err) {
      console.error("Checkout session request failed:", err);
    }
  };

  // ===== CLEANING VARIANT =====
  if (isCleaningFlow) {
    return (
      <div className="w-full max-w-full min-w-0 text-left space-y-4">
        <div className="bg:white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
          <div className="flex items:center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
              aria-label="Back"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
              Submit Request
            </h2>
          </div>

          <ProgressBar activeCount={3} total={3} />

          <p className="text-sm text-[#4B5563]">
            No payment is required at this step. Submit your request and{" "}
            <span className="font-semibold">we will contact you</span> to
            confirm the details and final price.
          </p>

          <div className="space-y-2">
            <div className="text-sm text-[#6B7280] font-medium">
              Your personal information
            </div>
            <div className="grid gap-2">
              <input
                disabled
                value={firstName}
                className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
              />
              <input
                disabled
                value={lastName}
                className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
              />
              <input
                disabled
                value={phone}
                className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
              />
              <input
                disabled
                value={birthday}
                className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
              />
              <input
                disabled
                value={email}
                className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
              />
            </div>
            <button
              onClick={onEditPersonal}
              className="mt-2 inline-flex items-center justify-center h-[40px] rounded-[12px] px-4 text-sm font-semibold text-black"
              style={{ background: GOLD_GRADIENT }}
            >
              Change Personal Information
            </button>
          </div>

          <button
            onClick={submitRequest}
            disabled={submitting}
            type="button"
            className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: GOLD_GRADIENT }}
          >
            {submitting ? "Submitting..." : "Submit Cleaning Request"}
            <span className="text-lg">›</span>
          </button>
        </div>
      </div>
    );
  }

  // ===== DETAILING VARIANT (Redirect to Stripe Checkout) =====
  return (
    <div className="w-full max-w-full min-w-0 text-left space-y-4">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
              aria-label="Back"
            >
              <FiChevronLeft className="text-[18px] text-[#18181B]" />
            </button>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
              Checkout
            </h2>
          </div>

          <button
            onClick={() => setReceiptOnly((v) => !v)}
            className="inline-flex items-center gap-2 text-[14px] text-[#18181B]"
            title={receiptOnly ? "Show details" : "Show receipt only"}
          >
            {receiptOnly ? <FiEyeOff /> : <FiEye />}
            {receiptOnly ? "Receipt only" : "Show receipt only"}
          </button>
        </div>

        <ProgressBar activeCount={progressActive} total={6} />

        {!receiptOnly && (
          <>
            {/* PERSONAL INFO */}
            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Your personal information
              </div>
              <div className="grid gap-2">
                <input
                  disabled
                  value={firstName}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
                <input
                  disabled
                  value={lastName}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
                <input
                  disabled
                  value={phone}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
                <input
                  disabled
                  value={birthday}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
                <input
                  disabled
                  value={email}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
              </div>
              <button
                onClick={onEditPersonal}
                className="mt-2 inline-flex items-center justify-center h-[40px] rounded-[12px] px-4 text-sm font-semibold text:black"
                style={{ background: GOLD_GRADIENT }}
              >
                Change Personal Information
              </button>
            </div>

            {/* CAR INFO */}
            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">
                Your car information
              </div>
              <div className="grid gap-2">
                <input
                  disabled
                  value={`${vehicleYear} year`}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
                <input
                  disabled
                  value={vehicleMake}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
                <input
                  disabled
                  value={vehicleModel}
                  className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                />
              </div>
              <button
                onClick={onEditCar}
                className="mt-2 inline-flex items-center justify-center h-[40px] rounded-[12px] px-4 text-sm font-semibold text-black"
                style={{ background: GOLD_GRADIENT }}
              >
                Change Car Information
              </button>
            </div>

            {/* Info про оплату */}
            <div className="space-y-2">
              <div className="text-sm text-[#6B7280] font-medium">Payment</div>
              <p className="text-xs text-[#6B7280]">
                After clicking the button below you&apos;ll be redirected to a
                secure Stripe payment page where you can pay your{" "}
                <span className="font-semibold">
                  booking deposit (${depositAmount.toFixed(2)})
                </span>{" "}
                using a card, Apple Pay or Google Pay. You&apos;ll also have the
                option to save your card for future visits.
              </p>

              {/* Tips */}
              <div className="space-y-2 mt-3">
                <div className="text-sm text-[#6B7280] font-medium">
                  Select tip amount (optional)
                </div>
                <div className="flex flex-wrap gap-2">
                  {TIP_PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTip(v)}
                      className={`h-[36px] px-4 rounded-full border ${
                        tip === v ? "border-transparent" : "border-[#E5E7EB]"
                      }`}
                      style={{
                        background: tip === v ? GOLD_GRADIENT : "#ffffff",
                      }}
                    >
                      ${v}
                    </button>
                  ))}
                  <input
                    inputMode="numeric"
                    placeholder="Custom"
                    className="h-[36px] w-[100px] rounded-full border border-[#E5E7EB] px-3"
                    onChange={(e) => setTip(+e.target.value || 0)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* RECEIPT */}
        <div
          className="rounded-[16px] border p-4 space-y-3"
          style={{
            backgroundColor: "rgba(245,218,147,0.2)",
            borderColor: "#E5E7EB",
          }}
        >
          <div className="font-semibold text-[#18181B]">
            List of services you have selected
          </div>

          <div className="flex items-center justify-between text-[15px]">
            <span>{selectedServiceObj?.title || "—"}</span>
            <span>${(Number(selectedServiceObj?.price) || 0).toFixed(2)}</span>
          </div>

          {addonsDb.map((ad) =>
            selectedAddOnsArray.includes(ad.id) ? (
              <div
                key={ad.id}
                className="flex items-center justify-between text-[15px]"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#E1C07B" }}
                  />
                  {ad.title}
                </span>
                <span>${(Number(ad.price) || 0).toFixed(2)}</span>
              </div>
            ) : null
          )}

          <div className="h-px bg-[#E5E7EB]" />

          <div className="flex items-center justify-between text-[14px]">
            <span>SUBTOTAL</span>
            <span>${subTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text:[14px]">
            <span>TAX (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span>TIP</span>
            <span>${tip.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[16px] font-extrabold">
            <span>TOTAL</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[14px]">
            <span>DEPOSIT</span>
            <span>${depositAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-start gap-2 text-[13px] text-[#374151]">
            <input
              id="extraAddress"
              type="checkbox"
              className="mt-1"
              checked={includeExtraAddress}
              onChange={(e) => setIncludeExtraAddress(e.target.checked)}
            />
            <label htmlFor="extraAddress">
              Your additional address included to the route. Deposit amount will
              be deducted from total.
            </label>
          </div>
        </div>

        {/* Головна кнопка: редірект на Stripe Checkout */}
        <button
          onClick={handleSubmitWithStripeCheckout}
          disabled={submitting || !stripe}
          type="button"
          className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: GOLD_GRADIENT }}
        >
          {submitting
            ? "Processing..."
            : `Submit Request & Go to Payment ($${depositAmount})`}
          <span className="text-lg">›</span>
        </button>

        <button
          onClick={onAddMoreServices}
          type="button"
          className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2"
          style={{ background: GOLD_GRADIENT }}
        >
          Add More Services <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default Step8Checkout;
