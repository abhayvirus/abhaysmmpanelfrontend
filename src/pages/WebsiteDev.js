import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import AnimatedCounter from '../components/AnimatedCounter';
import { useMedia } from '../hooks/useMedia';
import {
  getMe,
  submitWebsiteDevRequest,
  getMyWebsiteDevRequests,
  getWebsiteDevDashboard,
  getWebsiteDevOrder,
  openWebsiteDevQuotePrint,
} from '../api';
import { useSettings } from '../contexts/SettingsContext';
import {
  WEBSITE_DEV_CATEGORIES,
  DOMAIN_EXTENSIONS,
  HOSTING_PLANS,
  FEATURE_OPTIONS,
  MAINTENANCE_PLANS,
  CRM_STATUSES,
  TRUST_STATS,
  PROJECT_SUCCESS_RATE,
  CONSULTATION_FEE,
  formatInr,
  formatInrRange,
  estimateCostLocal,
  projectProgress,
  getCrmStatusLabel,
  requestAmount,
} from '../content/websiteDevCategories';
import '../styles/websiteDevPage.css';

const TABS = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview' },
  { id: 'categories', label: 'Categories', shortLabel: 'Categories' },
  { id: 'estimator', label: 'Price Estimator', shortLabel: 'Estimator' },
  { id: 'requests', label: 'My Requests', shortLabel: 'Requests' },
];

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  company_name: '',
  website_type: '',
  budget: '',
  project_description: '',
  reference_links: '',
  delivery_timeline: '',
};

