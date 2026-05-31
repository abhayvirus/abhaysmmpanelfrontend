import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { API_BASE } from '../config/env';
import '../styles/socialProofSection.css';

const WHATSAPP_COMMUNITY_DEFAULT =
  'https://chat.whatsapp.com/LqjQV2tmqlt2PUoTxDMho2?s=cl&p=a&mlu=4';

function resolveImageUrl(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  if (s.startsWith('http') || s.startsWith('data:')) return s;
  if (s.startsWith('/uploads/')) return `${API_BASE.replace(/\/$/, '')}${s}`;
  return s;
}

function Counter({ value, label, active }) {
  const display = useAnimatedCounter(value, active);
  return (
    <div className="social-proof-counter">
      <span className="social-proof-counter__value">{display}</span>
      <span className="social-proof-counter__label">{label}</span>
    </div>
  );
}

function SocialCard({ card, settings, active }) {
  const link = settings[card.linkKey] || card.fallbackLink || '#';
  const count = settings[card.countKey] || card.defaultCount || '0';
  const hasLink = link && link !== '#';

  return (
    <article className={`social-proof-card social-proof-card--${card.id}`}>
      <div className="social-proof-card__glow" aria-hidden="true" />
      <div className="social-proof-card__icon" aria-hidden="true">{card.icon}</div>
      <h3 className="social-proof-card__name">{card.name}</h3>
      <p className="social-proof-card__handle">{card.handle}</p>
      {card.countKey && (
        <Counter value={count} label={card.countLabel} active={active} />
      )}
      <div className="social-proof-card__actions">
        <a
          href={hasLink ? link : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn-primary btn-sm social-proof-card__cta${!hasLink ? ' is-disabled' : ''}`}
          aria-disabled={!hasLink}
          onClick={!hasLink ? (e) => e.preventDefault() : undefined}
        >
          {card.cta}
        </a>
        {card.secondaryCta && hasLink && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm social-proof-card__cta-secondary"
          >
            {card.secondaryCta}
          </a>
        )}
      </div>
    </article>
  );
}

const SocialProofSection = () => {
  const { settings } = useSettings();
  const { ref, inView } = useInViewOnce(0.12);

  const whatsappCommunity =
    settings.whatsapp_community_link || settings.whatsapp_link || WHATSAPP_COMMUNITY_DEFAULT;

  const instagramFollowers = settings.social_instagram_followers || '13200';
  const instagramCount = useAnimatedCounter(instagramFollowers, inView);
  const profileImg = resolveImageUrl(settings.instagram_profile_image);

  const cards = [
    {
      id: 'instagram',
      icon: '📸',
      name: 'Instagram',
      handle: settings.instagram_username || '@abhay_d95',
      countKey: 'social_instagram_followers',
      countLabel: 'Followers',
      defaultCount: '13200',
      linkKey: 'instagram_link',
      fallbackLink: 'https://instagram.com/abhay_d95',
      cta: 'Follow Now',
      secondaryCta: 'View Profile',
    },
    {
      id: 'youtube',
      icon: '▶️',
      name: 'YouTube',
      handle: 'ABHAYSMM PANEL',
      countKey: 'social_youtube_subscribers',
      countLabel: 'Subscribers',
      defaultCount: '2500',
      linkKey: 'youtube_link',
      cta: 'Subscribe Now',
      secondaryCta: 'View Channel',
    },
    {
      id: 'linkedin',
      icon: '💼',
      name: 'LinkedIn',
      handle: 'Abhay Tiwari',
      countKey: 'social_linkedin_followers',
      countLabel: 'Followers',
      defaultCount: '1200',
      linkKey: 'linkedin_link',
      cta: 'Follow Now',
      secondaryCta: 'View Profile',
    },
    {
      id: 'facebook',
      icon: '📘',
      name: 'Facebook',
      handle: 'ABHAYSMM PANEL',
      countKey: 'social_facebook_followers',
      countLabel: 'Followers',
      defaultCount: '3500',
      linkKey: 'facebook_link',
      cta: 'Follow Now',
      secondaryCta: 'View Page',
    },
    {
      id: 'telegram',
      icon: '📢',
      name: 'Telegram',
      handle: 'Official Channel',
      linkKey: 'telegram_link',
      cta: 'Join Community',
    },
    {
      id: 'whatsapp',
      icon: '💬',
      name: 'WhatsApp Community',
      handle: 'Join Our Community',
      linkKey: 'whatsapp_community_link',
      fallbackLink: whatsappCommunity,
      cta: 'Join Community',
    },
  ];

  const enrichedSettings = { ...settings, whatsapp_community_link: whatsappCommunity };

  return (
    <section className="social-proof-section home-section" ref={ref} aria-labelledby="social-proof-title">
      <div className="social-proof-section__bg" aria-hidden="true" />

      <header className="social-proof-section__header">
        <h2 id="social-proof-title" className="social-proof-section__title">
          🚀 Connect With ABHAY D95
        </h2>
        <p className="social-proof-section__subtitle">
          Follow us on social media and stay updated with the latest offers, development updates,
          services and tutorials.
        </p>
      </header>

      {/* Featured Instagram creator card */}
      <article className="social-proof-featured">
        <div className="social-proof-featured__glow" aria-hidden="true" />
        <div className="social-proof-featured__avatar-wrap">
          {profileImg ? (
            <img
              src={profileImg}
              alt=""
              className="social-proof-featured__avatar"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="social-proof-featured__avatar social-proof-featured__avatar--fallback" aria-hidden="true">
              AD
            </div>
          )}
          <span className="social-proof-featured__badge">📸 Creator</span>
        </div>
        <div className="social-proof-featured__body">
          <p className="social-proof-featured__eyebrow">📸 Instagram Creator</p>
          <h3 className="social-proof-featured__username">
            {settings.instagram_username || '@abhay_d95'}
          </h3>
          <p className="social-proof-featured__count">
            <span className="social-proof-featured__count-num">{instagramCount}</span>
            <span className="social-proof-featured__count-label">Followers</span>
          </p>
          <ul className="social-proof-featured__tags">
            <li>AI Powered Full Stack Developer</li>
            <li>Software Engineer</li>
            <li>Website Developer</li>
          </ul>
          <div className="social-proof-featured__actions">
            <a
              href={settings.instagram_link || 'https://instagram.com/abhay_d95'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary social-proof-featured__cta"
            >
              Follow Now
            </a>
            <a
              href={settings.instagram_link || 'https://instagram.com/abhay_d95'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost social-proof-featured__cta-secondary"
            >
              View Profile
            </a>
          </div>
        </div>
      </article>

      <div className="social-proof-trust">
        <div className="social-proof-trust__item">
          <strong>{instagramCount}</strong>
          <span>Instagram Followers</span>
        </div>
        <div className="social-proof-trust__item">
          <strong>Growing</strong>
          <span>Community</span>
        </div>
        <div className="social-proof-trust__item">
          <strong>Trusted</strong>
          <span>Brand</span>
        </div>
      </div>

      <div className="social-proof-grid">
        {cards.map((card) => (
          <SocialCard key={card.id} card={card} settings={enrichedSettings} active={inView} />
        ))}
      </div>
    </section>
  );
};

export default SocialProofSection;
