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

export type HomepageContent = {
  title: string;
  subtitle: string;
  about_us_block: AboutUsContent;
  hero_page_slider_section: HeroPageSliderSection;
  why_vortex_section: WhyVortexSection;
  why_vortex_showcase_section: WhyVortexSection;
  vortex_audience_section: VortexAudienceSection;
  client_testimonials_section: ClientTestimonialsSection;
};

export type VortexContent = {
  homepage: HomepageContent;
  stats: {
    totalClicks: number;
    formSubmissions: number;
  };
};
