import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/brand';
import BrandLogo from '../BrandLogo';
import TelegramIcon from '../TelegramIcon';
import { resolveTelegramChannelUrl } from '../../constants/telegramChannel';

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/#services', label: 'Services' },
  { to: '/how-to-use', label: 'How to Use' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/blog', label: 'Blog' },
  { to: '/support', label: 'Contact' },
];

const LEGAL_LINKS = [
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/refund-policy', label: 'Refund Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
];

const LandingFooter = ({ settings = {} }) => {
  const telegramUrl = resolveTelegramChannelUrl(settings);
  const instagramUrl = settings.instagram_link || 'https://instagram.com/abhay_d95';
  const email = settings.support_email || BRAND.supportEmail;
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <Link to="/" className="landing-footer__brand-link" aria-label={BRAND.name}>
            <BrandLogo size="sm" showSubtitle siteLogo={settings.site_logo} />
          </Link>
          <p className="landing-footer__tagline">{settings.site_tagline || BRAND.tagline}</p>
          <ul className="landing-footer__social">
            <li>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                <TelegramIcon size={18} />
                <span>Telegram</span>
              </a>
            </li>
            <li>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">📸</span>
                <span>Instagram</span>
              </a>
            </li>
          </ul>
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
          <h3 className="landing-footer__heading">Legal</h3>
          <ul className="landing-footer__links">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-footer__col">
          <h3 className="landing-footer__heading">Support</h3>
          <ul className="landing-footer__links">
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                Telegram Support
              </a>
            </li>
            <li>
              <span className="landing-footer__muted">24/7 Support</span>
            </li>
            <li>
              <Link to="/support">Help Center</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="landing-footer__bottom">
        <p>
          © {year} {BRAND.name}. All rights reserved.
        </p>
        <p className="landing-footer__byline">
          Developed by{' '}
          <a href={BRAND.company.url} target="_blank" rel="noopener noreferrer">
            {BRAND.company.name}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
