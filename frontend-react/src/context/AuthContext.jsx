import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { getToken, saveToken, removeToken } from '../utils/auth';
import { getCustomerProfile } from '../services/auth.service';

const AuthContext = createContext(null);

const logError = (...args) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};

const normalizeUser = (userData) => {
  if (!userData) return null;
  const raw = userData.customer || userData.user || userData;
  return {
    id: raw.id || raw._id || '',
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    ...raw,
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const logout = useCallback(() => {
    removeToken();
    if (isMountedRef.current) {
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return null;
    try {
      const profile = await getCustomerProfile();
      const normalized = normalizeUser(profile);
      if (isMountedRef.current) {
        setUser(normalized);
      }
      return normalized;
    } catch (error) {
      logError('Refresh user failed:', error);
      removeToken();
      if (isMountedRef.current) {
        setToken(null);
        setUser(null);
      }
      return null;
    }
  }, []);

  const login = useCallback(
    async (newToken, userData) => {
      if (newToken) {
        saveToken(newToken);
        if (isMountedRef.current) {
          setToken(newToken);
        }
      }

      if (userData) {
        if (isMountedRef.current) {
          setUser(normalizeUser(userData));
        }
      } else if (newToken) {
        await refreshUser();
      }
    },
    [refreshUser],
  );

  const restoreSession = useCallback(async () => {
    const existingToken = getToken();

    if (!existingToken) {
      if (isMountedRef.current) {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
      return;
    }

    try {
      if (isMountedRef.current) setLoading(true);
      const profile = await getCustomerProfile();
      if (isMountedRef.current) {
        setUser(normalizeUser(profile));
        setToken(existingToken);
      }
    } catch (error) {
      logError('Session restoration failed:', error);
      removeToken();
      if (isMountedRef.current) {
        setToken(null);
        setUser(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
