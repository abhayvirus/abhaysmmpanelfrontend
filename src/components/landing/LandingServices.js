import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const LandingServices = ({ services, sym }) => {
  const { ref, inView } = useInViewOnce(0.1);
  const list = services.slice(0, 6);

  return (
    <section className="landing-section landing-services" ref={ref} aria-labelledby="landing-services-title">
      <div className="landing-section__container">
        <motion.header
          className="landing-section__header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="landing-section__eyebrow">Services</p>
          <h2 id="landing-services-title" className="landing-section__title">Popular Services</h2>
          <p className="landing-section__subtitle">Top-performing services trusted by thousands of resellers.</p>
        </motion.header>

        <div className="landing-services__grid">
          {list.map((s, i) => (
            <motion.article
              key={`${s.name}-${i}`}
              className="landing-service-card"
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="landing-service-card__badges">
                <span className="landing-service-card__badge landing-service-card__badge--speed">⚡ Fast</span>
                <span className="landing-service-card__badge landing-service-card__badge--refill">♻️ Refill</span>
              </div>
              <h3 className="landing-service-card__name">{s.name}</h3>
              <p className="landing-service-card__meta">{s.platform} · {s.category}</p>
              <div className="landing-service-card__price">
                <span className="landing-service-card__price-value">{sym}{s.custom_price || s.price || '—'}</span>
                <span className="landing-service-card__price-unit">/ 1k</span>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="landing-services__cta-wrap"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.35 }}
        >
          <Link to="/signup" className="landing-btn landing-btn--primary">
            View All Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingServices;
