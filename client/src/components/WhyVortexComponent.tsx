import { useI18n } from '../context/ContentContext';
import { useState } from 'react';
import { useInitialContent } from '../context/ContentContext';

function WhyVortexComponent() {
  const { t } = useI18n();
  const content = useInitialContent()?.homepage.why_vortex_section ?? null;
  const [currentSlide, setCurrentSlide] = useState(0);

  const previousSlide = () => {
    setCurrentSlide((slide) => Math.max(slide - 1, 0));
  };

  const nextSlide = () => {
    if (!content) {
      return;
    }

    setCurrentSlide((slide) => Math.min(slide + 1, content.cards.length - 1));
  };

  return (
    <section className="section-container why-vortex-section">
      <div className="radial-bg-container" aria-hidden="true" />
      {content && (
        <div className="why-vortex-wrapper">
          <header className="why-vortex-header">
            <h2>{content.section_title}</h2>
            <p>{content.section_description}</p>
          </header>

          <div className="why-vortex-controls">
            <button
              type="button"
              onClick={previousSlide}
              disabled={currentSlide === 0}
              aria-label={t('common.previous')}
            >
              <img src="/icons/slider_scroll_right.svg" alt="" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              disabled={currentSlide === content.cards.length - 1}
              aria-label={t('common.next')}
            >
              <img src="/icons/slider_scroll_right.svg" alt="" />
            </button>
          </div>

          <div className="why-vortex-carousel">
            <div
              className="why-vortex-track"
              style={{ '--why-vortex-slide': currentSlide } as React.CSSProperties}
            >
              {content.cards.map((card, index) => (
                <article className="why-vortex-card" key={`${card.title}-${index}`}>
                  <img className="why-vortex-mark" src="/bgs/logo2.svg" alt="" />
                  <span className="why-vortex-number">{index + 1}/</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default WhyVortexComponent;
