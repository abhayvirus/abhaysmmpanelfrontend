import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';
import { useInViewOnce } from '../../hooks/useInViewOnce';
import { BRAND } from '../../config/brand';

const whatsappQrSrc = `${process.env.PUBLIC_URL}${BRAND.whatsappQr}`;

function resolveWhatsAppGroupUrl(settings) {
  const url =
    settings.whatsapp_community_link
    || settings.whatsapp_link
    || BRAND.whatsappGroupUrl;
  return String(url || '').trim();
}

const LandingWhatsAppGroup = () => {
  const { settings } = useSettings();
  const groupUrl = resolveWhatsAppGroupUrl(settings);
  const { ref, inView } = useInViewOnce(0.12);

  return (
    <section
      className="landing-section landing-whatsapp-group"
      ref={ref}
      aria-labelledby="landing-whatsapp-group-title"
    >
      <div className="landing-section__container">
        <motion.div
          className="landing-whatsapp-group__card"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="landing-whatsapp-group__glow" aria-hidden="true" />

          <div className="landing-whatsapp-group__grid">
            <div className="landing-whatsapp-group__copy">
              <p className="landing-section__eyebrow">Community</p>
              <h2 id="landing-whatsapp-group-title" className="landing-whatsapp-group__title">
                Join our WhatsApp Group
              </h2>
              <p className="landing-whatsapp-group__desc">
                Get offers, payment updates, new services, and quick support from the {BRAND.shortName}{' '}
                team. Scan the QR code or tap the button below.
              </p>
              {groupUrl ? (
                <a
                  href={groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn landing-whatsapp-group__btn landing-btn--lg"
                >
                  Join Group on WhatsApp
                </a>
              ) : null}
            </div>

            <figure className="landing-whatsapp-group__qr-wrap">
              <img
                src={whatsappQrSrc}
                alt="WhatsApp group QR code for AbhaySMM Panel — scan to join"
                className="landing-whatsapp-group__qr"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="landing-whatsapp-group__qr-caption">
                Scan with WhatsApp camera to join
              </figcaption>
            </figure>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingWhatsAppGroup;
