import { DEFAULT_ADMIN_NAV_LINKS } from '../config/adminNav';

export function parseAdminNavJson(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeCustomItem(raw, index) {
  const path = String(raw?.path || raw?.to || '').trim();
  const label = String(raw?.label || 'Custom link').trim() || 'Custom link';
  const external = raw?.external === true
    || raw?.external === 'true'
    || /^https?:\/\//i.test(path);
  const id = String(raw?.id || `custom-${index}-${label}`).replace(/\s+/g, '-').toLowerCase();
  if (!path) return null;
  return {
    id,
    to: path,
    label,
    icon: String(raw?.icon || '🔗').trim() || '🔗',
    external,
    openInNewTab: raw?.openInNewTab !== false && raw?.openInNewTab !== 'false',
    builtin: false,
    custom: true,
  };
}

/**
 * Merge built-in admin nav with custom links from settings.
 * @param {{ admin_sidebar_hidden?: string[]|string, admin_sidebar_custom?: object[]|string }} settings
 */
export function buildAdminNavLinks(settings = {}) {
  const hidden = new Set(parseAdminNavJson(settings.admin_sidebar_hidden).map(String));
  const customRaw = parseAdminNavJson(settings.admin_sidebar_custom);

  const builtins = DEFAULT_ADMIN_NAV_LINKS.filter((l) => !hidden.has(l.id));
  const customs = customRaw
    .map((item, i) => normalizeCustomItem(item, i))
    .filter(Boolean)
    .filter((l) => l.enabled !== false && l.enabled !== 'false');

  return [...builtins, ...customs];
}
