import { NavLink } from "react-router-dom";
import { Form, InputGroup, Button } from "react-bootstrap";
import AppRoutes from "../routes/AppRoutes.jsx";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
  const navLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

  return (
    <div className={styles.appWrapper}>
      {/* Header */}
      <header className={styles.navbar}>
        <div className={styles.navbarLogo}>
          <span className={styles.logoIcon}>
            <i className="fa-solid fa-person-biking"></i>
          </span>
          <span className={styles.logoText}>Makook</span>
        </div>

        <div className={styles.searchWrapper}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fa-solid fa-magnifying-glass"></i>
            </InputGroup.Text>

            <Form.Control placeholder="Search..." aria-label="Search" />
          </InputGroup>
        </div>
        <NavLink to="/notifications">
          <Button
            variant="light"
            className="rounded-circle p-2"
            aria-label="Notifications"
          >
            <i className="fa-regular fa-bell"></i>
          </Button>
        </NavLink>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/my-orders" className={navLinkClass}>
              My Orders
            </NavLink>

            <NavLink to="/track-orders" className={navLinkClass}>
              Track
            </NavLink>

            <NavLink to="/notifications" className={navLinkClass}>
              Notifications
            </NavLink>

            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </nav>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
