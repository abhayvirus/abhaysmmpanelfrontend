import React, { useEffect, useState } from 'react';

/** Count-up animation for dashboard stats */
const AnimatedCounter = ({ value = 0, duration = 900, prefix = '', suffix = '', decimals = 0 }) => {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return undefined;
    }
    let start = 0;
    const startTime = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(start + (target - start) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    start = display;
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('en-IN');

  return (
    <span className="animated-counter">
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default AnimatedCounter;
