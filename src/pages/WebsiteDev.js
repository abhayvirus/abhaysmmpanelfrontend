import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
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
  PROJECT_STAGES,
  PRICE_FACTORS,
  CONSULTATION_FEE,
  formatInr,
  formatInrRange,
  estimateCostLocal,
  projectProgress,
} from '../content/websiteDevCategories';
import '../styles/websiteDevPage.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'categories', label: 'Categories' },
  { id: 'estimator', label: 'Price Estimator' },
  { id: 'requests', label: 'My Requests' },
];

const EMPTY_FORM = {
  full_name: '', email: '', phone: '', whatsapp: '', company_name: '',
  business_category: '', website_type: '', project_description: '', budget: '',
  preferred_domain: '', domain_extension: '', hosting_required: 'no', hosting_plan: '',
  reference_links: '', target_audience: '', delivery_timeline: '', additional_notes: '',
};

const WebsiteDev = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [tab, setTab] = useState('overview');
  const [dash, setDash] = useState({});
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastCode, setLastCode] = useState('');
  const [estCat, setEstCat] = useState(WEBSITE_DEV_CATEGORIES[0].id);
  const [estDomain, setEstDomain] = useState('.com');
  const [estHosting, setEstHosting] = useState('');
  const [estFeatures, setEstFeatures] = useState([]);

  const estimate = useMemo(
    () => estimateCostLocal({ categoryId: estCat, featureIds: estFeatures, domainExt: estDomain, hostingId: estHosting }),
    [estCat, estFeatures, estDomain, estHosting]
  );

  const load = () => {
    getWebsiteDevDashboard().then((r) => setDash(r.data || {})).catch(() => {});
    getMyWebsiteDevRequests().then((r) => setRequests(r.data || [])).catch(() => setRequests([]));
  };

  useEffect(() => {
    getMe().then((r) => setForm((f) => ({ ...f, full_name: r.data.name || '', email: r.data.email || '' }))).catch(() => {});
    load();
  }, []);

  const openRequest = (cat) => {
    setError('');
    setSelectedFeatures([]);
    setFiles([]);
    setForm((f) => ({
      ...f,
      website_type: cat.name,
      domain_extension: estDomain,
      hosting_plan: estHosting,
    }));
    setFormOpen(true);
  };

  const toggleFeature = (id, list, setter) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      fd.append('required_features', JSON.stringify(selectedFeatures));
      fd.append('hosting_required', form.hosting_required);
      files.forEach((f) => fd.append('files', f));
      const { data } = await submitWebsiteDevRequest(fd);
      setLastCode(data.request_code || `#${data.request_id}`);
      setFormOpen(false);
      setSuccessOpen(true);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      if (data.balance != null) localStorage.setItem('user', JSON.stringify({ ...stored, balance: data.balance }));
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
    { label: 'Pending Quotations', value: dash.pending_quotations || 0, icon: '📄' },
    { label: 'Completed', value: dash.completed_projects || 0, icon: '✅' },
    { label: 'Refunds Done', value: dash.refunds_completed || 0, icon: '💰' },
  ];

  return (
    <UserLayout title="Website Development">
      <div className="website-dev-page">
        <header className="website-dev-page__header">
          <h1 className="website-dev-page__title">🌐 Website Development</h1>
          <p className="website-dev-page__sub">Professional websites, apps & enterprise solutions — from ₹5,000 to ₹50,00,000+</p>
        </header>

        <nav className="website-dev-tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`website-dev-tab${tab === t.id ? ' is-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <>
            <div className="website-dev-dash-grid">
              {dashCards.map((c) => (
                <div key={c.label} className="stat-card website-dev-stat">
                  <span className="website-dev-stat__icon" aria-hidden="true">{c.icon}</span>
                  <div className="stat-value">{c.value}</div>
                  <div className="stat-label">{c.label}</div>
                </div>
              ))}
            </div>
            <div className="card website-dev-price-info">
              <h2>Price information</h2>
              <p>Final project cost depends on:</p>
              <ul>{PRICE_FACTORS.map((f) => <li key={f}>{f}</li>)}</ul>
              <p className="website-dev-price-info__range">Estimated range: {sym}5,000 to {sym}50,00,000+</p>
            </div>
            <div className="website-dev-fee-banner">
              Consultation fee: <strong>{sym}{CONSULTATION_FEE}</strong> (refundable after requirement review)
            </div>
          </>
        )}

        {tab === 'categories' && (
          <>
            <div className="website-dev-grid">
              {WEBSITE_DEV_CATEGORIES.map((cat) => (
                <article key={cat.id} className="card website-dev-card">
                  <div className="website-dev-card__icon" aria-hidden="true">{cat.icon}</div>
                  <h2 className="website-dev-card__title">{cat.name}</h2>
                  <p className="website-dev-card__desc">{cat.description}</p>
                  <p className="website-dev-card__price">{formatInrRange(cat.priceMin, cat.priceMax, sym)}</p>
                  <p className="website-dev-card__meta"><strong>Delivery:</strong> {cat.deliveryTime}</p>
                  <ul className="website-dev-card__features">{cat.features.map((f) => <li key={f}>{f}</li>)}</ul>
                  <button type="button" className="btn btn-primary website-dev-card__btn" onClick={() => openRequest(cat)}>Request Website</button>
                </article>
              ))}
            </div>
            <section className="card website-dev-section">
              <h2>Popular domain extensions</h2>
              <div className="website-dev-domain-grid">
                {DOMAIN_EXTENSIONS.map((d) => (
                  <div key={d.ext} className="website-dev-domain-chip">
                    <strong>{d.ext}</strong>
                    <span>{sym}{d.priceYear.toLocaleString('en-IN')}/yr</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="card website-dev-section">
              <h2>Hosting plans</h2>
              <div className="website-dev-hosting-grid">
                {HOSTING_PLANS.map((h) => (
                  <article key={h.id} className="website-dev-hosting-card">
                    <h3>{h.name}</h3>
                    <p className="website-dev-hosting-price">{sym}{h.priceYear.toLocaleString('en-IN')}/yr</p>
                    <ul>
                      <li>Storage: {h.storage}</li>
                      <li>Bandwidth: {h.bandwidth}</li>
                      <li>SSL: {h.ssl ? 'Yes' : 'No'}</li>
                      <li>Backup: {h.backup}</li>
                      <li>Email: {h.emailAccounts}</li>
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'estimator' && (
          <div className="card website-dev-estimator">
            <h2>Price estimator</h2>
            <div className="form-group">
              <label className="label">Website type</label>
              <select className="select" value={estCat} onChange={(e) => setEstCat(e.target.value)}>
                {WEBSITE_DEV_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Domain extension</label>
              <select className="select" value={estDomain} onChange={(e) => setEstDomain(e.target.value)}>
                {DOMAIN_EXTENSIONS.map((d) => <option key={d.ext} value={d.ext}>{d.ext}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Hosting plan</label>
              <select className="select" value={estHosting} onChange={(e) => setEstHosting(e.target.value)}>
                <option value="">None selected</option>
                {HOSTING_PLANS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <p className="label">Features</p>
            <div className="website-dev-features-grid">
              {FEATURE_OPTIONS.map((f) => (
                <label key={f.id} className="website-dev-feature-check">
                  <input type="checkbox" checked={estFeatures.includes(f.id)} onChange={() => toggleFeature(f.id, estFeatures, setEstFeatures)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
            <div className="website-dev-estimate-result">
              <span>Estimated cost range</span>
              <strong>{formatInr(estimate.min, sym)} – {formatInr(estimate.max, sym)}</strong>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <>
            {selectedRequest && (
              <div className="card website-dev-tracking">
                <div className="website-dev-tracking__head">
                  <h2>{selectedRequest.request_code || `#${selectedRequest.id}`} — {selectedRequest.website_type}</h2>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedRequest(null)}>Close</button>
                </div>
                <div className="website-dev-progress">
                  <div className="website-dev-progress__bar" style={{ width: `${projectProgress(selectedRequest.project_status)}%` }} />
                </div>
                <ol className="website-dev-stages">
                  {PROJECT_STAGES.map((s) => {
                    const cur = PROJECT_STAGES.findIndex((x) => x.key === selectedRequest.project_status);
                    const done = s.step <= (cur + 1);
                    return (
                      <li key={s.key} className={done ? 'is-done' : ''}>{s.label}</li>
                    );
                  })}
                </ol>
                {selectedRequest.quotation && (
                  <div className="website-dev-quote-box">
                    <p><strong>Quotation:</strong> {formatInr(selectedRequest.quotation.final_price, sym)}</p>
                    <a href="#quote" className="btn btn-primary btn-sm" onClick={(e) => { e.preventDefault(); openWebsiteDevQuotePrint(selectedRequest.id); }}>View / Print Quote</a>
                  </div>
                )}
              </div>
            )}
            <h2 className="website-dev-my__title">My Website Requests</h2>
            {requests.length === 0 ? (
              <div className="card user-panel-empty"><p className="user-panel-empty-title">No requests yet</p></div>
            ) : (
              <>
                <div className="table-wrap user-panel-table-wrap card">
                  <table>
                    <thead>
                      <tr>
                        <th>Request ID</th><th>Website Type</th><th>Date</th><th>Status</th>
                        <th>Fee</th><th>Refund</th><th>Quote</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.request_code || `#${r.id}`}</td>
                          <td>{r.website_type}</td>
                          <td>{new Date(r.created_at).toLocaleDateString()}</td>
                          <td><span className="badge badge-info">{r.project_status?.replace(/_/g, ' ') || r.status}</span></td>
                          <td>{sym}{parseFloat(r.wallet_fee || 99).toFixed(0)}</td>
                          <td>{r.refund_status === 'completed' ? 'Completed' : 'Pending'}</td>
                          <td>{r.quotation_status === 'sent' ? 'Sent' : '—'}</td>
                          <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openTracking(r.id)}>Track</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="user-panel-mobile-list">
                  {requests.map((r) => (
                    <article key={r.id} className="card user-panel-mobile-card">
                      <div className="user-panel-mobile-top">
                        <strong>{r.request_code || `#${r.id}`}</strong>
                        <span className="badge badge-info">{r.status}</span>
                      </div>
                      <div className="user-panel-mobile-row"><span>Type</span><span>{r.website_type}</span></div>
                      <button type="button" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => openTracking(r.id)}>Track Project</button>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {formOpen && (
        <div className="modal-overlay website-dev-modal" role="dialog" aria-modal="true">
          <div className="modal-panel card website-dev-form-panel">
            <h2>Website Request Form</h2>
            <p className="website-dev-form-fee">Consultation fee: {sym}{CONSULTATION_FEE} (deducted from wallet)</p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="website-dev-form-grid">
                {[
                  ['full_name', 'Full Name *', 'text'], ['email', 'Email Address *', 'email'],
                  ['phone', 'Mobile Number *', 'tel'], ['whatsapp', 'WhatsApp Number', 'tel'],
                  ['company_name', 'Company Name', 'text'], ['business_category', 'Business Category', 'text'],
                  ['website_type', 'Website Type *', 'text'], ['budget', 'Estimated Budget', 'text'],
                  ['preferred_domain', 'Preferred Domain', 'text'], ['delivery_timeline', 'Delivery Timeline', 'text'],
                ].map(([key, label, type]) => (
                  <div key={key} className="form-group">
                    <label className="label">{label}</label>
                    <input className="input" type={type} required={label.includes('*')} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="label">Domain Extension</label>
                  <select className="select" value={form.domain_extension} onChange={(e) => setForm({ ...form, domain_extension: e.target.value })}>
                    <option value="">Select</option>
                    {DOMAIN_EXTENSIONS.map((d) => <option key={d.ext} value={d.ext}>{d.ext}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Hosting Required</label>
                  <select className="select" value={form.hosting_required} onChange={(e) => setForm({ ...form, hosting_required: e.target.value })}>
                    <option value="no">No</option><option value="yes">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Hosting Plan</label>
                  <select className="select" value={form.hosting_plan} onChange={(e) => setForm({ ...form, hosting_plan: e.target.value })}>
                    <option value="">Select</option>
                    {HOSTING_PLANS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div className="form-group form-group--full">
                  <label className="label">Target Audience</label>
                  <input className="input" value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} />
                </div>
                <div className="form-group form-group--full">
                  <label className="label">Project Description</label>
                  <textarea className="textarea" rows={3} value={form.project_description} onChange={(e) => setForm({ ...form, project_description: e.target.value })} />
                </div>
                <div className="form-group form-group--full">
                  <label className="label">Reference Website Links</label>
                  <textarea className="textarea" rows={2} value={form.reference_links} onChange={(e) => setForm({ ...form, reference_links: e.target.value })} />
                </div>
                <div className="form-group form-group--full">
                  <label className="label">Additional Notes</label>
                  <textarea className="textarea" rows={2} value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} />
                </div>
                <div className="form-group form-group--full">
                  <label className="label">Required Features</label>
                  <div className="website-dev-features-grid">
                    {FEATURE_OPTIONS.map((f) => (
                      <label key={f.id} className="website-dev-feature-check">
                        <input type="checkbox" checked={selectedFeatures.includes(f.id)} onChange={() => toggleFeature(f.id, selectedFeatures, setSelectedFeatures)} />
                        <span>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group form-group--full">
                  <label className="label">Upload files (logo, images, PDF)</label>
                  <input className="input" type="file" multiple accept="image/*,.pdf" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                </div>
              </div>
              <div className="website-dev-form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : `Submit & pay ${sym}${CONSULTATION_FEE}`}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              </div>
              {error?.includes('Insufficient') && <Link to="/add-funds" className="btn btn-sm btn-primary" style={{ marginTop: 12 }}>Add Funds</Link>}
            </form>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="modal-overlay website-dev-success-modal" role="dialog" aria-modal="true">
          <div className="modal-panel card">
            <h2>Website Request Submitted Successfully</h2>
            {lastCode && <p style={{ fontWeight: 700, color: 'var(--primary)' }}>{lastCode}</p>}
            <p>Thank you for your interest in our Website Development Services.</p>
            <p>A refundable consultation fee of ₹99 has been deducted from your wallet.</p>
            <p>Our team will review your requirements and contact you shortly.</p>
            <p>This consultation fee can be refunded by the admin after requirement review.</p>
            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSuccessOpen(false); setTab('requests'); }}>OK</button>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default WebsiteDev;
