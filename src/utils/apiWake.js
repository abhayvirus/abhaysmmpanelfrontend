import { API_BASE } from '../config/env';

async function pingOnce(timeoutMs) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => ctrl?.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/api/ping`, {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors',
      signal: ctrl?.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wake Hostinger Node app (cold start). Retries a few short pings.
 * Uses /api/ping (no DB) so it succeeds as soon as the process accepts HTTP.
 */
export async function wakeApi(timeoutMs = 6000) {
  const attempts = 3;
  const perTry = Math.max(1500, Math.floor(timeoutMs / attempts));
  for (let i = 0; i < attempts; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await pingOnce(perTry);
    if (ok) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/** While user is on login/signup, ping every 45s so Hostinger does not idle-stop the API. */
export function startApiKeepAlive(intervalMs = 45000) {
  void wakeApi(5000);
  const id = setInterval(() => {
    void wakeApi(5000);
  }, intervalMs);
  return () => clearInterval(id);
}
