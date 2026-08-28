import MainPageHeroContent from "../components/MainPageHeroContent";
import AboutUsComponent from "../components/AboutUsComponent";
import HeroPageSliderSection from "../components/HeroPageSliderSection";
import WhyVortexComponent from "../components/WhyVortexComponent";
import WhyVortexShowcaseComponent from "../components/WhyVortexShowcaseComponent";
import VortexAudienceComponent from "../components/VortexAudienceComponent";
import ClientTestimonialsComponent from "../components/ClientTestimonialsComponent";


function MainPage() {
  return (
      <>
          <MainPageHeroContent/>
          <AboutUsComponent/>
          <HeroPageSliderSection/>
          <WhyVortexComponent/>
          <WhyVortexShowcaseComponent/>
          <VortexAudienceComponent/>
          <ClientTestimonialsComponent/>
      </>
  );
}

export default MainPage;
