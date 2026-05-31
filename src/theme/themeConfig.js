/** Global theme engine — defaults, presets, CSS variables, import/export */

export const DEFAULT_THEME = {
  theme_mode: 'dark',
  theme_primary: '#2563eb',
  theme_accent: '#0ea5e9',
  theme_button: '#2563eb',
  theme_bg: '#020617',
  theme_card: '#071226',
  theme_text: '#ffffff',
  theme_border: 'rgba(37, 99, 235, 0.25)',
  theme_success: '#22c55e',
  theme_warning: '#f59e0b',
  theme_danger: '#ef4444',
};

export const THEME_PRESETS = [
  {
    id: 'abhaysmm',
    name: 'ABHAYSMM Blue',
    swatch: ['#2563eb', '#0ea5e9'],
    theme_primary: '#2563eb',
    theme_accent: '#0ea5e9',
    theme_button: '#2563eb',
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    swatch: ['#f59e0b', '#fbbf24'],
    theme_primary: '#f59e0b',
    theme_accent: '#fbbf24',
    theme_button: '#f59e0b',
    theme_border: 'rgba(245, 158, 11, 0.35)',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    swatch: ['#10b981', '#34d399'],
    theme_primary: '#10b981',
    theme_accent: '#34d399',
    theme_button: '#10b981',
    theme_border: 'rgba(16, 185, 129, 0.3)',
  },
  {
    id: 'crimson',
    name: 'Crimson Red',
    swatch: ['#dc2626', '#ef4444'],
    theme_primary: '#dc2626',
    theme_accent: '#ef4444',
    theme_button: '#dc2626',
    theme_border: 'rgba(220, 38, 38, 0.3)',
  },
  {
    id: 'purple',
    name: 'Purple Luxury',
    swatch: ['#7c3aed', '#a855f7'],
    theme_primary: '#7c3aed',
    theme_accent: '#a855f7',
    theme_button: '#7c3aed',
    theme_border: 'rgba(124, 58, 237, 0.35)',
  },
  {
    id: 'neon',
    name: 'Neon Cyber',
    swatch: ['#00e5ff', '#00bcd4'],
    theme_primary: '#00e5ff',
    theme_accent: '#00bcd4',
    theme_button: '#00e5ff',
    theme_bg: '#030712',
    theme_card: '#0a1628',
    theme_text: '#e0f7fa',
    theme_border: 'rgba(0, 229, 255, 0.35)',
  },
  {
    id: 'orange',
    name: 'Orange Fire',
    swatch: ['#ea580c', '#fb923c'],
    theme_primary: '#ea580c',
    theme_accent: '#fb923c',
    theme_button: '#ea580c',
    theme_border: 'rgba(234, 88, 12, 0.35)',
  },
  {
    id: 'pink',
    name: 'Pink Premium',
    swatch: ['#db2777', '#ec4899'],
    theme_primary: '#db2777',
    theme_accent: '#ec4899',
    theme_button: '#db2777',
    theme_border: 'rgba(219, 39, 119, 0.35)',
  },
  {
    id: 'black-gold',
    name: 'Black Gold',
    swatch: ['#d4af37', '#f5c542'],
    theme_primary: '#d4af37',
    theme_accent: '#f5c542',
    theme_button: '#d4af37',
    theme_bg: '#0a0a0a',
    theme_card: '#141414',
    theme_text: '#faf5e6',
    theme_border: 'rgba(212, 175, 55, 0.35)',
  },
  {
    id: 'matrix',
    name: 'Dark Matrix',
    swatch: ['#22c55e', '#16a34a'],
    theme_primary: '#22c55e',
    theme_accent: '#16a34a',
    theme_button: '#22c55e',
    theme_bg: '#020617',
    theme_card: '#041208',
    theme_text: '#dcfce7',
    theme_border: 'rgba(34, 197, 94, 0.3)',
  },
];

const THEME_KEYS = Object.keys(DEFAULT_THEME);

export function mergeTheme(settings = {}) {
  const merged = { ...DEFAULT_THEME };
  THEME_KEYS.forEach((key) => {
    if (settings[key] != null && settings[key] !== '') merged[key] = settings[key];
  });
  return merged;
}

export function getResolvedThemeMode(settings = {}) {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return settings.theme_mode === 'light' ? 'light' : 'dark';
}

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function primaryGlow(primary, alpha = 0.35) {
  const rgb = hexToRgb(primary);
  if (!rgb) return `rgba(37, 99, 235, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Apply full theme to document root — drives entire site via CSS variables */
export function applyThemeVars(root, settings = {}) {
  if (!root) return;
  const t = mergeTheme(settings);
  const mode = getResolvedThemeMode(settings);

  const primary = t.theme_primary;
  const secondary = t.theme_accent;
  const button = t.theme_button || primary;
  const success = t.theme_success;
  const warning = t.theme_warning;
  const danger = t.theme_danger;

  const bg = t.theme_bg || (mode === 'light' ? '#f8fafc' : '#020617');
  const card = t.theme_card || (mode === 'light' ? '#ffffff' : '#071226');
  const text = t.theme_text || (mode === 'light' ? '#0f172a' : '#ffffff');
  const border = t.theme_border || (mode === 'light' ? '#e2e8f0' : primaryGlow(primary, 0.25));
  const muted = mode === 'light' ? '#64748b' : '#94a3b8';
  const hover = mode === 'light' ? '#f1f5f9' : '#1a2535';

  root.setAttribute('data-theme', mode);

  const vars = {
    '--primary': primary,
    '--primary-color': primary,
    '--accent': secondary,
    '--secondary-color': secondary,
    '--button-color': button,
    '--background-color': bg,
    '--card-color': card,
    '--text-color': text,
    '--border-color': border,
    '--success-color': success,
    '--warning-color': warning,
    '--danger-color': danger,
    '--bg': bg,
    '--bg-card': card,
    '--bg-elevated': card,
    '--bg-hover': hover,
    '--text': text,
    '--text-muted': muted,
    '--text-secondary': muted,
    '--border': border,
    '--success': success,
    '--warning': warning,
    '--danger': danger,
    '--gradient': `linear-gradient(135deg, ${button} 0%, ${secondary} 100%)`,
    '--primary-glow': primaryGlow(primary, mode === 'light' ? 0.18 : 0.35),
    '--table-row-hover': primaryGlow(primary, mode === 'light' ? 0.06 : 0.08),
    '--chrome-bg': mode === 'light' ? 'rgba(255,255,255,0.96)' : 'rgba(7, 18, 38, 0.96)',
    '--modal-overlay': mode === 'light' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.75)',
  };

  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', bg);
}

export function exportThemeJson(settings) {
  const payload = {
    name: 'ABHAYSMM Theme',
    version: 1,
    exportedAt: new Date().toISOString(),
    theme: mergeTheme(settings),
  };
  return JSON.stringify(payload, null, 2);
}

export function importThemeJson(text) {
  const data = JSON.parse(text);
  const theme = data.theme || data;
  return mergeTheme(theme);
}

export function downloadThemeFile(settings, filename = 'abhaysmm-theme.json') {
  const blob = new Blob([exportThemeJson(settings)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
