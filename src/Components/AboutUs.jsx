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
import SEO from './SEO.jsx'

const AboutUs = () => {
      useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, []);

  return (
    <div className="relative">
      <SEO
        title="About Us — Danilets Family"
        description="Meet the Danilets family — a Columbus, Ohio immigrant family that built a trusted auto detailing and cleaning business from the ground up since 2013. Our story, team, and values."
        image="/Top_of_Page/4.webp"
      />
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
