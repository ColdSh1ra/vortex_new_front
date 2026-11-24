import StickyHeading from './default/StickyHeading';
import { useState } from 'react';
import { useInitialContent } from '../context/ContentContext';
import SliderControls from './default/SliderControls';

function WhyVortexComponent() {
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
            <StickyHeading>{content.section_title}</StickyHeading>
            <p>{content.section_description}</p>
          </header>

          <SliderControls
            onPrevious={previousSlide}
            onNext={nextSlide}
            previousDisabled={currentSlide === 0}
            nextDisabled={currentSlide === content.cards.length - 1}
          />

          <div className="why-vortex-carousel">
            <div
              className="why-vortex-track"
              style={{ '--why-vortex-slide': currentSlide } as React.CSSProperties}
            >
              {content.cards.map((card, index) => (
                <article className="why-vortex-card" key={`${card.title}-${index}`}>
                  {card.image_src && <img className="why-vortex-mark" src={card.image_src} alt="" loading="lazy" />}
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
