/** Portal landing routes (e.g. /admin, /supplier) must not prefix-match child pages. */
function isPortalRoot(href: string): boolean {
  return href.split('/').filter(Boolean).length === 1;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (isPortalRoot(href)) return false;
  if (pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function getActiveNavItem<T extends { href: string }>(navItems: T[], pathname: string): T | undefined {
  return navItems
    .filter((item) => isNavItemActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
