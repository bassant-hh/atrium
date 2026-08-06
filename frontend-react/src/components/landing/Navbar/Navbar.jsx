import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMotorcycle } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import {
  handlePrimaryCTA,
  handleSecondaryCTA,
  getCTAButtonLabels,
} from '../../../utils/publicNavigation';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const labels = getCTAButtonLabels(isAuthenticated);

  return (
    <header className="landing-navbar">
      <div className="landing-navbar__logo">
        <span className="landing-navbar__logo-icon">
          <FaMotorcycle />
        </span>
        <span className="landing-navbar__logo-text">Makook</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          type="button"
          className="landing-navbar__login-btn"
          style={{
            backgroundColor: 'transparent',
            color: '#004d62',
            border: '1px solid #004d62',
          }}
          onClick={() => handleSecondaryCTA(navigate)}
        >
          {labels.secondary}
        </button>

        <button
          type="button"
          className="landing-navbar__login-btn"
          onClick={() => handlePrimaryCTA(navigate, isAuthenticated)}
        >
          {labels.primary}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
