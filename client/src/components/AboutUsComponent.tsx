import { useInitialContent } from '../context/ContentContext';

function AboutUs() {
    const content = useInitialContent()?.homepage.about_us_block ?? null;

    return (
        <section className="about-us-content section-container">
            {content && (
                <div className="about-us-wrapper display-flex flex-column align-content-center width-100-p">
                    <div className="about-us-header">
                        <h2 className="about-us-hero-title text-color-orange">
                            {content.about_us_title}
                        </h2>
                        <p className="about-us-hero-subtitle">
                            {content.about_us_subtitle}
                        </p>
                    </div>

                    {content.about_us_blocks.map((block, index) => (
                        <div key={"about-us-block-" + index} className={'about-us-block'}>
                            <div className={'about-us-block-inner-wrapper display-flex jc-space-between' +
                                (index % 2 === 0 ? ' row-reverse ' : ' flex-direction-row ')}
                                 >
                                <div className={'about-us-info-element gap-8 display-flex flex-column'}
                                     key={block.about_us_title + index}>
                                    <span className="about-us-index text-color-orange">
                                        {index + 1}/
                                    </span>
                                    <h3 className="about-us-title text-color-white">
                                        {block.about_us_title}
                                    </h3>
                                    <p className="about-us-description text-color-white">
                                        {block.about_us_description}
                                    </p>
                                </div>
                                <div className={'display-flex align-content-center au-image-outer-wrapper'}>
                                    <div className="radial-bg-container" aria-hidden="true" />
                                    <img src={block.about_us_image_path}
                                         className={' image'}
                                         width="160"
                                         height="160"
                                         alt=""
                                         loading="lazy" />
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
