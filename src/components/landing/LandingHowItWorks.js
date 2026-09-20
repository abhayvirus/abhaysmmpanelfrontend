import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const STEPS = [
  { n: '01', title: 'Create account', desc: 'Sign up free with email OTP or Google.' },
  { n: '02', title: 'Add funds', desc: 'Recharge wallet via UPI, cards, and more.' },
  { n: '03', title: 'Choose service', desc: 'Pick Instagram, YouTube, and other SMM services.' },
  { n: '04', title: 'Place order', desc: 'Enter link + quantity and track in My Orders.' },
];

const LandingHowItWorks = () => {
  const { ref, inView } = useInViewOnce(0.1);

  return (
    <section className="landing-section landing-how" ref={ref} aria-labelledby="landing-how-title">
      <div className="landing-section__container">
        <motion.header
          className="landing-section__header"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="landing-section__eyebrow">Quick start</p>
          <h2 id="landing-how-title" className="landing-section__title">
            How it works
          </h2>
          <p className="landing-section__subtitle">
            Four simple steps to grow your social media with ABHAYSMM PANEL.
          </p>
        </motion.header>

        <div className="landing-how__grid">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.n}
              className="landing-how__card"
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <span className="landing-how__num" aria-hidden="true">
                {step.n}
              </span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.article>
          ))}
        </div>

        <div className="landing-how__cta">
          <Link to="/how-to-use" className="landing-btn landing-btn--ghost">
            Full How to Use guide
          </Link>
          <Link to="/signup" className="landing-btn landing-btn--primary">
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
