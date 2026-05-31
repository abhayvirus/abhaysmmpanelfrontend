/** Official ABHAYSMM Telegram channel — admin can override via settings.telegram_link */
export const DEFAULT_TELEGRAM_CHANNEL_URL = 'https://t.me/abhayd95';

export const PUBLIC_GUEST_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export function resolveTelegramChannelUrl(settings = {}) {
  const url = String(settings.telegram_link || '').trim();
  if (url && url.startsWith('http')) return url;
  return DEFAULT_TELEGRAM_CHANNEL_URL;
}

export function shouldShowPublicTelegramBanner(pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  return PUBLIC_GUEST_PATHS.includes(path) && !localStorage.getItem('token');
}
