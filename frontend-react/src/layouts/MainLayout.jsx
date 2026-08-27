import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { useNotification } from '../context/NotificationContext.jsx';
import HeaderDestinationSearch from '../components/navigation/HeaderDestinationSearch/HeaderDestinationSearch.jsx';
import MobileBottomNavigation from '../components/navigation/MobileBottomNavigation/MobileBottomNavigation.jsx';
import styles from './MainLayout.module.css';

const formatBadgeCount = (count) => {
  if (!count || count <= 0) return null;
  if (count > 99) return '99+';
  return String(count);
};

const MainLayout = () => {
  const { unreadCount } = useNotification();

  const navLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  return (
    <div className={styles.appWrapper}>
      {/* Top Navbar Header */}
      <header className={styles.navbar}>
        <div className={styles.navbarLogo}>
          <span className={styles.logoIcon}>
            <i className="fa-solid fa-person-biking"></i>
          </span>
          <span className={styles.logoText}>Makook</span>
        </div>

        {/* Destination Search (Header Position) */}
        <div className={styles.searchWrapper}>
          <HeaderDestinationSearch />
        </div>

        {/* Notification Bell Button with Numeric Badge */}
        <NavLink
          to={ROUTES.NOTIFICATIONS}
          className={({ isActive }) =>
            `btn btn-light rounded-circle p-2 ${styles.bellWrapper} ${isActive ? styles.navLinkActive : ''}`
          }
          aria-label="Notifications"
        >
          <i className="fa-regular fa-bell"></i>
          {unreadCount > 0 && (
            <span className={styles.bellBadge}>{formatBadgeCount(unreadCount)}</span>
          )}
        </NavLink>
      </header>

      <div className={styles.body}>
        {/* Desktop Sidebar (hidden on mobile via media query) */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <NavLink to={ROUTES.HOME} className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to={ROUTES.MY_ORDERS} className={navLinkClass}>
              My Orders
            </NavLink>

            <NavLink to={ROUTES.NOTIFICATIONS} className={navLinkClass}>
              Notifications
            </NavLink>

            <NavLink to={ROUTES.CUSTOMER_PROFILE} className={navLinkClass}>
              Profile
            </NavLink>
          </nav>
        </aside>

        {/* Main Page Content */}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation Bar (visible on mobile only) */}
      <MobileBottomNavigation />
    </div>
  );
};

export default MainLayout;
