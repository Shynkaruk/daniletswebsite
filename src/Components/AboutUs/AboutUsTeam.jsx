// components/AboutUsTeam.jsx
import React from "react";
import ArrowRight from "../../assets/icons/arrows/arrow_right_black.svg"; // стрілка у кнопці
import NatalyPhoto from "../../assets/photo/team/1team.png";
import Elijah from "../../assets/photo/team/2team.png";
import Timothy from "../../assets/photo/team/3team.png";

const people = [
  {
    id: 1,
    name: "Nataly",
    surname: "Danilets",
    role: "Founder of Danilets Cleaning",
    bio: "With over 10 years in the cleaning industry, Nataly Danilets brings expertise and passion to every cleaning project. Her attention to detail and commitment to customer satisfaction ensures your space receives exceptional care that exceeds expectations.",
    photo: NatalyPhoto, // <-- підстав своє фото
    instagram: "#",
  },
  {
    id: 2,
    name: "Elijah",
    surname: "Danilets",
    role: "Co-Founder of Danilets Pickleball, Detailing & Media",
    bio: "As a multi-talented professional, Elijah leads our pickleball programs, captures moments through photography, and co-founded Danilets Detailing. His diverse expertise allows him to bring creativity and precision to every service we offer.",
    photo: Elijah, // <-- підстав своє фото
    instagram: "#",
  },
  {
    id: 3,
    name: "Timothy",
    surname: "Danilets",
    role: "Co-Founder of Danilets Pickleball Detailing & Media",
    bio: "Timothy brings exceptional attention to detail to every project. His eye for perfection, whether detailing vehicles or creating media content, ensures clients receive outstanding results that go beyond expectations.",
    photo: Timothy, // <-- підстав своє фото
    instagram: "#",
  },
];

const AboutUsTeam = () => {
  return (
    <section className="mx-2 md:mx-12 bg-white rounded-[32px] shadow-sm">
      <div className="mx-2 w-full px-2 md:px-10 py-10 md:py-8">
        {/* Заголовок + опис */}
        <div className="mb-8 md:mb-12">
          <h2
            className="text-[#18181B] font-extrabold leading-tight 
                         text-[36px] sm:text-[44px] md:text-[60px]"
          >
            About Us
          </h2>
          <p
            className="mt-4 text-[#5E5E61] font-medium
                        text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed"
          >
            We’re proud to be pioneers in blending expert Cleaning, Precision
            Detailing, Creative Media, and Pro Pickleball services under one
            trusted name. At Danilets, we treat every client like family —
            delivering not just high-quality results, but genuine care and
            reliability. Our integrated approach ensures excellence in every
            detail, making us more than a service provider — we’re your
            dedicated partners in lifestyle, comfort, and performance.
          </p>
        </div>

        {/* Картки (desktop: 3 в ряд, mobile: стекаються) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {people.map((p) => (
            <article
              key={p.id}
              className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8
             shadow-[0_8px_22px_rgba(0,0,0,0.06)] border border-[#ECECEC]
             flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Фото */}
                <div className="shrink-0">
                  <img
                    src={
                      p.photo || "data:image/gif;base64,R0lGODlhAQABAAAAACw="
                    }
                    alt={`${p.name} ${p.surname}`}
                    className="w-16 h-16 md:w-42 md:h-42 rounded-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    className="text-[#18181B] font-extrabold leading-tight
                     text-[20px] md:text-[38px]"
                  >
                    {p.name}
                    <br className="hidden sm:block" /> {p.surname}
                  </h3>
                  <p className="text-[#5E5E61] text-[14px] md:text-[18px] mt-3">
                    {p.role}
                  </p>
                </div>
              </div>

              {/* Текст займає вільне місце, щоб кнопки вирівнялись по низу */}
              <p className="text-[#5E5E61] text-[14px] sm:text-[15px] md:text-[17px] leading-snug mb-6 flex-grow">
                {p.bio}
              </p>

              {/* CTA */}
              <a
                href={p.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between w-full
               rounded-[88px] px-5 py-3 text-[15px] md:text-[17px] font-semibold text-[#18181B] mt-auto"
                style={{
                  background:
                    "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                }}
              >
                <span>Instagram</span>
                <img
                  src={ArrowRight}
                  alt=""
                  className="w-5 h-5 md:w-6 md:h-6"
                />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsTeam;
