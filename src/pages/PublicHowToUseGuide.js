import React from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import GuidePage from '../components/GuidePage';
import {
  PUBLIC_HOW_TO_USE_META,
  PUBLIC_HOW_TO_USE_SECTIONS,
  PUBLIC_FUND_WORKFLOW_STEPS,
  PUBLIC_HOW_TO_USE_QUICK_NAV,
  PUBLIC_HOW_TO_USE_FEATURES,
} from '../content/publicHowToUseGuide';
import { BRAND } from '../config/brand';
import '../styles/publicGuidePage.css';

const PublicHowToUseGuide = () => (
  <div className="public-guide-page">
    <PublicNav />
    <main className="public-guide-page__main container">
      <GuidePage
        meta={PUBLIC_HOW_TO_USE_META}
        sections={PUBLIC_HOW_TO_USE_SECTIONS}
        workflowSteps={PUBLIC_FUND_WORKFLOW_STEPS}
        quickNav={PUBLIC_HOW_TO_USE_QUICK_NAV}
        uiFeatures={PUBLIC_HOW_TO_USE_FEATURES}
        backLink="/"
        backLabel="Back to Home"
        panelLabel="Quick links"
      />
      <section className="card public-guide-cta">
        <h2 className="public-guide-cta__title">Ready to add funds?</h2>
        <p className="public-guide-cta__text">
          Sign in to {BRAND.name}, open Add Funds, and recharge your wallet in under a minute.
        </p>
        <div className="public-guide-cta__actions">
          <Link to="/signup" className="btn btn-primary">Create Free Account</Link>
          <Link to="/login" className="btn btn-ghost">Login</Link>
        </div>
      </section>
    </main>
    <footer className="public-guide-page__footer">
      <p>
        © {new Date().getFullYear()} {BRAND.name} ·{' '}
        <a href={BRAND.domain}>{BRAND.domain.replace('https://', '')}</a>
      </p>
    </footer>
  </div>
);

export default PublicHowToUseGuide;
