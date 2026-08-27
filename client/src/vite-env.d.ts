/// <reference types="vite/client" />

import type { VortexContent } from './types/content';

declare global {
  interface Window {
    __VORTEX_CONTENT__?: VortexContent;
  }
}

export {};
