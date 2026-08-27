import { useEffect, useState } from 'react';
import {getHomepageContent} from "../services/api";
import type { HeroPageSliderSection as HeroPageSliderSectionContent } from "../types/content";
import { useInitialContent } from '../context/ContentContext';

function HeroPageSliderSection() {
    const initialContent = useInitialContent()?.homepage.hero_page_slider_section ?? null;
    const [content, setContent] = useState<HeroPageSliderSectionContent | null>(initialContent)
    const [isLoading, setIsLoading] = useState<boolean>(!initialContent)
    const [error, setError] = useState<string | null>(null)
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        if (content) {
            return;
        }

        async function loadContent() {
            try {
                const sliderSectionContent = await getHomepageContent("hero_page_slider_section");
                setContent(sliderSectionContent);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Unknown error')
            } finally {
                setIsLoading(false)
            }
        }
        loadContent();
    }, [content])

    useEffect(() => {
        if (!content || content.slide_image_paths.length < 2) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setCurrentSlide((slide) => (slide + 1) % content.slide_image_paths.length);
        }, 5000);

        return () => window.clearInterval(intervalId);
    }, [content]);

    const goToPreviousSlide = () => {
        if (!content) {
            return;
        }

        setCurrentSlide((slide) => (
            slide === 0 ? content.slide_image_paths.length - 1 : slide - 1
        ));
    };

    const goToNextSlide = () => {
        if (!content) {
            return;
        }

        setCurrentSlide((slide) => (slide + 1) % content.slide_image_paths.length);
    };

    return (
        <section className={'section-container hero-page-slider-section'}>
            {isLoading && <div className={'loading'}>Іде завантаження</div>}
            {error && <div className={'error'}>{error}</div>}
            {content && (
                <div className={'slider-wrapper'}>
                    <h2 className={'section-title'}>
                        {content.section_title}
                    </h2>

                    <div className={'carousel-buttons'}>
                        <button type="button" onClick={goToPreviousSlide} aria-label="Previous slide">
                            <img src="/icons/slider_scroll_right.svg" alt="" />
                        </button>
                        <button type="button" onClick={goToNextSlide} aria-label="Next slide">
                            <img src="/icons/slider_scroll_right.svg" alt="" />
                        </button>
                    </div>

                    <div className={'carousel-container'}>
                        <div
                            className={'slider-track'}
                            style={{
                                transform: `translateX(calc(-${currentSlide * 66.666667}% - ${currentSlide * 5}px))`,
                            }}
                        >
                            {content.slide_image_paths.map((slidePath, index) => (
                                <div
                                    className={'slide-content display-flex align-content-center'}
                                    key={'slide_' + index + slidePath}
                                >
                                    <img
                                        className={'image slider-image'}
                                        src={slidePath}
                                        alt={`Slide ${index + 1}`} />
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
