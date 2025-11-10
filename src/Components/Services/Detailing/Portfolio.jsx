import React, { useEffect, useState, useCallback } from "react";

import car1 from "../../../assets/cars/car1.png";
import car2 from "../../../assets/cars/car2.png";
import car3 from "../../../assets/cars/car3.png";
import car4 from "../../../assets/cars/car4.png";
import car5 from "../../../assets/cars/car5.png";
import car6 from "../../../assets/cars/car6.png";

const portfolioItems = [
  { id: 1, image: car1 },
  { id: 2, image: car2 },
  { id: 3, image: car3 },
  { id: 4, image: car4 },
  { id: 5, image: car5 },
  { id: 6, image: car6 },
];

const Modal = ({ open, onClose, item }) => {
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onKeyDown]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div
        className="relative z-[101] mx-auto w-[90vw] max-w-[1100px] max-h-[90vh] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="mt-6 mx-6 rounded-xl overflow-hidden">
          <img
            src={item.image}
            alt="Portfolio item"
            className="w-full h-auto object-cover select-none"
            decoding="async"
            loading="lazy"
            style={{
              imageRendering: "auto", // natural smoothing
              transform: "translateZ(0)", // hardware acceleration
              backfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

const Portfolio = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section className="px-5 md:px-10 lg:px-20 py-10 lg:py-16 -mt-10 md:-mt-10">
      <div className="w-full mx-auto">
        {/* Title */}
        <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extrabold text-black mb-10">
          Portfolio
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {portfolioItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelected(item)}
              className="cursor-pointer bg-white rounded-[28px] shadow-[0_8px_28px_rgba(0,0,0,0.08)] overflow-hidden 
                         transform transition lg:hover:scale-[1.02] active:scale-[0.995]"
            >
              <div className="p-2 lg:p-4">
                <div className="aspect-[16/11] lg:aspect-[16/10] w-full overflow-hidden rounded-[22px]">
                  <img
                    src={item.image}
                    alt="Portfolio item"
                    decoding="async"
                    loading="lazy"
                    className="h-full w-full object-cover select-none transition-transform duration-500 hover:scale-[1.03]"
                    style={{
                      imageRendering: "auto",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      WebkitFontSmoothing: "antialiased",
                    }}
                  />
                </div>
              </div>

              {/* Порожній блок замість назв */}
              <div className="px-6 lg:px-8 pb-6 lg:pb-8 h-[28px]" />
            </article>
          ))}
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        item={selected}
      />
    </section>
  );
};

export default Portfolio;
