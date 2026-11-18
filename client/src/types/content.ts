import type { CmsSupplementaryContent } from './cmsContent';
export type AboutUsContent = {
  visible?: boolean;
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
  visible?: boolean;
  section_title: string;
  slide_image_paths: string[];
}

export type WhyVortexCard = {
  title: string;
  description: string;
  image_src: string;
};

export type WhyVortexSection = {
  visible?: boolean;
  section_title: string;
  section_description: string;
  cards: WhyVortexCard[];
};

export type VortexAudienceCard = {
  title: string;
  description: string;
  cta_text: string;
  cta_target?: string;
  image_src: string;
};

export type VortexAudienceSection = {
  visible?: boolean;
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
  visible?: boolean;
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
  partner_links?: { label: string; href: string }[];
};

export type IntegrationsCatalogSection = {
  visible?: boolean;
  section_title: string;
  section_description: string;
  cards: IntegrationCatalogCard[];
};

export type CarServiceSection = {
  visible?: boolean;
  heading: string;
  description: string;
  car_service_features: string[];
  paragraphs?: string[]; link_text?: string; link_target?: string; image?: string; image_alt?: string;
};

export type WebsiteDevelopmentBenefitGroup = {
  items: string[];
  image_src: string;
  note?: string;
};

export type WebsiteDevelopmentSection = {
  visible?: boolean;
  heading: string;
  gift_message: string;
  description_paragraphs: string[];
  website_image_src: string;
  website_image_alt?: string;
  cta_target?: string;
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
  visible?: boolean;
  currency: string;
  base_monthly_price: number;
  increment: number;
  default_manager_count: number;
  default_store_count: number;
  integrations: PricingIntegrationSetting[];
  included_features: string[];
};

export type VortexPricingPlan = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  currency: string;
  billing_period: 'monthly' | 'yearly' | 'one_time';
  features: string[];
  cta_text: string;
  cta_target: string;
  highlighted?: boolean;
};

export type VortexPricingSection = {
  billing_labels?: {monthly: string; yearly: string; one_time: string};
  visible: boolean;
  section_title: string;
  section_description: string;
  plans: VortexPricingPlan[];
};

export type HomepageContent = {
  title: string;
  subtitle: string;
  hero?: {cta_text: string; cta_target: string; image: string; image_alt: string; screenshots: {image: string; alt: string}[]};
  suppliers_section?: {visible: boolean; title: string; description: string; image: string; image_alt: string; suppliers: {id: string; name: string; logo: string; logo_alt: string}[]};
  sync_section?: {visible: boolean; title: string; paragraphs: string[]; client_label: string; image: string; image_alt: string};
  about_us_block: AboutUsContent;
  hero_page_slider_section: HeroPageSliderSection;
  why_vortex_section: WhyVortexSection;
  vortex_audience_section: VortexAudienceSection;
  client_testimonials_section: ClientTestimonialsSection;
  integrations_catalog_section: IntegrationsCatalogSection;
  car_service_section: CarServiceSection;
  website_development_section: WebsiteDevelopmentSection;
  vortex_pricing_section?: VortexPricingSection;
};

export type FaqDataItem = {
  topic: string;
  answer: string;
};

export type ContactWorker = {
  contact_topic: string;
  full_name: string;
  role: string;
  phone: string;
  photo_path: string;
  messenger_links: {
    telegram?: string;
    viber?: string;
    whatsapp?: string;
    email?: string;
  };
};

export type ContactsContent = {
  visible?: boolean;
  title: string;
  subtitle: string;
  workers: ContactWorker[];
};

export type VortexContent = CmsSupplementaryContent & {
  ui: Record<string, string>;
  car_service: CarServicePageContent;
  homepage: HomepageContent;
  FAQ: FaqDataItem[];
  videos: FaqDataItem[];
  contacts: ContactsContent;
  settings: {
    pricing_calculator: PricingCalculatorSettings;
  };
  stats: {
    totalClicks: number;
    formSubmissions: number;
  };
};

export type CarServicePageContent = {
  visible?: boolean;
  title: string;
  subtitle: string;
  blocks: {
    id: string;
    title: string;
    image_src: string;
    image_alt: string;
    paragraphs: string[];
    list_intro?: string;
    items?: string[];
    closing_paragraphs?: string[];
    documents?: { label: string; href: string | null }[];
    note?: string;
  }[];
};

export const LANGUAGES = ['ua', 'cz', 'sk', 'en', 'pl'] as const;
export type Language = typeof LANGUAGES[number];
export type ContentCatalog = Record<Language, VortexContent>;
