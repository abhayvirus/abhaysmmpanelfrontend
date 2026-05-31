import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/brand';
import TelegramIcon from '../TelegramIcon';
import { resolveTelegramChannelUrl } from '../../constants/telegramChannel';

const QUICK_LINKS = [
  { to: '/signup', label: 'Sign Up' },
  { to: '/login', label: 'Login' },
  { to: '/how-to-use', label: 'How to Use' },
];

const LandingFooter = ({ settings }) => {
  const telegramUrl = resolveTelegramChannelUrl(settings);
  const instagramUrl = settings.instagram_link || 'https://instagram.com/abhay_d95';
  const siteName = settings.site_name || BRAND.name;
  const email = settings.support_email || BRAND.supportEmail;

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <strong className="landing-footer__logo">{BRAND.shortName}</strong>
          <p className="landing-footer__tagline">{settings.site_tagline || BRAND.tagline}</p>
        </div>

        <div className="landing-footer__col">
          <h3 className="landing-footer__heading">Quick Links</h3>
          <ul className="landing-footer__links">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-footer__col">
          <h3 className="landing-footer__heading">Connect</h3>
          <ul className="landing-footer__links landing-footer__social">
            <li>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                <TelegramIcon size={18} /> Telegram
              </a>
            </li>
            <li>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                📸 Instagram
              </a>
            </li>
          </ul>
        </div>

        <div className="landing-footer__col">
          <h3 className="landing-footer__heading">Contact</h3>
          <ul className="landing-footer__links">
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>
              <a href={BRAND.domain}>{BRAND.domain.replace('https://', '')}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="landing-footer__bottom">
        <p>
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
