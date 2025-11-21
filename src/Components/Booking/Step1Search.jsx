// src/components/booking/Step1Search.jsx
import React from "react";
import { FiMapPin } from "react-icons/fi";
import searchIcon from "../../assets/icons/search.svg?url";

const Step1Search = ({
  visible,
  query,
  onChangeQuery,
  predictions,
  onChoosePrediction,
  onSearch,
}) => {
  if (!visible) return null;

  const hasInput = query.trim().length > 0;

  return (
    <div className="w-full max-w-full min-w-0 space-y-3 text-left">
      <div className="relative">
        <img
          src={searchIcon}
          alt="Search"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 z-10 select-none pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          type="text"
          placeholder="Enter your address"
          className="
            w-full max-w-full
            h-[60px] sm:h-[64px]
            rounded-full bg-white/90 backdrop-blur
            pl-16 sm:pl-[4.5rem] pr-5
            text-[16px] sm:text-[18px] text-[#18181B] placeholder:text-[#9CA3AF]
            outline-none shadow box-border
          "
        />
      </div>

      {hasInput && (
        <button
          onClick={onSearch}
          className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow"
          style={{
            background:
              "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
          }}
        >
          Search
        </button>
      )}

      {hasInput && predictions.length > 0 && (
        <ul className="space-y-2">
          {predictions.map((item, idx) => (
            <li key={item.place_id || idx}>
              <button
                onClick={() => onChoosePrediction(item)}
                className="
                  w-full bg-white/90 backdrop-blur
                  rounded-[16px] px-3 py-3 shadow
                  flex items-center gap-3 text-left
                "
              >
                <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F2F2F2]">
                  <FiMapPin className="text-[18px] text-[#18181B]" />
                </span>
                <span className="text-[#18181B] text-[15px] sm:text-[16px] truncate">
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
  );
};

export default Step1Search;
