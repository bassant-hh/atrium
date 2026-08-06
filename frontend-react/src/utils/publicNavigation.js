import { getRole, removeRole } from './role';
import { getToken } from './auth';
import { ROUTES } from '../constants/routes';
import { goToRiderPortal } from './navigation';

export const handlePrimaryCTA = (navigate, isAuthenticated) => {
  const role = getRole();
  const token = getToken();
  const isAuth = isAuthenticated || !!token;

  // Scenario C: Authenticated User with Stored Role
  if (role && isAuth) {
    if (role === 'customer') {
      navigate(ROUTES.CUSTOMER_PROFILE);
    } else if (role === 'rider') {
      goToRiderPortal('/dashboard');
    }
    return;
  }

  // Scenario B & D: Unauthenticated User with Stored Role
  if (role === 'customer') {
    navigate(ROUTES.CUSTOMER_LOGIN);
    return;
  }
  if (role === 'rider') {
    goToRiderPortal('/login');
    return;
  }

  // Scenario A: First Visit (No Role) -> Intent = Register
  navigate(ROUTES.PORTAL, { state: { intent: 'register' } });
};

export const handleSecondaryCTA = (navigate) => {
  const role = getRole();
  if (!role) {
    // Scenario A: First visit secondary button = Login -> Intent = Login
    navigate(ROUTES.PORTAL, { state: { intent: 'login' } });
  } else {
    // Scenarios B, C, D: Secondary button = Change Account Type -> Neutral portal
    removeRole();
    navigate(ROUTES.PORTAL);
  }
};

export const getCTAButtonLabels = (isAuthenticated) => {
  const role = getRole();
  const token = getToken();
  const isAuth = isAuthenticated || !!token;

  if (!role) {
    return {
      primary: 'Register',
      secondary: 'Login',
      hasRole: false,
      isAuthenticated: false,
    };
  }

  if (isAuth) {
    return {
      primary: 'Continue',
      secondary: 'Change Account Type',
      hasRole: true,
      isAuthenticated: true,
    };
  }

  return {
    primary: 'Login',
    secondary: 'Change Account Type',
    hasRole: true,
    isAuthenticated: false,
  };
};
