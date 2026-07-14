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
                    <div className={'radial-bg-container absolute-container'}/>
                    <img className={'absolute-container image vortex-logo'} src='./../../public/bgs/logo2.svg' alt='company logo'/>
                    <div className={'hero-page-shadow-container display-flex align-content-center absolute-container'}>
                        <img className={'hero-page-image screen-shot-1'} src='./../../public/imgs/vx-screenshot-1.png' alt='inside app screenshot'/>
                        <img className={'hero-page-image screen-shot-2'} src='./../../public/imgs/vx-screenshot-2.png' alt='inside app screenshot'/>
                        <img className={'hero-page-image screen-shot-3'} src='./../../public/imgs/vx-screenshot-3.png' alt='inside app screenshot'/>
                    </div>
                    <BlueContainerBlock
                        ShowHeading={true}
                        AdditionalClass={'homepage-text-container '}
                        Heading={
                            <TextContainer
                                Heading={content.homepage.title}
                                Description={content.homepage.subtitle}
                                ContainerClass="gap-8 display-flex flex-column align-content-center "
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