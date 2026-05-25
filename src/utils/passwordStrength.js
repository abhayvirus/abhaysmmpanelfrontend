/** Client-side password strength for reset/signup UX */
export function getPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: '', percent: 0, color: '#64748b' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  const idx = Math.min(score, 4);

  return {
    score: idx,
    label: labels[idx],
    percent: (idx / 4) * 100,
    color: colors[idx],
    valid: password.length >= 8,
  };
}

export function validateResetPassword(password, confirm) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password is too long';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}
