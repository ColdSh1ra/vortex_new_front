import React from 'react';
import { Link } from 'react-router-dom';

const HeaderMain = () => {
  // DYNAMIC DATA: Eventually, this will come from vortex.json via your Node server
  const menuLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'CRM Login', path: '/login' },
  ];

  return (
    <header>
      <div>VORTEX</div>
      <nav>
        <ul>
          {menuLinks.map((link, index) => (
            <li key={index}>
              <Link to={link.path}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default HeaderMain;