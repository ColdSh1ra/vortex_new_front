/// <reference types="vite/client" />

import type { VortexContent } from './types/content';

declare global {
  interface Window {
    __VORTEX_CONTENT__?: VortexContent;
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
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
