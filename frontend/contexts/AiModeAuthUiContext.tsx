'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getErrorMessage } from '@/services/api';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '@/utils/email';

export type AiModeAuthMode = 'login' | 'signup';

type AiModeAuthUiContextValue = {
  setAuthMode: (mode: AiModeAuthMode) => void;
  authMode: AiModeAuthMode;
  submitLogin: (email: string, password: string) => Promise<void>;
  submitSignup: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  loginError: string;
  signupError: string;
  submitting: boolean;
};

const AiModeAuthUiContext = createContext<AiModeAuthUiContextValue | undefined>(undefined);

export function AiModeAuthUiProvider({ children }: { children: ReactNode }) {
  const { login, register } = useAuth();
  const { refreshCart } = useCart();
  const [authMode, setAuthMode] = useState<AiModeAuthMode>('login');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitLogin = useCallback(
    async (email: string, password: string) => {
      if (!isAllowedCustomerSupplierEmail(email)) {
        setLoginError(ALLOWED_EMAIL_DOMAINS_MESSAGE);
        return;
      }

      try {
        setSubmitting(true);
        setLoginError('');
        await login(email, password);
        await refreshCart();
      } catch (err) {
        setLoginError(getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
    [login, refreshCart],
  );

  const submitSignup = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      if (!isAllowedCustomerSupplierEmail(data.email)) {
        setSignupError(ALLOWED_EMAIL_DOMAINS_MESSAGE);
        return;
      }

      try {
        setSubmitting(true);
        setSignupError('');
        await register(data);
        await refreshCart();
      } catch (err) {
        setSignupError(getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
    [refreshCart, register],
  );

  const value = useMemo(
    () => ({
      authMode,
      setAuthMode,
      submitLogin,
      submitSignup,
      loginError,
      signupError,
      submitting,
    }),
    [authMode, submitLogin, submitSignup, loginError, signupError, submitting],
  );

  return (
    <AiModeAuthUiContext.Provider value={value}>{children}</AiModeAuthUiContext.Provider>
  );
}

export function useAiModeAuthUi() {
  const context = useContext(AiModeAuthUiContext);
  if (!context) {
    throw new Error('useAiModeAuthUi must be used within AiModeAuthUiProvider');
  }
  return context;
}
