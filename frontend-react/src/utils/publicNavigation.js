import { getRole, removeRole } from './role';
import { getToken } from './auth';
import { ROUTES } from '../constants/routes';
import { goToRiderPortal } from './navigation';

export const handlePrimaryCTA = (navigate, authInfo) => {
  const role = getRole();
  const currentToken = authInfo?.token || getToken();
  const isAuthenticated = Boolean(authInfo?.isAuthenticated && authInfo?.user && currentToken);

  // Scenario 3: Authenticated User with Valid Session
  if (isAuthenticated && role) {
    if (role === 'customer') {
      navigate(ROUTES.CUSTOMER_PROFILE);
    } else if (role === 'rider') {
      goToRiderPortal('/dashboard');
    }
    return;
  }

  // Scenario 2: Unauthenticated Returning User with Stored Role Preference
  if (role === 'customer') {
    navigate(ROUTES.CUSTOMER_LOGIN);
    return;
  }
  if (role === 'rider') {
    goToRiderPortal('/login');
    return;
  }

  // Scenario 1: First Visit (No Role) -> Navigate to Portal with Register Intent
  navigate(ROUTES.PORTAL, { state: { intent: 'register' } });
};

export const handleSecondaryCTA = (navigate, authInfo, onShowSwitchDialog) => {
  const role = getRole();
  const currentToken = authInfo?.token || getToken();
  const isAuthenticated = Boolean(authInfo?.isAuthenticated && authInfo?.user && currentToken);

  if (!role) {
    // Scenario 1: First Visit Secondary Button = Login
    navigate(ROUTES.PORTAL, { state: { intent: 'login' } });
  } else if (isAuthenticated) {
    // Scenario 3: Authenticated User Secondary Button = Switch account -> Open Confirmation Dialog
    if (typeof onShowSwitchDialog === 'function') {
      onShowSwitchDialog();
    } else {
      removeRole();
      navigate(ROUTES.PORTAL, { replace: true, state: null });
    }
  } else {
    // Scenario 2: Unauthenticated Returning User = Use another account -> Neutral Portal (Clear State)
    removeRole();
    navigate(ROUTES.PORTAL, { replace: true, state: null });
  }
};

export const getCTAButtonLabels = (authInfo) => {
  const role = getRole();
  const currentToken = authInfo?.token || getToken();
  const isAuthenticated = Boolean(authInfo?.isAuthenticated && authInfo?.user && currentToken);

  if (!role) {
    return {
      primary: 'Register',
      secondary: 'Login',
      hasRole: false,
      isAuthenticated: false,
    };
  }

  if (isAuthenticated) {
    return {
      primary: 'Continue to Dashboard',
      secondary: 'Switch account',
      hasRole: true,
      isAuthenticated: true,
    };
  }

  return {
    primary: 'Login',
    secondary: 'Use another account',
    hasRole: true,
    isAuthenticated: false,
  };
};
