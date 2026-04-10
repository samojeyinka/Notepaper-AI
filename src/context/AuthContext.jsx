import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../api/authService';
import { userService } from '../api/userService';

const AuthContext = createContext(null);

const SESSION_USER_KEY  = 'np_session_user';

/** Read initial user from sessionStorage on first load */
function readSession() {
  try {
    const user = JSON.parse(sessionStorage.getItem(SESSION_USER_KEY) || 'null');
    return { user };
  } catch {
    return { user: null };
  }
}

/** Persist user to sessionStorage */
function writeSession(user) {
  try {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch (_) { /* storage quota — ignore */ }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_USER_KEY);
}

export function AuthProvider({ children }) {
  const initial = readSession();

  const [user, setUser] = useState(initial.user);
  const [isChecked, setIsChecked] = useState(false); // have we tried to hydrate?

  const isAuthenticated = !!user;

  // Attempt to hydrate on load: if cookie is valid, this gets the profile
  useEffect(() => {
    userService.getProfile()
      .then(res => {
        setUser(res.data);
        writeSession(res.data);
      })
      .catch(() => {
        setUser(null);
        clearSession();
      })
      .finally(() => setIsChecked(true));
  }, []);

  /** Called after a successful login or 2FA verification */
  const loginSuccess = useCallback((userData) => {
    setUser(userData);
    writeSession(userData);
  }, []);

  /**
   * Attempt login. Returns:
   *   { requires2fa: false }  — login complete, user in context
   *   { requires2fa: true, tempToken }  — redirect to 2FA page
   */
  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);

    if (res?.data?.requires_2fa) {
      return { requires2fa: true, tempToken: res.data.temp_token };
    }

    const { user: userData } = res.data;
    loginSuccess(userData);
    return { requires2fa: false };
  }, [loginSuccess]);

  /** Verify 2FA OTP and complete login */
  const verify2fa = useCallback(async (tempToken, otp) => {
    const res = await authService.verify2fa({ temp_token: tempToken, otp });
    const { user: userData } = res.data;
    loginSuccess(userData);
  }, [loginSuccess]);

  /** Update user details in context immediately (used after profile update API) */
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      writeSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (_) {
      // silent
    } finally {
      setUser(null);
      clearSession();
    }
  }, []);

  // Don't render until we verify session existence prevents flash of login screen 
  if (!isChecked) return null;

  const isAdmin = user?.roles?.some(r => ['admin', 'super-admin'].includes(r?.name ?? r)) ?? false;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, verify2fa, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
