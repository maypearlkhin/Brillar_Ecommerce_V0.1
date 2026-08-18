'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/common/LoadingState';
import { getRoleHomePath } from '@/utils/authRedirect';

/** Keeps suppliers (and admins) out of the customer storefront. */
export default function StoreRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const blocked =
    isAuthenticated && user && (user.role === 'supplier' || user.role === 'admin');

  useEffect(() => {
    if (!loading && blocked && user) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [loading, blocked, user, router]);

  if (loading || blocked) return <LoadingState />;

  return <>{children}</>;
}
