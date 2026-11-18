import StickyHeading from './default/StickyHeading';
import ChevronCircle from './default/ChevronCircle';
import {useInitialContent} from '../context/ContentContext';

function VortexAudienceComponent() {
    const content = useInitialContent()?.homepage.vortex_audience_section ?? null;

    return (
        <section className="section-container vortex-audience-section">
            {content && (
                <div className="vortex-audience-wrapper">
                    <StickyHeading>{content.section_title}</StickyHeading>
                    <div className="audience-grid">
                        {content.cards.map((card, index) => (
                            <article className="audience-card" key={`${card.title}-${index}`}>
                                <div className="audience-card-content">
                                    <span>{index + 1}/</span>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                    <a href={card.cta_target ?? "#trial-request"} className="audience-cta">
                                        {card.cta_text}
                                        <ChevronCircle />
                                    </a>
                                </div>
                                <div className="audience-image-frame" aria-hidden="true">
                                    {card.image_src &&
                                        <img src={card.image_src} alt="" width="256" height="256" loading="lazy"/>}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default VortexAudienceComponent;
