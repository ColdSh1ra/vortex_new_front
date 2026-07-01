import { useEffect, useState } from 'react';
import { getContent } from '../services/api';
import type { VortexContent } from '../types/content';
import BlueContainerBlock from "../components/default/BlueContainerBlock";
import TextContainer from "../components/default/TextContainer";
import ButtonFill from "../components/default/ButtonFIll";

function MainPageHeroContent() {
    const [content, setContent] = useState<VortexContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadContent() {
            try {
                const apiContent = await getContent();
                setContent(apiContent);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        }

        loadContent();
    }, []);

    return (
        <section className="hero-page section-container">
            {isLoading && <p>Іде завантаження...</p>}
            {error && <p>Невдалось завантажити сторінку: {error}</p>}
            {content && (
                <>
                    <div className={'radial-bg-container'}/>

                    <div className={'hero-page-shadow-container'}>
                        <img сlassName={'image hero-page'} src='./../../public/imgs/vx-screenshot-1.png' alt='inside app screenshot'/>
                        <img src='./../../public/imgs/vx-screenshot-2.png' alt='inside app screenshot'/>
                        <img src='./../../public/imgs/vx-screenshot-3.png' alt='inside app screenshot'/>
                    </div>
                    <BlueContainerBlock
                        ShowHeading={true}
                        AdditionalClass={''}
                        Heading={
                            <TextContainer
                                Heading={content.homepage.title}
                                Description={content.homepage.subtitle}
                                ContainerClass="homepage-text-container "
                                HeadingClass="homepage-title"
                                DescriptionClass="homepage-subtitle"
                            />
                        }
                        BlockContent={
                            <div className={'container-block-actions display-flex align-content-center'}>
                                <ButtonFill
                                    dynamicClass={' orange with-icon'}
                                    btnFunction={() => {}}
                                    btnText={'Спробувати Безкоштовно'}
                                    btnIcon={'./../../public/icons/chevron-right-double.svg'}
                                />
                            </div>
                        }
                    >
                    </BlueContainerBlock>
                    {/*<h2>{content.homepage.title}</h2>*/}
                    {/*<p>{content.homepage.subtitle}</p>*/}
                    {/*<p>Total clicks: {content.stats.totalClicks}</p>*/}
                    {/*<p>Form submissions: {content.stats.formSubmissions}</p>*/}
                </>
            )}
        </section>
    );
}

export default MainPageHeroContent;