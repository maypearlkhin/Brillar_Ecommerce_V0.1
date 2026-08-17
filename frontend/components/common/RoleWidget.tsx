'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { integrationService } from '@/services/integration.service';
import { UserRole } from '@/types';

const WIDGET_SCRIPT_ID = 'brillar-role-widget';
const WIDGET_MARK_ATTR = 'data-brillar-role-widget';

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

function isWidgetArtifact(el: Element): boolean {
  if (el.id === WIDGET_SCRIPT_ID) return false;

  const id = el.id || '';
  const className = typeof (el as HTMLElement).className === 'string' ? (el as HTMLElement).className : '';
  if (/chat|widget|tawk|crisp|tidio|intercom|hubspot|botpress|woot|launcher|bubble/i.test(`${id} ${className}`)) {
    return true;
  }

  if (el.tagName === 'IFRAME') return true;

  if (el instanceof HTMLElement) {
    const computed = window.getComputedStyle(el);
    const zIndex = parseInt(computed.zIndex || '0', 10);
    if (computed.position === 'fixed' && zIndex >= 9999) return true;
  }

  return false;
}

function teardownWidget(tracked: Set<Element>) {
  document.getElementById(WIDGET_SCRIPT_ID)?.remove();

  const candidates = new Set<Element>(tracked);
  [document.body, document.documentElement].forEach((root) => {
    Array.from(root.children).forEach((el) => {
      if (isWidgetArtifact(el)) candidates.add(el);
    });
  });
  document.querySelectorAll(`[${WIDGET_MARK_ATTR}="true"]`).forEach((el) => candidates.add(el));

  candidates.forEach((el) => {
    try {
      el.remove();
    } catch {
      /* ignore */
    }
  });
  tracked.clear();

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

export default function RoleWidget() {
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname() || '';
  const trackedRef = useRef<Set<Element>>(new Set());

  const activeRole =
    !loading && isAuthenticated ? getActiveWidgetRole(pathname, user?.role) : null;

  useEffect(() => {
    const tracked = trackedRef.current;
    teardownWidget(tracked);

    if (!activeRole) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;

    const loadWidget = async () => {
      try {
        const config = await integrationService.getWidget(activeRole);
        if (cancelled || !config?.url || !config?.token) {
          teardownWidget(tracked);
          return;
        }

        observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
              if (!(node instanceof Element)) return;
              if (node.id === WIDGET_SCRIPT_ID) return;
              const className = typeof (node as HTMLElement).className === 'string' ? (node as HTMLElement).className : '';
              if (className.includes('Mui')) return;
              node.setAttribute(WIDGET_MARK_ATTR, 'true');
              tracked.add(node);
            });
          }
        });
        observer.observe(document.body, { childList: true });
        observer.observe(document.documentElement, { childList: true });

        const script = document.createElement('script');
        script.id = WIDGET_SCRIPT_ID;
        script.src = normalizeScriptUrl(config.url);
        script.async = true;
        script.setAttribute('data-access-token', config.token);
        script.setAttribute('data-token', config.token);
        script.setAttribute('data-widget-role', activeRole);
        document.body.appendChild(script);
      } catch {
        if (!cancelled) teardownWidget(tracked);
      }
    };

    loadWidget();

    return () => {
      cancelled = true;
      observer?.disconnect();
      teardownWidget(tracked);
    };
  }, [activeRole]);

  return null;
}
