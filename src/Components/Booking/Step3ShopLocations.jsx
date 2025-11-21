// src/components/booking/Step3ShopLocations.jsx
import React from "react";
import { FiAlertTriangle, FiChevronLeft, FiMapPin } from "react-icons/fi";
import { LuStore } from "react-icons/lu";
import searchIcon from "../../assets/icons/search.svg?url";
import ProgressBar from "./ProgressBar";

const GOLD = "#E1C07B";
const GRAY = "#A8A8AD";

const Step3ShopLocations = ({
  visible,
  shopMode,
  setShopMode,
  shopAddress,
  pickupQuery,
  onPickupChange,
  pickupPreds,
  onPickupChoose,
  canContinueShop,
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
            Our Shop Locations
          </h2>
        </div>

        <ProgressBar activeCount={2} />

        <div className="space-y-3">
          {/* Drop-off */}
          <button
            onClick={() => setShopMode("dropoff")}
            aria-pressed={shopMode === "dropoff"}
            className={`w-full rounded-[20px] px-4 py-4 flex items-center justify-between
              ${
                shopMode === "dropoff"
                  ? "bg-[#F8F4EC] shadow"
                  : "bg-white border border-[#E5E7EB]"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center">
                <LuStore
                  className="w-5 h-5"
                  style={{ color: shopMode === "dropoff" ? GOLD : GRAY }}
                />
              </div>
              <div className="leading-tight">
                <div className="text-[16px] sm:text-[17px] font-bold text-[#18181B]">
                  Customer Drop-off
                </div>
                <div className="text-[14px] text-[#6B7280] truncate max-w-[220px] sm:max-w-[280px]">
                  {shopAddress}
                </div>
              </div>
            </div>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${
                  shopMode === "dropoff"
                    ? "bg-[#E7D3A3]"
                    : "bg-[#EFEFEF]"
                }`}
            >
              {shopMode === "dropoff" ? "✓" : ""}
            </span>
          </button>

          {/* Pick-up */}
          <button
            onClick={() => setShopMode("pickup")}
            aria-pressed={shopMode === "pickup"}
            className={`w-full rounded-[20px] px-4 py-4 flex items-center justify-between
              ${
                shopMode === "pickup"
                  ? "bg-[#F8F4EC] shadow"
                  : "bg-white border border-[#E5E7EB]"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center">
                <LuStore
                  className="w-5 h-5"
                  style={{ color: shopMode === "pickup" ? GOLD : GRAY }}
                />
              </div>
              <div className="leading-tight">
                <div className="text-[16px] sm:text-[17px] font-bold text-[#18181B]">
                  Pick up &amp; Drop-off Service
                </div>
                <div className="text-[14px] text-[#6B7280]">$5/mile</div>
              </div>
            </div>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${
                  shopMode === "pickup"
                    ? "bg-[#E7D3A3]"
                    : "bg-[#EFEFEF]"
                }`}
            >
              {shopMode === "pickup" ? "✓" : ""}
            </span>
          </button>

          {/* Address for pickup */}
          {shopMode === "pickup" && (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={searchIcon}
                  alt="Search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 z-10 pointer-events-none select-none"
                />
                <input
                  value={pickupQuery}
                  onChange={(e) => onPickupChange(e.target.value)}
                  type="text"
                  placeholder="Enter your address"
                  className="
                    w-full h-[56px] rounded-[16px]
                    bg-[#F4F4F5] pl-12 pr-4
                    text-[16px] text-[#18181B] placeholder:text-[#9CA3AF]
                    outline-none shadow-inner
                  "
                />
              </div>

              {pickupPreds.length > 0 && (
                <ul className="space-y-2">
                  {pickupPreds.map((item, idx) => (
                    <li key={item.place_id || idx}>
                      <button
                        onClick={() => onPickupChoose(item)}
                        className="
                          w-full bg-white/90 backdrop-blur
                          rounded-[16px] px-3 py-3 shadow
                          flex items-center gap-3 text-left
                        "
                      >
                        <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F2F2F2]">
                          <FiMapPin className="text-[18px] text-[#18181B]" />
                        </span>
                        <span className="text-[#18181B] text-[15px] truncate">
                          {item.sf?.main_text ? (
                            <>
                              <span className="font-semibold">
                                {item.sf.main_text}
                              </span>
                              {item.sf.secondary_text ? (
                                <span className="opacity-80">
                                  , {item.sf.secondary_text}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            item.description
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="w-full rounded-[20px] px-4 py-3 bg-[#F2F2F2] text-[#1F2937] text-[14px] leading-snug flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EDE4D1] shrink-0">
              <FiAlertTriangle
                className="text-[18px]"
                style={{ color: "#C89C3C" }}
              />
            </span>
            <span className="pr-2">
              Pick-up pricing calculated from shop location
            </span>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!canContinueShop}
          className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
            ${!canContinueShop ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{
            background:
              "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
          }}
        >
          Continue <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
};

export default Step3ShopLocations;
