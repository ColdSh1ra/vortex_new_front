function isPageVisible(content, pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/privacy-policy') return content.privacy_policy?.visible !== false;
  if (path === '/tecdoc-license') return content.tecdoc?.visible !== false;
  const slug = path.match(/^\/integrations\/([^/]+)$/)?.[1];
  if (slug && content.integration_pages !== undefined) return content.integration_pages.visible !== false
    && !!content.integration_pages.pages?.[slug] && content.integration_pages.pages[slug].visible !== false;
  return true;
}
function publicPaths(content, staticPaths) {
  const paths = new Set(staticPaths.filter(path => !path.startsWith('/integrations/') || content.integration_pages === undefined));
  if (content.integration_pages) for (const slug of Object.keys(content.integration_pages.pages || {})) {
    if (/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(slug)) paths.add(`/integrations/${slug}`);
  }
  return [...paths].filter(path => isPageVisible(content, path));
}
module.exports = { isPageVisible, publicPaths };
