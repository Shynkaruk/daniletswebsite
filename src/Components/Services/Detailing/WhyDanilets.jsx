import React, { useMemo } from 'react'

// Іконки
import iconFull from '../../../assets/icons/icon_full-auto-detailing.svg'
import iconPaint from '../../../assets/icons/icon_paint-protection.svg'
import iconPrecision from '../../../assets/icons/icon_precision-work.svg'
import iconFlexible from '../../../assets/icons/icon_flexible-scheduling.svg'
import iconDrops from '../../../assets/icons/iconDropsRed.svg'

const WhyDanilets = () => {
  const items = useMemo(() => [
    { id: 1, title: '+1,500 Vehicles Detailed',   subtitle: 'Since 2020, weve transformed over 1,500 vehicles',                            icon: iconFull },
    { id: 2, title: 'Attention to Detail',      subtitle: 'We dont cut corners',          icon: iconPaint },
    { id: 3, title: 'Dealership & Fleet Services',        subtitle: 'Consistent quality for businesses',                    icon: iconPrecision },
    { id: 4, title: 'Family-Owned',   subtitle: 'Youre not just a transaction—youre family',                     icon: iconFlexible },
  ], [])

  return (
    <section className="w-full px-4 pb-8">
      {/* ------- MOBILE (як було) ------- */}
      <div className="md:hidden">
        <div className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-[#FF525226] mb-4">
          <span className="w-5 h-5 grid place-items-center rounded-full">
            <img src={iconDrops} alt="drops icon" className="w-6 h-6" />
          </span>
          <span className="text-base font-semibold text-[#1c1c1c]">Why Danilets Detailing?</span>
        </div>

        <h2 className="text-black text-3xl leading-[1.2] font-bold mb-3">
          Excellence in Every Detail<br />
          <span className="text-black">Loop with Danilets</span>
        </h2>

        <p className="text-neutral-900 text-xl leading-6 mb-6 mt-6">
          We don’t just wash cars. We restore shine, protect surfaces, and bring back that new-car
          feeling — with precision, care, and premium service
        </p>

        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="bg-white rounded-[20px] px-4 py-3 ring-1 ring-black/5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-neutral-100 grid place-items-center">
                  <img src={item.icon} alt={item.title} className="w-9 h-9 object-contain"
                       onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl leading-8 font-semibold text-neutral-900">{item.title}</h3>
                  <p className="text-base leading-6 text-neutral-500 mt-1">{item.subtitle}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ------- DESKTOP ------- */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-8 md:-mt-10 lg:gap-12 max-w-[1400px] mx-auto">
        {/* LEFT: 2×2 картки */}
        <div className="md:col-span-7">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {items.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-[28px] px-6 py-6 ring-1 ring-black/5 shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-neutral-100 grid place-items-center">
                    <img src={item.icon} alt={item.title} className="w-8 h-8 object-contain"
                         onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[28px] leading-8 font-semibold text-neutral-900">{item.title}</h3>
                    <p className="text-[15px] leading-6 text-neutral-500 mt-1">{item.subtitle}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* RIGHT: бейдж + заголовок + опис */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-[#FF525226] mb-5 self-start">
            <span className="w-6 h-6 grid place-items-center rounded-full">
              <img src={iconDrops} alt="" className="w-6 h-6" />
            </span>
            <span className="text-base font-semibold text-[#1c1c1c]">Why Danilets Detailing?</span>
          </div>

          <h2 className="text-black text-[44px] lg:text-[52px] leading-[1.1] font-bold mb-4">
            Excellence in Every Detail
          </h2>

          <p className="text-neutral-700 text-lg leading-7 max-w-[560px]">
            We don’t just wash cars. We restore shine, protect surfaces, and bring back that new-car
            feeling — with precision, care, and premium service.
          </p>
        </div>
      </div>
    </section>
  )
}

export default WhyDanilets
