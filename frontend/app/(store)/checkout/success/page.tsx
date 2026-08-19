'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/common/AuthGuard';
import LoadingState from '@/components/common/LoadingState';

function SuccessRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      router.replace(`/orders/${orderId}?placed=1`);
      return;
    }
    router.replace('/orders');
  }, [orderId, router]);

  return <LoadingState message="Taking you to your order..." />;
}

export default function CheckoutSuccessPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <Suspense fallback={<LoadingState message="Taking you to your order..." />}>
        <SuccessRedirect />
      </Suspense>
    </AuthGuard>
  );
}
