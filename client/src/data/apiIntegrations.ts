import type { Language } from '../types/content';
import ua from '../locales/integrations/ua.json';
import cz from '../locales/integrations/cz.json';
import sk from '../locales/integrations/sk.json';
import en from '../locales/integrations/en.json';
import pl from '../locales/integrations/pl.json';

const screenshots = '/imgs/api-integrations/screenshots/';

type ApiIntegrationDefinition = {
  slug: string;
  imageSrc: string;
  images: string[];
  sectionImageIndexes?: (number | null)[];
};

export const API_INTEGRATIONS: ApiIntegrationDefinition[] = [
  { slug: 'tecdoc', imageSrc: '/imgs/api-integrations/tecdoc-int-logo.svg', images: ['tecdoc-VIN.jpg', 'tecdoc-parts-categories.png', 'tecdoc-screenshot-2.jpg', 'tecdoc-parts.png'].map(file => screenshots + file) },
  { slug: 'checkbox', imageSrc: '/imgs/api-integrations/checkbox-int-logo.svg', images: ['checkbox_screenshot_paydesk.png', 'checkbox_screenshot_shop.png'].map(file => screenshots + file) },
  { slug: 'vchasno', imageSrc: '/imgs/api-integrations/vchasno-kasa-logo.svg', images: ['vchasno-kasa-flow.svg', 'vchasno-kasa-settings.svg'].map(file => screenshots + file) },
  { slug: 'nova_poshta', imageSrc: '/imgs/api-integrations/np-int-logo.svg', images: ['novaposhta_screenshot_sender.png', 'np_step1.png', 'np_step_2.png', 'np_step_3.png', 'np_step_4.png'].map(file => screenshots + file), sectionImageIndexes: [0, 1, null] },
  { slug: 'turboSMS', imageSrc: '/imgs/api-integrations/turbosms-int-logo.svg', images: ['turbosms_screenshot_blured.jpg', 'turbosms_screenshot_send_message_blured.jpg'].map(file => screenshots + file) },
  { slug: 'bank_API', imageSrc: '/imgs/api-integrations/banks-api-int-logo.svg', images: ['bankapi_screenshot-400h.png', 'bankapi_history.png'].map(file => screenshots + file) },
  { slug: 'binotel', imageSrc: '/imgs/api-integrations/binotel-int-logo.svg', images: ['binotel_call_history.png', 'binotel_call.png'].map(file => screenshots + file) },
];

export type IntegrationPageCopy = {
  title: string;
  lead: string;
  sections: { title: string; paragraphs: string[]; items: string[] }[];
  links: { label: string; href: string }[];
};

export type IntegrationLocaleCopy = {
  label: string;
  eyebrow: string;
  connect: string;
  viewFeatures: string;
  featuresTitle: string;
  linksTitle: string;
  back: string;
  relatedTitle: string;
  pages: Record<string, IntegrationPageCopy>;
};

const copy: Record<Language, IntegrationLocaleCopy> = { ua, cz, sk, en, pl };
export const getIntegrationCopy = (language: Language) => copy[language];
export const getApiIntegration = (slug: string | undefined) => API_INTEGRATIONS.find(integration => integration.slug === slug);
