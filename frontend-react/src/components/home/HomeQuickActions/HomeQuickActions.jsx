import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaBoxOpen, FaUserCircle, FaArrowRight } from 'react-icons/fa';
import { ROUTES } from '../../../constants/routes';
import './HomeQuickActions.css';

const HomeQuickActions = () => {
  return (
    <section className="home-quick-actions" aria-label="Quick Actions">
      {/* Section 2 — Primary Action CTA (Hero Banner) */}
      <Link to={ROUTES.NEW_ORDER} className="home-hero-cta">
        <div className="home-hero-cta__left">
          <div className="home-hero-cta__icon-wrapper" aria-hidden="true">
            <FaPlus />
          </div>
          <div className="home-hero-cta__text">
            <span className="home-hero-cta__title">Create New Order</span>
            <span className="home-hero-cta__subtitle">Food, printing, stationery & documents</span>
          </div>
        </div>
        <FaArrowRight className="home-hero-cta__arrow" aria-hidden="true" />
      </Link>

      {/* Section 3 — Quick Access Shortcuts */}
      <div className="home-shortcuts-grid">
        <Link to={ROUTES.MY_ORDERS} className="home-shortcut-item">
          <div className="home-shortcut-item__icon-badge" aria-hidden="true">
            <FaBoxOpen />
          </div>
          <div className="home-shortcut-item__info">
            <span className="home-shortcut-item__label">My Orders</span>
            <span className="home-shortcut-item__sub">Track & history</span>
          </div>
        </Link>

        <Link to={ROUTES.CUSTOMER_PROFILE} className="home-shortcut-item">
          <div className="home-shortcut-item__icon-badge" aria-hidden="true">
            <FaUserCircle />
          </div>
          <div className="home-shortcut-item__info">
            <span className="home-shortcut-item__label">Profile</span>
            <span className="home-shortcut-item__sub">Account info</span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HomeQuickActions;
