import { ROUTES } from '../../constants/routes';
import { goToRiderPortal } from '../../utils/navigation';

export const goCustomerLogin = (navigate, options = {}) => {
  navigate(ROUTES.CUSTOMER_LOGIN, options);
};

export const goCustomerRegister = (navigate, options = {}) => {
  navigate(ROUTES.CUSTOMER_REGISTER, options);
};

export const goRiderLogin = () => {
  goToRiderPortal('/login');
};

export const goRiderRegister = () => {
  goToRiderPortal('/register');
};

export const goDashboard = (navigate, role) => {
  if (role === 'customer') {
    navigate(ROUTES.CUSTOMER_PROFILE);
  } else if (role === 'rider') {
    goToRiderPortal('/dashboard');
  }
};

export const goPortal = (navigate, options = {}) => {
  navigate(ROUTES.PORTAL, options);
};
