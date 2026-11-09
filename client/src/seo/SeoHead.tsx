import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../context/ContentContext';
import { useBlog } from '../blog/BlogContext';
import { buildPageSeo, seoElements } from './metadata';
export default function SeoHead() {
  const location = useLocation();
  const { language } = useI18n();
  const { resource } = useBlog();
  useEffect(() => {
    const seo = buildPageSeo(location.pathname + location.search, language, resource);
    document.head.querySelectorAll('[data-vortex-seo], title').forEach(node => node.remove());
    for (const item of seoElements(seo)) {
      const node = document.createElement(item.tag);
      node.setAttribute('data-vortex-seo', 'true');
      for (const [key, value] of Object.entries(item.attributes)) node.setAttribute(key, value);
      if (item.text) node.textContent = item.text;
      document.head.appendChild(node);
    }
  }, [location.pathname, location.search, language, resource]);
  return null;
}
