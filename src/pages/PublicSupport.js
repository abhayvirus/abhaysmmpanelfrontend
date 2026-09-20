import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { useSettings } from '../contexts/SettingsContext';
import { BRAND } from '../config/brand';
import { resolveTelegramChannelUrl } from '../constants/telegramChannel';
import '../styles/publicGuidePage.css';

const PublicSupport = () => {
  const { settings } = useSettings();
  const email = settings.support_email || BRAND.supportEmail;
  const telegramUrl = resolveTelegramChannelUrl(settings);

  useEffect(() => {
    document.title = `Support — ${BRAND.name}`;
  }, []);

  return (
    <PublicPageShell className="public-simple-page">
      <article className="public-simple-card">
        <p className="legal-doc__eyebrow">Support</p>
        <h1>We&apos;re here to help</h1>
        <p>
          For wallet, payment, or order questions, reach the {BRAND.name} team using the channels
          below. Include your registered email and payment or order ID when relevant.
        </p>
        <ul className="public-simple-list">
          <li>
            Email:{' '}
            <a href={`mailto:${email}`}>{email}</a>
          </li>
          <li>
            Telegram:{' '}
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
              Telegram Support
            </a>
          </li>
          <li>After login: open Tickets in the panel for tracked support conversations.</li>
          <li>Guides: see How to Use for add-funds and order steps.</li>
        </ul>
        <div className="public-simple-actions">
          <a href={`mailto:${email}`} className="btn btn-primary">
            Email Support
          </a>
          <Link to="/login" className="btn btn-ghost">
            Login to Open Tickets
          </Link>
          <Link to="/how-to-use" className="btn btn-ghost">
            How to Use
          </Link>
        </div>
      </article>
    </PublicPageShell>
  );
};

export default PublicSupport;
