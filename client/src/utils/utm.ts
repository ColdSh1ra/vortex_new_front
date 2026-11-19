import type { UtmParams } from '../services/api';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const STORAGE_KEY = 'vortex-utm';
const MAX_LENGTH = 100;

function readFromUrl(search: string): UtmParams {
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value.slice(0, MAX_LENGTH);
  }
  return utm;
}

function readStored(): UtmParams {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    const utm: UtmParams = {};
    for (const key of UTM_KEYS) {
      if (typeof stored[key] === 'string' && stored[key]) utm[key] = stored[key].slice(0, MAX_LENGTH);
    }
    return utm;
  } catch {
    return {};
  }
}

/**
 * Remembers the campaign the visitor arrived with for this browser session, so
 * the request form still knows it after they navigate to another page.
 * Call it once on load; a new campaign link replaces the stored one.
 */
export function captureUtm(): void {
  if (typeof window === 'undefined') return;
  const fromUrl = readFromUrl(window.location.search);
  if (Object.keys(fromUrl).length === 0) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
  } catch {
    // Storage can be blocked; the current URL is still read by getUtm().
  }
}

/** UTM params of the current URL, or of the campaign link that opened this session. */
export function getUtm(): UtmParams | undefined {
  if (typeof window === 'undefined') return undefined;
  const fromUrl = readFromUrl(window.location.search);
  const utm = Object.keys(fromUrl).length ? fromUrl : readStored();
  return Object.keys(utm).length ? utm : undefined;
}
