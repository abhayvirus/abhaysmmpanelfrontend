import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { API_BASE } from '../config/env';
import '../styles/socialProofSection.css';

/** Creator profile — bundled in public/abhay_d95.jpeg */
const DEFAULT_PROFILE_IMAGE = `${process.env.PUBLIC_URL || ''}/abhay_d95.jpeg`;

const PROFILE_TAGS = [
  'AI-Full Stack Engineer',
  'VFX Editor',
];

const PROFILE_BIO =
  'AI-Full Stack Engineer & VFX Editor specializing in modern web applications, automation systems, AI integrations, visual effects, and premium digital experiences.';

function resolveImageUrl(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  if (s.startsWith('http') || s.startsWith('data:')) return s;
  if (s.startsWith('/uploads/')) return `${API_BASE.replace(/\/$/, '')}${s}`;
  if (s.startsWith('/')) return `${process.env.PUBLIC_URL || ''}${s}`;
  return s;
}

const SocialProofSection = () => {
  const { settings } = useSettings();
  const { ref, inView } = useInViewOnce(0.05);
  const [imgError, setImgError] = useState(false);

  const instagramFollowers = settings.social_instagram_followers || '13200';
  const instagramCount = useAnimatedCounter(instagramFollowers, inView);
  const profileImg = resolveImageUrl(settings.instagram_profile_image) || DEFAULT_PROFILE_IMAGE;
  const showPhoto = Boolean(profileImg) && !imgError;

  return (
    <section
      className="landing-section social-proof-section"
      ref={ref}
      aria-labelledby="social-proof-title"
    >
      <div className="landing-section__container social-proof-section__inner">
        <div className="social-proof-section__bg" aria-hidden="true" />

        <header className="social-proof-section__header">
          <p className="landing-section__eyebrow">Creator</p>
          <h2 id="social-proof-title" className="social-proof-section__title">
            Connect with ABHAY D95
          </h2>
          <p className="social-proof-section__subtitle">
            Follow for offers, product updates, tutorials, and behind-the-scenes from the ABHAYSMM team.
          </p>
        </header>

        <article className="social-proof-featured">
          <div className="social-proof-featured__glow" aria-hidden="true" />
          <div className="social-proof-featured__avatar-wrap">
            {showPhoto ? (
              <img
                src={profileImg}
                alt="Abhay D95"
                className="social-proof-featured__avatar"
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="social-proof-featured__avatar social-proof-featured__avatar--fallback"
                aria-hidden="true"
              >
                AD
              </div>
            )}
            <span className="social-proof-featured__badge">Creator</span>
          </div>
          <div className="social-proof-featured__body">
            <p className="social-proof-featured__eyebrow">Instagram</p>
            <h3 className="social-proof-featured__username">
              {settings.instagram_username || '@abhay_d95'}
            </h3>
            <p className="social-proof-featured__count">
              <span className="social-proof-featured__count-num">{instagramCount}</span>
              <span className="social-proof-featured__count-label">Followers</span>
            </p>
            <p className="social-proof-featured__bio">{PROFILE_BIO}</p>
            <ul className="social-proof-featured__tags" aria-label="Professional highlights">
              {PROFILE_TAGS.map((tag) => (
                <li key={tag} className="social-proof-featured__tag">
                  {tag}
                </li>
              ))}
            </ul>
            <div className="social-proof-featured__actions">
              <a
                href={settings.instagram_link || 'https://instagram.com/abhay_d95'}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-btn landing-btn--primary social-proof-featured__cta"
              >
                Follow Now
              </a>
              <a
                href={settings.instagram_link || 'https://instagram.com/abhay_d95'}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-btn landing-btn--ghost social-proof-featured__cta-secondary"
              >
                View Profile
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default SocialProofSection;
