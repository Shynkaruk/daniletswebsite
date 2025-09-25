// components/PickleballWhySection.jsx
import React, { useRef, useState } from "react";

// За замовчуванням (можеш замінити)
import ArrowRight from "../../assets/icons/arrows/arrow_right_black.svg";
import DefaultCardIcon from "../../assets/icons/services/media.svg";
import DefaultBadgeIcon from "../../assets/icons/services/media.svg"; // <-- заміниш на свою іконку бейджа

const cards = Array.from({ length: 5 }).map((_, i) => ({
  id: i + 1,
  title: "Boosts Physical Health",
  description:
    "With over 10 years in the cleaning industry, Nataly Danilets brings expertise and passion to every cleaning project",
  cta: "Learn More",
}));

const PickleballWhySection = ({
  badgeIconSrc = DefaultBadgeIcon, // 🔁 твоя іконка для бейджа
  cardIconSrc = DefaultCardIcon,   // 🔁 твоя іконка у картці
}) => {
  const trackRef = useRef(null);

  // Drag-to-scroll (мишкою)
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    isDownRef.current = true;
    setGrabbing(true);
    startXRef.current = (e.pageX ?? e.clientX) - el.getBoundingClientRect().left;
    scrollLeftRef.current = el.scrollLeft;
  };

  const onPointerMove = (e) => {
    const el = trackRef.current;
    if (!el || !isDownRef.current) return;
    e.preventDefault();
    const x = (e.pageX ?? e.clientX) - el.getBoundingClientRect().left;
    const walk = x - startXRef.current;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const onPointerUp = () => {
    isDownRef.current = false;
    setGrabbing(false);
  };

  const scrollByCards = (dir = 1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector("article");
    const gap = parseInt(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "16", 10);
    const step = firstCard ? firstCard.getBoundingClientRect().width + (gap || 16) : 420;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-[#EAEAEA]">
      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
          {/* Ліва колонка */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-[#E8D39E]/60 text-[#18181B] text-[14px] font-semibold mb-4">
              <img src={badgeIconSrc} alt="badge" className="w-6 h-6 md:w-8 md:h-8" />
              <span className="whitespace-nowrap">The history of the company's inception</span>
            </div>

            <h2 className="text-[#18181B] font-extrabold leading-tight text-[32px] sm:text-[40px] md:text-[52px]">
              More than just a game — it’s a movement
            </h2>

            <p className="mt-3 text-[#5E5E61] font-medium text-[16px] sm:text-[18px] md:text-[20px] leading-snug max-w-[560px]">
              Pickleball is taking over the world for a reason — it’s easy, fun, and for everyone
            </p>
          </div>

          {/* Права колонка */}
          <div className="relative lg:col-span-7">
            <div
              ref={trackRef}
              className={`hidebar flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-6 select-none ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onWheel={(e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  e.preventDefault();
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseLeave={onPointerUp}
              onMouseUp={onPointerUp}
            >
              <style>{`.hidebar::-webkit-scrollbar{display:none}`}</style>

              {cards.map((card) => (
                <article
                  key={card.id}
                  className="snap-start shrink-0 w-[86%] sm:w-[420px] md:w-[460px] bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img src={cardIconSrc} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                    <h3 className="text-[#18181B] font-extrabold text-[18px] sm:text-[20px] md:text-[22px]">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-[#5E5E61] text-[14px] sm:text-[15px] md:text-[16px] leading-snug mb-4 md:mb-5">
                    {card.description}
                  </p>

                  <button
                    className="mt-auto inline-flex items-center justify-between w-full rounded-[88px] px-4 py-3 text-[16px] md:text-[18px] font-semibold text-[#18181B]"
                    style={{
                      background:
                        "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                    }}
                  >
                    <span>{card.cta}</span>
                    <img src={ArrowRight} alt="" className="w-5 h-5" />
                  </button>
                </article>
              ))}
            </div>

            {/* Кнопка праворуч */}
            <button
              onClick={() => scrollByCards(1)}
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[-2.5rem] z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-white transition items-center justify-center"
              aria-label="Next"
            >
              <img src={ArrowRight} alt="" className="w-6 h-6" />
            </button>

            <div
              className="pointer-events-none absolute top-0 right-0 h-full w-12 sm:w-16 md:w-24 z-10"
              style={{
                background:
                  "linear-gradient(270deg, rgba(234,234,234,1) 0%, rgba(234,234,234,0) 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PickleballWhySection;
