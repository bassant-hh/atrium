import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.CUSTOMER_LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;
