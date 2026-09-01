export type AboutUsContent = {
  about_us_title: string;
  about_us_subtitle: string;
  about_us_blocks: AboutUsBlock[];
};

export type AboutUsBlock = {
  about_us_title: string;
  about_us_description: string;
  about_us_image_path: string;
};

export type HeroPageSliderSection = {
  section_title: string;
  slide_image_paths: string[];
}

export type WhyVortexCard = {
  title: string;
  description: string;
  image_src: string;
};

export type WhyVortexSection = {
  section_title: string;
  section_description: string;
  cards: WhyVortexCard[];
};

export type VortexAudienceCard = {
  title: string;
  description: string;
  cta_text: string;
  image_src: string;
};

export type VortexAudienceSection = {
  section_title: string;
  cards: VortexAudienceCard[];
};

export type ClientTestimonial = {
  company_name: string;
  company_type: string;
  image_src: string;
  pros: string[];
  cons: string[];
  quote: string;
  link_text: string;
  link_href: string;
};

export type ClientTestimonialsSection = {
  section_title: string;
  pros_title: string;
  cons_title: string;
  reviews: ClientTestimonial[];
};

export type IntegrationCatalogCard = {
  title: string;
  image_src: string;
  features: string[];
  link_text: string;
  link_href: string;
};

export type IntegrationsCatalogSection = {
  section_title: string;
  section_description: string;
  cards: IntegrationCatalogCard[];
};

export type CarServiceSection = {
  heading: string;
  description: string;
  car_service_features: string[];
};

export type WebsiteDevelopmentBenefitGroup = {
  items: string[];
  image_src: string;
  note?: string;
};

export type WebsiteDevelopmentSection = {
  heading: string;
  gift_message: string;
  description_paragraphs: string[];
  website_image_src: string;
  benefit_groups: WebsiteDevelopmentBenefitGroup[];
  upgrade_message: string;
  cta_text: string;
};

export type PricingIntegrationSetting = {
  id: string;
  label: string;
  price: number;
  billing_period: 'monthly' | 'one_time';
  selected_by_default: boolean;
};

export type PricingCalculatorSettings = {
  currency: string;
  base_monthly_price: number;
  increment: number;
  default_manager_count: number;
  default_store_count: number;
  integrations: PricingIntegrationSetting[];
  included_features: string[];
};

export type HomepageContent = {
  title: string;
  subtitle: string;
  about_us_block: AboutUsContent;
  hero_page_slider_section: HeroPageSliderSection;
  why_vortex_section: WhyVortexSection;
  why_vortex_showcase_section: WhyVortexSection;
  vortex_audience_section: VortexAudienceSection;
  client_testimonials_section: ClientTestimonialsSection;
  integrations_catalog_section: IntegrationsCatalogSection;
  car_service_section: CarServiceSection;
  website_development_section: WebsiteDevelopmentSection;
};

export type VortexContent = {
  homepage: HomepageContent;
  settings: {
    pricing_calculator: PricingCalculatorSettings;
  };
  stats: {
    totalClicks: number;
    formSubmissions: number;
  };
};
