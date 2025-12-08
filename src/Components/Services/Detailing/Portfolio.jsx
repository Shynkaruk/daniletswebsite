import React, { useEffect, useState, useCallback } from "react";

// === КОНФІГ З PUBLIC/Portfolio ===
const portfolioItems = [
  {
    id: 1,
    cover: "/Portfolio/Box 1/Main Photo.jpg",
    images: [
      "/Portfolio/Box 1/A7R04034 copy.JPG",
      "/Portfolio/Box 1/A7R04116 copy.JPG",
      "/Portfolio/Box 1/A7R04173 copy.JPG",
      "/Portfolio/Box 1/A7308458 copy.JPG",
    ],
  },
  {
    id: 2,
    cover: "/Portfolio/Box 2/Main.jpg",
    images: [
      "/Portfolio/Box 2/A7S02576 copy.JPG",
      "/Portfolio/Box 2/A7S02610 copy.JPG",
      "/Portfolio/Box 2/A7S02612 copy.JPG",
      "/Portfolio/Box 2/A7S02613 copy.JPG",
    ],
  },
  {
    id: 3,
    cover: "/Portfolio/Box 3/Main.jpg",
    images: [
      "/Portfolio/Box 3/A7S02638 copy.JPG",
      "/Portfolio/Box 3/A7S02644 copy.JPG",
      "/Portfolio/Box 3/A7S02646 copy.JPG",
      "/Portfolio/Box 3/A7S02651 copy.JPG",
    ],
  },
  {
    id: 4,
    cover: "/Portfolio/Box 4/Main.jpg",
    images: [
      "/Portfolio/Box 4/A7R05938 copy.JPG",
      "/Portfolio/Box 4/A7R05939 copy.JPG",
      "/Portfolio/Box 4/A7R05948 copy.JPG",
      "/Portfolio/Box 4/A7R05961 copy.JPG",
      "/Portfolio/Box 4/A7R05963 copy.JPG",
      "/Portfolio/Box 4/A7R05968 copy (1).jpg",
    ],
  },
  {
    id: 5,
    cover: "/Portfolio/Box 5/Main.jpg",
    images: [
      "/Portfolio/Box 5/ELI02903.JPG",
      "/Portfolio/Box 5/ELI02905.JPG",
      "/Portfolio/Box 5/ELI02906.JPG",
      "/Portfolio/Box 5/ELI02908.JPG",
      "/Portfolio/Box 5/ELI02912.JPG",
      "/Portfolio/Box 5/ELI02914.JPG",
    ],
  },
  {
    id: 6,
    cover: "/Portfolio/Box 6/Main.jpg",
    images: [
      "/Portfolio/Box 6/TIM06212 copy.JPG",
      "/Portfolio/Box 6/TIM06245 copy.JPG",
      "/Portfolio/Box 6/TIM06249 copy.JPG",
      "/Portfolio/Box 6/TIM06258 copy.JPG",
      "/Portfolio/Box 6/TIM06267 copy.JPG",
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

const Portfolio = () => {
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
              {/* Фото */}
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

              {/* Нова зона з CTA */}
              <div className="px-4 pb-4 flex items-center justify-between">
                <span className="text-[13px] sm:text-[14px] text-[#6B6B6F]">
                  Tap to view full gallery
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // щоб не дублювати клік по статті
                    setSelectedItem(item);
                  }}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2
                    rounded-full
                    text-[13px] sm:text-[14px] font-semibold
                    bg-black text-white
                    hover:bg-[#2A2A2A]
                    transition
                  "
                >
                  View Gallery
                  <span className="ml-1 text-[16px] leading-none">↗</span>
                </button>
              </div>
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

export default Portfolio;
