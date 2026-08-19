'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authService } from '@/services/auth.service';
import { getRoleHomePath } from '@/utils/authRedirect';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  supplierStatus: string | null;
  login: (email: string, password: string) => Promise<{ redirect: string; role: User['role'] }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [supplierStatus, setSupplierStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      authService.getProfile().then(setUser).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      });
    }
    setLoading(false);
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
    return { redirect: getRedirectPath(result.user, result.supplierStatus), role: result.user.role };
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const result = await authService.register(data);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setSupplierStatus(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
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
      logout();
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          router.replace(path);
        }, 50);
      });
    },
    [logout, router],
  );
}
