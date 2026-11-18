import type { HTMLAttributes } from 'react';
import { useStickyHeading } from '../../utils/useStickyHeading';

export default function StickyHeading({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { headingRef, sentinelRef, stuck } = useStickyHeading();
  return (
    <>
      <span className="sticky-heading-sentinel" ref={sentinelRef} aria-hidden="true" />
      <h2 {...props} ref={headingRef} data-stuck={stuck ? 'true' : undefined}>{children}</h2>
    </>
  );
}
