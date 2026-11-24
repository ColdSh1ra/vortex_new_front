import { useI18n } from '../../context/ContentContext';

/** Previous/next buttons shared by every slider: one look and one place (right-aligned, above the slides). */
export default function SliderControls({ onPrevious, onNext, previousDisabled = false, nextDisabled = false, controls }: {
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  /** id of the scrolling element, for aria-controls */
  controls?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="slider-controls">
      <button type="button" onClick={onPrevious} disabled={previousDisabled} aria-label={t('common.previous')} aria-controls={controls}>
        <SliderArrow previous />
      </button>
      <button type="button" onClick={onNext} disabled={nextDisabled} aria-label={t('common.next')} aria-controls={controls}>
        <SliderArrow />
      </button>
    </div>
  );
}

function SliderArrow({ previous = false }: { previous?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={previous ? 'M15 19 8 12l7-7' : 'm9 19 7-7-7-7'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
