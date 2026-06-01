import React from 'react'
import Cleaning from './Cleaining'
import ServicesProvideCleaning from './ServicesProvideCleaning'
import WhyDaniletsCleaning from './WhyDaniletsCleaning'
import ContactSection from '../../ContactSection'
import OurReviews from '../../OurReviews'
import FAQ from '../../FAQ'
import Footer from '../../Footer'
import PortfolioCleaning from './PortfolioCleaning'
import LayoutContainer from '../../LayoutContainer'
import SEO from '../../SEO.jsx'
import { CleaningStructuredData } from '../../StructuredData.jsx'

export default function CleaningPage() {
  return (
    <div className="relative bg-[#F5F5F7]">
      <SEO
        title="Commercial & Residential Cleaning — Columbus, OH"
        description="Professional cleaning services in Columbus, Ohio. Residential, commercial, move-in/move-out, and deep cleaning. Eco-friendly products, flexible scheduling. Book online today."
        image="/Portfolio_Cleaning/Box 1/Main.webp"
        canonical="https://daniletscleaning.com"
      />
      <CleaningStructuredData />
      <Cleaning></Cleaning>
      <ServicesProvideCleaning></ServicesProvideCleaning>
      <WhyDaniletsCleaning></WhyDaniletsCleaning>
      <PortfolioCleaning></PortfolioCleaning>
      <ContactSection></ContactSection>
      <LayoutContainer>
              <OurReviews></OurReviews>
      </LayoutContainer>
      <LayoutContainer>
              <FAQ></FAQ>
      </LayoutContainer>
      <Footer></Footer>
    </div>
  )
}
