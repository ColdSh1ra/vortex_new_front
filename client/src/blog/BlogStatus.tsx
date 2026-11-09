import { Link } from 'react-router-dom';
import { useI18n } from '../context/ContentContext';
import { useBlog } from './BlogContext';
import { blogText } from './copy';
import { blogUrl } from './urls';
export default function BlogStatus() {
  const { language, t } = useI18n();
  const { resource, loading, retry } = useBlog();
  return <div className="blog-page"><nav className="blog-breadcrumbs" aria-label={t('common.breadcrumbs')}><ol><li><Link to="/">{t('common.home')}</Link></li><li aria-hidden="true">/</li><li><Link to={blogUrl(language)}>{blogText(language, 'nav.blog')}</Link></li></ol></nav>
    <div className="blog-status" role={loading ? 'status' : undefined}>
      <h1>{blogText(language, loading ? 'loading' : resource?.status === 'not-found' ? 'missing' : 'error')}</h1>
      {resource?.status === 'error' && <button type="button" onClick={retry}>{blogText(language, 'retry')}</button>}
      {!loading && <Link to={blogUrl(language)}>{blogText(language, 'back')} →</Link>}
    </div>
  </div>;
}
