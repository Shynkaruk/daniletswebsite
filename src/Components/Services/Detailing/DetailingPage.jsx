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

const DetailingPage = () => {
  return (
    <div className="relative">
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
