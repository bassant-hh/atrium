import React from 'react';
import { FaMotorcycle } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__container">
        <div className="landing-footer__brand">
          <FaMotorcycle /> Makook Campus Platform
        </div>

        <p className="landing-footer__copy">
          © {new Date().getFullYear()} Makook. All rights reserved.
        </p>

        <div className="landing-footer__links">
          <a href="#privacy" className="landing-footer__link">
            Privacy Policy
          </a>
          <a href="#contact" className="landing-footer__link">
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
