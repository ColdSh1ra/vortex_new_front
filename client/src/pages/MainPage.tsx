import MainPageHeroContent from "../components/MainPageHeroContent";
import AboutUsComponent from "../components/AboutUsComponent";
import HeroPageSliderSection from "../components/HeroPageSliderSection";
import WhyVortexComponent from "../components/WhyVortexComponent";
import WhyVortexShowcaseComponent from "../components/WhyVortexShowcaseComponent";
import VortexAudienceComponent from "../components/VortexAudienceComponent";
import ClientTestimonialsComponent from "../components/ClientTestimonialsComponent";
import IntegrationsNetworkComponent from "../components/integrations/IntegrationsNetworkComponent";
import IntegrationsCatalogComponent from "../components/integrations/IntegrationsCatalogComponent";
import VortexSyncComponent from "../components/integrations/VortexSyncComponent";
import CarServiceOverviewComponent from "../components/CarServiceOverviewComponent";


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
          <IntegrationsNetworkComponent/>
          <IntegrationsCatalogComponent/>
          <VortexSyncComponent/>
          <CarServiceOverviewComponent/>
      </>
  );
}

export default MainPage;
