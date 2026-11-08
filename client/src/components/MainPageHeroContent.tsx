import { useI18n } from '../context/ContentContext';
import { useInitialContent } from '../context/ContentContext';
import BlueContainerBlock from "../components/default/BlueContainerBlock";
import ButtonFill from "../components/default/ButtonFIll";

function MainPageHeroContent() {
  const { t } = useI18n();
    const content = useInitialContent();

    const [titleAccent = '', ...titleLines] = content?.homepage.title.split('\n') ?? [];

    return (
        <section className="hero-page section-container">
            {content && (
                <>
                    <div className={'radial-bg-container absolute-container'}/>
                    <img className={'absolute-container image vortex-logo'} src='/bgs/logo2.svg' alt='Vortex'/>
                    <div className={'hero-page-shadow-container display-flex align-content-center absolute-container'}>
                        <img className={'hero-page-image screen-shot-1'} src='/imgs/vx-screenshot-1.png' alt=''/>
                        <img className={'hero-page-image screen-shot-2'} src='/imgs/vx-screenshot-2.png' alt=''/>
                        <img className={'hero-page-image screen-shot-3'} src='/imgs/vx-screenshot-3.png' alt=''/>
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
                                    btnFunction={() => document.getElementById('trial-request')?.scrollIntoView({ behavior: 'smooth' })}
                                    btnText={t('common.tryFree')}
                                    btnIcon={'/icons/chevron-right-double.svg'}
                                />
                                <ButtonFill
                                    dynamicClass={' button-outline hero-demo-button no-icon'}
                                    btnFunction={() => document.getElementById('trial-request')?.scrollIntoView({ behavior: 'smooth' })}
                                    btnText={t('common.tryDemo')}
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
