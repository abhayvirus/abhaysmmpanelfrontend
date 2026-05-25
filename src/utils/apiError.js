/** User-friendly API error message — never redirect on network/CORS failures */
export function getApiErrorMessage(err, fallback = 'Request failed') {
  if (!err) return fallback;

  if (!err.response) {
    if (err.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (err.message?.includes('Network Error')) {
      return 'Cannot reach API server. Check CORS on Render or your internet connection.';
    }
    return err.message || fallback;
  }

  const data = err.response.data;
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]) return data.errors[0];

  return fallback;
}

export function isAuthPublicRequest(config) {
  const url = config?.url || '';
  const paths = [
    '/auth/login',
    '/auth/signup',
    '/auth/google',
    '/auth/firebase',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/config',
    '/settings/public',
    '/public/',
  ];
  return paths.some((p) => url.includes(p));
}
