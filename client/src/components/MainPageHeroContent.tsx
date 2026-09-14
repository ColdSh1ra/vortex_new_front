import { useEffect, useState } from 'react';
import { getContent } from '../services/api';
import type { VortexContent } from '../types/content';
import { useInitialContent } from '../context/ContentContext';
import BlueContainerBlock from "../components/default/BlueContainerBlock";
import ButtonFill from "../components/default/ButtonFIll";

function MainPageHeroContent() {
    const initialContent = useInitialContent();
    const [content, setContent] = useState<VortexContent | null>(initialContent);
    const [isLoading, setIsLoading] = useState(!initialContent);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (content) {
            return;
        }

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
    }, [content]);

    const [titleAccent = '', ...titleLines] = content?.homepage.title.split('\n') ?? [];

    return (
        <section className="hero-page section-container">
            {isLoading && <p>Іде завантаження...</p>}
            {error && <p>Невдалось завантажити сторінку: {error}</p>}
            {content && (
                <>
                    <div className={'radial-bg-container absolute-container'}/>
                    <img className={'absolute-container image vortex-logo'} src='/bgs/logo2.svg' alt='company logo'/>
                    <div className={'hero-page-shadow-container display-flex align-content-center absolute-container'}>
                        <img className={'hero-page-image screen-shot-1'} src='/imgs/vx-screenshot-1.png' alt='inside app screenshot'/>
                        <img className={'hero-page-image screen-shot-2'} src='/imgs/vx-screenshot-2.png' alt='inside app screenshot'/>
                        <img className={'hero-page-image screen-shot-3'} src='/imgs/vx-screenshot-3.png' alt='inside app screenshot'/>
                    </div>
                    <BlueContainerBlock
                        ShowHeading={true}
                        AdditionalClass={'homepage-text-container '}
                        Heading={
                            <div className="homepage-heading gap-8 display-flex flex-column align-content-center">
                                <h1 className="homepage-title">
                                    <span className="homepage-title-accent">{titleAccent.trim()}</span>
                                    <span className="homepage-title-main">{titleLines.join('\n').trim()}</span>
                                </h1>
                                <p className="homepage-subtitle">{content.homepage.subtitle}</p>
                            </div>
                        }
                        BlockContent={
                            <div className={'container-block-actions display-flex align-content-center'}>
                                <ButtonFill
                                    dynamicClass={' orange with-icon'}
                                    btnFunction={() => {}}
                                    btnText={'Спробувати Безкоштовно'}
                                    btnIcon={'/icons/chevron-right-double.svg'}
                                />
                                <ButtonFill
                                    dynamicClass={' button-outline hero-demo-button no-icon'}
                                    btnFunction={() => {}}
                                    btnText={'Спробувати Демо'}
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
