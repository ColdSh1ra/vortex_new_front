import { Link } from 'react-router-dom';
import { useI18n } from '../context/ContentContext';
import { useBlog } from '../blog/BlogContext';
import { blogText } from '../blog/copy';
import { blogUrl, formatBlogDate } from '../blog/urls';
import BlogStatus from '../blog/BlogStatus';

export default function BlogPage() {
  const { language, t } = useI18n();
  const { resource, loading } = useBlog();
  if (loading || !resource || resource.status !== 'ready' || !resource.list) return <BlogStatus />;
  const { data, pagination } = resource.list;
  const pages = [...new Set([1, pagination.page - 1, pagination.page, pagination.page + 1, pagination.totalPages])].filter(page => page > 0 && page <= pagination.totalPages).sort((a, b) => a - b);
  return <div className="blog-page">
    <nav className="blog-breadcrumbs" aria-label={t('common.breadcrumbs')}><ol><li><Link to="/">{t('common.home')}</Link></li><li aria-hidden="true">/</li><li aria-current="page">{blogText(language, 'nav.blog')}</li></ol></nav>
    <header className="blog-intro"><p className="blog-eyebrow">Vortex / {blogText(language, 'nav.blog')}</p><h1>{blogText(language, 'title')}</h1><p>{blogText(language, 'intro')}</p></header>
    {resource.mode === 'demo' && <p className="blog-demo-note">{blogText(language, 'demo')} — {blogText(language, 'demoNote')}</p>}
    {!data.length ? <p className="blog-empty">{blogText(language, 'empty')}</p> : <div className="blog-grid">{data.map((post, index) => {
      const copy = post.translations[language];
      return <article className="blog-card" key={post.id}>
        <Link className="blog-card-image" to={blogUrl(language, post.slug)} tabIndex={-1} aria-hidden="true"><img src={post.cover.url} alt={post.cover.alt[language]} width={post.cover.width} height={post.cover.height} loading={index < 4 ? 'eager' : 'lazy'} /></Link>
        <div className="blog-card-copy"><time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, language)}</time><h2><Link to={blogUrl(language, post.slug)}>{copy.title}</Link></h2><p>{copy.excerpt}</p><Link className="blog-card-view" to={blogUrl(language, post.slug)} aria-label={`${blogText(language, 'view')}: ${copy.title}`}>{blogText(language, 'view')}<span aria-hidden="true">→</span></Link></div>
      </article>;
    })}</div>}
    {pagination.totalPages > 1 && <nav className="blog-pagination" aria-label={blogText(language, 'pagination')}>
      {pagination.page > 1 && <Link rel="prev" to={blogUrl(language, undefined, pagination.page - 1)}>← <span>{blogText(language, 'previous')}</span></Link>}
      {pages.map((page, index) => <span className="blog-pagination-item" key={page}>{index > 0 && page - pages[index - 1] > 1 && <span className="blog-pagination-dots" aria-hidden="true">…</span>}<Link to={blogUrl(language, undefined, page)} aria-current={page === pagination.page ? 'page' : undefined} aria-label={blogText(language, 'page', { page })}>{page}</Link></span>)}
      {pagination.page < pagination.totalPages && <Link rel="next" to={blogUrl(language, undefined, pagination.page + 1)}><span>{blogText(language, 'next')}</span> →</Link>}
    </nav>}
  </div>;
}
