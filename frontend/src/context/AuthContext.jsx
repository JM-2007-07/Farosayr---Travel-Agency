import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

// status: 'loading' (checking /auth/me on first load) | 'authenticated' | 'guest'
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch {
      // A 401 here just means "no valid session" — the expected, common
      // case on first load for a logged-out visitor, not an error to
      // surface anywhere. Any other failure (network down, 500) also just
      // leaves the UI in the logged-out state, since there's no session to
      // trust either way — deliberately no console logging here, per the
      // no-debug-logging rule.
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    setStatus('authenticated');
    return loggedInUser;
  }, []);

  const register = useCallback(async (data) => {
    const newUser = await authService.register(data);
    setUser(newUser);
    setStatus('authenticated');
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Clear local state even if the network call fails — the visible
      // "am I logged in" state shouldn't get stuck because of a transient
      // network error; worst case, the cookie clears next successful call.
      setUser(null);
      setStatus('guest');
    }
  }, []);

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
