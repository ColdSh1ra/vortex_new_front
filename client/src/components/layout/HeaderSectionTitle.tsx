import { useEffect, useRef, useState } from 'react';
import type { ActiveSectionHeading } from '../../utils/useActiveSectionHeading';

export default function HeaderSectionTitle({ heading, onWidthChange }: {
  heading: ActiveSectionHeading | null;
  onWidthChange: (width: number) => void;
}) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [titles, setTitles] = useState({ current: heading, leaving: null as ActiveSectionHeading | null, revision: 0 });

  useEffect(() => {
    setTitles(previous => previous.current?.id === heading?.id && previous.current?.text === heading?.text
      ? previous : { current: heading, leaving: previous.current, revision: previous.revision + 1 });
    const timer = window.setTimeout(() => setTitles(previous => ({ ...previous, leaving: null })), 200);
    return () => window.clearTimeout(timer);
  }, [heading?.id, heading?.text]);

  useEffect(() => {
    const element = measureRef.current;
    if (!element) return;
    const measure = () => onWidthChange(Math.ceil(element.getBoundingClientRect().width));
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [onWidthChange]);

  return (
    <>
      <span className="header-title-measure" ref={measureRef} aria-hidden="true">{heading?.text}</span>
      <span className="header-compact-title-slot" aria-hidden="true">
        {titles.current && <span key={`current-${titles.revision}`} className="header-section-title header-section-title-current">{titles.current.text}</span>}
        {titles.leaving && <span key={`leaving-${titles.revision}`} className="header-section-title header-section-title-leaving">{titles.leaving.text}</span>}
      </span>
    </>
  );
}
