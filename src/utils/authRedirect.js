/** Post-login routing and auth path helpers */

import { notifyAuthSessionChanged } from './authEvents';
import { isAdminRole, normalizeUser } from './roles';

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export function getPostLoginPath(user = getStoredUser()) {
  return isAdminRole(user) ? '/admin' : '/dashboard';
}

export function getLoginPath() {
  const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
  return `${base}/login`;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  notifyAuthSessionChanged();
}

export function saveAuthSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(normalizeUser(user)));
  notifyAuthSessionChanged();
}
