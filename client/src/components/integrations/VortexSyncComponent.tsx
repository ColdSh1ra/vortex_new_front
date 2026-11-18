import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useI18n } from '../../context/ContentContext';
import { SYNC_ROUTES, SYNC_VIEWBOX } from './syncRoutes';
import type { SyncPoint } from './syncRoutes';

// Separate outbound and return roads avoid head-on traffic. Two spaced dots
// share each road; negative delays make both directions busy from the first frame.
const TRANSFERS = SYNC_ROUTES.flatMap((route, routeIndex) => {
  const reverse = route.direction === 'to-left';
  const points = reverse ? [...route.points].reverse() : route.points;
  const duration = (12 + routeIndex * .7) / 1.3;
  return [0, 1].map((itemIndex) => ({
    id: `${route.id}-${itemIndex}`,
    routeId: route.id,
    direction: route.direction,
    points,
    duration,
    delay: -((routeIndex * 1.75 + itemIndex * duration / 2 + 1.3) % duration),
    restingDistance: `${30 + (routeIndex % 3) * 16}%`,
    reducedVisible: itemIndex === 0,
  }));
});

function pixelPath(points: readonly SyncPoint[], width: number, height: number) {
  return points.map((point, index) => {
    const x = (point.x * width / SYNC_VIEWBOX.width).toFixed(3);
    const y = (point.y * height / SYNC_VIEWBOX.height).toFixed(3);
    if (index === 0) return `M ${x} ${y}`;
    return point.x === points[index - 1].x ? `V ${y}` : `H ${x}`;
  }).join(' ');
}

function VortexSyncComponent() {
  const { t } = useI18n();
  const visualRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    resizeObserver.observe(visual);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
    }, { rootMargin: '100px' });
    visibilityObserver.observe(visual);
    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  // SVG trails and CSS motion paths use the same *pixel* geometry. This keeps
  // their heads aligned even when the responsive panel changes aspect ratio.
  const transfers = useMemo(() => TRANSFERS.map((transfer) => ({
    ...transfer,
    path: pixelPath(transfer.points, size.width, size.height),
  })), [size.width, size.height]);

  const transferStyle = (transfer: typeof transfers[number]): CSSProperties => ({
    '--sync-duration': `${transfer.duration}s`,
    '--sync-delay': `${transfer.delay}s`,
    '--sync-route': `path("${transfer.path}")`,
    '--sync-rest-distance': transfer.restingDistance,
  } as CSSProperties);

  return (
    <section className="section-container vortex-sync-section">
      <div className="vortex-sync-grid">
        <article className="vortex-sync-copy">
          <h2>{t('sync.title')}</h2>
          <div className="vortex-sync-description">
            {['first', 'second', 'third', 'fourth'].map((key) => <p key={key}>{t(`sync.${key}`)}</p>)}
          </div>
        </article>

        <div
          className="vortex-sync-visual"
          ref={visualRef}
          role="img"
          aria-label={t('sync.alt')}
          data-active={active}
          data-ready={size.width > 0 && size.height > 0}
        >
          <div className="vortex-sync-client vortex-sync-client-left">
            <img src="/imgs/3dicons_premium/3dicons-boy-right-premium.png" alt="" width="148" height="148" />
            <span>{t('sync.client', { number: 1 })}</span>
          </div>

          <div className="vortex-sync-exchange" aria-hidden="true">
            <strong>{t('sync.title')}</strong>
            <svg className="vortex-sync-trails" viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} preserveAspectRatio="none" fill="none">
              {SYNC_ROUTES.map((route) => (
                <path
                  key={route.id}
                  className={`vortex-sync-road vortex-sync-road-${route.direction}`}
                  d={pixelPath(route.points, size.width, size.height)}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {transfers.map((transfer) => (
                <path
                  key={transfer.id}
                  className={`vortex-sync-trail vortex-sync-trail-${transfer.direction}`}
                  d={transfer.path}
                  pathLength="1000"
                  vectorEffect="non-scaling-stroke"
                  style={transferStyle(transfer)}
                />
              ))}
            </svg>
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className={`vortex-sync-dot vortex-sync-dot-${transfer.direction}`}
                data-route={transfer.routeId}
                data-reduced-visible={transfer.reducedVisible}
                style={transferStyle(transfer)}
              />
            ))}
          </div>

          <div className="vortex-sync-client vortex-sync-client-right">
            <img src="/imgs/3dicons_premium/3dicons-boy-left-premium.png" alt="" width="148" height="148" />
            <span>{t('sync.client', { number: 2 })}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VortexSyncComponent;
