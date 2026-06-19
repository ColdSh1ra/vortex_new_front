import { Link } from "react-router-dom";
import type { NavigationLink } from "../../types/navigation";
import ButtonFill from "../default/ButtonFIll";

const menuLinks: NavigationLink[] = [
  { name: "Main", path: "/" },
  { name: "Contact", path: "/contact" },
  { name: "FAQ", path: "/faq" },
];

function HeaderMain() {
  return (
    <header className="header">
      <div className="brand header-logo-container">
          <Link to={'/'}>
              <img src="./../../public/imgs/vortex-logo-115.svg" alt="company logo" />
          </Link>
      </div>
      <nav>
        <ul className="nav-list">
          {menuLinks.map((link) => (
            <li key={link.path}>
              <Link className="nav-link" to={link.path}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ButtonFill
        btnFunction={() => {}}
        btnText="Cпробувати Безкоштовно"
        bgColor="var(--orange-bg-color)"
        textColor="#000"
      />
      <Link className="tcd-link nav-link" to="/tecdoc-license">
        <img
          className="tecdoc-license-link"
          src="/../../public/imgs/tecdoc-button.png"
          alt="tecdoc license page"
        />
      </Link>
    </header>
  );
}

export default HeaderMain;
