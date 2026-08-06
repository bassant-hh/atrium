const ROLE_KEY = 'makook_role';

export const getRole = () => {
  return localStorage.getItem(ROLE_KEY);
};

export const saveRole = (role) => {
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  }
};

export const removeRole = () => {
  localStorage.removeItem(ROLE_KEY);
};

export const isCustomer = () => {
  return getRole() === 'customer';
};

export const isRider = () => {
  return getRole() === 'rider';
};
