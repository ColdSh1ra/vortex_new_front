import {useNavigate} from 'react-router-dom';
import {localizedUrl} from '../seo/urls';
import { imageSize } from '../utils/imageSize';
import { useI18n } from '../context/ContentContext';
import { useInitialContent } from '../context/ContentContext';
import BlueContainerBlock from "../components/default/BlueContainerBlock";
import ButtonFill from "../components/default/ButtonFIll";

function MainPageHeroContent() {
  const { t, language } = useI18n();
  const navigate=useNavigate();
    const content = useInitialContent();
    const hero=content?.homepage.hero;
    const screenshots=hero ? hero.screenshots : [1,2,3].map(number=>({image:'/imgs/vx-screenshot-'+number+'.png',alt:''}));
    const follow=(target:string)=>{if(target.startsWith('#'))document.getElementById(target.slice(1))?.scrollIntoView({behavior:'smooth'});else if(/^(https:|mailto:|tel:)/.test(target))window.location.assign(target);else navigate(localizedUrl(target,language));};

    const [titleAccent = '', ...titleLines] = content?.homepage.title.split('\n') ?? [];

    return (
        <section className="hero-page section-container">
            {content && (
                <>
                    <div className={'radial-bg-container absolute-container'}/>
                    {(!hero || hero.image) && <img className={'absolute-container image vortex-logo'} src={hero ? hero.image : '/bgs/logo2.svg'} alt={hero ? hero.image_alt : 'Vortex'}/>}
                    <div className={'hero-page-shadow-container display-flex align-content-center absolute-container'}>
                        {screenshots.map((image,index)=>image.image&&<img key={index} className={'hero-page-image screen-shot-'+(index+1)} src={image.image} alt={image.alt} {...imageSize(image.image)} decoding="async" fetchPriority={index===1?'high':'auto'}/>)}
                    </div>
                    <BlueContainerBlock
                        ShowHeading={true}
                        AdditionalClass={'homepage-text-container '}
                        Heading={
                            <div className="homepage-heading gap-8 display-flex flex-column align-content-center">
                                <h1 className="homepage-title" data-header-heading data-header-title={`${titleAccent.trim()} ${titleLines.join(' ').trim()}`.trim()}>
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
                                    btnFunction={() => follow(hero?.cta_target ?? '#trial-request')}
                                    btnText={hero?.cta_text ?? t('common.tryFree')}
                                    btnIcon={'/icons/double-chevron-right.svg'}
                                />
                                <ButtonFill
                                    dynamicClass={' button-outline hero-demo-button no-icon'}
                                    btnFunction={() => follow(hero?.cta_target ?? '#trial-request')}
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
