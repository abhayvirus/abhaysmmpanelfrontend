import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { BRAND } from '../config/brand';
import '../styles/publicGuidePage.css';

const PublicLegalPage = ({ doc }) => {
  useEffect(() => {
    document.title = `${doc.title} — ${BRAND.name}`;
  }, [doc.title]);

  return (
    <PublicPageShell className="public-legal-page">
      <article className="legal-doc">
        <header className="legal-doc__header">
          <p className="legal-doc__eyebrow">Legal</p>
          <h1>{doc.title}</h1>
          <p className="legal-doc__meta">Last updated: {doc.updated}</p>
        </header>
        {doc.sections.map((section) => (
          <section key={section.heading} className="legal-doc__section">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <p className="legal-doc__back">
          <Link to="/">← Back to Home</Link>
          {' · '}
          <Link to="/how-to-use">How to Use</Link>
          {' · '}
          <Link to="/support">Support</Link>
        </p>
      </article>
    </PublicPageShell>
  );
};

export default PublicLegalPage;
