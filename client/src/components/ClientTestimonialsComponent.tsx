import { useEffect, useState } from 'react';
import { useInitialContent } from '../context/ContentContext';
import { getHomepageContent } from '../services/api';
import type { ClientTestimonialsSection } from '../types/content';

function ClientTestimonialsComponent() {
  const initialContent = useInitialContent()?.homepage.client_testimonials_section ?? null;
  const [content, setContent] = useState<ClientTestimonialsSection | null>(initialContent);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      return;
    }

    getHomepageContent('client_testimonials_section')
      .then(setContent)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      });
  }, [content]);

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
      {error && <p className="testimonials-status">{error}</p>}
      {content && (
        <div className="client-testimonials-wrapper">
          <h2>{content.section_title}</h2>

          <div className="testimonials-controls">
            <button
              type="button"
              onClick={previousSlide}
              disabled={currentSlide === 0}
              aria-label="Previous testimonials"
            >
              <img src="/icons/slider_scroll_right.svg" alt="" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              disabled={currentSlide === content.reviews.length - 1}
              aria-label="Next testimonials"
            >
              <img src="/icons/slider_scroll_right.svg" alt="" />
            </button>
          </div>

          <div className="testimonials-carousel">
            <div
              className="testimonials-track"
              style={{ '--testimonial-slide': currentSlide } as React.CSSProperties}
            >
              {content.reviews.map((review, index) => (
                <article className="testimonial-card" key={`${review.company_name}-${index}`}>
                  <header>
                    <div className="testimonial-logo-frame">
                      {review.image_src && <img src={review.image_src} alt="" />}
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

                  {review.link_text && <a href={review.link_href}>{review.link_text}</a>}
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
