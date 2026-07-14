import { useEffect, useState } from 'react';
import { getHomepageContent } from '../services/api';
import type { AboutUsContent } from '../types/content';
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
        <section className="hero-page section-container">
            {isLoading && <p>Іде завантаження...</p>}
            {error && <p>Невдалось завантажити сторінку: {error}</p>}
            {content && (
                <>
                    <h2>{content.about_us_title}</h2>
                    <p>{content.about_us_subtitle}</p>

                    {content.about_us_blocks.map((block) => (
                        <div key={block.about_us_title}>
                            <h3>{block.about_us_title}</h3>
                            <p>{block.about_us_description}</p>
                        </div>
                    ))}
                </>
            )}
        </section>
    );
}

export default AboutUs;
