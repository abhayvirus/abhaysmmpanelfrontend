import { useEffect, useState } from 'react';
import { formatStatCount } from '../utils/formatStat';

/**
 * Animate numeric counter 0 → target when `active` becomes true.
 * Returns formatted marketing string (e.g. 13.2K+).
 */
export function useAnimatedCounter(target, active, duration = 2000) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const goal = Math.max(0, parseInt(target, 10) || 0);
    if (goal === 0) {
      setCurrent(0);
      return undefined;
    }

    const start = performance.now();
    let raf;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(Math.round(goal * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  const n = parseInt(target, 10) || 0;
  if (!active && n > 0) return formatStatCount(0, { minimum: 0, fallback: '0' });
  if (n <= 0) return '—';
  return formatStatCount(current, { minimum: 0, fallback: '0+' });
}
