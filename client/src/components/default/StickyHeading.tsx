import { useId } from 'react';
import type { HTMLAttributes } from 'react';

/** A normal section heading whose text can be shown in the compact navigation. */
export default function StickyHeading({ children, id, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const generatedId = useId();
  return <h2 {...props} id={id ?? `section-heading-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`} data-header-heading>{children}</h2>;
}
