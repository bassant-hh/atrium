import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRole, removeRole } from '../utils/role';
import { getToken } from '../utils/auth';
import {
  goCustomerLogin,
  goRiderLogin,
  goDashboard,
  goPortal,
} from '../services/navigation/publicPortal.service';

export const usePublicAuthNavigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated: authState, user, token, logout } = useAuth();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const role = getRole();
  const currentToken = token || getToken();
  const isAuthenticated = Boolean(authState && user && currentToken);

  // Memoize decision matrix labels
  const labels = useMemo(() => {
    if (!role) {
      return {
        primaryLabel: 'Register',
        secondaryLabel: 'Login',
        hasRole: false,
      };
    }

    if (isAuthenticated) {
      return {
        primaryLabel: 'Continue to Dashboard',
        secondaryLabel: 'Switch account',
        hasRole: true,
      };
    }

    return {
      primaryLabel: 'Login',
      secondaryLabel: 'Use another account',
      hasRole: true,
    };
  }, [role, isAuthenticated]);

  // Primary CTA click decision callback
  const onPrimaryClick = useCallback(() => {
    // Scenario 3: Authenticated User -> Go to Dashboard
    if (isAuthenticated && role) {
      goDashboard(navigate, role);
      return;
    }

    // Scenario 2: Unauthenticated Returning User -> Go to Saved Role Login
    if (role === 'customer') {
      goCustomerLogin(navigate);
      return;
    }
    if (role === 'rider') {
      goRiderLogin();
      return;
    }

    // Scenario 1: First Visit (No Role) -> Go to Portal with Register Intent
    goPortal(navigate, { state: { intent: 'register' } });
  }, [navigate, isAuthenticated, role]);

  // Secondary CTA click decision callback
  const onSecondaryClick = useCallback(() => {
    if (!role) {
      // First Visit: Secondary = Login -> Go to Portal with Login Intent
      goPortal(navigate, { state: { intent: 'login' } });
    } else if (isAuthenticated) {
      // Authenticated User: Secondary = Switch account -> Open Confirmation Dialog
      setShowSwitchModal(true);
    } else {
      // Returning User: Secondary = Use another account -> Neutral Portal
      removeRole();
      goPortal(navigate, { replace: true, state: null });
    }
  }, [navigate, role, isAuthenticated]);

  const closeSwitchModal = useCallback(() => {
    setShowSwitchModal(false);
  }, []);

  const confirmSwitchAccount = useCallback(() => {
    setShowSwitchModal(false);
    logout();
    removeRole();
    goPortal(navigate, { replace: true, state: null });
  }, [navigate, logout]);

  return {
    primaryLabel: labels.primaryLabel,
    secondaryLabel: labels.secondaryLabel,
    onPrimaryClick,
    onSecondaryClick,
    isAuthenticated,
    role,
    showSwitchModal,
    closeSwitchModal,
    confirmSwitchAccount,
  };
};
