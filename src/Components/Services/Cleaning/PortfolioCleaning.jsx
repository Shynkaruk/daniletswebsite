import React, { useEffect, useState, useCallback } from "react";

// === КОНФІГ З PUBLIC/Portfolio_Cleaning ===
// Main (без розширення на скріншоті) використовую як обкладинку.
// Якщо файл у тебе називається Main.jpg — просто додай .jpg у шлях.

// === КОНФІГ З PUBLIC/Portfolio_Cleaning ===
const portfolioItems = [
  {
    id: 1,
    cover: "/Portfolio_Cleaning/Box 1/Main.jpg",
    images: [
      "/Portfolio_Cleaning/Box 1/IMG_1300.jpg",
      "/Portfolio_Cleaning/Box 1/IMG_1302.jpg",
      "/Portfolio_Cleaning/Box 1/IMG_1310.jpg",
      "/Portfolio_Cleaning/Box 1/IMG_1319.jpg",
      "/Portfolio_Cleaning/Box 1/IMG_1323.jpg",
      "/Portfolio_Cleaning/Box 1/IMG_1340.jpg",
      "/Portfolio_Cleaning/Box 1/IMG_1345.jpg",
      "/Portfolio_Cleaning/Box 1/IMG_1351.jpg",
    ],
  },
  {
    id: 2,
    cover: "/Portfolio_Cleaning/Box 2/Main.jpg",
    images: [
      "/Portfolio_Cleaning/Box 2/IMG_0946.jpg",
      "/Portfolio_Cleaning/Box 2/IMG_0947.jpg",
      "/Portfolio_Cleaning/Box 2/IMG_0952.jpg",
      "/Portfolio_Cleaning/Box 2/IMG_0957.jpg",
      "/Portfolio_Cleaning/Box 2/IMG_0960.jpg",
      "/Portfolio_Cleaning/Box 2/IMG_0961.jpg",
      "/Portfolio_Cleaning/Box 2/IMG_0962.jpg",
      "/Portfolio_Cleaning/Box 2/IMG_0965.jpg",
    ],
  },
  {
    id: 3,
    cover: "/Portfolio_Cleaning/Box 3/Main.jpg",
    images: [
      "/Portfolio_Cleaning/Box 3/IMG_8537.jpg",
      "/Portfolio_Cleaning/Box 3/IMG_8538.jpg",
      "/Portfolio_Cleaning/Box 3/IMG_8540.jpg",
      "/Portfolio_Cleaning/Box 3/IMG_8546.jpg",
      "/Portfolio_Cleaning/Box 3/IMG_8551.jpg",
      "/Portfolio_Cleaning/Box 3/IMG_8553.jpg",
    ],
  },
  {
    id: 4,
    cover: "/Portfolio_Cleaning/Box 4/Main.jpg",
    images: [
      "/Portfolio_Cleaning/Box 4/IMG_4397.JPG",
      "/Portfolio_Cleaning/Box 4/IMG_4502.jpg",
      "/Portfolio_Cleaning/Box 4/IMG_4508.jpg",
      "/Portfolio_Cleaning/Box 4/IMG_4517.jpg",
      "/Portfolio_Cleaning/Box 4/IMG_4534.jpg",
      "/Portfolio_Cleaning/Box 4/IMG_4540.jpg",
      "/Portfolio_Cleaning/Box 4/IMG_5876.JPG",
      "/Portfolio_Cleaning/Box 4/IMG_5879.JPG",
      "/Portfolio_Cleaning/Box 4/IMG_5881.JPG",
    ],
  },
  {
    id: 5,
    cover: "/Portfolio_Cleaning/Box 5/Main.jpg",
    images: [
      "/Portfolio_Cleaning/Box 5/IMG_8485.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8487.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8488.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8489.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8490.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8493.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8495.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8498.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8500.jpg",
      "/Portfolio_Cleaning/Box 5/IMG_8504.jpg",
    ],
  },
  {
    id: 6,
    cover: "/Portfolio_Cleaning/Box 6/Main.jpg",
    images: [
      "/Portfolio_Cleaning/Box 6/IMG_8511.jpg",
      "/Portfolio_Cleaning/Box 6/IMG_8514.jpg",
      "/Portfolio_Cleaning/Box 6/IMG_8515.jpg",
      "/Portfolio_Cleaning/Box 6/IMG_8520.jpg",
      "/Portfolio_Cleaning/Box 6/IMG_8521.jpg",
      "/Portfolio_Cleaning/Box 6/IMG_8523.jpg",
      "/Portfolio_Cleaning/Box 6/IMG_8524.jpg",
    ],
  },
];


// ====== MODAL З ГАЛЕРЕЄЮ ======
const Modal = ({ open, onClose, images }) => {
  const [index, setIndex] = useState(0);

  const hasImages = images && images.length > 0;

  const showPrev = useCallback(() => {
    if (!hasImages) return;
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [hasImages, images]);

  const showNext = useCallback(() => {
    if (!hasImages) return;
    setIndex((prev) => (prev + 1) % images.length);
  }, [hasImages, images]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    },
    [onClose, showPrev, showNext]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    setIndex(0);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onKeyDown]);

  if (!open || !hasImages) return null;

  const currentSrc = images[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Темний фон */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" />

      {/* Модалка */}
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
          px-2 pt-12 pb-4
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
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
        <div className="relative flex items-center justify-center w-full">
          {images.length > 1 && (
            <button
              onClick={showPrev}
              className="absolute left-2 sm:left-4 z-20 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              ‹
            </button>
          )}

          <img
            src={currentSrc}
            alt="Portfolio item"
            className="max-w-full max-h-[80vh] object-contain select-none"
            decoding="async"
            loading="lazy"
            style={{
              imageRendering: "auto",
              backfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
            }}
          />

          {images.length > 1 && (
            <button
              onClick={showNext}
              className="absolute right-2 sm:right-4 z-20 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              ›
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 text-sm text-gray-600">
            {index + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

const PortfolioCleaning = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-10 lg:py-16 -mt-10 md:-mt-10">
      <div className="max-w-[1400px] mx-auto">
        {/* Заголовок */}
        <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extrabold text-black mb-6 sm:mb-8 lg:mb-10">
          Portfolio
        </h2>

        {/* Сітка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {portfolioItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="cursor-pointer bg-white rounded-[26px] shadow-[0_6px_22px_rgba(0,0,0,0.06)] overflow-hidden 
                         transform transition-transform duration-300 lg:hover:scale-[1.015] active:scale-[0.99]"
            >
              <div className="p-2 sm:p-3 lg:p-3.5">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[22px]">
                  <img
                    src={item.cover}
                    alt={`Portfolio box ${item.id}`}
                    decoding="async"
                    loading="lazy"
                    className="h-full w-full object-cover select-none transition-transform duration-500 lg:hover:scale-[1.04]"
                    style={{
                      imageRendering: "auto",
                      backfaceVisibility: "hidden",
                      WebkitFontSmoothing: "antialiased",
                    }}
                  />
                </div>
              </div>

              <div className="px-5 pb-5 h-[20px]" />
            </article>
          ))}
        </div>
      </div>

      <Modal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        images={selectedItem?.images || []}
      />
    </section>
  );
};

export default PortfolioCleaning;
