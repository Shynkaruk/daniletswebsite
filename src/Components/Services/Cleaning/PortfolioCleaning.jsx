import React, { useEffect, useState, useCallback } from "react";
import arrowRightIcon from "../../../assets/icons/arrows/arrow_right_black.svg";

// === КОНФІГ З PUBLIC/Portfolio_Cleaning ===
const portfolioItems = [
  {
    id: 1,
    cover: "/Portfolio_Cleaning/Box 1/Main.webp",
    images: [
      "/Portfolio_Cleaning/Box 1/IMG_1300.webp",
      "/Portfolio_Cleaning/Box 1/IMG_1302.webp",
      "/Portfolio_Cleaning/Box 1/IMG_1310.webp",
      "/Portfolio_Cleaning/Box 1/IMG_1319.webp",
      "/Portfolio_Cleaning/Box 1/IMG_1323.webp",
      "/Portfolio_Cleaning/Box 1/IMG_1340.webp",
      "/Portfolio_Cleaning/Box 1/IMG_1345.webp",
      "/Portfolio_Cleaning/Box 1/IMG_1351.webp",
    ],
  },
  {
    id: 2,
    cover: "/Portfolio_Cleaning/Box 2/Main.webp",
    images: [
      "/Portfolio_Cleaning/Box 2/IMG_0946.webp",
      "/Portfolio_Cleaning/Box 2/IMG_0947.webp",
      "/Portfolio_Cleaning/Box 2/IMG_0952.webp",
      "/Portfolio_Cleaning/Box 2/IMG_0957.webp",
      "/Portfolio_Cleaning/Box 2/IMG_0960.webp",
      "/Portfolio_Cleaning/Box 2/IMG_0961.webp",
      "/Portfolio_Cleaning/Box 2/IMG_0962.webp",
      "/Portfolio_Cleaning/Box 2/IMG_0965.webp",
    ],
  },
  {
    id: 3,
    cover: "/Portfolio_Cleaning/Box 3/Main.webp",
    images: [
      "/Portfolio_Cleaning/Box 3/IMG_8537.webp",
      "/Portfolio_Cleaning/Box 3/IMG_8538.webp",
      "/Portfolio_Cleaning/Box 3/IMG_8540.webp",
      "/Portfolio_Cleaning/Box 3/IMG_8546.webp",
      "/Portfolio_Cleaning/Box 3/IMG_8551.webp",
      "/Portfolio_Cleaning/Box 3/IMG_8553.webp",
    ],
  },
  {
    id: 4,
    cover: "/Portfolio_Cleaning/Box 4/Main.webp",
    images: [
      "/Portfolio_Cleaning/Box 4/IMG_4397.webp",
      "/Portfolio_Cleaning/Box 4/IMG_4502.webp",
      "/Portfolio_Cleaning/Box 4/IMG_4508.webp",
      "/Portfolio_Cleaning/Box 4/IMG_4517.webp",
      "/Portfolio_Cleaning/Box 4/IMG_4534.webp",
      "/Portfolio_Cleaning/Box 4/IMG_4540.webp",
      "/Portfolio_Cleaning/Box 4/IMG_5876.webp",
      "/Portfolio_Cleaning/Box 4/IMG_5879.webp",
      "/Portfolio_Cleaning/Box 4/IMG_5881.webp",
    ],
  },
  {
    id: 5,
    cover: "/Portfolio_Cleaning/Box 5/IMG_8485.webp",
    images: [
      "/Portfolio_Cleaning/Box 5/IMG_8485.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8487.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8488.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8489.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8490.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8493.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8495.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8498.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8500.webp",
      "/Portfolio_Cleaning/Box 5/IMG_8504.webp",
    ],
  },
  {
    id: 6,
    cover: "/Portfolio_Cleaning/Box 6/Main.webp",
    images: [
      "/Portfolio_Cleaning/Box 6/IMG_8511.webp",
      "/Portfolio_Cleaning/Box 6/IMG_8514.webp",
      "/Portfolio_Cleaning/Box 6/IMG_8515.webp",
      "/Portfolio_Cleaning/Box 6/IMG_8520.webp",
      "/Portfolio_Cleaning/Box 6/IMG_8521.webp",
      "/Portfolio_Cleaning/Box 6/IMG_8523.webp",
      "/Portfolio_Cleaning/Box 6/IMG_8524.webp",
    ],
  },
];

