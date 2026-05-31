import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import AnimatedCounter from '../components/AnimatedCounter';
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
  { id: 'overview', label: 'Overview' },
  { id: 'categories', label: 'Categories' },
  { id: 'estimator', label: 'Price Estimator' },
  { id: 'requests', label: 'My Requests' },
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
  const sym = settings.currency_symbol || '₹';
  const [tab, setTab] = useState('overview');
  const [dash, setDash] = useState({});
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
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

  useEffect(() => {
    getMe().then((r) => setForm((f) => ({ ...f, full_name: r.data.name || '', email: r.data.email || '' }))).catch(() => {});
    load();
  }, []);

  const openRequest = (cat) => {
    setError('');
    setTermsAgreed(false);
    setForm((f) => ({
      ...EMPTY_FORM,
      full_name: f.full_name,
      email: f.email,
      phone: f.phone,
      company_name: f.company_name,
      website_type: cat.name,
    }));
    setFormOpen(true);
  };

  const toggleFeature = (id) => {
    setEstFeatures((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAgreed) {
      setError('Please agree to terms and conditions');
      return;
    }
    setError('');
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
    { label: 'Quotations Sent', value: dash.quotations_sent || 0, icon: '📝' },
    { label: 'Completed Projects', value: dash.completed_projects || 0, icon: '✅' },
    { label: 'Revenue Generated', value: dash.revenue_generated || 0, icon: '💰', isMoney: true },
  ];

  const estimatorFeatures = FEATURE_OPTIONS.filter((f) => !f.estimatorOnly || estFeatures.includes(f.id) || f.id === 'custom_design');

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

        <nav className="website-dev-tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`website-dev-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <>
            <div className="website-dev-dash-grid">
              {dashCards.map((c) => (
                <div key={c.label} className="website-dev-glass website-dev-stat">
                  <span className="website-dev-stat__icon" aria-hidden="true">{c.icon}</span>
                  <div className="stat-value website-dev-stat__value">
                    {c.isMoney ? (
                      <AnimatedCounter value={c.value} prefix={sym} />
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
              <div className="website-dev-progress">
                <div
                  className="website-dev-progress__bar"
                  style={{ width: `${PROJECT_SUCCESS_RATE}%` }}
                />
              </div>
            </div>

            <section className="website-dev-trust">
              {TRUST_STATS.map((t) => (
                <div key={t.label} className="website-dev-glass website-dev-trust__item">
                  <span aria-hidden="true">{t.icon}</span>
                  <span>{t.label}</span>
                </div>
              ))}
            </section>

            <div className="website-dev-glass website-dev-consult-card">
              <h2>💼 Website Consultation Fee: {sym}{CONSULTATION_FEE}</h2>
              <p>This amount is <strong>NOT refundable</strong>.</p>
              <p>
                After project confirmation, the {sym}{CONSULTATION_FEE} consultation fee will be
                automatically adjusted in the final website cost.
              </p>
              <div className="website-dev-consult-example">
                <p><span>Website Cost</span><strong>{sym}10,000</strong></p>
                <p><span>Consultation Paid</span><strong>{sym}99</strong></p>
                <p className="website-dev-consult-example__final">
                  <span>Final Payable</span><strong>{sym}9,901</strong>
                </p>
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
            <div className="website-dev-estimator-grid">
              <div className="form-group">
                <label className="label">Website Type</label>
                <select className="select" value={estCat} onChange={(e) => setEstCat(e.target.value)}>
                  {WEBSITE_DEV_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Domain Extension</label>
                <select className="select" value={estDomain} onChange={(e) => setEstDomain(e.target.value)}>
                  {DOMAIN_EXTENSIONS.map((d) => <option key={d.ext} value={d.ext}>{d.ext}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Hosting Plan</label>
                <select className="select" value={estHosting} onChange={(e) => setEstHosting(e.target.value)}>
                  <option value="">None</option>
                  {HOSTING_PLANS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Number Of Pages</label>
                <input className="input" type="number" min={1} max={200} value={estPages} onChange={(e) => setEstPages(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Maintenance Plan</label>
                <select className="select" value={estMaintenance} onChange={(e) => setEstMaintenance(e.target.value)}>
                  {MAINTENANCE_PLANS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <label className="website-dev-feature-check website-dev-feature-check--block">
                <input type="checkbox" checked={estCustomDesign} onChange={(e) => setEstCustomDesign(e.target.checked)} />
                <span>Custom Design</span>
              </label>
            </div>
            <p className="label">Add-ons</p>
            <div className="website-dev-features-grid">
              {estimatorFeatures.filter((f) => f.id !== 'custom_design').map((f) => (
                <label key={f.id} className="website-dev-feature-check">
                  <input type="checkbox" checked={estFeatures.includes(f.id)} onChange={() => toggleFeature(f.id)} />
                  <span>{f.label}</span>
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
          </div>
        )}

        {tab === 'requests' && (
          <>
            {selectedRequest && (
              <div className="website-dev-glass website-dev-tracking">
                <div className="website-dev-tracking__head">
                  <h2>{selectedRequest.request_code || `#${selectedRequest.id}`} — {selectedRequest.website_type}</h2>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedRequest(null)}>Close</button>
                </div>
                <div className="website-dev-progress">
                  <div className="website-dev-progress__bar" style={{ width: `${projectProgress(selectedRequest.project_status)}%` }} />
                </div>
                <ol className="website-dev-stages">
                  {CRM_STATUSES.map((s) => {
                    const cur = CRM_STATUSES.findIndex((x) => x.key === selectedRequest.project_status);
                    const done = cur >= 0 && CRM_STATUSES.indexOf(s) <= cur;
                    return <li key={s.key} className={done ? 'is-done' : ''}>{s.label}</li>;
                  })}
                </ol>
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
              <div className="website-dev-glass user-panel-empty"><p className="user-panel-empty-title">No requests yet</p></div>
            ) : (
              <>
                <div className="table-wrap user-panel-table-wrap website-dev-glass">
                  <table className="website-dev-crm-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Website Type</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Assigned Developer</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.request_code || `#${r.id}`}</td>
                          <td>{r.website_type}</td>
                          <td><span className="website-dev-status-pill">{getCrmStatusLabel(r.project_status, r.status)}</span></td>
                          <td>{new Date(r.created_at).toLocaleDateString()}</td>
                          <td>{requestAmount(r, sym)}</td>
                          <td>{r.assigned_developer || '—'}</td>
                          <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openTracking(r.id)}>Track</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="user-panel-mobile-list">
                  {requests.map((r) => (
                    <article key={r.id} className="website-dev-glass user-panel-mobile-card">
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

      {formOpen && (
        <div className="modal-overlay website-dev-modal" role="dialog" aria-modal="true">
          <div className="modal-panel website-dev-glass website-dev-form-panel">
            <h2>Request Website</h2>
            <p className="website-dev-form-fee">Consultation fee {sym}{CONSULTATION_FEE} will be deducted from your wallet (adjusted in final project cost).</p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="website-dev-form-grid">
                {[
                  ['full_name', 'Full Name *', 'text'],
                  ['email', 'Email *', 'email'],
                  ['phone', 'Phone Number *', 'tel'],
                  ['company_name', 'Company Name', 'text'],
                  ['website_type', 'Website Type *', 'text'],
                  ['budget', 'Budget', 'text'],
                  ['delivery_timeline', 'Delivery Deadline', 'text'],
                ].map(([key, label, type]) => (
                  <div key={key} className="form-group">
                    <label className="label">{label}</label>
                    <input
                      className="input"
                      type={type}
                      required={label.includes('*')}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="form-group form-group--full">
                  <label className="label">Project Description</label>
                  <textarea className="textarea" rows={3} value={form.project_description} onChange={(e) => setForm({ ...form, project_description: e.target.value })} />
                </div>
                <div className="form-group form-group--full">
                  <label className="label">Reference Website URL</label>
                  <input className="input" type="url" placeholder="https://" value={form.reference_links} onChange={(e) => setForm({ ...form, reference_links: e.target.value })} />
                </div>
                <label className="website-dev-terms form-group--full">
                  <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />
                  <span>I agree to terms and conditions</span>
                </label>
              </div>
              <div className="website-dev-form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : `Submit & pay ${sym}${CONSULTATION_FEE}`}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              </div>
              {error?.includes('Insufficient') && (
                <Link to="/add-funds" className="btn btn-sm btn-primary" style={{ marginTop: 12 }}>Add Funds</Link>
              )}
            </form>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="modal-overlay website-dev-success-modal" role="dialog" aria-modal="true">
          <div className="modal-panel website-dev-glass">
            <h2>Request Submitted</h2>
            {lastCode && <p className="website-dev-success-id">{lastCode}</p>}
            <p>Your website development request has been received. Our team will review your requirements and contact you shortly.</p>
            <p>The {sym}{CONSULTATION_FEE} consultation fee has been paid and will be adjusted in your final project cost after confirmation.</p>
            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSuccessOpen(false); setTab('requests'); }}>View My Requests</button>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default WebsiteDev;
