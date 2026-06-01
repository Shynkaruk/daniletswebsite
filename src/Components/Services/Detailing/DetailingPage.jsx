import React from 'react'
import Detailing from "./Detailing";
import ServicesProvide from './ServicesProvide';
import OurPortfolioDetailing from './OurPortfolioDetailing'
import WhyDanilets from './WhyDanilets'
import Portfolio from './Portfolio';
import ContactSection from '../../ContactSection';
import OurReviews from '../../OurReviews';
import FAQ from '../../FAQ'
import Footer from '../../Footer'
import SEO from '../../SEO.jsx'
import { DetailingStructuredData } from '../../StructuredData.jsx'

const DetailingPage = () => {
  return (
    <div className="relative">
      <SEO
        title="Premium Auto Detailing — Columbus, OH"
        description="Professional auto detailing in Columbus, Ohio. Mobile detailing, ceramic coating, paint protection, interior & exterior detailing for personal and fleet vehicles. Book online."
        image="/Top_of_Page/2.webp"
        canonical="https://daniletsdetailing.com"
      />
      <DetailingStructuredData />
      <Detailing />
      <div className="relative z-10 md:-mt-25 -mt-20">
        <ServicesProvide />
      </div>
      <OurPortfolioDetailing/>
      <WhyDanilets></WhyDanilets>
      <Portfolio></Portfolio>
      <ContactSection></ContactSection>
      <OurReviews></OurReviews>
      <FAQ></FAQ>
      <Footer></Footer>
    </div>
  );
};


export default DetailingPage;
