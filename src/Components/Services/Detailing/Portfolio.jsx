import React, { useEffect, useState, useCallback } from "react";

// Підстав свої зображення
import car1 from "../../../assets/cars/car1.jpg";
import car2 from "../../../assets/cars/car2.png";
import car3 from "../../../assets/cars/car3.png";
import car4 from "../../../assets/cars/car4.png";
import car5 from "../../../assets/cars/car5.png";
import car6 from "../../../assets/cars/car6.png";

const portfolioItems = [
  {
    id: 1,
    title: "Mercedes-AMG GT R",
    category: "Detailing",
    image: car1,
    description:
      "Повний детейлінг кузова: двофазна мийка, деконтамінація, полірування в 2 етапи, керамічний захист 9H, детайлінг дисків та гальмівних супортів.",
  },
  {
    id: 2,
    title: "Mercedes-AMG GT R",
    category: "Detailing",
    image: car2,
    description:
      "Екстер’єрний детайлінг + захист плівкою зон ризику (капот, бампер, дзеркала). Фінальна консервація силером.",
  },
  {
    id: 3,
    title: "Mercedes-AMG GT R",
    category: "Detailing",
    image: car3,
    description:
      "Експрес-детайлінг кузова, очищення та кондиціювання зовнішнього пластику, оновлення чорного глянцю.",
  },
  {
    id: 4,
    title: "Mercedes-AMG GT R",
    category: "Detailing",
    image: car4,
    description:
      "Корекція ЛКП з локальним спот-ремувалом дефектів, вирівнювання голограм та фінішне полірування.",
  },
  {
    id: 5,
    title: "Mercedes-AMG GT R",
    category: "Detailing",
    image: car5,
    description:
      "Комплекс салону: глибоке очищення, парогенератор, озонація, захист текстилю та шкіри.",
  },
  {
    id: 6,
    title: "Mercedes-AMG GT R",
    category: "Detailing",
    image: car6,
    description:
      "Повний цикл «Premium»: екстер’єр + інтер’єр + скло + диски + двигун, гарантійний догляд 30 днів.",
  },
];

const Modal = ({ open, onClose, item }) => {
  // закриття по Esc
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  // блокування скролу body та прослуховувач Esc
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onKeyDown]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portfolio-modal-title"
      onClick={onClose} // клік по оверлею закриває
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"></div>

{/* Вміст модалки */}
<div
  className="relative z-[101] mx-4 sm:mx-6 lg:mx-0 w-full max-w-5xl rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden
             animate-[fadeIn_200ms_ease-out] "
  onClick={(e) => e.stopPropagation()} // щоб не закривати при кліку всередині
>
  {/* Кнопка закриття */}
  <button
    onClick={onClose}
    aria-label="Close"
    className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </button>

  {/* Зображення з відступами */}
  <div className="mt-6 mx-6 rounded-xl overflow-hidden">
    <img
      src={item.image}
      alt={item.title}
      className="w-full h-auto object-cover"
    />
  </div>

  {/* Текстова частина */}
  <div className="p-6 sm:p-8">
    <p className="text-sm sm:text-base text-neutral-500">{item.category}</p>
    <h3 id="portfolio-modal-title" className="mt-1 text-2xl sm:text-3xl font-semibold text-black">
      {item.title}
    </h3>
    <p className="mt-4 text-base sm:text-lg text-neutral-700 leading-relaxed">
      {item.description}
    </p>
  </div>
</div>


      {/* Анімація (keyframes) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

const Portfolio = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section className="px-5 md:px-10 lg:px-20 py-10 lg:py-16">
      <div className="w-full mx-auto">
        {/* Заголовок */}
        <h2 className="text-[32px] sm:text-[40px] lg:text-[52px] font-extrabold text-black mb-10">
          Our Portfolio
        </h2>

        {/* Сітка карток: мобайл 1, таблет 2, ПК 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {portfolioItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelected(item)}
              className="cursor-pointer bg-white rounded-[28px] shadow-[0_8px_28px_rgba(0,0,0,0.08)] overflow-hidden 
                         transform transition lg:hover:scale-[1.02] active:scale-[0.995]"
            >
              <div className="p-2 lg:p-4">
                {/* Робимо зображення більшим на ПК */}
                <div className="aspect-[16/11] lg:aspect-[16/10] w-full overflow-hidden rounded-[22px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                <p className="text-sm lg:text-base text-neutral-500">{item.category}</p>
                <h3 className="font-semibold text-lg lg:text-2xl text-black mt-1">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Модалка */}
      <Modal open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </section>
  );
};

export default Portfolio;
