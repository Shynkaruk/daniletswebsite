import React, { useEffect, useState } from "react";
import Head from "./../Head.jsx";
import familyPhoto from "../../assets/photo/family-photo5.png";
import familyMobile from "../../assets/photo/bg_family_mobile.jpg";
import diamondicon from "../../assets/icons/diamond-icon.svg";

const MainAboutUs = () => {
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  // ✅ блокуємо прокрутку сторінки під модалкою
  useEffect(() => {
    if (!showPopup) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showPopup]);

  return (
    <div className="bg-[#e5e5e5] min-h-screen pb-8 relative">
      <Head />

      <main className="relative min-h-screen w-full overflow-hidden">
        {/* BACKGROUND (Desktop через img для ідеального контролю) */}
        <div className="absolute inset-0 z-0 md:block">
          <img
            src={familyPhoto}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* BACKGROUND (Mobile) */}
        <div
          className="absolute inset-0 z-0 md:hidden bg-no-repeat"
          style={{
            backgroundImage: `url(${familyMobile})`,
            backgroundSize: "cover",
            transform: "scale(1)",
            backgroundPosition: "50%",
          }}
        />

        {/* CONTENT */}
        <div className="relative z-[3] w-[95%] max-w-[1792px] mx-auto md:pt-[120px] pt-[90px] px-4 pb-16">
          <div className="w-full md:w-2/3 lg:w-1/2 space-y-6">
            <h1 className="text-[40px] sm:text-[40px] md:text-[80px] lg:text-[82px] xl:text-[90px] font-extrabold text-white">
              Danilets Family
            </h1>

            <p
              className="text-[16px] sm:text-[18px] md:text-[18px] lg:text-[22px] -mt-5 xl:text-[24px] font-medium leading-snug text-white max-w-[900px]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              A family story of faith, resilience, and the American dream. From
              losing everything to building something meaningful, every
              milestone shaped who we are today.
            </p>

            <button
              onClick={openPopup}
              className="border border-white px-6 py-3 md:px-12 md:py-5 rounded-full text-white text-[16px] sm:text-[18px] font-semibold hover:bg-white hover:text-black transition"
            >
              Read More
            </button>
          </div>
        </div>

        {/* LABEL */}
        <div className="absolute z-[4] bottom-25 right-6 md:bottom-30 md:right-20 bg-[rgba(235,176,108,0.15)] rounded-full px-4 py-3 flex items-center gap-3">
          <img
            src={diamondicon}
            alt="Diamond Icon"
            className="w-6 h-6 lg:w-8 lg:h-8"
          />
          <span className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-semibold">
            Lets is More
          </span>
        </div>
      </main>

      {/* POPUP */}
      {showPopup && <PopupStory onClose={closePopup} />}
    </div>
  );
};

/* ============================
   МОДАЛЬНЕ ВІКНО (АДАПТИВНЕ)
=============================== */
const PopupStory = ({ onClose }) => {
  // ✅ ESC закриває
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="
        fixed inset-0 z-[9999999999]
        bg-black/70 backdrop-blur-sm
        flex items-end sm:items-center justify-center
      "
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // ✅ клік по бекдропу — закрити
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        // ✅ safe-area для iPhone (ноучі)
        paddingTop: "env(safe-area-inset-top)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
      }}
    >
<div
  className="
    relative bg-white
    w-full
    max-w-[900px]
    mx-3 sm:mx-6 md:mx-10
    rounded-t-2xl sm:rounded-2xl
    shadow-2xl
    overflow-hidden
  "
  style={{
    height: "min(90dvh, 880px)",
  }}
>

        {/* Sticky header */}
        <div
          className="
            sticky top-0 z-10 bg-white
            border-b border-black/10
          "
          style={{
            paddingTop: "max(12px, env(safe-area-inset-top))",
          }}
        >
          <div className="relative px-5 sm:px-8 pb-4">
            <h2 className="text-[24px] sm:text-3xl font-extrabold text-center pr-10">
              A Journey of Faith and Resilience
            </h2>

            <button
              onClick={onClose}
              aria-label="Close"
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-full
                flex items-center justify-center
                text-2xl font-semibold
                text-gray-700 hover:text-black
                bg-white shadow
                active:scale-95 transition
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="h-full overflow-y-auto px-5 sm:px-8 py-6">
          <p className="mb-3">
            Our story begins in 2009 when our family moved to the United States,
            leaving everything behind. We lost our home and business, and
            arrived in upstate New York with nothing but hope and faith in God's
            plan.
          </p>

          <p className="mb-3">
            From 2010 to 2012, Nataly wasn't physically present in the US—stuck
            in Europe, separated from her children, fighting to reunite our
            family. After two years of perseverance and prayer, she was finally
            able to return. In 2013, we moved to Columbus, Ohio, where our
            American dream truly began.
          </p>

          <h3 className="text-2xl font-semibold mt-6 mb-3">
            Building from the Ground Up
          </h3>

          <p className="mb-3">
            When we first arrived in Columbus, Nataly started working at a
            hotel, making just $3.75 per room. During those difficult days, she
            made a promise: "When I have my own company, I will never treat my
            team members like this."
          </p>

          <p className="mb-3">
            From 2013 to 2016, she worked for others while building her skills
            and reputation. She then started working independently as a sole
            proprietor, serving clients with the same dedication and care that
            would become our family trademark.
          </p>

          <p className="mb-3">
            In 2020, everything changed. Nataly began hiring team members,
            growing from a one-person operation to a full cleaning company. That
            same year, Timothy came across a YouTube channel called "Detailed
            Geek," ordered some equipment, and detailed his mom's car. Elijah
            joined him in partnership, and Danilets Detailing was born.
          </p>

          <h3 className="text-2xl font-semibold mt-6 mb-3">
            Milestones of Perseverance
          </h3>

          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>2016: Started cleaning for private clients</li>
            <li>2020: Started hiring team members for cleaning services</li>
            <li>2020: Founded Danilets Detailing</li>
            <li>2021: Granted asylum in the United States</li>
            <li>2024: Received green card in the United States</li>
            <li>2024: Purchased first home in the United States</li>
            <li>2025: Rebranded to combine detailing and cleaning </li>
          </ul>

          <h3 className="text-2xl font-semibold mt-6 mb-3">
            Our Promise to You
          </h3>

          <p className="mb-3">
            We know what it's like to start with nothing. We know the value of
            hard work, integrity, and treating people with dignity. Every
            customer we serve receives the same care and excellence we wished
            for during our hardest days.
          </p>

          <p>
            When you choose Danilets, you're not just hiring a service—you're
            supporting a family that believes in the American dream, honors God
            in everything we do, and treats every client like family.
          </p>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="
                px-6 py-2 rounded-full border border-[#D4D4D8]
                text-sm md:text-[15px] hover:bg-[#F4F4F5] transition
              "
            >
              Close
            </button>
          </div>

          {/* ✅ простір під safe-area знизу */}
          <div style={{ height: "max(12px, env(safe-area-inset-bottom))" }} />
        </div>
      </div>
    </div>
  );
};

export default MainAboutUs;
