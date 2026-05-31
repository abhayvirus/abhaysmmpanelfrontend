import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  adminGetServices,
  adminSyncServices,
  adminUpdateService,
  adminDeleteService,
  adminProviderStatus,
  adminTestConnection,
  adminCreateService,
} from '../api';
import SocialIconPicker from '../components/SocialIconPicker';
import '../styles/adminServices.css';

function formatSyncTime(iso) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function keyStatusLabel(status) {
  if (status === 'valid') return { text: 'Valid', className: 'badge-success' };
  if (status === 'present') return { text: 'Configured (not verified)', className: 'badge-warning' };
  if (status === 'invalid') return { text: 'Invalid', className: 'badge-danger' };
  return { text: 'Unknown', className: 'badge-danger' };
}

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [editPrices, setEditPrices] = useState({});
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [addForm, setAddForm] = useState({
    name: '',
    platform: '',
    category: '',
    custom_price: '',
    min_quantity: 10,
    max_quantity: 10000,
    is_active: true,
  });

  const loadProviderStatus = useCallback(async () => {
    try {
      const r = await adminProviderStatus();
      setProviderInfo(r.data);
    } catch (e) {
      setProviderInfo({
        connected: false,
        message: e.response?.data?.message || e.message,
      });
    }
  }, []);

  useEffect(() => {
    loadServices();
    loadProviderStatus();
  }, [loadProviderStatus]);

  const loadServices = async () => {
    const res = await adminGetServices();
    setServices(res.data);
    const prices = {};
    res.data.forEach((s) => { prices[s.id] = s.custom_price; });
    setEditPrices(prices);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setSyncMsg(null);
    try {
      const res = await adminTestConnection();
      const d = res.data;
      setProviderInfo({
        connected: d.connected,
        provider: d.providerName,
        provider_id: d.providerId,
        api_url: d.apiUrl,
        balance: d.balance,
        currency: d.currency,
        services_count: d.servicesCount,
        api_key_status: d.apiKeyStatus,
        api_key_preview: d.apiKeyPreview,
        last_sync_at: d.lastSyncAt,
        message: d.message,
        reason_code: d.reasonCode,
        request_body: d.requestBody,
        raw_response: d.rawResponse,
        services_raw_response: d.servicesRawResponse,
      });
      setSyncMsg({
        type: d.connected ? 'success' : 'error',
        text: d.message || (d.connected ? 'Connection OK' : 'Connection failed'),
      });
    } catch (err) {
      const d = err.response?.data || {};
      setProviderInfo({ connected: false, ...d, message: d.message || err.message });
      setSyncMsg({ type: 'error', text: d.message || 'Test connection failed' });
    }
    setTesting(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await adminSyncServices();
      setSyncMsg({ type: 'success', text: res.data.message });
      await loadServices();
      await loadProviderStatus();
    } catch (err) {
      const d = err.response?.data || {};
      setSyncMsg({ type: 'error', text: d.message || d.reasonCode || 'Sync failed' });
    }
    setSyncing(false);
  };

  const handleSave = async (svc) => {
    try {
      await adminUpdateService(svc.id, {
        custom_price: parseFloat(editPrices[svc.id]),
        is_active: svc.is_active,
      });
      setSyncMsg({ type: 'success', text: 'Service saved' });
    } catch {
      setSyncMsg({ type: 'error', text: 'Save failed' });
    }
  };

  const toggleActive = async (svc) => {
    try {
      await adminUpdateService(svc.id, {
        custom_price: parseFloat(editPrices[svc.id]),
        is_active: !svc.is_active,
      });
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, is_active: !s.is_active } : s)));
    } catch {
      setSyncMsg({ type: 'error', text: 'Toggle failed' });
    }
  };

  const handleDelete = async (svc) => {
    if (!window.confirm(`Delete "${svc.name}"?\n\nIf this service has orders, it will be deactivated instead.`)) return;
    setDeletingId(svc.id);
    try {
      const res = await adminDeleteService(svc.id);
      setSyncMsg({ type: 'success', text: res.data.message || 'Service removed' });
      await loadServices();
    } catch (err) {
      setSyncMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
    }
    setDeletingId(null);
  };

  const createManualService = async () => {
    if (!addForm.name.trim() || !addForm.platform.trim() || !addForm.custom_price) {
      setSyncMsg({ type: 'error', text: 'Name, Platform, Price required' });
      return;
    }
    setAdding(true);
    try {
      await adminCreateService({
        ...addForm,
        custom_price: parseFloat(addForm.custom_price),
        original_price: parseFloat(addForm.custom_price),
        min_quantity: parseInt(addForm.min_quantity, 10),
        max_quantity: parseInt(addForm.max_quantity, 10),
      });
      setSyncMsg({ type: 'success', text: 'Service added successfully' });
      setAddForm({
        name: '', platform: '', category: '', custom_price: '', min_quantity: 10, max_quantity: 10000, is_active: true,
      });
      await loadServices();
    } catch (err) {
      setSyncMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add service' });
    }
    setAdding(false);
  };

  const platforms = ['All', ...new Set(services.map((s) => s.platform).filter(Boolean))];
  const categories = ['All', ...new Set(services.map((s) => s.category).filter(Boolean))];

  const filtered = services.filter((s) => {
    const q = search.trim().toLowerCase();
    if (platform !== 'All' && s.platform !== platform) return false;
    if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q)
      || (s.platform || '').toLowerCase().includes(q)
      || (s.category || '').toLowerCase().includes(q)
    );
  });

  const keyBadge = providerInfo ? keyStatusLabel(providerInfo.api_key_status) : null;
  const rawJson = providerInfo?.raw_response != null
    ? JSON.stringify(providerInfo.raw_response, null, 2)
    : null;

  const renderServiceCard = (svc) => (
    <article key={svc.id} className="admin-svc-card">
      <h3 className="admin-svc-card__title">{svc.name}</h3>
      <div className="admin-svc-card__grid">
        <div className="admin-svc-card__cell">
          <span>Platform</span>
          <strong>{svc.platform || '—'}</strong>
        </div>
        <div className="admin-svc-card__cell">
          <span>Status</span>
          <strong>{svc.is_active ? 'Active' : 'Disabled'}</strong>
        </div>
        <div className="admin-svc-card__cell">
          <span>Provider /1000</span>
          <strong>₹{parseFloat(svc.original_price).toFixed(2)}</strong>
        </div>
        <div className="admin-svc-card__cell">
          <span>Min order</span>
          <strong>{svc.min_quantity}</strong>
        </div>
        <div className="admin-svc-card__cell">
          <span>Max order</span>
          <strong>{svc.max_quantity?.toLocaleString()}</strong>
        </div>
        {svc.category && (
          <div className="admin-svc-card__cell">
            <span>Category</span>
            <strong>{svc.category}</strong>
          </div>
        )}
      </div>
      <div className="admin-svc-card__price">
        <label htmlFor={`price-${svc.id}`}>Your price / 1000 (₹)</label>
        <input
          id={`price-${svc.id}`}
          type="number"
          step="0.01"
          className="input"
          value={editPrices[svc.id] ?? ''}
          onChange={(e) => setEditPrices((prev) => ({ ...prev, [svc.id]: e.target.value }))}
        />
      </div>
      <div className="admin-svc-card__actions">
        <button
          type="button"
          onClick={() => toggleActive(svc)}
          className={`btn btn-sm ${svc.is_active ? 'btn-primary' : 'btn-danger'}`}
        >
          {svc.is_active ? 'ON' : 'OFF'}
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave(svc)}>
          Save
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(svc)}
          disabled={deletingId === svc.id}
        >
          {deletingId === svc.id ? '…' : 'Delete'}
        </button>
      </div>
    </article>
  );

  return (
    <AdminLayout>
      <div className="admin-services-page">
        <div className="admin-services-header">
          <div>
            <h1 className="admin-page-title">Services &amp; API</h1>
            {providerInfo && (
              <span className={`badge ${providerInfo.connected ? 'badge-success' : 'badge-danger'}`}>
                {providerInfo.connected
                  ? `API OK · Balance: ${providerInfo.balance ?? '—'} ${providerInfo.currency || ''}`
                  : `API Error: ${providerInfo.message || 'Not connected'}`}
              </span>
            )}
          </div>
          <div className="admin-api-actions">
            <button type="button" className="btn btn-ghost" onClick={handleTestConnection} disabled={testing || syncing}>
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSync} disabled={syncing || testing}>
              {syncing ? 'Syncing…' : 'Sync all services'}
            </button>
          </div>
        </div>

        {providerInfo && (
          <div className="card admin-api-diagnostics">
            <h3 className="card-title">Provider diagnostics</h3>
            <dl className="admin-api-diagnostics-grid">
              <div><dt>Provider URL</dt><dd>{providerInfo.api_url || '—'}</dd></div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`badge ${providerInfo.connected ? 'badge-success' : 'badge-danger'}`}>
                    {providerInfo.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>API key</dt>
                <dd>
                  {keyBadge && <span className={`badge ${keyBadge.className}`}>{keyBadge.text}</span>}
                  {providerInfo.api_key_preview && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      {providerInfo.api_key_preview}
                    </span>
                  )}
                </dd>
              </div>
              <div><dt>Last sync</dt><dd>{formatSyncTime(providerInfo.last_sync_at)}</dd></div>
            </dl>
            {rawJson && <pre className="admin-api-raw">{rawJson}</pre>}
          </div>
        )}

        <div className="card admin-services-add-form">
          <h3 className="card-title">Add service manually</h3>
          <div className="admin-services-add-grid">
            <input
              className="input"
              placeholder="Service name"
              value={addForm.name}
              onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
            />
            <div className="admin-services-add-span-2">
              <SocialIconPicker
                mode="platform"
                value={addForm.platform}
                onChange={(v) => setAddForm((p) => ({ ...p, platform: v }))}
                placeholder="Platform (manual)"
              />
            </div>
            <input
              className="input"
              placeholder="Category (optional)"
              value={addForm.category}
              onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value }))}
            />
            <input
              className="input"
              type="number"
              step="0.01"
              placeholder="Selling price / 1000 (₹)"
              value={addForm.custom_price}
              onChange={(e) => setAddForm((p) => ({ ...p, custom_price: e.target.value }))}
            />
            <input
              className="input"
              type="number"
              placeholder="Min qty"
              value={addForm.min_quantity}
              onChange={(e) => setAddForm((p) => ({ ...p, min_quantity: e.target.value }))}
            />
            <input
              className="input"
              type="number"
              placeholder="Max qty"
              value={addForm.max_quantity}
              onChange={(e) => setAddForm((p) => ({ ...p, max_quantity: e.target.value }))}
            />
          </div>
          <div className="admin-services-add-actions">
            <label className="admin-services-add-active">
              <input
                type="checkbox"
                checked={!!addForm.is_active}
                onChange={(e) => setAddForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              Active
            </label>
            <button type="button" className="btn btn-primary" onClick={createManualService} disabled={adding}>
              {adding ? 'Adding…' : 'Add Service'}
            </button>
          </div>
          <p className="admin-services-add-note">
            Manual services are non-provider listings. Provider sync uses your API URL.
          </p>
        </div>

        {syncMsg && (
          <div className={`admin-services-sync-msg admin-services-sync-msg--${syncMsg.type}`}>
            {syncMsg.text}
          </div>
        )}

        <div className="admin-services-filters">
          <input
            className="input"
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search services"
          />
          <div className="admin-services-filter-row" role="group" aria-label="Platform filter">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`btn btn-sm ${platform === p ? 'btn-primary' : 'btn-ghost'}`}
              >
                {p}
              </button>
            ))}
          </div>
          {categories.length > 1 && (
            <div className="admin-services-filter-row" role="group" aria-label="Category filter">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  className={`btn btn-sm ${categoryFilter === c ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="admin-services-hint">Original = provider price · Your Price = user charge</p>

        {!filtered.length ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No services found</p>
        ) : (
          <>
            <div className="admin-services-desktop admin-services-table-wrap table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {['Service', 'Platform', 'Original/1000', 'Your Price/1000', 'Min', 'Max', 'Active', 'Actions'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((svc) => (
                    <tr key={svc.id}>
                      <td style={{ maxWidth: 180 }}>{svc.name}</td>
                      <td>{svc.platform}</td>
                      <td style={{ color: 'var(--text-muted)' }}>₹{parseFloat(svc.original_price).toFixed(4)}</td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={editPrices[svc.id] ?? ''}
                          onChange={(e) => setEditPrices((prev) => ({ ...prev, [svc.id]: e.target.value }))}
                          style={{ width: '100%', maxWidth: 90, padding: '4px 6px', fontSize: 12 }}
                        />
                      </td>
                      <td>{svc.min_quantity}</td>
                      <td>{svc.max_quantity}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleActive(svc)}
                          className={`btn btn-sm ${svc.is_active ? 'btn-primary' : 'btn-danger'}`}
                        >
                          {svc.is_active ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="admin-svc-actions-cell">
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave(svc)}>
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(svc)}
                          disabled={deletingId === svc.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-services-mobile">
              {filtered.map(renderServiceCard)}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
