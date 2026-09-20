import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { useSettings } from '../contexts/SettingsContext';
import { BRAND } from '../config/brand';
import { resolveTelegramChannelUrl } from '../constants/telegramChannel';
import { PUBLIC_HOW_TO_USE_META, GUIDE_TOPICS } from '../content/publicHowToUseGuide';
import { SUPPORT_WHATSAPP } from '../content/publicPages';
import '../styles/publicGuidePage.css';

const PublicHowToUseGuide = () => {
  const { settings } = useSettings();
  const telegramUrl = resolveTelegramChannelUrl(settings);

  useEffect(() => {
    document.title = `How to Use — ${BRAND.name}`;
  }, []);

  return (
    <PublicPageShell className="public-guide-page public-guide-page--simple">
      <header className="guide-simple-hero">
        <h1>{PUBLIC_HOW_TO_USE_META.title}</h1>
        <p>{PUBLIC_HOW_TO_USE_META.subtitle}</p>
      </header>

      <div className="guide-simple-list">
        {GUIDE_TOPICS.map((topic) => (
          <section key={topic.id} id={topic.id} className="guide-simple-block">
            <h2>{topic.title}</h2>
            {topic.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>
        ))}
      </div>

      <section className="guide-simple-cta" aria-label="Get started">
        <h2>Ready to start?</h2>
        <p>Create a free account, add funds, and place your first order.</p>
        <div className="guide-simple-cta__actions">
          <Link to="/signup" className="btn btn-primary">
            Create Free Account
          </Link>
          <Link to="/login" className="btn btn-ghost">
            Login
          </Link>
          <a href={SUPPORT_WHATSAPP.waUrl} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={telegramUrl} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            Telegram
          </a>
        </div>
      </section>
    </PublicPageShell>
  );
};

export default PublicHowToUseGuide;
