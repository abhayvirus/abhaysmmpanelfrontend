import React from 'react';
import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const BADGES = [
  { icon: '⚡', title: 'Instant Delivery', desc: 'Orders start in minutes' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Razorpay & encrypted checkout' },
  { icon: '♻️', title: 'Refill Supported', desc: 'Auto refill on eligible services' },
  { icon: '🔌', title: 'API Access', desc: 'Full reseller API integration' },
  { icon: '🎧', title: '24/7 Support', desc: 'Telegram & ticket support' },
];

const LandingTrustBadges = () => {
  const { ref, inView } = useInViewOnce(0.12);

  return (
    <section className="landing-section landing-trust" ref={ref} aria-label="Trust badges">
      <div className="landing-section__container">
        <motion.div
          className="landing-trust__grid"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {BADGES.map((b) => (
            <motion.div
              key={b.title}
              className="landing-trust__card"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
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
