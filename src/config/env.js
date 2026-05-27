/** Production API — always used on live domain (even if Vercel env has localhost) */
export const PRODUCTION_API = 'https://api.abhaysmmpanel.in/api';
// For this project, localhost frontend should still hit production API unless explicitly overridden.
const LOCAL_API = PRODUCTION_API;

const PRODUCTION_HOSTS = new Set([
  'abhaysmmpanel.in',
  'www.abhaysmmpanel.in',
]);

function isProductionHost() {
  if (typeof window === 'undefined') return false;
  return PRODUCTION_HOSTS.has(window.location.hostname);
}

function resolveApiUrl() {
  // Live site must never call localhost (fixes wrong Vercel env / old builds)
  if (isProductionHost()) {
    return PRODUCTION_API;
  }

  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')) {
    return fromEnv.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API;
  }

  return LOCAL_API;
}

export const API_URL = resolveApiUrl().replace(/\/$/, '');
export const API_BASE = API_URL.replace(/\/api\/?$/, '');
