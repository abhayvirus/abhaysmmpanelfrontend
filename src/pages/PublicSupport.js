import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { useSettings } from '../contexts/SettingsContext';
import { BRAND } from '../config/brand';
import { resolveTelegramChannelUrl } from '../constants/telegramChannel';
import { PUBLIC_SUPPORT_CONTENT, SUPPORT_WHATSAPP } from '../content/publicPages';
import '../styles/publicGuidePage.css';

const PublicSupport = () => {
  const { settings } = useSettings();
  const email = settings.support_email || BRAND.supportEmail;
  const telegramUrl = resolveTelegramChannelUrl(settings);
  const whatsappFromSettings = String(settings.whatsapp_link || '').trim();
  const whatsappUrl =
    whatsappFromSettings.startsWith('http') || whatsappFromSettings.startsWith('https')
      ? whatsappFromSettings
      : SUPPORT_WHATSAPP.waUrl;
  const whatsappDisplay =
    whatsappFromSettings && !whatsappFromSettings.startsWith('http')
      ? whatsappFromSettings.replace(/\D/g, '') || SUPPORT_WHATSAPP.display
      : SUPPORT_WHATSAPP.display;

  useEffect(() => {
    document.title = `Support — ${BRAND.name}`;
  }, []);

  return (
    <PublicPageShell className="public-simple-page">
      <article className="public-simple-card">
        <p className="legal-doc__eyebrow">Support</p>
        <h1>{PUBLIC_SUPPORT_CONTENT.title}</h1>
        <p className="public-simple-lead">{PUBLIC_SUPPORT_CONTENT.subtitle}</p>
        <p>{PUBLIC_SUPPORT_CONTENT.hours}</p>

        <h2 className="public-simple-h2">Contact us</h2>
        <ul className="public-simple-list">
          <li>
            <strong>WhatsApp:</strong>{' '}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              {whatsappDisplay}
            </a>
          </li>
          <li>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${email}`}>{email}</a>
          </li>
          <li>
            <strong>Telegram:</strong>{' '}
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
              Telegram Support
            </a>
          </li>
          <li>
            <strong>In panel:</strong> Login → open Tickets for tracked support.
          </li>
        </ul>

        <h2 className="public-simple-h2">When you message us, include</h2>
        <ul className="public-simple-list">
          {PUBLIC_SUPPORT_CONTENT.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>

        <div className="public-simple-actions">
          <a href={whatsappUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            WhatsApp {SUPPORT_WHATSAPP.display}
          </a>
          <a href={`mailto:${email}`} className="btn btn-ghost">
            Email Support
          </a>
          <Link to="/login" className="btn btn-ghost">
            Login to Tickets
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
