import React, { useMemo, useRef, useState } from "react";

function VideoThumb({ webm, mp4 }) {
  const ref = useRef(null);

  const handleEnter = () => ref.current?.play();
  const handleLeave = () => ref.current?.pause();

  return (
    <div
      className="relative aspect-[588/392] rounded-[16px] overflow-hidden bg-black"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <video
        ref={ref}
        className="w-full h-full object-cover object-center"
        preload="metadata"
        playsInline
        muted
        loop
        autoPlay={/Mobi|Android/i.test(navigator.userAgent)}
        aria-label="Detailing video"
        disablePictureInPicture
      >
        {webm && <source src={webm} type="video/webm" />}
        {mp4 && <source src={mp4} type="video/mp4" />}
      </video>
    </div>
  );
}

const OurPortfolioDetailing = () => {
  const items = useMemo(
    () => [
      {
        id: 1,
        srcWebm: "/video/video1.webm",
        srcMp4: "/video/video1.mp4",
      },
      {
        id: 2,
        srcWebm: "/video/video2.webm",
        srcMp4: "/video/video2.mp4",
      },
      {
        id: 3,
        srcWebm: "/video/video3.webm",
        srcMp4: "/video/video3.mp4",
      },
      {
        id: 4,
        srcWebm: "/video/video4.webm",
        srcMp4: "/video/video4.mp4",
      },
      {
        id: 5,
        srcWebm: "/video/video1.webm",
        srcMp4: "/video/video1.mp4",
      },
    ],
    []
  );

  const PAGE = 3;
  const [start, setStart] = useState(0);
  const visible = items.slice(start, start + PAGE);
  const hasPrev = start > 0;
  const hasNext = start + PAGE < items.length;

  const handlePrev = () => {
    if (hasPrev) setStart((s) => Math.max(0, s - PAGE));
  };
  const handleNext = () => {
    if (hasNext) setStart((s) => Math.min(items.length - PAGE, s + PAGE));
  };

  const [openId, setOpenId] = useState(null);
  const activeItem = useMemo(
    () => items.find((it) => it.id === openId) || null,
    [openId, items]
  );

  return (
    <section className="bg-[#EDEDED] py-10 md:py-14 md:-mt-10">
      <div className="w-[95%] max-w-[1792px] mx-auto px-4 md:px-6">
        {/* Заголовок */}
        <h2 className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[60px] font-bold mb-8">
          Videos
        </h2>

        {/* Сітка відео */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              className="relative rounded-[16px] overflow-hidden w-full text-left bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md transition"
            >
              <VideoThumb webm={item.srcWebm} mp4={item.srcMp4} />

              {/* Іконка Play */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-md">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-900 translate-x-[1px]"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Кнопки навігації */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!hasPrev}
            className="w-13 h-11 md:w-19 md:h-16 rounded-full bg-white shadow-sm ring-1 ring-black/5 grid place-items-center disabled:opacity-50"
            aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasNext}
            className="w-13 h-11 md:w-19 md:h-16 rounded-full bg-white shadow-sm ring-1 ring-black/5 grid place-items-center disabled:opacity-50"
            aria-label="Next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Фул-скрін модалка тільки з відео */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-[1200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full aspect-video rounded-[24px] overflow-hidden bg-black">
              <video
                className="w-full h-full object-contain"
                preload="metadata"
                playsInline
                controls
                autoPlay
              >
                {activeItem.srcWebm && (
                  <source src={activeItem.srcWebm} type="video/webm" />
                )}
                {activeItem.srcMp4 && (
                  <source src={activeItem.srcMp4} type="video/mp4" />
                )}
              </video>
            </div>

            {/* Порожня зона під текст (для майбутнього) */}
            <div className="mt-4 h-[40px]" />
          </div>
        </div>
      )}
    </section>
  );
};

export default OurPortfolioDetailing;
