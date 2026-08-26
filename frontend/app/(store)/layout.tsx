import StoreRouteGuard from '@/components/storefront/StoreRouteGuard';
import StoreChrome from '@/components/storefront/StoreChrome';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreRouteGuard>
      <StoreChrome>{children}</StoreChrome>
    </StoreRouteGuard>
  );
}
