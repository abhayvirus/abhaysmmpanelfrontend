/**
 * Marketing-friendly stat display: 10K+, 500+, etc.
 * Uses real DB count but never shows below configured minimum on landing page.
 */
export function formatStatCount(value, { minimum = 0, fallback = '10K+' } = {}) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) {
    return minimum > 0 ? formatNumber(minimum) : fallback;
  }
  const display = minimum > 0 ? Math.max(n, minimum) : n;
  return formatNumber(display);
}

function formatNumber(n) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1).replace(/\.0$/, '')}M+`;
  }
  if (n >= 10_000) {
    return `${Math.floor(n / 1000)}K+`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1).replace(/\.0$/, '')}K+`;
  }
  return `${n}+`;
}
