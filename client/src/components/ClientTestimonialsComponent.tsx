import StickyHeading from './default/StickyHeading';
import { imageSize } from '../utils/imageSize';
import { localizedUrl } from '../seo/urls';
import { useState } from 'react';
import { useInitialContent, useI18n } from '../context/ContentContext';
import SliderControls from './default/SliderControls';

function ClientTestimonialsComponent() {
  const { language } = useI18n();
  const content = useInitialContent()?.homepage.client_testimonials_section ?? null;
  const [currentSlide, setCurrentSlide] = useState(0);

  const previousSlide = () => {
    setCurrentSlide((slide) => Math.max(slide - 1, 0));
  };

  const nextSlide = () => {
    if (!content) {
      return;
    }

    setCurrentSlide((slide) => Math.min(slide + 1, content.reviews.length - 1));
  };

  return (
    <section className="section-container client-testimonials-section">
      <div className="radial-bg-container" aria-hidden="true" />
      {content && (
        <div className="client-testimonials-wrapper">
          <StickyHeading>{content.section_title}</StickyHeading>

          <SliderControls
            onPrevious={previousSlide}
            onNext={nextSlide}
            previousDisabled={currentSlide === 0}
            nextDisabled={currentSlide === content.reviews.length - 1}
          />

          <div className="testimonials-carousel">
            <div
              className="testimonials-track"
              style={{ '--testimonial-slide': currentSlide } as React.CSSProperties}
            >
              {content.reviews.map((review, index) => (
                <article className="testimonial-card" key={`${review.company_name}-${index}`}>
                  <header>
                    <div className="testimonial-logo-frame">
                      {review.image_src && <img src={review.image_src} {...imageSize(review.image_src)} loading="lazy" decoding="async" alt="" />}
                    </div>
                    <div>
                      <h3>{review.company_name}</h3>
                      <p>{review.company_type}</p>
                    </div>
                  </header>

                  <h4>{content.pros_title}</h4>
                  <ul className="testimonial-list testimonial-pros">
                    {review.pros.map((item) => <li key={item}>{item}</li>)}
                  </ul>

                  <h4>{content.cons_title}</h4>
                  <ul className="testimonial-list testimonial-cons">
                    {review.cons.map((item) => <li key={item}>{item}</li>)}
                  </ul>

                  {review.quote && (
                    <blockquote>
                      <span aria-hidden="true">“</span>
                      <p>{review.quote}</p>
                    </blockquote>
                  )}

                  {review.link_text && <a href={localizedUrl(review.link_href, language)}>{review.link_text}</a>}
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ClientTestimonialsComponent;
