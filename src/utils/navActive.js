/** Sidebar / bottom-nav active route matching */

export function isNavActive(pathname, to) {
  if (to === '/dashboard' || to === '/admin') {
    return pathname === to;
  }
  if (to === '/tickets') {
    return pathname === '/tickets' || pathname.startsWith('/tickets/');
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
