/** User-friendly API error message — never redirect on network/CORS failures */
export function getApiErrorMessage(err, fallback = 'Request failed') {
  if (!err) return fallback;

  if (!err.response) {
    if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
      return 'Request cancelled. Please try again.';
    }
    if (err.message?.includes('Network Error')) {
      return 'Cannot reach the API right now (server waking up or timed out). Wait 15 seconds and try again.';
    }
    if (err.code === 'ECONNABORTED') {
      return 'API timed out. Server may be waking up — wait 15 seconds and try again.';
    }
    return err.message || fallback;
  }

  const status = err.response.status;
  if (status === 504 || status === 502) {
    return 'Server gateway timeout. Please wait 15 seconds and try again.';
  }

  const data = err.response.data;
  if (typeof data === 'string' && data && !data.startsWith('<')) return data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]) return data.errors[0];

  if (status === 503) {
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
