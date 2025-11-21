// src/components/booking/Step5SelectService.jsx
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import { LuStar } from "react-icons/lu";
import ProgressBar from "./ProgressBar";

const GOLD = "#E1C07B";

const Step5SelectService = ({
  visible,
  servicesDb,
  loadingServices,
  selectedServiceId,
  setSelectedServiceId,
  canNextService,
  onNext,
  onBack,
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
            Select Service
          </h2>
        </div>

        <ProgressBar activeCount={4} />

        <div className="space-y-3">
          {loadingServices ? (
            <div className="text-[#6B7280]">Loading…</div>
          ) : servicesDb.length === 0 ? (
            <div className="text-[#6B7280]">No services yet.</div>
          ) : (
            servicesDb.map((svc) => {
              const active = selectedServiceId === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => setSelectedServiceId(svc.id)}
                  aria-pressed={active}
                  className={`w-full rounded-[20px] px-4 py-4 flex items-center justify-between
                    ${
                      active
                        ? "bg-[#F8F4EC] shadow"
                        : "bg-white border border-[#E5E7EB]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <LuStar
                      className="w-5 h-5"
                      style={{ color: active ? GOLD : "#D5D5D8" }}
                    />
                    <span className="text-[16px] font-semibold text-[#18181B]">
                      {svc.title}
                      {svc.subtitle ? (
                        <span className="ml-2 text-[#6B7280] font-normal">
                          · {svc.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] text-[#6B7280]">
                      ${(Number(svc.price) || 0).toFixed(2)}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${active ? "bg-[#E7D3A3]" : "bg-[#EFEFEF]"}`}
                    >
                      {active ? "✓" : ""}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!canNextService}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${!canNextService ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{
            background:
              "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
          }}
        >
          Next <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default Step5SelectService;
