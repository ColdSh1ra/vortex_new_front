import { Link } from "react-router-dom";

const footerMenuLinks = [
    { name: "Облік СТО", path: "/" },
    { name: "Розробка веб-сайтів", path: "/contact" },
    { name: "Ціни", path: "/faq" },
    { name: "Запитання", path: "/faq" },
    { name: "Контакти", path: "/contacts" },
];

function FooterMain() {
    return (
        <footer className="footer">
            <div className="footer-logo-container">
                <img src="./../../public/imgs/vortex-logo-115.png" alt="company logo" />
            </div>
            <div className={'footer-menu-points'}>
                {footerMenuLinks.map((mp, index) => (
                    <Link className={'basic-mp footer-menu-point'} key={'menuPoint' + index} to={mp.path}>
                        { mp.name}
                    </Link>
                ))}

            </div>
            <div className={'footer-additional-links'}></div>
        </footer>
    )
}

export default FooterMain;