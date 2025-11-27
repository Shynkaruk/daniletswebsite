import MainAboutUs from './AboutUs/MainAboutUs'
import OurTrackRecord from './AboutUs/OurTrackRecord'
import PickleballWhySection from './AboutUs/PickleballWhySection'
import AboutUsTeam from './AboutUs/AboutUsTeam'
import OurCoreValues from './OurCoreValues'
import OurReviewsStrip from './AboutUs/OurReviewsStrip'
import ContactSection from './ContactSection'
import FAQ from './FAQ'
import Footer from './Footer'
import { useEffect } from 'react'

const AboutUs = () => {
      useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, []);

  return (
    <div className="relative">
      <MainAboutUs />
      <div className="-mt-30 relative z-10">
        <OurTrackRecord />
      </div>
      <PickleballWhySection></PickleballWhySection>
      <AboutUsTeam></AboutUsTeam>
      <div className='mt-10 md:mx-3'>
        <OurCoreValues></OurCoreValues>
      </div>
        <ContactSection></ContactSection>
        <FAQ></FAQ>
        <Footer></Footer>
    </div>
  )
}

export default AboutUs
