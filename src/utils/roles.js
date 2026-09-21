/** Role helpers — DB may store admin/ADMIN/user/USER */

export function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

export function isAdminRole(roleOrUser) {
  if (roleOrUser && typeof roleOrUser === 'object') {
    return normalizeRole(roleOrUser.role) === 'admin';
  }
  return normalizeRole(roleOrUser) === 'admin';
}

/** Normalize user object before saving to localStorage */
export function normalizeUser(user) {
  if (!user || typeof user !== 'object') return user;
  const role = normalizeRole(user.role);
  return {
    ...user,
    role: role === 'admin' ? 'admin' : (role || 'user'),
  };
}
