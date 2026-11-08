/// <reference types="vite/client" />

import type { ContentCatalog, Language } from './types/content';

declare global {
  interface Window {
    __VORTEX_CONTENT__?: ContentCatalog;
    __VORTEX_LANGUAGE__?: Language;
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          hl?: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
        },
      ) => number;
      reset: (widgetId: number) => void;
    };
  }

  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_RECAPTCHA_SITE_KEY?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
