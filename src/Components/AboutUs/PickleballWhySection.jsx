// components/PickleballWhySection.jsx
import React, { useRef, useState } from "react";

// За замовчуванням (можеш замінити)
import ArrowRight from "../../assets/icons/arrows/arrow_right_black.svg";
import DefaultCardIcon from "../../assets/icons/services/media.svg";
import DefaultBadgeIcon from "../../assets/icons/services/media.svg"; // <-- заміниш на свою іконку бейджа

const cards = [
  {
    id: 1,
    title: "2009 - A New Beginning",
    brief:
      "Fled Latvia and arrived in the United States with nothing but hope and faith.",
    detailed: `Our family's American journey began in 2009 when we fled Latvia, leaving behind everything we knew—our home, our business, and our entire life. We arrived in upstate New York with nothing but the clothes on our backs and an unwavering faith in God's plan. It was the hardest decision we ever made, but we believed in the promise of a better future. This moment of complete loss became the foundation of our family's resilience and determination.`,
  },
  {
    id: 2,
    title: "2010-2012 - Separated by an Ocean",
    brief:
      "Family separated as Nataly remained stuck in Europe, fighting to reunite with her children.",
    detailed: `For almost two agonizing years, our family was torn apart. Nataly was stuck in Europe, unable to enter the United States, while her children waited in America. These were the darkest days—separated by an ocean, connected only by phone calls and prayers. Every day felt like an eternity. But Nataly never stopped fighting. She navigated complex immigration processes, endured countless setbacks, and refused to give up on reuniting with her family. Her perseverance during this impossible time taught us that faith and determination can overcome any obstacle.`,
  },
  {
    id: 3,
    title: "2013 - Columbus, Ohio — Our New Home",
    brief:
      "Reunited as a family and moved to Columbus, Ohio, where our American dream truly began.",
    detailed: `After almost two years of separation, our family was finally whole again. In 2013, we moved to Columbus, Ohio—a city that would become our home and the birthplace of our dreams. We arrived with nothing but each other and a determination to build a better life. Columbus welcomed us with open arms, and we embraced every opportunity to work hard, learn, and grow. This city gave us a chance to start over, and we promised ourselves we'd make the most of it. Columbus isn't just where we live—it's where we became who we are today.`,
  },
  {
    id: 4,
    title: "2013 - The Hotel Job",
    brief:
      "Nataly started working at a hotel, earning just $3.75 per room, and made a life-changing promise.",
    detailed: `Nataly's first job in Columbus was cleaning hotel rooms for $3.75 per room. The work was exhausting and the pay was barely enough to survive. But she showed up every single day with dignity and gave her best effort. During those grueling shifts, she made a promise that would change everything: "When I have my own company, I will never treat my team members like this." That promise became the foundation of Timils Cleaning (now branded to Danilets Cleaning). Every team member we hire, every client we serve—it all goes back to that moment when Nataly decided that hard work deserves respect, and people deserve dignity.`,
  },
  {
    id: 5,
    title: "2013-2016 - Building Skills & Reputation",
    brief:
      "Worked for various cleaning companies, learning the business and building an excellent reputation.",
    detailed: `From 2013 to 2016, Nataly worked for several cleaning companies, absorbing everything she could learn about the industry. She studied what made clients happy, what created lasting relationships, and what separated good service from exceptional service. She built a reputation for being reliable, thorough, and trustworthy—clients would specifically request her. These years weren't easy, but they were essential. Every house she cleaned, every client she served, every challenge she overcame was preparing her for what came next. She was building more than skills—she was building the foundation of a business rooted in excellence and integrity.`,
  },
  {
    id: 6,
    title: "2016-2020 - Independent & Growing",
    brief:
      "Started working independently as a sole proprietor, serving clients with dedication and care.",
    detailed: `In 2016, Nataly took the leap and started working independently as a sole proprietor. No longer working for someone else, she was building her own client base and reputation. She poured her heart into every job, treating each client's home like her own. Word spread quickly—clients loved her attention to detail, her reliability, and her genuine care. What started as one woman with a dream grew into a thriving independent business. These years taught her the realities of entrepreneurship: the long hours, the sacrifices, the uncertainty, and the incredible reward of building something with your own hands. She was no longer just working—she was creating a legacy.`,
  },
  {
    id: 7,
    title: "2020 - A Team is Born",
    brief:
      "Started hiring team members, growing from a one-person operation to a full cleaning company.",
    detailed: `2020 was a turning point. Nataly's business had grown beyond what one person could handle, and it was time to build a team. Remembering her promise from the hotel days, she hired her first team members and treated them with the respect and dignity she wished she'd received. She paid fair wages, provided training, and created a work environment built on trust and excellence. Timils Cleaning was no longer just Nataly—it was a team united by shared values. Every team member understood that they weren't just cleaning spaces; they were representing a family business built on faith, hard work, and treating people right. This was the beginning of something bigger than any of us imagined.`,
  },
  {
    id: 8,
    title: "2020 - Danilets Detailing is Founded",
    brief:
      "Timothy discovered detailing through YouTube, and together with Elijah, Danilets Detailing was born.",
    detailed: `In 2020, Timothy stumbled upon a YouTube channel called "Detailed Geek" and was instantly captivated. He ordered some basic equipment and detailed his mom's car—the results were incredible. Elijah saw the potential immediately, and the two brothers joined forces to start Danilets Detailing. What began as a YouTube-inspired experiment quickly became a passion and then a business. They started with one vehicle at a time, learning techniques, perfecting their craft, and building a reputation for meticulous attention to detail. The same values that built the cleaning business—integrity, excellence, and treating every client like family—became the foundation of Danilets Detailing. Two brothers, one vision, and a commitment to perfection.`,
  },
  {
    id: 9,
    title: "2021 - Asylum Granted",
    brief:
      "After years of uncertainty, our family was granted asylum in the United States.",
    detailed: `2021 brought a moment we'd been praying for since 2009—our family was officially granted asylum in the United States. After twelve years of uncertainty, fear, and fighting to stay together, we finally had legal protection and the right to build our lives here. This wasn't just a legal status; it was validation that our struggle mattered, that our faith was rewarded, and that America truly was the land of opportunity. We could finally breathe. We could finally plan for the future without fear. This milestone gave us the security to dream bigger, invest in our businesses, and commit fully to serving the Columbus community that had welcomed us. We were no longer just surviving—we were officially home.`,
  },
  {
    id: 10,
    title: "2024 - Green Cards Received",
    brief:
      "Our entire family received green cards, marking a major milestone in our American journey.",
    detailed: `November 2024 brought one of the most emotional moments of our lives—our entire family received green cards. Fifteen years after arriving with nothing, we were now permanent residents of the United States. This wasn't just a card; it was proof that the American dream is real. It was validation of every sacrifice, every hardship, every prayer, and every moment of doubt we pushed through. We thought about that hotel room in 2013 where Nataly earned $3.75 per room. We thought about the years of separation, the uncertainty, the fear. And now, here we were—legal permanent residents with thriving businesses and a bright future. This green card represented more than legal status; it represented hope fulfilled, faith rewarded, and dreams realized.`,
  },
  {
    id: 11,
    title: "2024 - First Home in America",
    brief:
      "Purchased our first home in the United States—a dream fifteen years in the making.",
    detailed: `In December 2024, we achieved what once seemed impossible—we purchased our first home in the United States. Fifteen years after arriving with nothing, we had a place to call our own. This wasn't just a house; it was proof that hard work, faith, and perseverance pay off. It was a symbol of stability, security, and the American dream realized. We walked through those doors for the first time with overwhelming emotions, remembering the tiny apartments, the years of uncertainty. Now we had a home—a place where our family and friends could gather, where memories would be made, where the next chapter of our story would unfold. This home represents everything we've worked for and everything we believe in: faith, family, and the promise that anything is possible in America.`,
  },
  {
    id: 12,
    title: "2020-2025 - Over 1,500 Vehicles Detailed",
    brief:
      "Detailed over 1,500 vehicles, building expertise and a reputation for excellence.",
    detailed: `From 2020 to 2025, Danilets Detailing transformed over 1,500 vehicles and counting—each one a testament to our commitment to excellence. Every car, truck, and SUV that came through our doors received the same meticulous attention to detail, whether it was a daily driver or a luxury vehicle. We learned something from every single one: different paint types, various interior materials, unique challenges, and specific client preferences. This hands-on experience made us experts in our craft. We weren't just detailing vehicles; we were perfecting our skills, building relationships, and creating a reputation for quality that brought clients back again and again. These 1,500+ vehicles represent thousands of hours of hard work, continuous learning, and an unwavering commitment to delivering results that exceed expectations.`,
  },
  {
    id: 13,
    title: "2025 - Rebranded & United",
    brief:
      "Rebranded to unite Timils Cleaning and Danilets Detailing under one family business.",
    detailed: `In 2025, we made a strategic decision to rebrand and unite our services under the Danilets family name. What started as two separate businesses—Timils Cleaning and Danilets Detailing—came together to reflect what we've always been: one family, one mission, one commitment to excellence. This rebrand represents our growth, our maturity, and our vision for the future. We're not just a cleaning company or a detailing company—we're a family business that serves with integrity, excellence, and care. Whether we're transforming your commercial space or perfecting your vehicle, you're getting the same values, the same dedication, and the same family that's been serving Columbus since 2013. This is who we are. This is the Danilets difference.`,
  },
];

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

  // Попап для Learn More
  const [activeCard, setActiveCard] = useState(null);

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    isDownRef.current = true;
    setGrabbing(true);
    startXRef.current =
      (e.pageX ?? e.clientX) - el.getBoundingClientRect().left;
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
    const gap = parseInt(
      getComputedStyle(el).columnGap ||
        getComputedStyle(el).gap ||
        "16",
      10
    );
    const step = firstCard
      ? firstCard.getBoundingClientRect().width + (gap || 16)
      : 420;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <>
      <section className="relative w-full bg-[#EAEAEA]">
        <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-10 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
            {/* Ліва колонка */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-[#E8D39E]/60 text-[#18181B] text-[14px] font-semibold mb-4">
                <img
                  src={badgeIconSrc}
                  alt="badge"
                  className="w-6 h-6 md:w-8 md:h-8"
                />
                <span className="whitespace-nowrap">
                  The Story Behind Our Family Business
                </span>
              </div>

              <h2 className="text-[#18181B] font-extrabold leading-tight text-[32px] sm:text-[40px] md:text-[52px]">
                More than just a business
              </h2>

              <p className="mt-3 text-[#5E5E61] font-medium text-[16px] sm:text-[18px] md:text-[20px] leading-snug max-w-[560px]">
                From losing everything to building something meaningful, every
                milestone shaped who we are today.
              </p>
            </div>

            {/* Права колонка */}
            <div className="relative lg:col-span-7">
              <div
                ref={trackRef}
                className={`hidebar flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-6 select-none ${
                  grabbing ? "cursor-grabbing" : "cursor-grab"
                }`}
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
                    className="snap-start shrink-0 w-[86%] sm:w-[420px] md:w-[460px] bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-[0_6px_18px_rgba(0,0,0,0.06)] flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={cardIconSrc}
                        alt=""
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                      />
                      <h3 className="text-[#18181B] font-extrabold text-[18px] sm:text-[20px] md:text-[22px]">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-[#5E5E61] text-[14px] sm:text-[15px] md:text-[16px] leading-snug mb-4 md:mb-5">
                      {card.brief}
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveCard(card)}
                      className="mt-auto inline-flex items-center justify-between w-full rounded-[88px] px-4 py-3 text-[16px] md:text-[18px] font-semibold text-[#18181B]"
                      style={{
                        background:
                          "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                      }}
                    >
                      <span>Learn More</span>
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

      {/* Pop-up для Learn More по таймлайну */}
      {activeCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-[900px] max-h-[90vh] overflow-y-auto p-8 text-black shadow-2xl">
            <button
              onClick={() => setActiveCard(null)}
              className="absolute top-3 right-3 text-2xl font-semibold text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-4 text-center">
              {activeCard.title}
            </h2>

            <p
              className="text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-line"
            >
              {activeCard.detailed}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PickleballWhySection;
