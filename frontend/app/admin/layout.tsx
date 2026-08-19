'use client';

import AuthGuard from '@/components/common/AuthGuard';
import PortalLayout from '@/components/common/PortalLayout';
import { adminNavItems } from '@/components/admin/adminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard roles={['admin']}>
      <PortalLayout
        title="Admin"
        portalName="Brillar Market Admin"
        portalSubtitle="Operations Console"
        roleLabel="Administrator"
        hideHeader
        navItems={adminNavItems}
      >
        {children}
      </PortalLayout>
    </AuthGuard>
  );
}
