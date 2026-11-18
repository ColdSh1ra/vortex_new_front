import { useI18n } from '../../context/ContentContext';
import Link from '../default/LocalizedLink';
import CircleButtonLink from "../default/CircleButtonLink";
import { blogUrl } from '../../blog/urls';
import { SOCIAL_LINKS } from '../../data/socialLinks';
function getFooterMenuLinks(t: (key: string) => string, blogPath: string) { return [
    { name: t("nav.carService"), path: "/car-service" },
    { name: t("nav.websites"), path: "/websites" },
    { name: t("nav.dismantling"), path: "/auto-dismantling" },
    { name: t("nav.tecdoc"), path: "/tecdoc-license" },
    { name: t("nav.pricing"), path: "/#pricing" },
    { name: t("nav.faq"), path: "/faq" },
    { name: t("nav.blog"), path: blogPath },
    { name: t("nav.contacts"), path: "/contact" },
]; }
function FooterMain() {
    const { t, language } = useI18n();
    const footerMenuLinks = getFooterMenuLinks(t, blogUrl(language));
    const currentYear = new Date().getFullYear();

    return (
        <div className="footer-background">
            <footer className="footer section-container">

                <div className={'absolute-footer-el footer-bg-text'}>
                    VORTEX
                </div>
                <div className={'absolute-footer-el display-flex radial-bg-container'}/>


                <div className="footer-logo-container">
                    <Link to={'/'}>
                        <img src="/imgs/vortex-logo-115.svg" alt="Vortex" />
                    </Link>
                </div>
                <div className={'footer-menu-points display-flex flex-column gap-40'}>
                    {footerMenuLinks.map((mp, index) => (
                        <Link className={'nav-link basic-mp footer-menu-point'} key={'menuPoint' + index} to={mp.path}>
                            { mp.name}
                        </Link>
                    ))}
                </div>
                <div className={'footer-bottom-container display-flex'}>
                    <div className={'copyright'}>
                        {t('common.copyright', { year: currentYear })}
                    </div>
                    <div className={'footer-additional-links display-flex gap-20'}>
                        {SOCIAL_LINKS.map((sl, index) => (
                            <CircleButtonLink
                                linkPath={sl.url}
                                label={sl.name}
                                imageUrl={sl.imageSrc}
                                key={'socialLink' + index + sl.name}>
                            </CircleButtonLink>
                        ))}
                    </div>
                    <div className={'privacy-policy-link'}>
                        <Link className={'nav-link basic-mp'} to={'/privacy-policy'}>
                            {t('common.privacy')}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default FooterMain;
