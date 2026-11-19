import {useI18n} from '../context/ContentContext';
import { useState } from "react";
import MainPageHeroContent from "../components/MainPageHeroContent";
import AboutUsComponent from "../components/AboutUsComponent";
import HeroPageSliderSection from "../components/HeroPageSliderSection";
import WhyVortexComponent from "../components/WhyVortexComponent";
import VortexAudienceComponent from "../components/VortexAudienceComponent";
import ClientTestimonialsComponent from "../components/ClientTestimonialsComponent";
import IntegrationsNetworkComponent from "../components/integrations/IntegrationsNetworkComponent";
import IntegrationsCatalogComponent from "../components/integrations/IntegrationsCatalogComponent";
import VortexSyncComponent from "../components/integrations/VortexSyncComponent";
import CarServiceOverviewComponent from "../components/CarServiceOverviewComponent";
import WebsiteDevelopmentComponent from "../components/WebsiteDevelopmentComponent";
import PricingCalculatorComponent, { type PricingCalculatorChoice } from "../components/PricingCalculatorComponent";
import VortexPlansComponent from "../components/VortexPlansComponent";
import TrialRequestComponent from "../components/TrialRequestComponent";


function MainPage() {
  const [calculatorChoice, setCalculatorChoice] = useState<PricingCalculatorChoice | null>(null);
  const {content}=useI18n();
  const home=content?.homepage;

  return (
      <>
          <MainPageHeroContent/>
          {home?.about_us_block?.visible !== false && <AboutUsComponent/>}
          {home?.hero_page_slider_section?.visible !== false && <HeroPageSliderSection/>}
          {home?.why_vortex_section?.visible !== false && <WhyVortexComponent/>}
          <div className="audience-testimonials-group">
              {home?.vortex_audience_section?.visible !== false && <VortexAudienceComponent/>}
              {home?.client_testimonials_section?.visible !== false && <ClientTestimonialsComponent/>}
          </div>
          {home?.suppliers_section?.visible !== false && <IntegrationsNetworkComponent/>}
          {home?.integrations_catalog_section?.visible !== false && <IntegrationsCatalogComponent/>}
          {home?.sync_section?.visible !== false && <VortexSyncComponent/>}
          {home?.car_service_section?.visible !== false && <CarServiceOverviewComponent/>}
          {home?.website_development_section?.visible !== false && <WebsiteDevelopmentComponent/>}
          <VortexPlansComponent/>
          {content?.settings.pricing_calculator.visible !== false && <PricingCalculatorComponent onSelectionChange={setCalculatorChoice}/>}
          <TrialRequestComponent totalSum={calculatorChoice?.total ?? 0} calculator={calculatorChoice?.selection} requestedProduct="vortex"/>
      </>
  );
}

export default MainPage;
