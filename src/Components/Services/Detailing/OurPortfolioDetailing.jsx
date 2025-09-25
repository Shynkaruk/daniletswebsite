import React, { useMemo, useRef, useState } from 'react'

function VideoThumb({ webm, mp4, title }) {
  const ref = useRef(null)

  const handleEnter = () => ref.current?.play()
  const handleLeave = () => ref.current?.pause()

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
        aria-label={title}
        disablePictureInPicture
      >
        {webm && <source src={webm} type="video/webm" />}
        {mp4 && <source src={mp4} type="video/mp4" />}
      </video>
    </div>
  )
}


const OurPortfolioDetailing = () => {
  const items = useMemo(
    () => [
      { id: 1, tag: 'Detailing', title: 'Mercedes-AMG GT R', srcWebm: '/video/video1.webm', srcMp4: '/video/video1.mp4',
        desc: "We don't just wash — we decontaminate, polish, protect. Deep exterior restoration for long-lasting gloss." },
      { id: 2, tag: 'Detailing', title: 'BMW M4',            srcWebm: '/video/video2.webm', srcMp4: '/video/video2.mp4',
        desc: 'Full paint correction + ceramic coating. Hydrophobic finish and mirror-like reflections.' },
      { id: 3, tag: 'Detailing', title: 'Porsche 911',       srcWebm: '/video/video3.webm', srcMp4: '/video/video3.mp4',
        desc: 'Two-stage polishing, trim restoration, and glass sealant for ultimate clarity.' },
      { id: 4, tag: 'Detailing', title: 'Audi RS7',          srcWebm: '/video/video4.webm', srcMp4: '/video/video4.mp4',
        desc: 'Wheel off detailing, brake caliper cleanup, and tire dressing with satin finish.' },
      { id: 5, tag: 'Detailing', title: 'Range Rover',       srcWebm: '/video/video1.webm', srcMp4: '/video/video1.mp4',
        desc: 'Premium wash protocol, tar removal, clay bar, and single-stage enhancement.' },
    ],
    []
  )

  const PAGE = 3
  const [start, setStart] = useState(0)
  const visible = items.slice(start, start + PAGE)
  const hasPrev = start > 0
  const hasNext = start + PAGE < items.length
  const handlePrev = () => { if (hasPrev) setStart(s => Math.max(0, s - PAGE)) }
  const handleNext = () => { if (hasNext) setStart(s => Math.min(items.length - PAGE, s + PAGE)) }

  const [openId, setOpenId] = useState(null)
  const activeItem = useMemo(() => items.find(it => it.id === openId) || null, [openId, items])

  return (
    <section className="px-4 md:px-8 lg:px-12 pb-6">
      <h2 className="text-3xl md:text-4xl font-bold my-6 md:ml-10">Our portfolio</h2>

      {/* 3 картки в ряд */}
      <div className="grid grid-cols-1 md:mx-10 md:grid-cols-3 gap-4 lg:gap-5">
        {visible.map((item) => (
          <article key={item.id} className="bg-white rounded-[20px] p-3 shadow-sm ring-1 ring-black/5 flex flex-col">
            <button
              type="button"
              onClick={() => setOpenId(item.id)}
              className="relative rounded-[16px] overflow-hidden w-full text-left"
            >
              {/* Відео із пропорцією ≈ 588×392 і зсувом ~–2.9% без жорстких px */}
              <VideoThumb webm={item.srcWebm} mp4={item.srcMp4} title={item.title} />

              {/* Плей-іконка поверх */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-md">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 translate-x-[1px]">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>

            {/* Підписи */}
            <div className="mt-3">
              <p className="text-base mt-2 leading-4 text-neutral-500">{item.tag}</p>
              <h3 className="text-3xl mt-2 font-bold text-neutral-900">{item.title}</h3>
            </div>
          </article>
        ))}
      </div>

      {/* Кнопки управління */}
      <div className="mt-6 md:ml-10 flex items-center justify-between">
        <button type="button" className="px-6 h-11 md:px-9 md:h-14 rounded-full bg-white text-neutral-900 text-xl font-bold shadow-sm ring-1 ring-black/5">
          Load More
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!hasPrev}
            className="w-13 h-11 md:w-19 md:h-16 rounded-full bg-white shadow-sm ring-1 ring-black/5 grid place-items-center disabled:opacity-50"
            aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Модалка */}
      {activeItem && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/60" onClick={() => setOpenId(null)} aria-label="Close modal backdrop" />
          <div className="relative mx-auto mt-20 w-[92%] md:max-w-4xl lg:max-w-5xl rounded-[24px] bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 grid place-items-center">
                  <span className="text-[18px]">🧽</span>
                </div>
                <h3 className="text-[18px] font-semibold">{activeItem.title}</h3>
              </div>
              <button onClick={() => setOpenId(null)} className="w-9 h-9 rounded-full bg-neutral-100 grid place-items-center" aria-label="Close modal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-4 mt-3">
              <div className="rounded-[16px] overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  preload="metadata"
                  playsInline
                  controls
                  autoPlay
                  muted
                >
                  {activeItem.srcWebm && <source src={activeItem.srcWebm} type="video/webm" />}
                  {activeItem.srcMp4 && <source src={activeItem.srcMp4} type="video/mp4" />}
                </video>
              </div>
            </div>

            <div className="px-4 py-4">
              <p className="text-sm leading-6 text-neutral-800">{activeItem.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default OurPortfolioDetailing
