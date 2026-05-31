import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import {
  adminGetWebsiteDevStats,
  adminGetWebsiteDevOrders,
  adminGetWebsiteDevOrder,
  adminWebsiteDevAction,
  adminWebsiteDevQuote,
  adminRefundWebsiteDevFee,
  adminWebsiteDevProjectStatus,
  adminWebsiteDevAssign,
  openWebsiteDevQuotePrint,
  API_BASE,
} from '../api';
import { CRM_STATUSES, CONSULTATION_FEE, getCrmStatusLabel } from '../content/websiteDevCategories';
import '../styles/adminWebsiteDev.css';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const AdminWebsiteDev = () => {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    project_name: '', development_cost: '', domain_cost: '', hosting_cost: '',
    additional_features: '', discount: '', final_price: '', notes: '',
  });
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');
  const [developerName, setDeveloperName] = useState('');

  const load = () => {
    adminGetWebsiteDevStats().then((r) => setStats(r.data || {})).catch(() => {});
    adminGetWebsiteDevOrders().then((r) => setOrders(r.data || [])).catch(() => setOrders([]));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (typeFilter && !String(o.website_type || '').toLowerCase().includes(typeFilter.toLowerCase())) return false;
      if (!q) return true;
      return [o.id, o.request_code, o.user_name, o.user_email, o.email, o.phone, o.website_type].some(
        (v) => String(v || '').toLowerCase().includes(q)
      );
    });
  }, [orders, filter, typeFilter, search]);

  const openDetail = async (id) => {
    try {
      const { data } = await adminGetWebsiteDevOrder(id);
      setDetail(data);
      setDeveloperName(data.assigned_developer || '');
    } catch (e) {
      showToast(e.response?.data?.message || 'Load failed');
    }
  };

  const assignDeveloper = async () => {
    if (!detail || !developerName.trim()) return;
    setBusyId(detail.id);
    try {
      await adminWebsiteDevAssign(detail.id, developerName.trim());
      showToast('Developer assigned');
      openDetail(detail.id);
    } catch (e) {
      showToast(e.response?.data?.message || 'Assign failed');
    }
    setBusyId(null);
  };

  const runAction = async (id, action) => {
    setBusyId(id);
    try {
      await adminWebsiteDevAction(id, { action });
      showToast(`Action: ${action}`);
      load();
      if (detail?.id === id) openDetail(id);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed');
    }
    setBusyId(null);
  };

  const sendQuote = async (e) => {
    e.preventDefault();
    setBusyId(detail.id);
    try {
      await adminWebsiteDevQuote(detail.id, quoteForm);
      showToast('Quotation sent');
      setQuoteOpen(false);
      load();
      openDetail(detail.id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Quote failed');
    }
    setBusyId(null);
  };

  const refund = async (id) => {
    if (!window.confirm('Refund ₹99 consultation fee to user wallet?')) return;
    setBusyId(id);
    try {
      await adminRefundWebsiteDevFee(id);
      showToast('Refund completed');
      load();
      if (detail?.id === id) openDetail(id);
    } catch (e) {
      showToast(e.response?.data?.message || 'Refund failed');
    }
    setBusyId(null);
  };

  const statCards = [
    { label: 'Total Requests', value: stats.total || 0 },
    { label: 'Pending', value: stats.pending || 0 },
    { label: 'Approved', value: stats.approved || 0 },
    { label: 'Rejected', value: stats.rejected || 0 },
    { label: 'In Progress', value: stats.in_progress || 0 },
    { label: 'Completed', value: stats.completed || 0 },
    { label: 'Refund Pending', value: stats.refund_pending || 0 },
    { label: 'Refund Done', value: stats.refund_completed || 0 },
    { label: 'Revenue (fees)', value: `₹${parseFloat(stats.total_revenue || 0).toFixed(0)}` },
  ];

  const columns = [
    { key: 'id', label: 'Request ID', render: (o) => o.request_code || `#${o.id}` },
    { key: 'user', label: 'User', render: (o) => <span>{o.user_name || o.full_name}<br /><small style={{ color: 'var(--text-muted)' }}>{o.user_email || o.email}</small></span> },
    { key: 'phone', label: 'Mobile' },
    { key: 'website_type', label: 'Website Type' },
    { key: 'budget', label: 'Budget', render: (o) => o.budget || '—' },
    { key: 'fee', label: 'Fee', render: (o) => `₹${parseFloat(o.wallet_fee || 99).toFixed(0)}` },
    { key: 'date', label: 'Submitted', render: (o) => new Date(o.created_at).toLocaleDateString() },
    { key: 'status', label: 'Status', highlight: true, render: (o) => <span className="badge badge-info">{getCrmStatusLabel(o.project_status, o.status)}</span> },
    { key: 'developer', label: 'Developer', render: (o) => o.assigned_developer || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (o) => (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(o.id)}>View</button>
      ),
    },
  ];

  const fileUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <AdminLayout>
      <div className="admin-website-dev-page">
        <h1 className="admin-page-title">🌐 Website Requests Management</h1>
        <p className="admin-website-consult-note">
          Consultation fee ₹{CONSULTATION_FEE} is non-refundable and auto-adjusted in final quotation (payable = final price − ₹{CONSULTATION_FEE}).
        </p>
        {toast && <div className="alert alert-success">{toast}</div>}

        <div className="stats-grid admin-website-stats">
          {statCards.map((c) => (
            <div key={c.label} className="stat-card admin-stat-card">
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <input className="input" placeholder="Search name, email, ID, phone…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Filter by website type…" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ marginBottom: 8 }} />
          <div className="admin-website-filters">
            {STATUS_FILTERS.map((f) => (
              <button key={f.key} type="button" className={`filter-chip${filter === f.key ? ' is-active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
        </div>

        <AdminResponsiveTable columns={columns} rows={filtered} emptyMessage="No website orders" />
      </div>

      {detail && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel card" style={{ maxWidth: '36rem', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>{detail.request_code || `#${detail.id}`}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Status: <span className="badge badge-info">{getCrmStatusLabel(detail.project_status, detail.status)}</span>
              {' · '}Quote: {detail.quotation_status}
              {' · '}Developer: {detail.assigned_developer || 'Unassigned'}
            </p>
            <dl className="admin-website-detail-grid">
              <div><dt>Full Name</dt><dd>{detail.full_name}</dd></div>
              <div><dt>Email</dt><dd>{detail.email}</dd></div>
              <div><dt>Phone</dt><dd>{detail.phone}</dd></div>
              <div><dt>WhatsApp</dt><dd>{detail.whatsapp || '—'}</dd></div>
              <div><dt>Company</dt><dd>{detail.company_name || '—'}</dd></div>
              <div><dt>Website Type</dt><dd>{detail.website_type}</dd></div>
              <div><dt>Budget</dt><dd>{detail.budget || '—'}</dd></div>
              <div><dt>Domain</dt><dd>{detail.preferred_domain || '—'} {detail.domain_extension || ''}</dd></div>
              <div><dt>Hosting</dt><dd>{detail.hosting_plan || detail.hosting_required}</dd></div>
              <div><dt>Features</dt><dd>{(detail.required_features || []).join(', ') || '—'}</dd></div>
              <div><dt>Description</dt><dd>{detail.project_description || '—'}</dd></div>
              <div><dt>Target Audience</dt><dd>{detail.target_audience || '—'}</dd></div>
              <div><dt>Reference Links</dt><dd>{detail.reference_links || '—'}</dd></div>
              {(detail.uploaded_files || []).length > 0 && (
                <div><dt>Uploaded Files</dt><dd>
                  {(detail.uploaded_files || []).map((f) => (
                    <a key={f.url} href={fileUrl(f.url)} target="_blank" rel="noreferrer" style={{ display: 'block' }}>{f.name}</a>
                  ))}
                </dd></div>
              )}
            </dl>
            {detail.quotation && (
              <div className="card" style={{ padding: 12, marginBottom: 12 }}>
                <strong>Quotation: ₹{Number(detail.quotation.final_price || 0).toLocaleString('en-IN')}</strong>
                {detail.quotation.payable_after_consultation != null && (
                  <p style={{ margin: '6px 0 0', fontSize: 13 }}>Payable after ₹{CONSULTATION_FEE} credit: ₹{Number(detail.quotation.payable_after_consultation).toLocaleString('en-IN')}</p>
                )}
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => openWebsiteDevQuotePrint(detail.id, true)}>Print PDF</button>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label className="label">Assign Developer</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input className="input" placeholder="Developer name" value={developerName} onChange={(e) => setDeveloperName(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
                <button type="button" className="btn btn-primary btn-sm" disabled={busyId === detail.id} onClick={assignDeveloper}>Assign</button>
              </div>
            </div>
            <div className="admin-website-actions">
              <button type="button" className="btn btn-ghost btn-sm" disabled={busyId === detail.id} onClick={() => runAction(detail.id, 'reviewed')}>Mark Reviewed</button>
              <button type="button" className="btn btn-primary btn-sm" disabled={busyId === detail.id} onClick={() => runAction(detail.id, 'contacted')}>Contact User</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setQuoteForm({
                    ...quoteForm,
                    project_name: detail.website_type,
                    discount: String(CONSULTATION_FEE),
                  });
                  setQuoteOpen(true);
                }}
              >
                Send Quote
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={busyId === detail.id} onClick={() => runAction(detail.id, 'approve')}>Approve</button>
              <button type="button" className="btn btn-danger btn-sm" disabled={busyId === detail.id} onClick={() => runAction(detail.id, 'reject')}>Reject</button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busyId === detail.id} onClick={() => runAction(detail.id, 'start')}>Start Project</button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busyId === detail.id} onClick={() => runAction(detail.id, 'complete')}>Complete</button>
              {detail.refund_status !== 'completed' && (
                <button type="button" className="btn btn-primary btn-sm" disabled={busyId === detail.id} onClick={() => refund(detail.id)}>Refund ₹99</button>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>Close</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Update project stage</label>
              <select className="select" value={detail.project_status} onChange={(e) => adminWebsiteDevProjectStatus(detail.id, e.target.value).then(() => openDetail(detail.id))}>
                {CRM_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                <option value="client_discussion">Client Discussion (legacy)</option>
                <option value="design_started">Design Started (legacy)</option>
                <option value="final_review">Final Review (legacy)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {quoteOpen && detail && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel card">
            <h2>Create Quotation</h2>
            <form onSubmit={sendQuote}>
              {[
                ['project_name', 'Project Name'], ['development_cost', 'Development Cost'],
                ['domain_cost', 'Domain Cost'], ['hosting_cost', 'Hosting Cost'],
                ['additional_features', 'Additional Features'], ['discount', 'Discount'],
                ['final_price', 'Final Price'],
              ].map(([key, label]) => (
                <div key={key} className="form-group">
                  <label className="label">{label}</label>
                  <input className="input" type="number" value={quoteForm[key]} onChange={(e) => setQuoteForm({ ...quoteForm, [key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label className="label">Notes</label>
                <textarea className="textarea" value={quoteForm.notes} onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={busyId === detail.id}>Send Quote & Generate PDF</button>
              <button type="button" className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={() => setQuoteOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWebsiteDev;
