/** Official ABHAYSMM Telegram channel — admin can override via settings.telegram_link */
export const DEFAULT_TELEGRAM_CHANNEL_URL = 'https://t.me/abhayd95';

/** Stable public DOM id for Telegram promo popup */
export const PUBLIC_TELEGRAM_POPUP_ID = 'public-telegram-popup';

export function normalizePathname(pathname = '/') {
  return String(pathname).replace(/\/$/, '') || '/';
}

export function isLandingPage(pathname) {
  return normalizePathname(pathname) === '/';
}

/** Sticky banner + floating FAB — landing page only, guests only */
export function shouldShowLandingTelegramWidgets(
  pathname,
  isLoggedIn = Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('token'))
) {
  return !isLoggedIn && isLandingPage(pathname);
}

export function resolveTelegramChannelUrl(settings = {}) {
  const url = String(settings.telegram_link || '').trim();
  if (url && url.startsWith('http')) return url;
  return DEFAULT_TELEGRAM_CHANNEL_URL;
}

export function shouldShowPublicTelegramBanner(pathname, isLoggedIn) {
  return shouldShowLandingTelegramWidgets(pathname, isLoggedIn);
}

export function shouldShowTelegramFloat(pathname, isLoggedIn) {
  return shouldShowLandingTelegramWidgets(pathname, isLoggedIn);
}
