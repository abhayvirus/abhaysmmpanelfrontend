import React from 'react';
import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const BADGES = [
  { icon: '⚡', title: 'Instant Delivery', desc: 'Orders start in minutes' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Razorpay & encrypted checkout' },
  { icon: '♻️', title: 'Refill Supported', desc: 'Auto refill on eligible services' },
  { icon: '🔌', title: 'API Access', desc: 'Full reseller API integration' },
  { icon: '🎧', title: '24/7 Support', desc: 'WhatsApp & ticket support' },
  { icon: '📈', title: 'Real-time Tracking', desc: 'Live order status updates' },
];

const LandingTrustBadges = () => {
  const { ref, inView } = useInViewOnce(0.05);

  return (
    <section className="landing-section landing-trust" ref={ref} aria-label="Trust badges">
      <div className="landing-section__container">
        <motion.div
          className="landing-trust__grid"
          initial={false}
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: inView ? 0.06 : 0 } },
          }}
        >
          {BADGES.map((b) => (
            <motion.div
              key={b.title}
              className="landing-trust__card"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="landing-trust__icon" aria-hidden="true">{b.icon}</span>
              <h3 className="landing-trust__title">{b.title}</h3>
              <p className="landing-trust__desc">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTrustBadges;
