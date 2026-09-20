import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import '../styles/simpleGuide.css';

const SECTIONS = [
  {
    id: 'add-funds',
    title: 'How to add funds',
    steps: [
      'Open Add Funds from the menu (or bottom bar on mobile).',
      'Enter the amount you want to add (minimum as shown on the page).',
      'Choose a payment method and complete the payment.',
      'After success, your wallet balance updates automatically. You can then place orders.',
    ],
    link: { to: '/add-funds', label: 'Go to Add Funds' },
  },
  {
    id: 'refer',
    title: 'How to refer',
    steps: [
      'Open Referrals from the menu.',
      'Copy your referral link (or code).',
      'Share it with friends. When they sign up using your link and make their first deposit of ₹100 or more, you earn commission.',
      'Commission is credited to your wallet automatically. Check Referral history on the same page.',
    ],
    link: { to: '/referrals', label: 'Go to Referrals' },
  },
  {
    id: 'order',
    title: 'How to place an order',
    steps: [
      'Open New Order (Dashboard).',
      'Select platform, category, and service.',
      'Paste the link (or username) and enter quantity.',
      'Confirm the order. Balance is deducted and the order appears under Orders.',
    ],
    link: { to: '/dashboard', label: 'Go to New Order' },
  },
  {
    id: 'orders',
    title: 'How to check orders',
    steps: [
      'Open Orders from the menu.',
      'See status (Pending, Processing, Completed, etc.).',
      'Use filters if you need to find a specific order.',
    ],
    link: { to: '/orders', label: 'Go to Orders' },
  },
  {
    id: 'support',
    title: 'How to get support',
    steps: [
      'Open Support to create a ticket, or tap the blue chat icon for live chat.',
      'Write your issue clearly (order ID helps if related to an order).',
      'Our team replies in Support tickets or Live Chat. You will also get notifications.',
    ],
    link: { to: '/tickets', label: 'Go to Support' },
  },
];

const UserGuide = () => (
  <UserLayout title="Help Guide">
    <div className="simple-guide">
      <header className="simple-guide__header">
        <Link to="/dashboard" className="simple-guide__back">← Back to Dashboard</Link>
        <h1>Help Guide</h1>
        <p>Simple steps for common tasks. Heading pe topic, niche steps.</p>
      </header>

      <div className="simple-guide__list">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="simple-guide__block">
            <h2>{section.title}</h2>
            <ol>
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {section.link && (
              <Link to={section.link.to} className="btn btn-primary btn-sm simple-guide__cta">
                {section.link.label}
              </Link>
            )}
          </section>
        ))}
      </div>
    </div>
  </UserLayout>
);

export default UserGuide;
