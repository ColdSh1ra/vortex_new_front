import type { HomepageContent, VortexContent } from '../types/content';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export type RequestedProduct = 'vortex' | 'tecdoc';

export type TrialRequestLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type TrialRequestPayload = {
  requested_product: RequestedProduct;
  name: string;
  phone: string;
  total_sum: number;
  recaptcha_token: string;
  location: TrialRequestLocation | null;
};

export async function getContent(): Promise<VortexContent> {
  const response = await fetch(`${API_BASE_URL}/content`);

  if (!response.ok) {
    throw new Error('Failed to fetch content from API');
  }

  return response.json() as Promise<VortexContent>;
}

export async function getHomepageContent<Key extends keyof HomepageContent>(
  key: Key
): Promise<HomepageContent[Key]> {
  const content = await getContent();

  return content.homepage[key];
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

  const result = await response.json().catch(() => null) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(result?.message || 'Не вдалося відправити заявку. Спробуйте ще раз.');
  }
}
