import React from 'react';
import { FaGraduationCap, FaUtensils, FaPrint } from 'react-icons/fa';
import { usePublicAuthNavigation } from '../../../hooks/usePublicAuthNavigation';
import SwitchAccountModal from '../SwitchAccountModal/SwitchAccountModal';
import './Hero.css';

const Hero = () => {
  const {
    primaryLabel,
    secondaryLabel,
    onPrimaryClick,
    onSecondaryClick,
    role,
    showSwitchModal,
    closeSwitchModal,
  } = usePublicAuthNavigation();

  const handleSecondaryClick = () => {
    if (role) {
      onSecondaryClick();
    } else {
      const servicesElement = document.getElementById('services-section');
      if (servicesElement) {
        servicesElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Content */}
          <div className="hero-content">
            <div className="hero-content__badge">
              <FaGraduationCap /> Built Exclusively for University Campus
            </div>

            <h1 className="hero-content__title">
              Everything a Student Needs,{' '}
              <span className="hero-content__title-highlight">Delivered.</span>
            </h1>

            <p className="hero-content__subtitle">
              Food, printing, books, stationery, and campus-wide delivery. Everything designed to
              save your study time and keep campus life seamless.
            </p>

            <div className="hero-content__actions">
              <button type="button" className="hero-btn-primary" onClick={onPrimaryClick}>
                {primaryLabel}
              </button>

              <button type="button" className="hero-btn-secondary" onClick={handleSecondaryClick}>
                {secondaryLabel}
              </button>
            </div>
          </div>

          {/* Right Composition */}
          <div className="hero-visual">
            <div className="floating-element floating-element--1">
              <FaUtensils color="#004D62" /> Hot Meal • 15 Mins
            </div>

            <div className="floating-element floating-element--2">
              <FaPrint color="#004D62" /> Exam Notes Printed
            </div>

            <div className="hero-card-main">
              <div className="hero-card-header">
                <div className="hero-card-avatar">
                  <FaGraduationCap />
                </div>
                <div>
                  <h3 className="hero-card-title">Campus Order Request</h3>
                  <span className="hero-card-status">Building A → Library 2F</span>
                </div>
              </div>

              <div className="hero-card-list">
                <div className="hero-card-item">
                  <span>🍕 Chicken Shawarma Combo</span>
                  <span>25 SAR</span>
                </div>
                <div className="hero-card-item">
                  <span>🖨️ CS Lecture Slides (12 pgs)</span>
                  <span>6 SAR</span>
                </div>
                <div className="hero-card-item">
                  <span>✏️ Blue Ink Pen Pack</span>
                  <span>4 SAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SwitchAccountModal isOpen={showSwitchModal} onClose={closeSwitchModal} />
    </>
  );
};

export default Hero;
