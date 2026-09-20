import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const FALLBACK_SERVICES = [
  { name: 'Instagram Followers', platform: 'Instagram', category: 'Followers', price: '—', custom_price: null },
  { name: 'Instagram Likes', platform: 'Instagram', category: 'Likes', price: '—', custom_price: null },
  { name: 'Instagram Reels Views', platform: 'Instagram', category: 'Views', price: '—', custom_price: null },
  { name: 'YouTube Views', platform: 'YouTube', category: 'Views', price: '—', custom_price: null },
  { name: 'YouTube Subscribers', platform: 'YouTube', category: 'Subscribers', price: '—', custom_price: null },
  { name: 'Telegram Members', platform: 'Telegram', category: 'Members', price: '—', custom_price: null },
];

const LandingServices = ({ services = [], sym = '₹' }) => {
  const { ref, inView } = useInViewOnce(0.08);
  const list = (services.length > 0 ? services : FALLBACK_SERVICES).slice(0, 6);
  const usingFallback = services.length === 0;

  return (
    <section
      id="services"
      className="landing-section landing-services"
      ref={ref}
      aria-labelledby="landing-services-title"
    >
      <div className="landing-section__container">
        <motion.header
          className="landing-section__header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="landing-section__eyebrow">Services</p>
          <h2 id="landing-services-title" className="landing-section__title">
            Popular Services
          </h2>
          <p className="landing-section__subtitle">
            {usingFallback
              ? 'Instagram, YouTube, Telegram and more — login to see live rates and place orders.'
              : 'Top-performing services trusted by thousands of users.'}
          </p>
        </motion.header>

        <div className="landing-services__grid">
          {list.map((s, i) => (
            <motion.article
              key={`${s.name}-${i}`}
              className="landing-service-card"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="landing-service-card__badges">
                <span className="landing-service-card__badge landing-service-card__badge--speed">
                  Fast
                </span>
                <span className="landing-service-card__badge landing-service-card__badge--refill">
                  Refill
                </span>
              </div>
              <h3 className="landing-service-card__name">{s.name}</h3>
              <p className="landing-service-card__meta">
                {s.platform}
                {s.category ? ` · ${s.category}` : ''}
              </p>
              <div className="landing-service-card__price">
                <span className="landing-service-card__price-value">
                  {usingFallback
                    ? 'Live rate'
                    : `${sym}${s.custom_price || s.price || '—'}`}
                </span>
                {!usingFallback && (
                  <span className="landing-service-card__price-unit">/ 1k</span>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        <div className="landing-services__cta-wrap">
          <Link to="/services" className="landing-btn landing-btn--ghost">
            Explore all services
          </Link>
          <Link to="/signup" className="landing-btn landing-btn--primary">
            Order now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LandingServices;
