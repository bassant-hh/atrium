import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading authentication...
      </div>
    );
  }

  if (isAuthenticated) {
    const from = location.state?.from || ROUTES.CUSTOMER_PROFILE;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;
