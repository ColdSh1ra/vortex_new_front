import Link from '../components/default/LocalizedLink';
import { useI18n } from '../context/ContentContext';
import { useBlog } from './BlogContext';
import { blogText } from './copy';
import { blogUrl } from './urls';
export default function BlogStatus() {
  const { language, t, content } = useI18n();
  const text=(key:string,values:Record<string,string|number>={})=>blogText(language,key,values,content);
  const { resource, loading, retry } = useBlog();
  return <div className="blog-page"><nav className="blog-breadcrumbs" aria-label={t('common.breadcrumbs')}><ol><li><Link to="/">{t('common.home')}</Link></li><li aria-hidden="true">/</li><li><Link to={blogUrl(language)}>{text('nav.blog')}</Link></li></ol></nav>
    <div className="blog-status" role={loading ? 'status' : undefined}>
      <h1>{text(loading ? 'loading' : resource?.status === 'not-found' ? 'missing' : 'error')}</h1>
      {resource?.status === 'error' && <button type="button" onClick={retry}>{text('retry')}</button>}
      {!loading && <Link to={blogUrl(language)}>{text('back')} →</Link>}
    </div>
  </div>;
}
