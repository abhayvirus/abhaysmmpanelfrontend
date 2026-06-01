import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DownloadAppButton from '../DownloadAppButton';
import { useInViewOnce } from '../../hooks/useInViewOnce';
import { BRAND } from '../../config/brand';

const appScreenshotSrc = `${process.env.PUBLIC_URL}${BRAND.appScreenshot}`;

const LandingAppShowcase = () => {
  const { ref, inView } = useInViewOnce(0.12);

  return (
    <section
      className="landing-section landing-app-showcase"
      ref={ref}
      aria-labelledby="landing-app-showcase-title"
    >
      <div className="landing-section__container">
        <div className="landing-app-showcase__grid">
          <motion.div
            className="landing-app-showcase__copy"
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="landing-section__eyebrow">Mobile App</p>
            <h2 id="landing-app-showcase-title" className="landing-section__title">
              ABHAYSMM Panel on your phone
            </h2>
            <p className="landing-section__subtitle landing-app-showcase__desc">
              Order services, track deliveries, manage wallet balance, and get support — all from a
              fast mobile-friendly panel experience.
            </p>
            <ul className="landing-app-showcase__features">
              <li>Dashboard &amp; orders on the go</li>
              <li>Deposit funds securely</li>
              <li>Real-time notifications</li>
            </ul>
            <div className="landing-app-showcase__actions">
              <DownloadAppButton className="landing-btn landing-btn--primary landing-btn--lg" />
              <Link to="/signup" className="landing-btn landing-btn--glass">
                Create account
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="landing-app-showcase__visual"
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-app-showcase__phone" aria-hidden="true">
              <div className="landing-app-showcase__phone-notch" />
              <div className="landing-app-showcase__phone-screen">
                <img
                  src={appScreenshotSrc}
                  alt="ABHAYSMM Panel mobile app screenshot showing dashboard and services"
                  className="landing-app-showcase__screenshot"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingAppShowcase;
