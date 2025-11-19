import React from 'react'
import Cleaning from './Cleaining'
import ServicesProvideCleaning from './ServicesProvideCleaning'
import WhyDaniletsCleaning from './WhyDaniletsCleaning'
import ContactSection from '../../ContactSection'
import OurReviews from '../../OurReviews'
import FAQ from '../../FAQ'
import Footer from '../../Footer'

export default function CleaningPage() {
  return (
    <div className="relative bg-[#F5F5F7] w-[min(1600px,100%)]">
      <Cleaning></Cleaning>
      <ServicesProvideCleaning></ServicesProvideCleaning>
      <WhyDaniletsCleaning></WhyDaniletsCleaning>
      <ContactSection></ContactSection>
      <OurReviews></OurReviews>
      <FAQ></FAQ>
      <Footer></Footer>
    </div>
  )
}
