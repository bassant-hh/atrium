import React from 'react';
import { usePublicAuthNavigation } from '../../../hooks/usePublicAuthNavigation';
import './CTA.css';

const CTA = () => {
  const { primaryLabel, onPrimaryClick } = usePublicAuthNavigation();

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Ready to get started?</h2>
        <p className="cta-subtitle">
          Join Makook today and experience the ultimate university service platform.
        </p>
        <button type="button" className="cta-btn" onClick={onPrimaryClick}>
          {primaryLabel}
        </button>
      </div>
    </section>
  );
};

export default CTA;
