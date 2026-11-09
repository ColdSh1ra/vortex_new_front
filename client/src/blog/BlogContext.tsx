import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { blogRoute } from './types';
import type { BlogResource } from './types';
const Context = createContext<{ resource: BlogResource | null; loading: boolean; retry: () => void } | null>(null);
export function BlogProvider({ children, initialData = null }: { children: ReactNode; initialData?: BlogResource | null }) {
  const location = useLocation();
  const route = blogRoute(location.pathname + location.search);
  const key = route?.key;
  const [resource, setResource] = useState(initialData);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!key || (attempt === 0 && resource?.key === key)) return;
    let active = true;
    const controller = new AbortController();
    void import('./loadBlogRoute').then(({ loadBlogRoute }) => loadBlogRoute(location.pathname + location.search, {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
      demoEnabled: import.meta.env.VITE_BLOG_DEMO_MODE !== 'false', signal: controller.signal,
    })).then(result => { if (active) setResource(result); }).catch(() => {
      if (active) setResource({ key, status: 'error', mode: 'live' });
    });
    return () => { active = false; controller.abort(); };
  }, [key, attempt]);
  return <Context.Provider value={{ resource: resource?.key === key ? resource : null, loading: !!key && resource?.key !== key, retry: () => { setResource(null); setAttempt(n => n + 1); } }}>{children}</Context.Provider>;
}
export function useBlog() {
  const context = useContext(Context);
  if (!context) throw new Error('useBlog requires BlogProvider');
  return context;
}
