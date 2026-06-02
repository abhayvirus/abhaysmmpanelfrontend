/** Built-in admin sidebar items — id is used to hide/show from Settings → Admin Menu */
export const DEFAULT_ADMIN_NAV_LINKS = [
  { id: 'dashboard', to: '/admin', label: 'Dashboard', icon: '📊', builtin: true },
  { id: 'users', to: '/admin/users', label: 'Users', icon: '👥', builtin: true },
  { id: 'services', to: '/admin/services', label: 'Services', icon: '📋', builtin: true },
  { id: 'categories', to: '/admin/categories', label: 'Categories', icon: '🏷️', builtin: true },
  { id: 'orders', to: '/admin/orders', label: 'Orders', icon: '📦', builtin: true },
  { id: 'website-dev', to: '/admin/website-dev', label: 'Website Orders', icon: '🌐', builtin: true },
  { id: 'funds', to: '/admin/funds', label: 'Payments', icon: '💰', builtin: true },
  { id: 'tickets', to: '/admin/tickets', label: 'Tickets', icon: '🎫', builtin: true },
  { id: 'announcements', to: '/admin/announcements', label: 'Announcements', icon: '📢', builtin: true },
  { id: 'child-panels', to: '/admin/child-panels', label: 'Child Panels', icon: '🖥️', builtin: true },
  { id: 'analytics', to: '/admin/analytics', label: 'Analytics', icon: '📈', builtin: true },
  { id: 'coupons', to: '/admin/coupons', label: 'Coupons', icon: '🎫', builtin: true },
  { id: 'chat', to: '/admin/chat', label: 'Support Inbox', icon: '💬', builtin: true },
  { id: 'activity-logs', to: '/admin/activity-logs', label: 'Activity Logs', icon: '📜', builtin: true },
  { id: 'settings', to: '/admin/settings', label: 'Settings', icon: '⚙️', builtin: true },
  { id: 'help', to: '/admin/help', label: 'Help Guide', icon: '📖', builtin: true },
];

/** Paths you can pick when adding a custom link to an existing admin page */
export const ADMIN_ROUTE_PRESETS = DEFAULT_ADMIN_NAV_LINKS.map((l) => ({
  value: l.to,
  label: l.label,
}));
