import React, { useMemo } from 'react'
import { FiCalendar } from "react-icons/fi";

// Іконки PNG
import iconFull from '../../../assets/icons/home_icon_cleaning.svg'
import iconPaint from '../../../assets/icons/sprey_icon.svg'
import iconFlexible from '../../../assets/icons/box_icon.svg'
import iconDrops from '../../../assets/icons/hand_icon_cleaning.svg'

const WhyDaniletsCleaning = () => {

  const items = useMemo(() => [
    {
      id: 1,
      title: 'Commercial Expertise',
      subtitle:
        'Specialized in professional environments—we understand business needs and deliver results that maintain your reputation.',
      icon: <img src={iconFull} className="w-7 h-7" alt="" />,
    },

    {
      id: 2,
      title: <>Attention to Detail</>,
      subtitle:
        "We don't cut corners. Every surface, every space receives the same thorough care we'd want for our own family.",
      icon: <img src={iconPaint} className="w-7 h-7" alt="" />,
    },

    {
      id: 3,
      title: 'Reliable Scheduling',
      subtitle:
        'We work around your timeline with flexible, dependable scheduling. Consistent service you can count on, every single time.',
      icon: (
        <FiCalendar
          className="w-6 h-6 text-[#1c1c1c]"
          style={{ strokeWidth: 1.5 }}
        />
      ),
    },

    {
      id: 4,
      title: 'Professional Results',
      subtitle:
        'As a family-owned business, we treat your space like our own. You get personal care with professional-grade excellence.',
      icon: <img src={iconFlexible} className="w-7 h-7" alt="" />,
    },
  ], [])


  return (
    <section className="w-full px-4 pb-8">

      {/* ------- MOBILE ------- */}
      <div className="md:hidden">
        <div className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-[#FF525226] mb-4">
          <span className="w-5 h-5 grid place-items-center rounded-full">
            <img src={iconDrops} alt="" className="w-6 h-6" />
          </span>
          <span className="text-base font-semibold text-[#1c1c1c]">
            Why Danilets Cleaning?
          </span>
        </div>

        <h2 className="text-black text-3xl leading-[1.2] font-bold mb-3">
          Excellence in Every Clean
        </h2>

        <p className="text-neutral-900 text-xl leading-6 mb-6 mt-6">
          We don't just clean spaces. We transform them with meticulous care, creating
          environments where businesses thrive and comfort meets excellence — delivering
          professional results that exceed expectations every time.
        </p>

        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="bg-white rounded-[20px] px-4 py-3 ring-1 ring-black/5 shadow-sm">
              <div className="flex items-start gap-3">

                {/* ICON WRAPPER */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-neutral-100 grid place-items-center">
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <h3 className="text-2xl leading-8 font-semibold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="text-base leading-6 text-neutral-500 mt-1">
                    {item.subtitle}
                  </p>
                </div>

              </div>
            </article>
          ))}
        </div>
      </div>



      {/* ------- DESKTOP ------- */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-8 lg:gap-12 max-w-[1600px] md:ml-5">

        {/* LEFT CARDS */}
        <div className="md:col-span-7">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {items.map((item) => (
              <article key={item.id} className="bg-white rounded-[28px] px-6 py-6 ring-1 ring-black/5 shadow-md">
                <div className="flex items-start gap-4">

                  {/* ICON WRAPPER */}
                  <div className="shrink-0 w-12 h-12 rounded-full bg-neutral-100 grid place-items-center">
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[28px] leading-8 font-semibold text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="text-[15px] leading-6 text-neutral-500 mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                </div>
              </article>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-[#FF525226] mb-5 self-start">
            <span className="w-6 h-6 grid place-items-center rounded-full">
              <img src={iconDrops} alt="" className="w-6 h-6" />
            </span>
            <span className="text-base font-semibold text-[#040404]">
              Why Danilets Cleaning?
            </span>
          </div>

          <h2 className="text-black text-[44px] lg:text-[52px] leading-[1.1] font-bold mb-4">
            Excellence in Every Clean
          </h2>

          <p className="text-neutral-700 text-lg leading-7 max-w-[560px]">
            We don't just clean spaces. We transform them with meticulous care, creating
            environments where businesses thrive and comfort meets excellence — delivering
            professional results that exceed expectations every time.
          </p>
        </div>
      </div>

    </section>
  )
}

export default WhyDaniletsCleaning
