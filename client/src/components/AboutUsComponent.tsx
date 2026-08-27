import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { getHomepageContent } from '../services/api';
import type { AboutUsContent } from '../types/content';
import { useInitialContent } from '../context/ContentContext';
import HeadingComponent from "./default/HeadingComponent";
import DescriptionComponent from "./default/DescriptionComponent";
// import BlueContainerBlock from "../components/default/BlueContainerBlock";
// import TextContainer from "../components/default/TextContainer";
// import ButtonFill from "../components/default/ButtonFIll";
const min: number = 95;
const max: number = 105;

const getRightPositionStyle = (index: number): CSSProperties => {
    const position = -(min + (index % (max - min + 1)));

    return {
        right: `${position}%`,
    };
};

function AboutUs() {
    const initialContent = useInitialContent()?.homepage.about_us_block ?? null;
    const [content, setContent] = useState<AboutUsContent | null>(initialContent);
    const [isLoading, setIsLoading] = useState(!initialContent);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (content) {
            return;
        }

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
    }, [content]);

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
                        <div key={"about-us-block-" + index} className={'about-us-block'}>
                            <div className={'about-us-block-inner-wrapper display-flex jc-space-between' +
                                (index % 2 === 0 ? ' row-reverse ' : ' flex-direction-row ')}
                                 >
                                <div className={'about-us-info-element gap-8 display-flex flex-column'}
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
                                    <div style={getRightPositionStyle(index)} className={' p-absolute-element radial-bg-container '}></div>
                                    <img src={block.about_us_image_path}
                                         className={' image'}
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
