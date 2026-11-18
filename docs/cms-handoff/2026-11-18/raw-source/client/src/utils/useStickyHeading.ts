import { useEffect, useRef, useState } from 'react';

type Entry = { sentinel: HTMLElement; setStuck: (value: boolean) => void; stuck: boolean };
const headings = new Map<HTMLElement, Entry>();
let frame: number | undefined;
let resizeObserver: ResizeObserver | undefined;

function measure() {
  frame = undefined;
  for (const [heading, entry] of headings) {
    const style = getComputedStyle(heading);
    const top = Number.parseFloat(style.top);
    const rect = heading.getBoundingClientRect();
    const stuck = style.position === 'sticky' && Number.isFinite(top)
      && entry.sentinel.getBoundingClientRect().top < top - 0.5
      && Math.abs(rect.top - top) <= 1.5 && rect.height > 0;
    if (stuck !== entry.stuck) {
      entry.stuck = stuck;
      entry.setStuck(stuck);
    }
  }
}

function schedule() {
  if (frame === undefined && headings.size) frame = window.requestAnimationFrame(measure);
}

/** A sentinel records the natural position; the heading rect confirms actual pinning. */
export function useStickyHeading() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const heading = headingRef.current;
    const sentinel = sentinelRef.current;
    if (!heading || !sentinel) return;
    const first = headings.size === 0;
    headings.set(heading, { sentinel, setStuck, stuck: false });
    if (first) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      window.addEventListener('vortex:header-layout', schedule);
      resizeObserver = new ResizeObserver(schedule);
    }
    resizeObserver?.observe(heading);
    if (heading.parentElement) resizeObserver?.observe(heading.parentElement);
    void document.fonts?.ready.then(schedule);
    schedule();

    return () => {
      headings.delete(heading);
      resizeObserver?.unobserve(heading);
      if (heading.parentElement) resizeObserver?.unobserve(heading.parentElement);
      if (!headings.size) {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        window.removeEventListener('vortex:header-layout', schedule);
        resizeObserver?.disconnect();
        resizeObserver = undefined;
        if (frame !== undefined) window.cancelAnimationFrame(frame);
        frame = undefined;
      }
    };
  }, []);

  return { headingRef, sentinelRef, stuck };
}
