import api from './api';
import { UserRole } from '@/types';

export interface RoleWidgetConfig {
  url: string;
  token: string;
}

export const integrationService = {
  getWidget: (role?: UserRole) =>
    api
      .get<{ success: boolean; data: RoleWidgetConfig | null }>('/integration/widget', {
        params: role ? { role } : undefined,
      })
      .then((r) => r.data.data),
};
