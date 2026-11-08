import type { ContentCatalog, Language } from '../types/content';
import type { WebsitePackage } from '../data/websitePlans';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export type RequestedProduct = 'vortex' | 'tecdoc';

export type TrialRequestLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type TrialRequestPayload = {
  source_page: 'home' | 'contact' | 'car-service' | 'websites' | 'auto-dismantling' | 'tecdoc-license';
  website_package?: WebsitePackage;
  language: Language;
  requested_product: RequestedProduct;
  name: string;
  phone: string;
  total_sum: number;
  recaptcha_token: string;
  location: TrialRequestLocation | null;
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
