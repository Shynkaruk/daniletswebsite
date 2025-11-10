// components/AboutUsTeam.jsx
import React from "react";
import ArrowRight from "../../assets/icons/arrows/arrow_right_black.svg";
import NatalyPhoto from "../../assets/photo/team/1team.png";
import Elijah from "../../assets/photo/team/2team.png";
import Timothy from "../../assets/photo/team/3team.png";

const people = [
  {
    id: 1,
    name: "Nataly",
    surname: "Danilets",
    role: "Founder of Danilets Cleaning",
    bio: "Founder and heart of Danilets Cleaning. Nataly built this business from the ground up with unwavering faith, a tireless work ethic, and a promise to treat every team member and client with dignity. Her journey from earning $3.75 per hotel room to leading a thriving cleaning company embodies the American dream. She leads with love, serves with excellence, and ensures every client receives the care she wished for during her hardest days.",
    photo: NatalyPhoto,
    instagram: "#",
  },
  {
    id: 2,
    name: "Elijah",
    surname: "Danilets",
    role: "Co-Founder of Danilets Pickleball, Detailing & Media",
    bio: "Co-Founder of Danilets Detailing, focusing on marketing, strategy, and client experience. Elijah ensures every customer interaction reflects our family values and commitment to excellence. From brand development to customer relationships, he's dedicated to making sure every detail exceeds expectations and every client feels like family.",
    photo: Elijah,
    instagram: "#",
  },
  {
    id: 3,
    name: "Timothy",
    surname: "Danilets",
    role: "Co-Founder of Danilets Pickleball Detailing & Media",
    bio: "Co-Founder of Danilets Detailing. Timothy discovered detailing in 2020 and has since detailed over 1,500 vehicles. He oversees every aspect of the detailing process, ensuring efficiency, quality, and precision in every service. His commitment to operational excellence guarantees that every vehicle receives meticulous care and professional results.",
    photo: Timothy,
    instagram: "#",
  },
];

const AboutUsTeam = () => {
  return (
    <section className="mx-2 md:mx-12 bg-white rounded-[32px] shadow-sm">
      <div className="mx-2 w-full px-2 md:px-10 py-10 md:py-8">
        {/* Заголовок + опис */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-[#18181B] font-extrabold leading-tight text-[36px] sm:text-[44px] md:text-[60px]">
            About Us
          </h2>
          <p className="mt-4 text-[#5E5E61] font-medium text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed">
            Built on faith, resilience, and a promise to serve with
            excellence—Danilets brings together professional cleaning and
            precision detailing under one trusted family name. We treat every
            client like family, delivering not just exceptional results, but
            genuine care and reliability. Our commitment to integrity and
            attention to detail ensures excellence in every service, making us
            more than a service provider—we're your dedicated partners in
            creating spaces and vehicles you're proud of.
          </p>
        </div>

        {/* Картки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {people.map((p) => (
            <article
              key={p.id}
              className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-[0_8px_22px_rgba(0,0,0,0.06)] border border-[#ECECEC] flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Фото — тільки лице в крузі */}
                <div className="shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden">
                  <img
                    src={
                      p.photo || "data:image/gif;base64,R0lGODlhAQABAAAAACw="
                    }
                    alt={`${p.name} ${p.surname}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[#18181B] font-extrabold leading-tight text-[20px] md:text-[38px]">
                    {p.name}
                    <br className="hidden sm:block" /> {p.surname}
                  </h3>
                  <p className="text-[#5E5E61] text-[14px] md:text-[18px] mt-3">
                    {p.role}
                  </p>
                </div>
              </div>

              <p className="text-[#5E5E61] text-[14px] sm:text-[15px] md:text-[17px] leading-snug mb-6 flex-grow">
                {p.bio}
              </p>

              <a
                href={p.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between w-full rounded-[88px] px-5 py-3 text-[15px] md:text-[17px] font-semibold text-[#18181B] mt-auto"
                style={{
                  background:
                    "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                }}
              >
                <span>Instagram</span>
                <img src={ArrowRight} alt="" className="w-5 h-5 md:w-6 md:h-6" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsTeam;
