export type PageSkeletonVariant = 'light' | 'dark' | 'blog';

const bar = (className: string, key?: number) => <span key={key} className={`page-skeleton-bone ${className}`} />;

function LightLayout() {
  return (
    <>
      <div className="page-skeleton-crumbs">{bar('page-skeleton-crumb')}{bar('page-skeleton-crumb page-skeleton-crumb-current')}</div>
      <div className="page-skeleton-hero">
        <div className="page-skeleton-copy">
          {bar('page-skeleton-eyebrow')}
          {bar('page-skeleton-title')}
          {bar('page-skeleton-title page-skeleton-title-short')}
          {bar('page-skeleton-line')}
          {bar('page-skeleton-line')}
          {bar('page-skeleton-line page-skeleton-line-short')}
          {bar('page-skeleton-pill')}
        </div>
        <div className="page-skeleton-bone page-skeleton-media">
          <img src="/imgs/sm-dark-blue-logo.svg" alt="" width="56" height="56" />
        </div>
      </div>
      <div className="page-skeleton-cards">{[0, 1, 2].map((index) => bar('page-skeleton-card', index))}</div>
    </>
  );
}

function DarkLayout() {
  return (
    <div className="page-skeleton-panel">
      {bar('page-skeleton-title page-skeleton-title-accent')}
      {bar('page-skeleton-title')}
      {bar('page-skeleton-title page-skeleton-title-short')}
      <div className="page-skeleton-gap" />
      {bar('page-skeleton-line')}
      {bar('page-skeleton-line')}
      {bar('page-skeleton-line page-skeleton-line-short')}
      {bar('page-skeleton-pill')}
    </div>
  );
}

function BlogLayout() {
  return (
    <>
      <div className="page-skeleton-crumbs">{bar('page-skeleton-crumb')}{bar('page-skeleton-crumb page-skeleton-crumb-current')}</div>
      {bar('page-skeleton-title page-skeleton-blog-title')}
      <div className="page-skeleton-posts">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div className="page-skeleton-post" key={index}>
            {bar('page-skeleton-post-cover')}
            {bar('page-skeleton-line page-skeleton-line-short')}
            {bar('page-skeleton-line')}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Shown while a page's content or route styles are still loading. Bones mirror the
 * real page layout and shimmer; a thin gold bar at the top shows progress. The whole
 * placeholder fades in after a short delay, so fast loads never flash it.
 */
export default function PageSkeleton({ variant = 'light', label }: { variant?: PageSkeletonVariant; label: string }) {
  return (
    <div className={`page-skeleton page-skeleton-${variant}`} role="status" aria-busy="true">
      <span className="page-skeleton-label">{label}</span>
      <span className="page-skeleton-progress" aria-hidden="true" />
      <div className="page-skeleton-inner" aria-hidden="true">
        {variant === 'dark' ? <DarkLayout /> : variant === 'blog' ? <BlogLayout /> : <LightLayout />}
      </div>
    </div>
  );
}
