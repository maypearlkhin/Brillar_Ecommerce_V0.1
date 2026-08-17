'use client';

import AuthGuard from '@/components/common/AuthGuard';
import PortalLayout from '@/components/common/PortalLayout';
import { supplierNavItems } from '@/components/supplier/supplierNav';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard roles={['supplier']}>
      <PortalLayout
        title="Supplier Dashboard"
        portalName="Supplier Dashboard"
        portalSubtitle="Manage your store"
        roleLabel="Supplier"
        navItems={supplierNavItems}
      >
        {children}
      </PortalLayout>
    </AuthGuard>
  );
}
