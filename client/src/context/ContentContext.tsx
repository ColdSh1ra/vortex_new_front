import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { VortexContent } from '../types/content';

const ContentContext = createContext<VortexContent | null>(null);

type ContentProviderProps = {
  children: ReactNode;
  content?: VortexContent | null;
};

export function ContentProvider({ children, content = null }: ContentProviderProps) {
  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useInitialContent() {
  return useContext(ContentContext);
}
