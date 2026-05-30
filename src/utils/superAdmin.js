/** Must match backend helpers/superAdmin.js */
export const SUPER_ADMIN_EMAIL = 'at02032004@gmail.com';

export function isSuperAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

export function isCurrentUserSuperAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return isSuperAdminEmail(user.email);
  } catch {
    return false;
  }
}
