import React, { useState } from "react";

const services = [
  {
    id: 1,
    title: "Dealerships",
    shortDescription:
      "Comprehensive detailing services for dealership inventory. Fast turnaround, consistent quality, volume pricing. Keep your lot looking showroom-ready.",
    detailedDescription: `
Professional detailing services designed specifically for automotive dealerships. We understand the importance of presentation in vehicle sales—first impressions matter.

Our team provides fast, efficient, and consistent detailing for your entire inventory, from trade-ins to premium vehicles.

Services include but are not limited to:
• Full exterior wash and wax  
• Interior cleaning and conditioning  
• Final inspection prep

Volume pricing available. We work with your schedule to ensure vehicles are ready when you need them.
    `,
  },
  {
    id: 2,
    title: "Fleets",
    shortDescription:
      "Professional fleet detailing for businesses. Maintain your company's image with clean, well-maintained vehicles. Scheduled service, competitive rates.",
    detailedDescription: `
Keep your company fleet looking professional with our specialized fleet detailing services.

Whether you have delivery vehicles, company cars, or commercial trucks, we provide consistent, reliable detailing that maintains your brand image on the road.

Services include:
• Exterior wash and protection  
• Interior cleaning and sanitization  
• Scheduled maintenance programs

We offer flexible scheduling and on-site service options. Your vehicles represent your business—let us help you make the right impression.
    `,
  },
  {
    id: 3,
    title: "Interior & Exterior Detailing",
    shortDescription:
      "Complete interior and exterior detailing for all vehicle types. Meticulous cleaning, conditioning, and protection. Transform your vehicle inside and out.",
    detailedDescription: `
Our comprehensive interior and exterior detailing service covers every aspect of your vehicle.

Exterior services include:
• Hand washing  
• Clay bar treatment  
• Paint correction  
• Trim restoration  
• Wax application  
• Wheel and tire cleaning  
• Glass polishing

Interior services include:
• Deep vacuuming  
• Seat and carpet shampooing  
• Leather conditioning  
• Thorough plastic cleaning and protection  
• Glass cleaning

We use professional-grade products and techniques to restore your vehicle to like-new condition. Perfect for personal vehicles, luxury cars, or any vehicle deserving premium care.
    `,
  },
  {
    id: 4,
    title: "Ceramic Coating",
    shortDescription:
      "Professional ceramic coating application with up to 5-year protection. Superior gloss, hydrophobic properties, and lasting paint protection.",
    detailedDescription: `
Protect your investment with professional ceramic coating application.

Our team applies premium Gtechniq ceramic coatings that create a durable, glass-like protective layer chemically bonded to your vehicle's paint.

Benefits include:
• Superior UV protection  
• Resistance to environmental contaminants  
• Enhanced gloss and depth  
• Hydrophobic water-beading properties  
• Easier maintenance

Complimentary add-on services include Exo, glass coating, and wheel coating. This is the ultimate protection for your vehicle's finish.
    `,
  },
  {
    id: 5,
    title: "Wrap / PPF (Paint Protection Film)",
    shortDescription:
      "Paint protection film and vehicle wrap services through our trusted partner. Protect your paint or transform your vehicle's appearance.",
    detailedDescription: `
Protect your vehicle's paint or completely transform its appearance with professional wrap and paint protection film (PPF) services.

Through our trusted partner network, we offer:
• Clear PPF for invisible protection against rock chips, scratches, and road debris  
• Full or partial vehicle wraps in any color or finish

Wraps offer unlimited customization options for personal style or business branding. Expert installation with warranty coverage.

Consultation available to determine the best solution for your needs.
    `,
  },
  {
    id: 6,
    title: "Other Services",
    shortDescription:
      "Additional detailing services: Glass Coating, Wheel Coating, Headlight Restoration, Trim Restoration, Decal and Sticker Removal, Window Tinting.",
    detailedDescription: `
We offer a comprehensive range of additional detailing services to meet all your vehicle care needs:

Glass Coating:
Ultra-hydrophobic barrier applied to glass that causes rainwater to bead and roll off instantly. Dramatically improves visibility during storms and makes glass easier to clean.

Wheel Coating:
Durable protection specifically formulated for wheels that repels brake dust and road grime. Creates a heat-resistant barrier that prevents corrosion and makes wheels significantly easier to maintain.

Headlight Restoration:
Removes yellowing, oxidation, and haziness from headlight lenses. Restores clarity, improves nighttime visibility, and enhances vehicle appearance. Includes protective coating.

Trim Restoration:
Revives faded and discolored exterior plastic and rubber trim to a rich, like-new appearance. Penetrates surfaces to restore color depth while providing UV protection against future fading.

Decal and Sticker Removal:
Professional removal of unwanted decals, stickers, and adhesive residue from vehicle surfaces. Safe techniques that protect your paint while completely eliminating stubborn graphics and markings.

Window Tinting:
Professional tint installation for UV protection, heat reduction, privacy, and enhanced appearance. Multiple shade options available.

Contact us for specific needs—if it involves your vehicle, we can help.
    `,
  },
];

const ServicesProvide = () => {
  const [activeService, setActiveService] = useState(null);

  const openModal = (service) => setActiveService(service);
  const closeModal = () => setActiveService(null);

  return (
    <section className="relative w-[95%] max-w-[1792px] mx-auto bg-white rounded-[32px] py-10 px-4 md:px-10 shadow-md">
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-black">
          Services We<br></br> Provide
        </h2>
      </div>

      {/* Картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col bg-[#F5F5F5] rounded-[24px] p-5 md:p-6 min-h-[220px] hover:shadow-lg transition-transform duration-200 hover:scale-[1.01]"
          >
            <h3
              className="text-[20px] md:text-[22px] font-bold text-black mb-3"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {service.title}
            </h3>
            <p
              className="text-[14px] md:text-[15px] text-[#4B4B4F] mb-6 flex-1"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {service.shortDescription}
            </p>

            <button
              onClick={() => openModal(service)}
              className="flex items-center justify-between w-full h-[44px] md:h-[48px] rounded-[999px] text-[14px] md:text-[15px] px-5 font-semibold mt-auto"
              style={{
                background:
                  "linear-gradient(107.27deg, #8B3434 -27.97%, #A84E4E -12.13%, #F29292 22.69%, #FF9E9E 45.99%, #E17B7B 77.51%)",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              Learn More
              <span className="text-lg">↗</span>
            </button>
          </div>
        ))}
      </div>

      {/* Модальне вікно */}
      {activeService && (
        <div
          className="fixed top-[100px] left-0 right-0 bottom-0 z-[999] flex items-start justify-center bg-black/60 px-4 pt-4 md:pt-6"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[24px] max-w-[720px] w-full max-h-[80vh] overflow-y-auto p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#71717A] hover:text-black text-xl"
            >
              ✕
            </button>

            <h3
              className="text-[22px] md:text-[26px] font-bold mb-4 text-black"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {activeService.title}
            </h3>

            <p
              className="text-[14px] md:text-[15px] text-[#3F3F46] whitespace-pre-line leading-relaxed"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {activeService.detailedDescription}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-full border border-[#D4D4D8] text-sm md:text-[15px] hover:bg-[#F4F4F5] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesProvide;
