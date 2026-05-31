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

export default function CleaningPage() {
  return (
    <div className="relative bg-[#F5F5F7]">
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
