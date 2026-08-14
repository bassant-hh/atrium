import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBoxOpen, FaPlus, FaBell, FaUser } from 'react-icons/fa';
import { ROUTES } from '../../../constants/routes';
import './MobileBottomNavigation.css';

const MobileBottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHomeActive = currentPath === ROUTES.HOME || currentPath === '/';
  const isOrdersActive =
    currentPath === ROUTES.MY_ORDERS || currentPath.startsWith('/track-orders');
  const isCreateActive = currentPath === ROUTES.NEW_ORDER;
  const isNotificationsActive = currentPath === ROUTES.NOTIFICATIONS;
  const isProfileActive = currentPath === ROUTES.CUSTOMER_PROFILE || currentPath === ROUTES.PROFILE;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="mobile-bottom-nav__container">
        {/* 1. Home */}
        <Link
          to={ROUTES.HOME}
          className={`mobile-bottom-nav__item ${
            isHomeActive ? 'mobile-bottom-nav__item--active' : ''
          }`}
          aria-current={isHomeActive ? 'page' : undefined}
          aria-label="Home"
        >
          <FaHome className="mobile-bottom-nav__icon" aria-hidden="true" />
          <span>Home</span>
        </Link>

        {/* 2. My Orders */}
        <Link
          to={ROUTES.MY_ORDERS}
          className={`mobile-bottom-nav__item ${
            isOrdersActive ? 'mobile-bottom-nav__item--active' : ''
          }`}
          aria-current={isOrdersActive ? 'page' : undefined}
          aria-label="My Orders"
        >
          <FaBoxOpen className="mobile-bottom-nav__icon" aria-hidden="true" />
          <span>Orders</span>
        </Link>

        {/* 3. Create New Order (Elevated Primary Action) */}
        <Link
          to={ROUTES.NEW_ORDER}
          className={`mobile-bottom-nav__cta ${
            isCreateActive ? 'mobile-bottom-nav__cta--active' : ''
          }`}
          aria-current={isCreateActive ? 'page' : undefined}
          aria-label="Create New Order"
        >
          <div className="mobile-bottom-nav__cta-circle" aria-hidden="true">
            <FaPlus />
          </div>
          <span>Create</span>
        </Link>

        {/* 4. Notifications */}
        <Link
          to={ROUTES.NOTIFICATIONS}
          className={`mobile-bottom-nav__item ${
            isNotificationsActive ? 'mobile-bottom-nav__item--active' : ''
          }`}
          aria-current={isNotificationsActive ? 'page' : undefined}
          aria-label="Notifications"
        >
          <FaBell className="mobile-bottom-nav__icon" aria-hidden="true" />
          <span>Alerts</span>
        </Link>

        {/* 5. Profile */}
        <Link
          to={ROUTES.CUSTOMER_PROFILE}
          className={`mobile-bottom-nav__item ${
            isProfileActive ? 'mobile-bottom-nav__item--active' : ''
          }`}
          aria-current={isProfileActive ? 'page' : undefined}
          aria-label="Profile"
        >
          <FaUser className="mobile-bottom-nav__icon" aria-hidden="true" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
