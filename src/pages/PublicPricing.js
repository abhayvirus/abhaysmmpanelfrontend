import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { BRAND } from '../config/brand';
import { PUBLIC_PRICING_CONTENT } from '../content/publicPages';
import '../styles/publicGuidePage.css';

const PublicPricing = () => {
  useEffect(() => {
    document.title = `Pricing — ${BRAND.name}`;
  }, []);

  const { title, subtitle, sections } = PUBLIC_PRICING_CONTENT;

  return (
    <PublicPageShell className="public-simple-page">
      <article className="public-simple-card">
        <p className="legal-doc__eyebrow">Pricing</p>
        <h1>{title}</h1>
        <p className="public-simple-lead">{subtitle}</p>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="public-simple-h2">{section.heading}</h2>
            <ul className="public-simple-list">
              {section.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}

        <div className="public-simple-actions">
          <Link to="/signup" className="btn btn-primary">
            Create Free Account
          </Link>
          <Link to="/how-to-use" className="btn btn-ghost">
            How to Add Funds
          </Link>
          <Link to="/services" className="btn btn-ghost">
            View Services
          </Link>
        </div>
      </article>
    </PublicPageShell>
  );
};

export default PublicPricing;
