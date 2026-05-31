import React from "react";

export const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

export function StepShell({ children }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="w-full bg-white/80 backdrop-blur rounded-3xl shadow-md px-5 sm:px-8 py-6 sm:py-8 text-left">
        {children}
      </div>
    </div>
  );
}

export function StepHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-[22px] sm:text-[28px] font-extrabold text-[#18181B] leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-[14px] sm:text-[15px] text-[#4B5563]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function FieldLabel({ children }) {
  return (
    <div className="text-[13px] sm:text-[14px] font-semibold text-[#18181B] mb-2">
      {children}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "w-full h-[48px] rounded-2xl border border-[#E5E7EB] bg-white px-4",
        "text-[15px] text-[#111827] placeholder:text-[#9CA3AF]",
        "focus:outline-none focus:ring-2 focus:ring-black/10",
        className,
      ].join(" ")}
    />
  );
}

export function SelectButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border px-4 py-4 text-left transition",
        active
          ? "border-black/30 bg-black/[0.04]"
          : "border-[#E5E7EB] bg-white hover:bg-black/[0.03]",
      ].join(" ")}
    >
      <div className="text-[15px] font-semibold text-[#111827]">{children}</div>
    </button>
  );
}

export function OutlineBtn({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-[48px] px-6 rounded-full border border-[#D4D4D8]",
        "text-[15px] font-semibold text-[#18181B]",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-black/[0.03]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-[48px] px-6 rounded-full text-[15px] font-semibold text-black",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-95",
      ].join(" ")}
      style={{ background: GOLD_GRADIENT }}
    >
      {children}
    </button>
  );
}

export function BottomNav({
  onBack,
  onNext,
  nextDisabled,
  nextText = "Continue",
}) {
  return (
    <div className="mt-7 flex flex-col sm:flex-row gap-3">
      <OutlineBtn onClick={onBack}>Back</OutlineBtn>
      <div className="flex-1" />
      <PrimaryBtn onClick={onNext} disabled={nextDisabled}>
        {nextText}
      </PrimaryBtn>
    </div>
  );
}
