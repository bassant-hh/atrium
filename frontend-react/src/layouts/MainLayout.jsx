import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ROUTES } from '../constants/routes.js';
import HeaderDestinationSearch from '../components/navigation/HeaderDestinationSearch/HeaderDestinationSearch.jsx';
import MobileBottomNavigation from '../components/navigation/MobileBottomNavigation/MobileBottomNavigation.jsx';
import styles from './MainLayout.module.css';

const MainLayout = () => {
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

        <NavLink to={ROUTES.NOTIFICATIONS}>
          <Button variant="light" className="rounded-circle p-2" aria-label="Notifications">
            <i className="fa-regular fa-bell"></i>
          </Button>
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
