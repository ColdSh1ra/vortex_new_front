import { useEffect, useState } from 'react';
import React from 'react';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import {getHomepageContent} from "../services/api";
import type { HeroPageSliderSection } from "../types/content";

function HeroPageSliderSectionComponent(): React.ReactNode {
    const [content, setContent] = useState<HeroPageSliderSection | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
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
        loadContent().then(r => console.log(r, "hero page slider content READY!!"));
    })
    return (
        <div className={'section-container hero-page-slider-section'}>
            {isLoading && <div className={'loading'}>Іде завантаження</div>}
            {error && <div className={'error'}>{error}</div>}
            {content && (
                <div className={'slider-wrapper'}>
                    <div className={'section-title'}>

                    </div>
                    <CarouselProvider
                        naturalSlideWidth={1200}
                        naturalSlideHeight={600}
                        totalSlides={content.slide_image_paths.length}
                        isIntrinsicHeight={true}
                        infinite={true}
                        isPlaying={true}
                        interval={5000}
                        className={'carousel-container'}
                    >
                        <div className={'carousel-buttons'}>
                            <ButtonBack>Back</ButtonBack>
                            <ButtonNext>Next</ButtonNext>
                        </div>
                        <Slider>
                            {content.slide_image_paths.map((slidePath, index) => (
                                <Slide key={'slide_' + index} index={index}>
                                    <div className={'slide-content'}>
                                        <img key={index} className={'image slider-image'} src={slidePath} alt={`slide image ${index}`} />
                                    </div>
                                </Slide>
                            ))}
                        </Slider>
                    </CarouselProvider>
                </div>
            )}
        </div>
    );
}

export default HeroPageSliderSectionComponent