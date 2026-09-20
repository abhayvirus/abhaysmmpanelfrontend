import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { BRAND } from '../../config/brand';

const whatsappQrSrc = `${process.env.PUBLIC_URL}${BRAND.whatsappQr}`;

function resolveWhatsAppGroupUrl(settings) {
  const url =
    settings.whatsapp_community_link
    || settings.whatsapp_link
    || BRAND.whatsappGroupUrl;
  return String(url || '').trim();
}

/** Compact in-page WhatsApp community CTA (QR is a tall phone asset — keep it small). */
const LandingWhatsAppGroup = () => {
  const { settings } = useSettings();
  const groupUrl = resolveWhatsAppGroupUrl(settings);

  return (
    <section
      className="landing-section landing-whatsapp-group"
      aria-labelledby="landing-whatsapp-group-title"
    >
      <div className="landing-section__container">
        <div className="landing-whatsapp-group__card">
          <div className="landing-whatsapp-group__glow" aria-hidden="true" />

          <div className="landing-whatsapp-group__grid">
            <div className="landing-whatsapp-group__copy">
              <p className="landing-section__eyebrow">Community</p>
              <h2 id="landing-whatsapp-group-title" className="landing-whatsapp-group__title">
                Join our WhatsApp Group
              </h2>
              <p className="landing-whatsapp-group__desc">
                Offers, payment updates, new services, and quick support from the {BRAND.shortName} team.
              </p>
              {groupUrl ? (
                <a
                  href={groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn landing-whatsapp-group__btn"
                >
                  Join Group on WhatsApp
                </a>
              ) : null}
            </div>

            <figure className="landing-whatsapp-group__qr-wrap">
              <div className="landing-whatsapp-group__qr-frame">
                <img
                  src={whatsappQrSrc}
                  alt="WhatsApp group QR code — scan to join AbhaySMM Panel"
                  className="landing-whatsapp-group__qr"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="landing-whatsapp-group__qr-caption">
                Scan with WhatsApp camera
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingWhatsAppGroup;
