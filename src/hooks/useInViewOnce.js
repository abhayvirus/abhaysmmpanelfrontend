import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when element enters viewport.
 * Falls back to visible after a short delay so content never stays invisible
 * if IntersectionObserver misses (tall sections, threshold, etc.).
 */
export function useInViewOnce(threshold = 0.08) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return undefined;

    let done = false;
    const mark = () => {
      if (done) return;
      done = true;
      setInView(true);
    };

    // Safety: never leave sections stuck at opacity 0
    const fallback = window.setTimeout(mark, 900);

    if (typeof IntersectionObserver === 'undefined') {
      mark();
      return () => window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          mark();
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '80px 0px 80px 0px' }
    );

    observer.observe(el);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [inView, threshold]);

  return { ref, inView };
}
