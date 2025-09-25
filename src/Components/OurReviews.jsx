import React, { useState, useRef, useEffect } from 'react';
import avatarIcon from '../assets/icons/avatar-icon.png'; 
import RightArrowIcon from '../assets/icons/angle-right-icon.png';
import LeftArrowIcon from '../assets/icons/angle-left-icon.png';

const OurReviews = () => {
  const reviews = [
    {
      id: 1,
      serviceType: 'Cleaning',
      name: 'Sarah Johnson',
      review: 'The cleaning service was exceptional! My house has never looked so spotless. The team was professional and thorough.',
    },
    {
      id: 2,
      serviceType: 'Cleaning',
      name: 'Michael Brown',
      review: 'I’m amazed at how clean my office is after their service. They paid attention to every detail. Highly recommend!',
    },
    {
      id: 3,
      serviceType: 'Cleaning',
      name: 'Emma Wilson',
      review: 'Outstanding cleaning! My apartment feels brand new, and the team was very polite and efficient.',
    },
    {
      id: 4,
      serviceType: 'Cleaning',
      name: 'Liam Carter',
      review: 'Fantastic cleaning service! They transformed my home, and I couldn’t be happier with the results.',
    },
    {
      id: 5,
      serviceType: 'Detailing',
      name: 'Emily Davis',
      review: 'My car looks brand new after their detailing service. The interior and exterior are flawless. Amazing job!',
    },
    {
      id: 6,
      serviceType: 'Detailing',
      name: 'James Wilson',
      review: 'Fantastic detailing work! My vehicle shines like never before. The team was punctual and professional.',
    },
    {
      id: 7,
      serviceType: 'Detailing',
      name: 'Robert Taylor',
      review: 'Best detailing service I’ve ever used! My car looks showroom-ready, and the service was top-notch.',
    },
    {
      id: 8,
      serviceType: 'Detailing',
      name: 'Sophia Harris',
      review: 'Incredible detailing! My car looks amazing, and the team was so thorough and professional.',
    },
    {
      id: 9,
      serviceType: 'Media',
      name: 'Olivia Smith',
      review: 'Their media production captured our event perfectly. The photos and videos are stunning. Highly recommend!',
    },
    {
      id: 10,
      serviceType: 'Media',
      name: 'David Miller',
      review: 'Incredible media service! The visuals they created for our project were breathtaking. Truly talented team.',
    },
    {
      id: 11,
      serviceType: 'Media',
      name: 'Sophie Harris',
      review: 'The media team did an amazing job with our wedding photos. Every moment was captured beautifully!',
    },
    {
      id: 12,
      serviceType: 'Media',
      name: 'Ethan Clark',
      review: 'Amazing media production! The quality of their work is unmatched, and they exceeded our expectations.',
    },
    {
      id: 13,
      serviceType: 'Pickleball',
      name: 'Laura Taylor',
      review: 'The pickleball coaching was fantastic! I improved my skills significantly, and it was so much fun.',
    },
    {
      id: 14,
      serviceType: 'Pickleball',
      name: 'Mark Lewis',
      review: 'Great pickleball program! The coaches were knowledgeable, and I had a blast learning new techniques.',
    },
    {
      id: 15,
      serviceType: 'Pickleball',
      name: 'Anna Clark',
      review: 'Loved the pickleball sessions! They were well-organized, and I saw huge improvements in my game.',
    },
    {
      id: 16,
      serviceType: 'Pickleball',
      name: 'Noah Adams',
      review: 'The pickleball training was excellent! The coaches were supportive, and I had a great time improving my skills.',
    },
  ];

  const [selectedService, setSelectedService] = useState('Cleaning');
  const filteredReviews = reviews.filter((review) => review.serviceType === selectedService);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCards = 4;

  const handlePrev = () => {
    setStartIndex((prevIndex) =>
      prevIndex === 0 ? filteredReviews.length - visibleCards : prevIndex - 1
    );
  };

  const handleNext = () => {
    setStartIndex((prevIndex) =>
      prevIndex + visibleCards >= filteredReviews.length ? 0 : prevIndex + 1
    );
  };

  const visibleItems = filteredReviews.slice(startIndex, startIndex + visibleCards);

  // Додаємо рефи для кнопок
  const buttonRefs = useRef({});
  const [activePosition, setActivePosition] = useState({ left: 0, width: 0 });

  // Оновлюємо позицію фону при зміні активного типу послуги
  useEffect(() => {
    const activeButton = buttonRefs.current[selectedService];
    if (activeButton) {
      const { offsetLeft, offsetWidth } = activeButton;
      setActivePosition({ left: offsetLeft, width: offsetWidth });
    }
  }, [selectedService]);

  return (
    <div className="w-[100%] max-w-[2100px] mx-auto py-12">
      {/* Заголовок і перемикачі типу послуги */}
      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 mb-8 px-4 md:px-16">
        <h2 className="text-4xl md:text-5xl font-bold text-black ml-2">Our Reviews</h2>
        <div className="relative w-full md:w-[660px] h-[76px] bg-white rounded-[174px] p-2 overflow-x-auto md:overflow-x-hidden overflow-y-hidden scrollbar-hide">
          {/* Фон активного типу послуги */}
          <div
            className="absolute h-[60px] bg-[rgba(242,242,242,1)] rounded-[88px] transition-all duration-300 ease-in-out z-0"
            style={{
              left: `${activePosition.left}px`,
              width: `${activePosition.width}px`,
            }}
          />
          <div className="flex space-x-[10px] z-10 min-w-max">
            {['Cleaning', 'Detailing', 'Media', 'Pickleball'].map((service) => (
              <button
                key={service}
                ref={(el) => (buttonRefs.current[service] = el)}
                onClick={() => {
                  setSelectedService(service);
                  setStartIndex(0);
                }}
                className="text-[18px] font-bold leading-[38px] tracking-[0%] text-[#18181B] py-[14px] px-10 rounded-[88px] transition z-10"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Картки */}
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 px-4 md:px-12">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col w-full md:w-[436px] h-[410px] bg-white rounded-[32px] p-6"
          >
            {/* Аватар та ім'я */}
            <div className="flex items-center mb-4">
              <img
                src={avatarIcon}
                alt="Avatar"
                className="w-[100px] h-[100px] rounded-[100px] mr-3"
              />
              <div className="flex flex-col">
                <h3
                  className="text-[24px] font-bold leading-[38px] tracking-[0%] text-[#18181B]"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {item.name}
                </h3>
              </div>
            </div>
            {/* Відгук */}
            <p
              className="text-[18px] font-normal leading-[100%] tracking-[0%] text-[#52525B]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {item.review}
            </p>
          </div>
        ))}
      </div>

      {/* Стрілочні перемикачі */}
      <div className="flex justify-start mt-4 px-4 md:px-16">
        <div className="flex space-x-[8px]">
          <button
            onClick={handlePrev}
            className="w-[68px] h-[52px] rounded-[88px] bg-white flex items-center justify-center py-4 px-6"
          >
            <img src={LeftArrowIcon} alt="Arrow Left" className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-[68px] h-[52px] rounded-[88px] bg-white flex items-center justify-center py-4 px-6"
          >
            <img src={RightArrowIcon} alt="Arrow Right" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OurReviews;