import { API_BASE } from '../config/env';

/** Hostinger may sleep the Node app; ping health to wake it before login/register. */
export async function wakeApi(timeoutMs = 8000) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => ctrl?.abort(), timeoutMs);
  try {
    await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors',
      signal: ctrl?.signal,
    });
  } catch {
    /* ignore — login will retry */
  } finally {
    clearTimeout(timer);
  }
}
