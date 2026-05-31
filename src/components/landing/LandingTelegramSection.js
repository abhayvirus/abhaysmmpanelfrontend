import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';
import TelegramIcon from '../TelegramIcon';
import { resolveTelegramChannelUrl } from '../../constants/telegramChannel';
import { useInViewOnce } from '../../hooks/useInViewOnce';

const LandingTelegramSection = () => {
  const { settings } = useSettings();
  const channelUrl = resolveTelegramChannelUrl(settings);
  const { ref, inView } = useInViewOnce(0.15);

  return (
    <section className="landing-section landing-telegram" ref={ref} aria-labelledby="landing-telegram-title">
      <div className="landing-section__container">
        <motion.div
          className="landing-telegram__card"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="landing-telegram__glow" aria-hidden="true" />
          <div className="landing-telegram__icon-wrap" aria-hidden="true">
            <TelegramIcon size={48} className="landing-telegram__icon" />
          </div>
          <h2 id="landing-telegram-title" className="landing-telegram__title">Join Our Telegram Channel</h2>
          <p className="landing-telegram__desc">
            Get instant updates on new services, exclusive offers, payment alerts, and priority support — directly on Telegram.
          </p>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-btn landing-btn--telegram landing-btn--lg"
          >
            <TelegramIcon size={22} className="landing-btn__icon" />
            Join Telegram Now
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTelegramSection;
