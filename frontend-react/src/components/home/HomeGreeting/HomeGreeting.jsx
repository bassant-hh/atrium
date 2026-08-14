import React from 'react';
import { FaUser } from 'react-icons/fa';
import './HomeGreeting.css';

const getTimeBasedSalutation = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const HomeGreeting = ({ user }) => {
  const salutation = getTimeBasedSalutation();

  // Normalized user.firstName from AuthContext
  const firstName = user?.firstName?.trim();
  const initial = firstName ? firstName.charAt(0).toUpperCase() : null;

  return (
    <header className="home-greeting" aria-label="Customer Greeting">
      <div className="home-greeting__main">
        <span className="home-greeting__salutation">{salutation} 👋</span>
        <h1 className="home-greeting__name">{firstName || 'Welcome'}</h1>
        <p className="home-greeting__subtitle">What would you like to do today?</p>
      </div>

      <div className="home-greeting__avatar" aria-hidden="true">
        {initial ? initial : <FaUser style={{ fontSize: '0.9rem' }} />}
      </div>
    </header>
  );
};

export default HomeGreeting;
