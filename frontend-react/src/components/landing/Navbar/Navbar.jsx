import React from 'react';
import { FaMotorcycle } from 'react-icons/fa';
import { usePublicAuthNavigation } from '../../../hooks/usePublicAuthNavigation';
import SwitchAccountModal from '../SwitchAccountModal/SwitchAccountModal';
import './Navbar.css';

const Navbar = () => {
  const {
    primaryLabel,
    secondaryLabel,
    onPrimaryClick,
    onSecondaryClick,
    showSwitchModal,
    closeSwitchModal,
  } = usePublicAuthNavigation();

  return (
    <>
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
            onClick={onSecondaryClick}
          >
            {secondaryLabel}
          </button>

          <button type="button" className="landing-navbar__login-btn" onClick={onPrimaryClick}>
            {primaryLabel}
          </button>
        </div>
      </header>

      <SwitchAccountModal isOpen={showSwitchModal} onClose={closeSwitchModal} />
    </>
  );
};

export default Navbar;
