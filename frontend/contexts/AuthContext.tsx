'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authService } from '@/services/auth.service';
import { getRoleHomePath } from '@/utils/authRedirect';
import { sendLoginEvent } from '@/utils/atenxionLogin';
import { sendLogoutEvent } from '@/utils/atenxionLogout';

const AUTH_STATE_CHANGED_EVENT = 'brillar:auth-state-changed';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  supplierStatus: string | null;
  login: (email: string, password: string) => Promise<{ redirect: string; role: User['role'] }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function emitAuthStateChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [supplierStatus, setSupplierStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthState = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      setToken(null);
      setUser(null);
      setSupplierStatus(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      setToken(storedToken);
      setUser(parsedUser);
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setToken(null);
      setUser(null);
      setSupplierStatus(null);
    }
  }, []);

  useEffect(() => {
    void refreshAuthState().finally(() => {
      setLoading(false);
    });
  }, [refreshAuthState]);

  useEffect(() => {
    const syncAuthState = () => {
      void refreshAuthState();
    };

    window.addEventListener('storage', syncAuthState);
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthState);
    };
  }, []);

  const getRedirectPath = (u: User, status?: string | null): string => {
    if (u.role === 'admin' || u.role === 'supplier') return getRoleHomePath(u.role);
    if (status === 'pending' || status === 'more_info_requested' || status === 'rejected') {
      return '/become-a-supplier';
    }
    return '/';
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setToken(result.token);
    setSupplierStatus(result.supplierStatus || null);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    emitAuthStateChanged();
    void sendLoginEvent();
    return { redirect: getRedirectPath(result.user, result.supplierStatus), role: result.user.role };
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const result = await authService.register(data);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    emitAuthStateChanged();
    void sendLoginEvent();
  };

  const logout = useCallback(async () => {
    await sendLogoutEvent();
    setUser(null);
    setToken(null);
    setSupplierStatus(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    emitAuthStateChanged();
  }, []);

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    emitAuthStateChanged();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        supplierStatus,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

/** Clears auth state, waits for React/widget teardown, then navigates. */
export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  return useCallback(
    (path = '/') => {
      void (async () => {
        await logout();
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            router.replace(path);
          }, 50);
        });
      })();
    },
    [logout, router],
  );
}
