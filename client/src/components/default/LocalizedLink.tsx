import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { useI18n } from '../../context/ContentContext';
import { localizedUrl } from '../../seo/urls';

/** Render real crawlable links while retaining the selected language. */
const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocalizedLink({ to, ...props }, ref) {
  const { language } = useI18n();
  const destination = typeof to === 'string' ? localizedUrl(to, language)
    : to.pathname ? localizedUrl(`${to.pathname}${to.search ?? ''}${to.hash ?? ''}`, language) : to;
  return <RouterLink {...props} to={destination} ref={ref} />;
});

export default LocalizedLink;
