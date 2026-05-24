/** Register service worker when PWA is enabled in admin settings */
export function registerServiceWorker(enabled) {
  if (!enabled || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

export function updateManifestMeta(settings) {
  const name = settings.site_name || 'SMM Panel';
  document.title = name;
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement('meta');
    themeMeta.name = 'theme-color';
    document.head.appendChild(themeMeta);
  }
  themeMeta.content = settings.theme_primary || '#6366f1';
}
