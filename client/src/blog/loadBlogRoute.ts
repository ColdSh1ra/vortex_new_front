import { BlogApiError, parseBlogArticle, parseBlogPreviewArticle, parseBlogList, requestBlog } from './api';
import { BLOG_PAGE_SIZE, BLOG_SLUG, blogRoute } from './types';
import type { BlogArticle, BlogResource } from './types';
import { demoList, demoSummaries } from './demo';
import { DEMO_BLOG_ARTICLE } from '../pages/BlogArticlePage';
import { LANGUAGES } from '../types/content';

export async function loadBlogRoute(url: string, options: { apiBaseUrl?: string; demoEnabled: boolean; signal?: AbortSignal; previewArticle?: unknown; previewForbidden?: boolean; checkRedirects?: boolean }): Promise<BlogResource | null> {
  const route = blogRoute(url);
  if (!route) return null;
  const missing: BlogResource = { key: route.key, status: 'not-found', mode: route.previewId ? 'preview' : 'live' };
  if(route.previewId){
    if(options.previewForbidden)return {...missing,status:'error'};
    if(options.previewArticle===null)return missing;
    try {
      const body=options.previewArticle !== undefined ? {data:options.previewArticle} : await requestBlog('preview/'+encodeURIComponent(route.previewId),options.apiBaseUrl ?? '/api',options.signal) as {data:unknown};
      return {key:route.key,status:'ready',mode:'preview',article:parseBlogPreviewArticle(body.data)};
    } catch(error) {
      if(options.signal?.aborted)throw error;
      return {...missing,status:error instanceof BlogApiError&&error.status===404?'not-found':'error'};
    }
  }
  if (route.page === 0 || (route.slug !== null && !BLOG_SLUG.test(route.slug))) return missing;
  try {
    if (!options.apiBaseUrl) throw new BlogApiError(503, 'BLOG_API_NOT_CONFIGURED');
    if (route.slug !== null) {
      const response = await requestBlog(`posts/${encodeURIComponent(route.slug)}`, options.apiBaseUrl, options.signal) as { data: unknown };
      const article = parseBlogArticle(response.data);
      if (article.slug !== route.slug) throw new BlogApiError(502, 'BLOG_INVALID_RESPONSE');
      return { key: route.key, status: 'ready', mode: 'live', article };
    }
    const list = parseBlogList(await requestBlog(`posts?page=${route.page}&limit=${BLOG_PAGE_SIZE}`, options.apiBaseUrl, options.signal));
    if (list.pagination.page !== route.page) throw new BlogApiError(502, 'BLOG_INVALID_RESPONSE');
    if (route.page! > Math.max(1, list.pagination.totalPages)) return missing;
    return { key: route.key, status: 'ready', mode: 'live', list };
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (error instanceof BlogApiError && error.status === 404) {
      if(route.slug && options.checkRedirects !== false && options.apiBaseUrl) {
        try {
          const body=await requestBlog('redirects/'+encodeURIComponent(route.slug),options.apiBaseUrl,options.signal) as {data?:{from?:unknown;to?:unknown}};
          if(body?.data?.from !== route.slug || typeof body.data.to!=='string' || !BLOG_SLUG.test(body.data.to) || body.data.to===route.slug)throw new BlogApiError(502,'BLOG_INVALID_RESPONSE');
          return {...missing,redirect:body.data.to};
        } catch(redirectError) {
          if(options.signal?.aborted)throw redirectError;
          if(!(redirectError instanceof BlogApiError && redirectError.status===404))return {...missing,status:'error'};
        }
      }
      return missing;
    }
    if (!(options.demoEnabled && error instanceof BlogApiError && error.code === 'BLOG_API_NOT_CONFIGURED')) return { key: route.key, status: 'error', mode: 'live' };
    if (route.slug !== null) {
      const summary = demoSummaries().find(item => item.slug === route.slug);
      if (!summary) return { ...missing, mode: 'demo' };
      if (route.slug === DEMO_BLOG_ARTICLE.slug) return { key: route.key, status: 'ready', mode: 'demo', article: DEMO_BLOG_ARTICLE };
      const article: BlogArticle = { ...summary, translations: Object.fromEntries(LANGUAGES.map(language => [language, { ...summary.translations[language], sections: DEMO_BLOG_ARTICLE.translations[language].sections }])) as BlogArticle['translations'] };
      return { key: route.key, status: 'ready', mode: 'demo', article };
    }
    const list = demoList(route.page!);
    if (route.page! > list.pagination.totalPages) return { ...missing, mode: 'demo' };
    return { key: route.key, status: 'ready', mode: 'demo', list };
  }
}
