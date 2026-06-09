import type { VortexContent } from '../types/content';

const API_BASE_URL = 'http://localhost:5001/api';

export async function getContent(): Promise<VortexContent> {
  const response = await fetch(`${API_BASE_URL}/content`);

  if (!response.ok) {
    throw new Error('Failed to fetch content from API');
  }

  return response.json() as Promise<VortexContent>;
}
