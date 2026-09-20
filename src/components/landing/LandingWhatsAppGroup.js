import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { BRAND } from '../../config/brand';

const whatsappQrSrc = `${process.env.PUBLIC_URL}${BRAND.whatsappQr}?v4`;

function resolveWhatsAppGroupUrl(settings) {
  const url =
    settings.whatsapp_community_link
    || settings.whatsapp_link
    || BRAND.whatsappGroupUrl;
  return String(url || '').trim();
}

const WhatsAppIcon = () => (
  <svg className="landing-whatsapp-group__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  </svg>
);

/** Compact in-page WhatsApp community CTA + QR. */
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
                  <WhatsAppIcon />
                  <span>Join Group on WhatsApp</span>
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
                  width={792}
                  height={911}
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
