import { API_BASE } from '../config/env';

async function pingOnce(timeoutMs) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => ctrl?.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/api/ping`, {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors',
      credentials: 'omit',
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
 * Wake Hostinger Node app (cold start). Retries until timeout.
 * Uses /api/ping (no DB) so it succeeds as soon as the process accepts HTTP.
 */
export async function wakeApi(timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt += 1;
    const remaining = deadline - Date.now();
    const perTry = Math.min(5000, Math.max(2000, remaining));
    // eslint-disable-next-line no-await-in-loop
    const ok = await pingOnce(perTry);
    if (ok) return true;
    if (Date.now() >= deadline) break;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, Math.min(800, 200 * attempt)));
  }
  return false;
}

/** While user is on login/signup, ping so Hostinger does not idle-stop the API. */
export function startApiKeepAlive(intervalMs = 45000) {
  void wakeApi(12000);
  const id = setInterval(() => {
    void wakeApi(8000);
  }, intervalMs);
  return () => clearInterval(id);
}
