import { useEffect, useState } from 'react';
import { getHomepageContent } from '../services/api';
import type { AboutUsContent } from '../types/content';
import HeadingComponent from "./default/HeadingComponent";
import DescriptionComponent from "./default/DescriptionComponent";
// import BlueContainerBlock from "../components/default/BlueContainerBlock";
// import TextContainer from "../components/default/TextContainer";
// import ButtonFill from "../components/default/ButtonFIll";

function AboutUs() {
    const [content, setContent] = useState<AboutUsContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadContent() {
            try {
                const aboutUsContent = await getHomepageContent("about_us_block");
                setContent(aboutUsContent);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        }

        loadContent();
    }, []);

    return (
        <section className="about-us-content section-container">
            {isLoading && <p>Іде завантаження...</p>}
            {error && <p>Невдалось завантажити сторінку: {error}</p>}
            {content && (
                <div className={'display-flex flex-column align-content-center'}>
                    <HeadingComponent children={content.about_us_title}
                                      adClassName={'about-us-hero-title text-color-orange'}
                    />
                    <DescriptionComponent children={content.about_us_subtitle}
                                          adClassName={'about-us-hero-subtitle'}
                    />

                    {content.about_us_blocks.map((block, index) => (
                        <div className={'about-us-block display-flex jc-space-between' +
                            (index % 2 === 0 ? ' row-reverse ' : ' flex-direction-row ')}
                             key={index}>
                            <div className={'about-us-info-element display-flex flex-column'}
                                 key={block.about_us_title + index}>
                                <HeadingComponent
                                    children={'/'+ (index + 1)}
                                    adClassName={'about-us-index text-color-orange'}
                                    />
                                <HeadingComponent
                                    children={block.about_us_title}
                                    adClassName={'about-us-title text-color-white'}
                                />
                                <DescriptionComponent
                                    children={block.about_us_description}
                                    adClassName={'about-us-description text-color-white'}
                                />
                            </div>
                            <div className={'display-flex align-content-center au-image-outer-wrapper'}>
                                <div className={' '}>
                                    <img src={block.about_us_image_path}
                                         className={'radial-bg-container image'}
                                         width="160"
                                         height="160"
                                         alt={'about us image'} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default AboutUs;
