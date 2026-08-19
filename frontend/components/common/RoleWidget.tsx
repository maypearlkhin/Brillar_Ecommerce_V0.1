'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { integrationService } from '@/services/integration.service';
import { UserRole } from '@/types';

const WIDGET_SCRIPT_ID = 'brillar-role-widget';

function getActiveWidgetRole(pathname: string, userRole?: UserRole | null): UserRole | null {
  if (!userRole) return null;

  if (pathname.startsWith('/admin')) {
    return userRole === 'admin' ? 'admin' : null;
  }
  if (pathname.startsWith('/supplier')) {
    return userRole === 'supplier' ? 'supplier' : null;
  }
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  return userRole === 'customer' ? 'customer' : null;
}

function normalizeScriptUrl(url: string): string {
  const trimmed = url.trim();
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch) return srcMatch[1];
  return trimmed;
}

function hideWidgetApis() {
  const w = window as Window & {
    $crisp?: { push: (args: unknown[]) => void };
    Tawk_API?: { hideWidget?: () => void };
    tidioChatApi?: { hide?: () => void };
    $chatwoot?: { toggle?: (state: string) => void };
  };

  try {
    w.$crisp?.push(['do', 'chat:hide']);
  } catch {
    /* ignore */
  }
  try {
    w.Tawk_API?.hideWidget?.();
  } catch {
    /* ignore */
  }
  try {
    w.tidioChatApi?.hide?.();
  } catch {
    /* ignore */
  }
  try {
    w.$chatwoot?.toggle?.('close');
  } catch {
    /* ignore */
  }
}

function teardownWidget() {
  hideWidgetApis();
  document.getElementById(WIDGET_SCRIPT_ID)?.remove();
}

export default function RoleWidget() {
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname() || '';

  const activeRole =
    !loading && isAuthenticated ? getActiveWidgetRole(pathname, user?.role) : null;

  useEffect(() => {
    let cancelled = false;
    let teardownTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleTeardown = () => {
      if (teardownTimer) clearTimeout(teardownTimer);
      teardownTimer = window.setTimeout(() => {
        teardownTimer = null;
        if (!cancelled) teardownWidget();
      }, 0);
    };

    if (!activeRole) {
      scheduleTeardown();
      return () => {
        cancelled = true;
        if (teardownTimer) clearTimeout(teardownTimer);
        scheduleTeardown();
      };
    }

    const loadWidget = async () => {
      try {
        const config = await integrationService.getWidget(activeRole);
        if (cancelled) return;

        teardownWidget();

        if (!config?.url || !config?.token) return;

        const script = document.createElement('script');
        script.id = WIDGET_SCRIPT_ID;
        script.src = normalizeScriptUrl(config.url);
        script.async = true;
        script.setAttribute('data-access-token', config.token);
        script.setAttribute('data-token', config.token);
        script.setAttribute('data-widget-role', activeRole);
        document.body.appendChild(script);
      } catch {
        if (!cancelled) scheduleTeardown();
      }
    };

    loadWidget();

    return () => {
      cancelled = true;
      if (teardownTimer) clearTimeout(teardownTimer);
      scheduleTeardown();
    };
  }, [activeRole]);

  return null;
}
