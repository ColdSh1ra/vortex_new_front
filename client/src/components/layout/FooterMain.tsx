import { Link } from "react-router-dom";
import CircleButtonLink from "../buttons/CircleButtonLink";
const footerMenuLinks = [
    { name: "Облік СТО", path: "/" },
    { name: "Розробка веб-сайтів", path: "/contact" },
    { name: "Ціни", path: "/faq" },
    { name: "Запитання", path: "/faq" },
    { name: "Контакти", path: "/contacts" },
];
const footerSocialLinks = [
    { name: "Facebook", path: "/", image_url: './../../public/icons/sm_black/facebook.svg'},
    { name: "YouTube", path: "/", image_url: './../../public/icons/sm_black/youtube.svg'},
    { name: "Telegram", path: "/", image_url: './../../public/icons/sm_black/telegram.svg'},
    { name: "Instagram", path: "/", image_url: './../../public/icons/sm_black/instagram.svg'},
];
function FooterMain() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer section-container">

            <div className={'absolute-footer-el footer-bg-text'}>
                VORTEX
            </div>
            <div className={'absolute-footer-el display-flex conic-bg-container'}/>


            <div className="footer-logo-container">
                <Link to={'/'}>
                    <img src="./../../public/imgs/vortex-logo-115.png" alt="company logo" />
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
                    Copyright &#169; {currentYear} Vortex
                </div>
                <div className={'footer-additional-links display-flex gap-20'}>
                    {footerSocialLinks.map((sl, index) => (
                        <CircleButtonLink
                            linkPath={sl.path}
                            imageUrl={sl.image_url}
                            key={'socialLink' + index + sl.name}>
                        </CircleButtonLink>
                    ))}
                </div>
                <div className={'privacy-policy-link'}>
                    <Link className={'nav-link basic-mp'} to={'/privacy-policy'}>
                        Політика конфіденційності
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default FooterMain;