import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { handlePrimaryCTA, getCTAButtonLabels } from '../../../utils/publicNavigation';
import './CTA.css';

const CTA = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const labels = getCTAButtonLabels(isAuthenticated);

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Ready to get started?</h2>
        <p className="cta-subtitle">
          Join Makook today and experience the ultimate university service platform.
        </p>
        <button
          type="button"
          className="cta-btn"
          onClick={() => handlePrimaryCTA(navigate, isAuthenticated)}
        >
          {labels.isAuthenticated ? 'Continue to Dashboard' : labels.hasRole ? 'Login' : 'Register'}
        </button>
      </div>
    </section>
  );
};

export default CTA;
