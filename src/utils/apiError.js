/** User-friendly API error message — never redirect on network/CORS failures */
export function getApiErrorMessage(err, fallback = 'Request failed') {
  if (!err) return fallback;

  if (!err.response) {
    if (err.message?.includes('Network Error')) {
      return 'Cannot reach the API right now. The server may be restarting — please wait a moment and try again.';
    }
    if (err.code === 'ECONNABORTED') {
      return 'API is taking too long (server may be waking up). Wait 10 seconds and try again.';
    }
    return err.message || fallback;
  }

  const data = err.response.data;
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]) return data.errors[0];

  if (err.response.status === 503) {
    return data?.message || 'Service temporarily unavailable. Please try again.';
  }

  return fallback;
}

export function isAuthPublicRequest(config) {
  const url = config?.url || '';
  const paths = [
    '/auth/login',
    '/auth/signup',
    '/auth/signup/send-otp',
    '/auth/signup/verify-otp',
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
