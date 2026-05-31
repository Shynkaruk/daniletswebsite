// components/OurReviewsStrip.jsx
import React, { useRef, useState } from "react";
import ArrowRight from "../../assets/icons/arrows/arrow_right_black.svg"
import ArrowRightUp from '../../assets/icons/arrows/arrow-up-right.svg'

const defaultReviews = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: "Jordan Neidig",
  ago: "3 weeks ago",
  text:
    "They transformed my truck’s interior, making it look and smell brand new. They were professional, friendly, and truly care about their work. This is a business worth supporting—great service and even better people. Highly recommend!",
  rating: "5/5",
  avatar: "",
}));

const OurReviewsStrip = ({ reviews = defaultReviews }) => {
  const trackRef = useRef(null);

  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  const onPointerDown = (e) => {
    const el = trackRef.current; if (!el) return;
    isDownRef.current = true; setGrabbing(true);
    startXRef.current = (e.pageX ?? e.clientX) - el.getBoundingClientRect().left;
    scrollLeftRef.current = el.scrollLeft;
  };
  const onPointerMove = (e) => {
    const el = trackRef.current; if (!el || !isDownRef.current) return;
    e.preventDefault();
    const x = (e.pageX ?? e.clientX) - el.getBoundingClientRect().left;
    el.scrollLeft = scrollLeftRef.current - (x - startXRef.current);
  };
  const onPointerUp = () => { isDownRef.current = false; setGrabbing(false); };

  const scrollByCards = (dir = 1) => {
    const el = trackRef.current; if (!el) return;
    const first = el.querySelector("article");
    const gap = parseInt(getComputedStyle(el).gap || "32", 10); // md:gap-8
    const step = first ? first.getBoundingClientRect().width + gap : 420;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-[#EAEAEA]">
      {/* вирівнюємо зліва, даємо максимум вправо */}
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <h2 className="text-[#18181B] font-extrabold leading-tight
                         text-[28px] sm:text-[36px] md:text-[44px]">
            Our reviews
          </h2>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollByCards(-1)}
              className="w-22 h-16 rounded-full bg-white flex items-center justify-center hover:bg-white shadow transition"
              aria-label="Previous"
            >
              <img src={ArrowRight} alt="" className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              className="w-22 h-16 rounded-full bg-white flex items-center justify-center hover:bg-white shadow transition"
              aria-label="Next"
            >
              <img src={ArrowRight} alt="" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className={`hidebar flex gap-5 md:gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth
                      ${grabbing ? "cursor-grabbing" : "cursor-grab"} pb-1`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseLeave={onPointerUp}
          onMouseUp={onPointerUp}
        >
          <style>{`.hidebar::-webkit-scrollbar{display:none}`}</style>

          {reviews.map((r) => (
            <article
              key={r.id}
              className="
                snap-start shrink-0
                w-[92%] sm:w-[520px]
                md:basis-[calc(25%-1.5rem)] md:flex-none /* 4 у вікні, md:gap-8 = 32px → 1.5rem сумарна частка */
                bg-[#F2F2F2] rounded-[24px] md:rounded-[28px] p-6 md:p-8
              "
            >
              {/* header of card */}
              <div className="flex items-center gap-4 md:gap-5 mb-4">
                {r.avatar ? (
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-14 h-14 md:w-16 md:h-16"
                    viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M3 20c2.6-5.2 15.4-5.2 18 0" />
                  </svg>
                )}

                <div className="min-w-0">
                  <div className="text-[#0B0E2C] font-extrabold
                                  text-[20px] md:text-[24px] leading-none">
                    {r.name}
                  </div>
                  <div className="text-[#6B7280] text-[14px] md:text-[16px] mt-1">
                    {r.ago}
                  </div>
                </div>
              </div>

              <p className="text-[#5E5E61] text-[16px] md:text-[18px] leading-snug">
                {r.text}
              </p>

              <div className="mt-6 md:mt-7 flex items-center justify-between">
                <span className="text-[#18181B] text-[16px] md:text-[18px]">{r.rating}</span>

                <button
                  className="w-11 h-11 md:w-18 md:h-18 rounded-full bg-white flex items-center justify-center shadow hover:shadow-md transition"
                  aria-label="Open review"
                >
                  <img src={ArrowRightUp} alt="" className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurReviewsStrip;
