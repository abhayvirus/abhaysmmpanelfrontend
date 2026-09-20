import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { BRAND } from '../config/brand';
import { PUBLIC_SERVICES_CONTENT } from '../content/publicPages';
import '../styles/publicGuidePage.css';

const PublicServices = () => {
  useEffect(() => {
    document.title = `Services — ${BRAND.name}`;
  }, []);

  const { title, subtitle, intro, platforms, notes } = PUBLIC_SERVICES_CONTENT;

  return (
    <PublicPageShell className="public-simple-page">
      <article className="public-simple-card public-simple-card--wide">
        <p className="legal-doc__eyebrow">Services</p>
        <h1>{title}</h1>
        <p className="public-simple-lead">{subtitle}</p>
        <p>{intro}</p>

        <div className="public-services-grid">
          {platforms.map((platform) => (
            <section key={platform.name} className="public-services-block">
              <h2>{platform.name}</h2>
              <ul className="public-simple-list">
                {platform.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <h2 className="public-simple-h2">Before you order</h2>
        <ul className="public-simple-list">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <div className="public-simple-actions">
          <Link to="/signup" className="btn btn-primary">
            Create Free Account
          </Link>
          <Link to="/login" className="btn btn-ghost">
            Login to Order
          </Link>
          <Link to="/pricing" className="btn btn-ghost">
            Pricing
          </Link>
        </div>
      </article>
    </PublicPageShell>
  );
};

export default PublicServices;
