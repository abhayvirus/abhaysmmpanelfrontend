import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../components/PublicPageShell';
import { BRAND } from '../config/brand';
import '../styles/publicGuidePage.css';

const PublicPricing = () => {
  useEffect(() => {
    document.title = `Pricing — ${BRAND.name}`;
  }, []);

  return (
    <PublicPageShell className="public-simple-page">
      <article className="public-simple-card">
        <p className="legal-doc__eyebrow">Pricing</p>
        <h1>Transparent wallet-based pricing</h1>
        <p>
          {BRAND.name} uses a prepaid wallet. You add funds once, then pay per order from your
          balance. Each service shows its own rate and min/max quantity inside the Services catalog
          after you sign in.
        </p>
        <ul className="public-simple-list">
          <li>No mandatory monthly subscription to browse or place orders.</li>
          <li>Pay only for the services you order, based on live panel rates.</li>
          <li>Checkout for wallet top-ups uses secure Razorpay payment methods (UPI, cards, and more).</li>
          <li>Start small — recharge a modest amount and place a test order first.</li>
        </ul>
        <div className="public-simple-actions">
          <Link to="/signup" className="btn btn-primary">Create Free Account</Link>
          <Link to="/how-to-use" className="btn btn-ghost">How to Add Funds</Link>
          <Link to="/#services" className="btn btn-ghost">View Services Preview</Link>
        </div>
      </article>
    </PublicPageShell>
  );
};

export default PublicPricing;