const WebsiteDev = () => {
  const { settings } = useSettings();
  const { isMobile } = useMedia();
  const sym = settings.currency_symbol || '₹';
  const [tab, setTab] = useState('overview');
  const [dash, setDash] = useState({});
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [walletBalance, setWalletBalance] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastCode, setLastCode] = useState('');
  const [estCat, setEstCat] = useState(WEBSITE_DEV_CATEGORIES[0].id);
  const [estDomain, setEstDomain] = useState('.com');
  const [estHosting, setEstHosting] = useState('');
  const [estPages, setEstPages] = useState(5);
  const [estCustomDesign, setEstCustomDesign] = useState(false);
  const [estMaintenance, setEstMaintenance] = useState('none');
  const [estFeatures, setEstFeatures] = useState([]);

  const estimate = useMemo(
    () => estimateCostLocal({
      categoryId: estCat,
      featureIds: estFeatures,
      domainExt: estDomain,
      hostingId: estHosting,
      pageCount: estPages,
      customDesign: estCustomDesign,
      maintenanceId: estMaintenance,
    }),
    [estCat, estFeatures, estDomain, estHosting, estPages, estCustomDesign, estMaintenance]
  );

  const load = () => {
    getWebsiteDevDashboard().then((r) => setDash(r.data || {})).catch(() => {});
    getMyWebsiteDevRequests().then((r) => setRequests(r.data || [])).catch(() => setRequests([]));
  };

  const refreshWallet = () => {
    getMe()
      .then((r) => {
        const bal = parseFloat(r.data?.balance);
        setWalletBalance(Number.isFinite(bal) ? bal : 0);
        setForm((f) => ({
          ...f,
          full_name: f.full_name || r.data?.name || '',
          email: f.email || r.data?.email || '',
        }));
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...stored, ...r.data, balance: bal }));
          window.dispatchEvent(new Event('notifications-updated'));
        } catch (_) { /* ignore */ }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshWallet();
    load();
  }, []);

  useEffect(() => {
    if (!formOpen && !successOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [formOpen, successOpen]);

  const openRequest = (cat) => {
    setError('');
    setTermsAgreed(false);
    refreshWallet();
    setForm((f) => ({
      ...EMPTY_FORM,
      full_name: f.full_name,
      email: f.email,
      phone: f.phone,
      company_name: f.company_name,
      website_type: cat.name,
      delivery_timeline: cat.deliveryTime || '',
      budget: formatInrRange(cat.priceMin, cat.priceMax, sym),
    }));
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setError('');
  };

  const toggleFeature = (id) => {
    setEstFeatures((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!String(form.full_name || '').trim()) {
      setError('Full name is required');
      return;
    }
    if (!String(form.email || '').trim()) {
      setError('Email is required');
      return;
    }
    const phoneDigits = String(form.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('Enter a valid phone number (at least 10 digits)');
      return;
    }
    if (!String(form.website_type || '').trim()) {
      setError('Website type is required');
      return;
    }
    if (!termsAgreed) {
      setError('Please agree to terms and conditions');
      return;
    }
    if (walletBalance < CONSULTATION_FEE) {
      setError(`Insufficient Wallet Balance. Need ${sym}${CONSULTATION_FEE}. Please add funds first.`);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      fd.append('terms_agreed', 'true');
      fd.append('hosting_required', 'no');
      const { data } = await submitWebsiteDevRequest(fd);
      setLastCode(data.request_code || `#${data.request_id}`);
      setFormOpen(false);
      setSuccessOpen(true);
      const newBal = parseFloat(data.balance);
      if (Number.isFinite(newBal)) {
        setWalletBalance(newBal);
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...stored, balance: newBal }));
        } catch (_) { /* ignore */ }
      }
      window.dispatchEvent(new Event('notifications-updated'));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
    setSubmitting(false);
  };

  const openTracking = async (id) => {
    try {
      const { data } = await getWebsiteDevOrder(id);
      setSelectedRequest(data);
      setTab('requests');
    } catch (_) {}
  };

  const dashCards = [
    { label: 'Total Requests', value: dash.total_requests || 0, icon: '📋' },
    { label: 'Active Projects', value: dash.active_projects || 0, icon: '⚡' },
    { label: 'Quotations Sent', value: dash.quotations_sent || 0, icon: '📝' },
    { label: 'Completed Projects', value: dash.completed_projects || 0, icon: '✅' },
    { label: 'Revenue Generated', value: dash.revenue_generated || 0, icon: '💰', isMoney: true, wide: true },
  ];

  const estimatorFeatures = FEATURE_OPTIONS.filter((f) => !f.estimatorOnly || estFeatures.includes(f.id) || f.id === 'custom_design');
  const canAfford = walletBalance >= CONSULTATION_FEE;

  const requestModal = formOpen ? createPortal(
    <div
      className="modal-overlay website-dev-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="website-dev-request-title"
      onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
    >
      <div className="modal-panel website-dev-form-panel">
        <div className="website-dev-form-panel__head">
          <div>
            <h2 id="website-dev-request-title">Request Website</h2>
            <p className="website-dev-form-fee">
              Consultation fee {sym}{CONSULTATION_FEE} will be deducted from your wallet
              (adjusted in final project cost).
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm website-dev-form-close" onClick={closeForm} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="website-dev-form-panel__body">
          <div className={`website-dev-wallet-banner ${canAfford ? 'is-ok' : 'is-low'}`}>
            <span>Wallet: <strong>{sym}{walletBalance.toFixed(2)}</strong></span>
            <span>Fee: <strong>{sym}{CONSULTATION_FEE}</strong></span>
            {!canAfford && (
              <Link to="/add-funds" className="btn btn-primary btn-sm" onClick={closeForm}>
                Add Funds
              </Link>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form id="website-dev-request-form" className="website-dev-request-form" onSubmit={handleSubmit} noValidate>
            <div className="website-dev-form-grid">
              <div className="website-dev-field">
                <label htmlFor="wd-full-name">Full Name *</label>
                <input
                  id="wd-full-name"
                  className="input"
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="website-dev-field">
                <label htmlFor="wd-email">Email *</label>
                <input
                  id="wd-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="website-dev-field">
                <label htmlFor="wd-phone">Phone Number *</label>
                <input
                  id="wd-phone"
                  className="input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="10-digit mobile"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="website-dev-field">
                <label htmlFor="wd-company">Company Name</label>
                <input
                  id="wd-company"
                  className="input"
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                />
              </div>
              <div className="website-dev-field website-dev-field--full">
                <label htmlFor="wd-type">Website Type *</label>
                <select
                  id="wd-type"
                  className="select"
                  value={form.website_type}
                  onChange={(e) => setForm({ ...form, website_type: e.target.value })}
                >
                  {WEBSITE_DEV_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="website-dev-field">
                <label htmlFor="wd-budget">Budget</label>
                <input
                  id="wd-budget"
                  className="input"
                  type="text"
                  placeholder="e.g. ₹15,000 – ₹50,000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div className="website-dev-field">
                <label htmlFor="wd-deadline">Delivery Deadline</label>
                <input
                  id="wd-deadline"
                  className="input"
                  type="text"
                  placeholder="e.g. 10–25 days"
                  value={form.delivery_timeline}
                  onChange={(e) => setForm({ ...form, delivery_timeline: e.target.value })}
                />
              </div>
              <div className="website-dev-field website-dev-field--full">
                <label htmlFor="wd-desc">Project Description</label>
                <textarea
                  id="wd-desc"
                  className="textarea"
                  rows={4}
                  placeholder="Tell us about your project goals, pages, and must-have features"
                  value={form.project_description}
                  onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                />
              </div>
              <div className="website-dev-field website-dev-field--full">
                <label htmlFor="wd-ref">Reference Website URL</label>
                <input
                  id="wd-ref"
                  className="input"
                  type="url"
                  placeholder="https://example.com"
                  value={form.reference_links}
                  onChange={(e) => setForm({ ...form, reference_links: e.target.value })}
                />
              </div>
              <label className="website-dev-terms website-dev-field--full">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                />
                <span>I agree to terms and conditions</span>
              </label>
            </div>
          </form>
          {!canAfford && (
            <p className="website-dev-form-hint">
              Add at least {sym}{(CONSULTATION_FEE - walletBalance).toFixed(2)} more to submit this request.{' '}
              <Link to="/add-funds" onClick={closeForm}>Go to Add Funds</Link>
            </p>
          )}
        </div>

        <div className="website-dev-form-panel__foot">
          <button
            type="submit"
            form="website-dev-request-form"
            className="btn btn-primary"
            disabled={submitting || !canAfford}
          >
            {submitting ? 'Submitting…' : `Submit & pay ${sym}${CONSULTATION_FEE}`}
          </button>
          <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={submitting}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const successModal = successOpen ? createPortal(
    <div className="modal-overlay website-dev-success-modal" role="dialog" aria-modal="true">
      <div className="modal-panel website-dev-success-panel">
        <h2>Request Submitted</h2>
        {lastCode && <p className="website-dev-success-id">{lastCode}</p>}
        <p>Your website development request has been received. Our team will review your requirements and contact you shortly.</p>
        <p>The {sym}{CONSULTATION_FEE} consultation fee has been paid and will be adjusted in your final project cost after confirmation.</p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={() => { setSuccessOpen(false); setTab('requests'); }}
        >
          View My Requests
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <UserLayout title="Website Development">
      <div className="website-dev-page website-dev-page--premium">
        <header className="website-dev-hero">
          <div className="website-dev-hero__glow" aria-hidden="true" />
          <h1 className="website-dev-page__title">Website Development Studio</h1>
          <p className="website-dev-page__sub">
            Premium websites, apps &amp; enterprise solutions — professional agency dashboard
          </p>
        </header>

        <div className="website-dev-tabs-wrap">
          <nav className="website-dev-tabs" aria-label="Sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`website-dev-tab${tab === t.id ? ' is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {isMobile ? t.shortLabel : t.label}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'overview' && (
          <>
            <div className="website-dev-dash-grid">
              {dashCards.map((c) => (
                <div key={c.label} className={`website-dev-glass website-dev-stat${c.wide ? ' website-dev-stat--wide' : ''}`}>
                  <div className="website-dev-stat__icon">{c.icon}</div>
                  <div className="website-dev-stat__value animated-counter">
                    {c.isMoney ? (
                      formatInr(c.value, sym)
                    ) : (
                      <AnimatedCounter value={c.value} />
                    )}
                  </div>
                  <div className="stat-label">{c.label}</div>
                </div>
              ))}
            </div>
            <div className="website-dev-glass website-dev-success-rate">
              <div className="website-dev-success-rate__head">
                <span>Project Success Rate</span>
                <strong>{PROJECT_SUCCESS_RATE}%</strong>
              </div>
              <div
                className="website-dev-success-rate__track"
                role="progressbar"
                aria-valuenow={PROJECT_SUCCESS_RATE}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="website-dev-success-rate__bar"
                  style={{ width: `${PROJECT_SUCCESS_RATE}%` }}
                />
              </div>
            </div>
            <div className="website-dev-trust">
              {TRUST_STATS.map((s) => (
                <div key={s.label} className="website-dev-glass website-dev-trust__item">
                  <span className="website-dev-trust__icon" aria-hidden="true">{s.icon || '⭐'}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="website-dev-glass website-dev-consult-card">
              <h2>Website Consultation Fee: {sym}{CONSULTATION_FEE}</h2>
              <p>
                A {sym}{CONSULTATION_FEE} consultation fee is deducted from your wallet when you submit a request.
                After project confirmation it is adjusted in the final website cost.
              </p>
              <div className="website-dev-consult-example">
                <p><span>Project quote</span><span>{sym}50,000</span></p>
                <p><span>Consultation credit</span><span>− {sym}{CONSULTATION_FEE}</span></p>
                <p className="website-dev-consult-example__final">
                  <span>You pay after confirmation</span>
                  <span>{formatInr(50000 - CONSULTATION_FEE, sym)}</span>
                </p>
              </div>
              <div className="website-dev-consult-actions">
                <button type="button" className="btn btn-primary" onClick={() => setTab('categories')}>
                  Browse categories
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setTab('estimator')}>
                  Try price estimator
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'categories' && (
          <div className="website-dev-grid">
            {WEBSITE_DEV_CATEGORIES.map((cat) => (
              <article key={cat.id} className="website-dev-glass website-dev-card">
                <div className="website-dev-card__icon" aria-hidden="true">{cat.icon}</div>
                <h2 className="website-dev-card__title">{cat.name}</h2>
                <p className="website-dev-card__price">{formatInrRange(cat.priceMin, cat.priceMax, sym)}</p>
                <p className="website-dev-card__meta"><strong>Delivery:</strong> {cat.deliveryTime}</p>
                <ul className="website-dev-card__features">
                  {cat.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <button type="button" className="btn btn-primary website-dev-card__btn" onClick={() => openRequest(cat)}>
                  Request Website
                </button>
              </article>
            ))}
          </div>
        )}

        {tab === 'estimator' && (
          <div className="website-dev-glass website-dev-estimator">
            <h2>Live Price Estimator</h2>
            <p className="website-dev-estimator__sub">
              Adjust options below — estimate updates instantly. Final quote may vary after requirement review.
            </p>
            <div className="website-dev-estimator-grid">
              <div className="website-dev-field">
                <label htmlFor="est-type">Website Type</label>
                <select id="est-type" className="select" value={estCat} onChange={(e) => setEstCat(e.target.value)}>
                  {WEBSITE_DEV_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="website-dev-field">
                <label htmlFor="est-domain">Domain Extension</label>
                <select id="est-domain" className="select" value={estDomain} onChange={(e) => setEstDomain(e.target.value)}>
                  {DOMAIN_EXTENSIONS.map((d) => (
                    <option key={d.ext} value={d.ext}>{d.ext} ({formatInr(d.priceYear, sym)}/yr)</option>
                  ))}
                </select>
              </div>
              <div className="website-dev-field">
                <label htmlFor="est-hosting">Hosting Plan</label>
                <select id="est-hosting" className="select" value={estHosting} onChange={(e) => setEstHosting(e.target.value)}>
                  <option value="">None</option>
                  {HOSTING_PLANS.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({formatInr(h.priceYear, sym)}/yr)</option>
                  ))}
                </select>
              </div>
              <div className="website-dev-field">
                <label htmlFor="est-pages">Number Of Pages</label>
                <input
                  id="est-pages"
                  className="input"
                  type="number"
                  min={1}
                  max={200}
                  value={estPages}
                  onChange={(e) => setEstPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
              </div>
              <div className="website-dev-field">
                <label htmlFor="est-maint">Maintenance Plan</label>
                <select id="est-maint" className="select" value={estMaintenance} onChange={(e) => setEstMaintenance(e.target.value)}>
                  {MAINTENANCE_PLANS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.priceYear ? ` (${formatInr(m.priceYear, sym)}/yr)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="website-dev-field">
                <label className="website-dev-toggle-label" htmlFor="est-custom">Custom Design</label>
                <label className="website-dev-toggle" htmlFor="est-custom">
                  <input
                    id="est-custom"
                    type="checkbox"
                    checked={estCustomDesign}
                    onChange={(e) => setEstCustomDesign(e.target.checked)}
                  />
                  <span>{estCustomDesign ? 'Enabled (+ design premium)' : 'Not included'}</span>
                </label>
              </div>
            </div>

            <p className="website-dev-addons-title">Add-ons</p>
            <div className="website-dev-features-grid">
              {estimatorFeatures.filter((f) => f.id !== 'custom_design').map((f) => (
                <label key={f.id} className={`website-dev-feature-check${estFeatures.includes(f.id) ? ' is-on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={estFeatures.includes(f.id)}
                    onChange={() => toggleFeature(f.id)}
                  />
                  <span className="website-dev-feature-check__text">
                    <strong>{f.label}</strong>
                    <small>+{formatInr(f.cost, sym)}</small>
                  </span>
                </label>
              ))}
            </div>

            <div className="website-dev-estimate-results">
              <div className="website-dev-estimate-result">
                <span>Estimated Cost</span>
                <strong>{formatInr(estimate.estimated, sym)}</strong>
                <small>{formatInr(estimate.min, sym)} – {formatInr(estimate.max, sym)}</small>
              </div>
              <div className="website-dev-estimate-result">
                <span>Development Time</span>
                <strong>{estimate.developmentTime}</strong>
              </div>
              <div className="website-dev-estimate-result">
                <span>Recommended Plan</span>
                <strong>{estimate.recommendedPlan}</strong>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary website-dev-estimator__cta"
              onClick={() => {
                const cat = WEBSITE_DEV_CATEGORIES.find((c) => c.id === estCat) || WEBSITE_DEV_CATEGORIES[0];
                openRequest(cat);
              }}
            >
              Request this website · pay {sym}{CONSULTATION_FEE} consultation
            </button>
          </div>
        )}

        {tab === 'requests' && (
          <>
            {selectedRequest && (
              <div className="website-dev-glass website-dev-tracking" style={{ marginBottom: 16 }}>
                <div className="website-dev-tracking__head">
                  <h2>{selectedRequest.request_code || `#${selectedRequest.id}`} — {selectedRequest.website_type}</h2>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedRequest(null)}>Close</button>
                </div>
                <div className="website-dev-progress">
                  <div className="website-dev-progress__bar" style={{ width: `${projectProgress(selectedRequest.project_status)}%` }} />
                </div>
                <div className="website-dev-crm-steps">
                  {CRM_STATUSES.map((s, i) => {
                    const cur = CRM_STATUSES.findIndex((x) => x.key === selectedRequest.project_status);
                    return (
                      <span key={s.key} className={`website-dev-status-pill${i <= cur ? ' is-done' : ''}`}>
                        {s.label}
                      </span>
                    );
                  })}
                </div>
                {selectedRequest.quotation && (
                  <div className="website-dev-quote-box">
                    <p><strong>Quotation:</strong> {formatInr(selectedRequest.quotation.final_price, sym)}</p>
                    {selectedRequest.quotation.payable_after_consultation != null && (
                      <p><strong>After consultation credit:</strong> {formatInr(selectedRequest.quotation.payable_after_consultation, sym)}</p>
                    )}
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => openWebsiteDevQuotePrint(selectedRequest.id)}>View Quote</button>
                  </div>
                )}
              </div>
            )}
            <h2 className="website-dev-my__title">My Website Requests</h2>
            {requests.length === 0 ? (
              <div className="website-dev-glass user-panel-empty">
                <p className="user-panel-empty-title">No requests yet</p>
                <span>Pick a category and submit your first brief.</span>
                <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setTab('categories')}>
                  Browse categories
                </button>
              </div>
            ) : (
              <>
                <div className="table-wrap user-panel-table-wrap website-dev-glass">
                  <table className="website-dev-crm-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Developer</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.request_code || `#${r.id}`}</td>
                          <td>{r.website_type}</td>
                          <td><span className="website-dev-status-pill">{getCrmStatusLabel(r.project_status, r.status)}</span></td>
                          <td>{requestAmount(r, sym)}</td>
                          <td>{r.assigned_developer || '—'}</td>
                          <td>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => openTracking(r.id)}>Track</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="user-panel-mobile-list">
                  {requests.map((r) => (
                    <article className="card user-panel-mobile-card" key={`wd-m-${r.id}`}>
                      <div className="user-panel-mobile-top">
                        <strong>{r.request_code || `#${r.id}`}</strong>
                        <span className="website-dev-status-pill">{getCrmStatusLabel(r.project_status, r.status)}</span>
                      </div>
                      <div className="user-panel-mobile-row"><span>Type</span><span>{r.website_type}</span></div>
                      <div className="user-panel-mobile-row"><span>Amount</span><span>{requestAmount(r, sym)}</span></div>
                      <div className="user-panel-mobile-row"><span>Developer</span><span>{r.assigned_developer || '—'}</span></div>
                      <button type="button" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => openTracking(r.id)}>Track</button>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {requestModal}
      {successModal}
    </UserLayout>
  );
};

export default WebsiteDev;
