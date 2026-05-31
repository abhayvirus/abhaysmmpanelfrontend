import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND } from '../../config/brand';
import { formatStatCount } from '../../utils/formatStat';
import { useInViewOnce } from '../../hooks/useInViewOnce';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

const STAT_ITEMS = [
  { key: 'totalOrders', label: 'Orders Delivered', minimum: BRAND.marketingStats.totalOrders, fallback: '10K+' },
  { key: 'totalUsers', label: 'Happy Clients', minimum: BRAND.marketingStats.totalUsers, fallback: '10K+' },
  { key: 'activeServices', label: 'Live Services', minimum: BRAND.marketingStats.activeServices, fallback: '500+' },
];

function useAnimatedPercent(active, target = 99.2, duration = 2200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased * 10) / 10);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return active ? `${value}%` : '0%';
}

const StatCard = ({ label, display, delay }) => (
  <motion.div
    className="landing-stat-card"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="landing-stat-card__glow" aria-hidden="true" />
    <div className="landing-stat-card__value">{display}</div>
    <div className="landing-stat-card__label">{label}</div>
  </motion.div>
);

const AnimatedStatCard = ({ statKey, label, minimum, fallback, stats, inView, delay }) => {
  const raw = stats[statKey];
  const parsed = parseInt(raw, 10);
  const goal = Math.max(Number.isNaN(parsed) ? 0 : parsed, minimum);
  const target = goal > 0 ? goal : minimum;
  const animated = useAnimatedCounter(target, inView);
  const display = goal > 0 || raw
    ? animated
    : formatStatCount(0, { minimum, fallback });
  return <StatCard label={label} display={display} delay={delay} />;
};

const SuccessRateCard = ({ inView, delay }) => {
  const display = useAnimatedPercent(inView, 99.2);
  return <StatCard label="Success Rate" display={display} delay={delay} />;
};

const LandingStats = ({ stats }) => {
  const { ref, inView } = useInViewOnce(0.15);

  return (
    <div className="landing-stats" ref={ref}>
      {STAT_ITEMS.map((item, i) => (
        <AnimatedStatCard
          key={item.key}
          statKey={item.key}
          label={item.label}
          minimum={item.minimum}
          fallback={item.fallback}
          stats={stats}
          inView={inView}
          delay={i * 0.08}
        />
      ))}
      <SuccessRateCard inView={inView} delay={0.32} />
    </div>
  );
};

export default LandingStats;
