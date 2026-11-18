import { useI18n } from '../context/ContentContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useInitialContent } from '../context/ContentContext';

function HeroPageSliderSection() {
  const { t } = useI18n();
    const content = useInitialContent()?.homepage.hero_page_slider_section ?? null;


    const [currentSlide, setCurrentSlide] = useState(0)
    const carouselRef = useRef<HTMLDivElement>(null)
    const scrollAnimationFrame = useRef<number | null>(null)

    const scrollToSlide = useCallback((requestedSlide: number) => {
        if (!content) {
            return;
        }

        const slideCount = content.slide_image_paths.length;

        if (slideCount === 0) {
            return;
        }

        const nextSlide = (requestedSlide + slideCount) % slideCount;
        const slideElement = carouselRef.current
            ?.querySelectorAll<HTMLElement>('.slide-content')[nextSlide];

        setCurrentSlide(nextSlide);
        carouselRef.current?.scrollTo({
            left: slideElement?.offsetLeft ?? 0,
            behavior: 'smooth',
        });
    }, [content]);

    useEffect(() => {
        if (!content || content.slide_image_paths.length < 2) {
            return;
        }

        const intervalId = window.setInterval(() => {
            scrollToSlide(currentSlide + 1);
        }, 5000);

        return () => window.clearInterval(intervalId);
    }, [content, currentSlide, scrollToSlide]);

    useEffect(() => () => {
        if (scrollAnimationFrame.current !== null) {
            window.cancelAnimationFrame(scrollAnimationFrame.current);
        }
    }, []);

    const updateCurrentSlideFromScroll = () => {
        if (scrollAnimationFrame.current !== null || !carouselRef.current) {
            return;
        }

        scrollAnimationFrame.current = window.requestAnimationFrame(() => {
            const carousel = carouselRef.current;

            if (!carousel) {
                scrollAnimationFrame.current = null;
                return;
            }

            const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
            const slides = Array.from(
                carousel.querySelectorAll<HTMLElement>('.slide-content')
            );

            if (slides.length === 0) {
                scrollAnimationFrame.current = null;
                return;
            }

            const closestSlide = slides.reduce((closestIndex, slide, index) => {
                const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
                const closestElement = slides[closestIndex];
                const closestCenter = closestElement.offsetLeft + closestElement.offsetWidth / 2;

                return Math.abs(slideCenter - carouselCenter) < Math.abs(closestCenter - carouselCenter)
                    ? index
                    : closestIndex;
            }, 0);

            setCurrentSlide(closestSlide);
            scrollAnimationFrame.current = null;
        });
    };

    const goToPreviousSlide = () => {
        scrollToSlide(currentSlide - 1);
    };

    const goToNextSlide = () => {
        scrollToSlide(currentSlide + 1);
    };

    return (
        <section className={'section-container hero-page-slider-section'}>
            {content && (
                <div className={'slider-wrapper'}>
                    <h2 className={'section-title'}>
                        {content.section_title}
                    </h2>

                    <div className={'carousel-buttons'}>
                        <button type="button" onClick={goToPreviousSlide} aria-label={t('common.previous')}>
                            <img src="/icons/slider_scroll_right.svg" alt="" />
                        </button>
                        <button type="button" onClick={goToNextSlide} aria-label={t('common.next')}>
                            <img src="/icons/slider_scroll_right.svg" alt="" />
                        </button>
                    </div>

                    <div
                        className={'carousel-container'}
                        ref={carouselRef}
                        onScroll={updateCurrentSlideFromScroll}
                    >
                        <div className={'slider-track'}>
                            {content.slide_image_paths.map((slidePath, index) => (
                                <div
                                    className={'slide-content display-flex align-content-center'}
                                    key={'slide_' + index + slidePath}
                                >
                                    <img
                                        className={'image slider-image'}
                                        src={slidePath}
                                        alt={t('common.slide', { number: index + 1 })}
                                        draggable={false} />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </section>
    );
}

export default HeroPageSliderSection
