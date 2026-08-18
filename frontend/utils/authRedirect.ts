import { UserRole } from '@/types';

export function getRoleHomePath(role: UserRole): string {
  if (role === 'admin') return '/admin';
  if (role === 'supplier') return '/supplier';
  return '/';
}
