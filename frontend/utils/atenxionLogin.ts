'use client';

import { User } from '@/types';
import { integrationService } from '@/services/integration.service';

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const sendLoginEvent = async (): Promise<void> => {
  try {
    const user = getStoredUser();
    if (!user?.id) return;

    await integrationService.notifyLogin(user.id);
  } catch (e) {
    console.log('Failed calling api to Atenxion Backend for user login', e);
  }
};