// ====== MODAL З ГАЛЕРЕЄЮ (fixed iOS thumbnails) ======
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

    // зберігаємо попередній overflow, щоб нічого не ламати
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setIndex(0);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onKeyDown]);

  if (!open || !hasImages) return null;

  const currentSrc = images[index];

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center px-4"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      {/* фон */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />

      {/* модалка */}
      <div
        className="
          relative z-[101]
          bg-white
          rounded-[28px] md:rounded-[32px]
          w-full max-w-[980px]
          max-h-[90vh]
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          flex flex-col overflow-hidden
        "
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 pt-5 pb-3 border-b border-[#E4E4E7]">
          <h3
            className="text-[18px] sm:text-[20px] md:text-[22px] font-semibold text-[#18181B]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Cleaning Portfolio
          </h3>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="
              h-9 w-9
              flex items-center justify-center
              rounded-full bg-[#F4F4F5]
              text-[18px] font-semibold text-[#52525B]
              hover:bg-[#E4E4E7] transition
            "
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 md:px-7 pb-6 pt-4 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          {/* Головне фото + стрілки */}
          <div className="relative mb-4">
            <div className="w-full rounded-[20px] md:rounded-[24px] overflow-hidden bg-[#F4F4F5]">
              <img
                src={currentSrc}
                alt="Cleaning portfolio item"
                className="w-full h-[220px] sm:h-[320px] md:h-[420px] object-cover select-none"
                decoding="async"
                loading="lazy"
                style={{
                  imageRendering: "auto",
                  backfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="absolute left-4 bottom-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={showPrev}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[18px] font-semibold hover:bg-white"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[18px] font-semibold hover:bg-white"
                >
                  {">"}
                </button>
              </div>
            )}
          </div>

          {/* Лічильник + мініатюри */}
          {images.length > 1 && (
            <>
              <div className="mb-1 text-xs sm:text-sm text-[#71717A]">
                {index + 1} / {images.length}
              </div>

              <div className="mb-3">
                {/* ✅ MOBILE: grid (без overflow-x) — прибирає “колажі” на iOS */}
                <div className="grid grid-cols-4 gap-3 sm:hidden">
                  {images.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setIndex(idx)}
                      className={`aspect-[4/3] w-full rounded-[14px] overflow-hidden border ${
                        idx === index ? "border-[#18181B]" : "border-transparent"
                      } bg-[#F4F4F5]`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>

                {/* SM+: як було — горизонтальний скрол */}
                <div className="hidden sm:block overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                  <div className="flex w-max gap-3">
                    {images.map((src, idx) => (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        onClick={() => setIndex(idx)}
                        className={`min-w-[80px] sm:min-w-[96px] h-[70px] sm:h-[80px] rounded-[16px] overflow-hidden border ${
                          idx === index
                            ? "border-[#18181B]"
                            : "border-transparent"
                        } bg-[#F4F4F5] flex-shrink-0`}
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PortfolioCleaning = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-10 lg:py-16 -mt-10 md:-mt-10">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extrabold text-black mb-6 sm:mb-8 lg:mb-10">
          Portfolio
        </h2>

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
                    alt={`Cleaning portfolio box ${item.id}`}
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

{/* CTA (FULL WIDTH як у Detailing Portfolio) */}
<div className="p-2 sm:p-3 lg:p-3.5 pb-4">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedItem(item);
    }}
    className="
      w-full block
      flex items-center justify-between
      h-[44px] sm:h-[48px]
      px-5
      rounded-full
      text-[13px] sm:text-[14px] font-semibold
      text-black
      hover:brightness-110
      transition
    "
    style={{
      background:
        "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)",
      fontFamily: "Manrope, sans-serif",
    }}
  >
    <span>View Gallery</span>
    <img
      src={arrowRightIcon}
      alt="arrow"
      className="w-[18px] h-[18px] object-contain"
    />
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

export default PortfolioCleaning;
