import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { useSettings } from '../contexts/SettingsContext';
import { BRAND } from '../config/brand';
import { resolveTelegramChannelUrl } from '../constants/telegramChannel';
import '../styles/publicGuidePage.css';

const PublicBlog = () => {
  const { settings } = useSettings();
  const telegramUrl = resolveTelegramChannelUrl(settings);

  useEffect(() => {
    document.title = `Blog & Updates — ${BRAND.name}`;
  }, []);

  return (
    <PublicPageShell className="public-simple-page">
      <article className="public-simple-card">
        <p className="legal-doc__eyebrow">Blog</p>
        <h1>Updates & announcements</h1>
        <p>
          Product updates, offers, and service notices for {BRAND.name} are shared through our
          official channels. We do not publish placeholder blog articles here.
        </p>
        <ul className="public-simple-list">
          <li>Follow the Telegram channel for timely panel and service updates.</li>
          <li>Read the How to Use guide for step-by-step wallet and order help.</li>
          <li>Logged-in users can also receive in-panel notifications and announcements.</li>
        </ul>
        <div className="public-simple-actions">
          <a href={telegramUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Open Telegram Channel
          </a>
          <Link to="/how-to-use" className="btn btn-ghost">How to Use Guide</Link>
        </div>
      </article>
    </PublicPageShell>
  );
};

export default PublicBlog;
