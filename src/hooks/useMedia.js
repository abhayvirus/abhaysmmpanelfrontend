import { useState, useEffect } from 'react';

const QUERIES = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useMedia() {
  const isMobile = useMediaQuery(QUERIES.mobile);
  const isTablet = useMediaQuery(QUERIES.tablet);
  const isDesktop = useMediaQuery(QUERIES.desktop);
  return { isMobile, isTablet, isDesktop, isMobileOrTablet: isMobile || isTablet };
}

export default useMedia;
