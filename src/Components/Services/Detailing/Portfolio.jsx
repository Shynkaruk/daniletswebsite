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
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Темний фон */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Модальне вікно */}
      <div
        className="
          relative z-[101]
          max-w-[95vw]
          max-h-[90vh]
          bg-white
          rounded-xl
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          overflow-hidden
          flex flex-col items-center
          px-2 pt-12 pb-2
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Хрестик */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute top-3 right-3
            z-20
            h-9 w-9
            flex items-center justify-center
            rounded-full bg-white/90 shadow
            hover:bg-white transition
          "
        >
          ✕
        </button>

        {/* Фото */}
        <img
          src={item.image}
          alt="Portfolio item"
          className="max-w-full max-h-[80vh] object-contain select-none"
          decoding="async"
          loading="lazy"
          style={{
            imageRendering: "auto",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
        />
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section className="px-5 md:px-10 lg:px-20 py-10 lg:py-16 -mt-10 md:-mt-10">
      <div className="w-full mx-auto">
        {/* Заголовок */}
        <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extrabold text-black mb-10">
          Portfolio
        </h2>

        {/* Сітка */}
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

              {/* Порожній блок */}
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
