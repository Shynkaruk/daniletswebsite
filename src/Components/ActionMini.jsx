import React, { useEffect, useState } from "react";
import { FiZap, FiTag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import RightArrowIcon from "../assets/icons/angle-right-icon.png";
import { cardsApi } from "../lib/api";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

function isOfferActive(offer) {
  if (!offer.published) return false;
  if (!offer.subtitle) return true; // no expiry = always active
  const expiry = new Date(offer.subtitle);
  return !isNaN(expiry) ? expiry > new Date() : true;
}

const ActionMini = ({ className = "" }) => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [offerIdx, setOfferIdx] = useState(0);

  useEffect(() => {
    cardsApi.list({ type: "special_offer", published: 1 }).then((rows) => {
      const active = (rows || []).filter(isOfferActive);
      setOffers(active);
    }).catch(() => {});
  }, []);

  // Cycle through offers every 5 s when multiple exist
  useEffect(() => {
    if (offers.length <= 1) return;
    const t = setInterval(() => setOfferIdx((i) => (i + 1) % offers.length), 5000);
    return () => clearInterval(t);
  }, [offers.length]);

  const currentOffer = offers[offerIdx] ?? null;

  return (
    <section className={`w-full ${className}`}>
      <div className="w-full min-h-[100px] bg-[#1C1C1C] rounded-[32px] flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 lg:px-12 py-4 sm:py-6 gap-4">

        {/* Icon + text */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          {currentOffer ? (
            <FiTag className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] shrink-0" color="#E1C07B" />
          ) : (
            <FiZap className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] shrink-0" color="#E1C07B" />
          )}

          <div className="min-w-0">
            <h2
              className="text-[18px] sm:text-[22px] lg:text-[26px] font-bold text-white leading-tight truncate"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {currentOffer ? currentOffer.title : "Deals Coming Soon"}
            </h2>

            {currentOffer?.body && (
              <p
                className="text-[12px] sm:text-[14px] text-[#B0B0B0] mt-0.5 line-clamp-1"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {currentOffer.body}
              </p>
            )}

            {currentOffer && (
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {currentOffer.price > 0 && (
                  <span
                    className="text-[13px] sm:text-[15px] font-extrabold px-3 py-0.5 rounded-full"
                    style={{ background: GOLD_GRADIENT, color: "#3E260C" }}
                  >
                    {currentOffer.price}% OFF
                  </span>
                )}
                {currentOffer.subtitle && (
                  <span className="text-[11px] text-[#9CA3AF]">
                    Expires {new Date(currentOffer.subtitle).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Offer dots (when multiple) */}
        {offers.length > 1 && (
          <div className="flex gap-1.5 shrink-0 sm:hidden">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => setOfferIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === offerIdx ? "bg-[#E1C07B] scale-125" : "bg-[#555]"}`}
              />
            ))}
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={() => navigate("/book-online")}
          className="w-full sm:w-[200px] lg:w-[238px] h-[48px] sm:h-[58px] rounded-[88px] flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 shrink-0 transition-all duration-200 hover:scale-[1.05] hover:brightness-90"
          style={{ background: GOLD_GRADIENT }}
        >
          <span
            className="text-[14px] sm:text-[16px] font-bold text-black"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Get Quote
          </span>
          <img src={RightArrowIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Dots for desktop (multiple offers) */}
      {offers.length > 1 && (
        <div className="hidden sm:flex justify-center gap-2 mt-3">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => setOfferIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === offerIdx ? "bg-[#E1C07B] scale-125" : "bg-[#999]"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ActionMini;
