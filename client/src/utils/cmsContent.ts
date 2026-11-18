import type { VortexContent } from '../types/content';
import type { CmsMenuItem } from '../types/cmsContent';
export function isCmsTargetVisible(content: VortexContent | null | undefined, target: string) {
    const pathname = target.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (pathname === '/tecdoc-license')
        return content?.tecdoc?.visible !== false;
    if (pathname === '/privacy-policy')
        return content?.privacy_policy?.visible !== false;
    if (pathname.startsWith('/integrations/') && content?.integration_pages) {
        const slug = pathname.slice('/integrations/'.length);
        return content.integration_pages.visible !== false && !!content.integration_pages.pages[slug] && content.integration_pages.pages[slug].visible !== false;
    }
    return true;
}
export function visibleCmsMenu(content: VortexContent | null | undefined, items: CmsMenuItem[]): CmsMenuItem[] {
    return items.flatMap(item => {
        if (item.children) {
            const children = item.children.filter(child => !!child.target && isCmsTargetVisible(content, child.target));
            return children.length ? [{ ...item, children }] : [];
        }
        return item.target && isCmsTargetVisible(content, item.target) ? [item] : [];
    });
}
export function formatCmsPrice(price: number, currency: string, language: string) {
    try {
        return new Intl.NumberFormat(language === 'ua' ? 'uk' : language === 'cz' ? 'cs' : language, { style: 'currency', currency, maximumFractionDigits: 2 }).format(price);
    }
    catch {
        return `${price} ${currency}`;
    }
}
