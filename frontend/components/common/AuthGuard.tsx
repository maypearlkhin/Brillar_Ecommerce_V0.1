'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/common/LoadingState';
import { UserRole } from '@/types';
import { getRoleHomePath } from '@/utils/authRedirect';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

export default function AuthGuard({ children, roles, redirectTo = '/login' }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else if (roles && user && !roles.includes(user.role)) {
        router.replace(getRoleHomePath(user.role));
      }
    }
  }, [loading, isAuthenticated, user, roles, router, redirectTo]);

  if (loading) return <LoadingState />;
  if (!isAuthenticated) return <LoadingState />;
  if (roles && user && !roles.includes(user.role)) return <LoadingState />;

  return <>{children}</>;
}
