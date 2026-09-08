'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/common/LoadingState';
import { getRoleHomePath } from '@/utils/authRedirect';

/** Keeps suppliers (and admins) out of the customer storefront. */
export default function StoreRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const isAiMode = pathname === '/ai-mode';

  const blocked =
    isAuthenticated && user && (user.role === 'supplier' || user.role === 'admin');

  useEffect(() => {
    if (!loading && blocked && user) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [loading, blocked, user, router]);

  if (blocked) return <LoadingState />;

  // AI mode uses its own full-screen entry loader — avoid the generic spinner first.
  if (loading && !isAiMode) return <LoadingState />;

  return <>{children}</>;
}
