import { useEffect, useState } from 'react';

export type ActiveSectionHeading = Readonly<{ id: string; text: string }>;
type HeadingState = { scope: string; heading: ActiveSectionHeading | null };

function activationOffset() {
  const header = document.querySelector<HTMLElement>('header.header');
  const compact = header?.querySelector<HTMLElement>('.header-compact-trigger');
  if (header && compact) {
    // offsetHeight is unaffected by the compact button's reveal transform.
    // Hovering the expanded navigation must not change the section threshold.
    return Math.max(0, header.getBoundingClientRect().top) + compact.offsetHeight + 12;
  }
  return 76;
}

/** The latest marked heading above the compact navigation's lower edge.
 * resetKey scopes the result to the current route/language, including the first
 * render after navigation. Headings remain in normal document flow.
 */
export function useActiveSectionHeading(resetKey: string) {
  const [state, setState] = useState<HeadingState>({ scope: resetKey, heading: null });

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    let frame: number | undefined;
    let disposed = false;
    let headings: HTMLHeadingElement[] = [];

    const commit = (heading: ActiveSectionHeading | null) => {
      setState(previous => previous.scope === resetKey
        && previous.heading?.id === heading?.id && previous.heading?.text === heading?.text
        ? previous : { scope: resetKey, heading });
    };
    const measure = () => {
      frame = undefined;
      if (disposed) return;
      if (window.scrollY <= 1) {
        commit(null);
        return;
      }
      const offset = activationOffset();
      let candidate: ActiveSectionHeading | null = null;
      for (const [index, heading] of headings.entries()) {
        const rect = heading.getBoundingClientRect();
        if (!heading.isConnected || rect.width <= 0 || rect.height <= 0 || rect.top > offset) continue;
        const style = getComputedStyle(heading);
        if (style.visibility === 'hidden' || style.visibility === 'collapse') continue;
        const text = (heading.dataset.headerTitle ?? heading.getAttribute('aria-label') ?? heading.textContent ?? '')
          .replace(/\s+/g, ' ').trim();
        if (text) candidate = { id: heading.id || `header-heading-${index}`, text };
      }
      commit(candidate);
    };
    const schedule = () => {
      if (!disposed && frame === undefined) frame = window.requestAnimationFrame(measure);
    };
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    const refresh = () => {
      resizeObserver?.disconnect();
      headings = Array.from(main.querySelectorAll<HTMLHeadingElement>('[data-header-heading]'));
      resizeObserver?.observe(main);
      for (const heading of headings) resizeObserver?.observe(heading);
      schedule();
    };
    const mutationObserver = new MutationObserver(refresh);
    mutationObserver.observe(main, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-header-heading', 'data-header-title', 'aria-label', 'hidden', 'class', 'style'],
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('vortex:header-layout', schedule);
    void document.fonts?.ready.then(schedule);
    refresh();

    return () => {
      disposed = true;
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('vortex:header-layout', schedule);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [resetKey]);

  return state.scope === resetKey ? state.heading : null;
}
