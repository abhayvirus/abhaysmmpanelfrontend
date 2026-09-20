import React from 'react';
import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const REASONS = [
  { icon: '⚡', title: 'Fast Delivery', desc: 'High-speed order processing with real-time status updates.' },
  { icon: '✨', title: 'High Quality', desc: 'Premium services curated for stable growth and retention.' },
  { icon: '🔐', title: 'Secure Payments', desc: 'Trusted gateways, encrypted sessions, and safe top-ups.' },
  { icon: '💎', title: 'Affordable Pricing', desc: 'Reseller-friendly rates with transparent per-1k pricing.' },
  { icon: '🛡️', title: 'Premium Support', desc: 'Dedicated help via tickets, chat, and WhatsApp.' },
];

const LandingWhyChoose = () => {
  const { ref, inView } = useInViewOnce(0.05);

  return (
    <section className="landing-section landing-why" ref={ref} aria-labelledby="landing-why-title">
      <div className="landing-section__container">
        <motion.header
          className="landing-section__header"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="landing-section__eyebrow">Why ABHAYSMM</p>
          <h2 id="landing-why-title" className="landing-section__title">Why Choose Us</h2>
          <p className="landing-section__subtitle">
            Built for creators, agencies, and resellers who need speed, reliability, and scale.
          </p>
        </motion.header>

        <div className="landing-why__grid">
          {REASONS.map((r, i) => (
            <motion.article
              key={r.title}
              className="landing-why__card"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: inView ? i * 0.04 : 0 }}
            >
              <span className="landing-why__icon" aria-hidden="true">{r.icon}</span>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingWhyChoose;
