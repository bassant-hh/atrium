const TOKEN_KEY = 'makook_token';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const saveToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const logout = () => {
  removeToken();
};

export const isAuthenticated = () => {
  return !!getToken();
};
