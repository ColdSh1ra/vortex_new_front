import type { ContentCatalog, Language } from '../types/content';
import type { WebsitePackage } from '../data/websitePlans';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export type RequestedProduct = 'vortex' | 'tecdoc';

/** What the visitor picked in the pricing calculator. The server reprices it from CMS data. */
export type CalculatorSelection = {
  manager_count: number;
  store_count: number;
  integrations: string[];
};

export type UtmParams = Partial<Record<
  'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content',
  string
>>;

export type TrialRequestPayload = {
  source_page: 'home' | 'contact' | 'car-service' | 'websites' | 'auto-dismantling' | 'tecdoc-license';
  website_package?: WebsitePackage;
  language: Language;
  requested_product: RequestedProduct;
  name: string;
  phone: string;
  total_sum: number;
  recaptcha_token: string;
  calculator?: CalculatorSelection;
  utm?: UtmParams;
  page_path: string;
  /** Time since the form was shown; very fast submissions are dropped as bots. */
  elapsed_ms: number;
  /** Honeypot: hidden from people, so any value means a bot filled it. */
  company_site: string;
};

export async function getContent(): Promise<ContentCatalog> {
  const response = await fetch(`${API_BASE_URL}/content`);

  if (!response.ok) {
    throw new Error('Failed to fetch content from API');
  }

  return response.json() as Promise<ContentCatalog>;
}

export async function submitTrialRequest(payload: TrialRequestPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/trial-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = new Error('trial_request_failed');
    Object.assign(error, { status: response.status });
    throw error;
  }
}
