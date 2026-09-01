import { useState } from "react";
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
import WebsiteDevelopmentComponent from "../components/WebsiteDevelopmentComponent";
import PricingCalculatorComponent from "../components/PricingCalculatorComponent";
import TrialRequestComponent from "../components/TrialRequestComponent";


function MainPage() {
  const [totalSum, setTotalSum] = useState(0);

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
          <WebsiteDevelopmentComponent/>
          <PricingCalculatorComponent onTotalChange={setTotalSum}/>
          <TrialRequestComponent totalSum={totalSum} requestedProduct="vortex"/>
      </>
  );
}

export default MainPage;
