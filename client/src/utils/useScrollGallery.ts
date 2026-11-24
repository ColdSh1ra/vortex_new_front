import { useCallback, useEffect, useRef, useState } from 'react';

/** Scroll-snap gallery driven by SliderControls: tracks the ends and scrolls one card at a time. */
export function useScrollGallery<T extends HTMLElement = HTMLDivElement>(gap = 8) {
  const ref = useRef<T>(null);
  const [position, setPosition] = useState({ atStart: true, atEnd: false });

  const update = useCallback(() => {
    const gallery = ref.current;
    if (!gallery) return;
    setPosition({
      atStart: gallery.scrollLeft <= 2,
      atEnd: gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    const gallery = ref.current;
    if (!gallery) return;
    const observer = new ResizeObserver(update);
    observer.observe(gallery);
    update();
    return () => observer.disconnect();
  }, [update]);

  const scroll = (direction: number) => {
    const gallery = ref.current;
    const firstCard = gallery?.firstElementChild;
    if (gallery && firstCard) {
      gallery.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior: 'smooth' });
    }
  };

  return { ref, position, scroll, onScroll: update };
}
