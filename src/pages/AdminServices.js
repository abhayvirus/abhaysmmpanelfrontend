import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  adminGetServices,
  adminSyncServices,
  adminUpdateService,
  adminProviderStatus,
  adminTestConnection,
  adminCreateService,
} from '../api';
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
  const [syncMsg, setSyncMsg] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [editPrices, setEditPrices] = useState({});
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [adding, setAdding] = useState(false);
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
      const detail = d.message || d.reasonCode || 'Sync failed';
      setSyncMsg({ type: 'error', text: detail });
      if (d.apiUrl || d.rawResponse) {
        setProviderInfo((prev) => ({
          ...prev,
          connected: false,
          api_url: d.apiUrl || prev?.api_url,
          message: d.message,
          reason_code: d.reasonCode,
          request_body: d.requestBody,
          raw_response: d.rawResponse,
          api_key_status: d.apiKeyStatus || prev?.api_key_status,
        }));
      }
    }
    setSyncing(false);
  };

  const handleSave = async (svc) => {
    try {
      await adminUpdateService(svc.id, { custom_price: parseFloat(editPrices[svc.id]), is_active: svc.is_active });
      alert('Saved!');
    } catch (err) { alert('Failed'); }
  };

  const toggleActive = async (svc) => {
    try {
      await adminUpdateService(svc.id, { custom_price: parseFloat(editPrices[svc.id]), is_active: !svc.is_active });
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, is_active: !svc.is_active } : s)));
    } catch (err) { alert('Failed'); }
  };

  const platforms = ['All', ...new Set(services.map((s) => s.platform))];
  const filtered = services.filter(
    (s) => (platform === 'All' || s.platform === platform)
      && s.name.toLowerCase().includes(search.toLowerCase())
  );

  const createManualService = async () => {
    if (!addForm.name.trim() || !addForm.platform.trim() || !addForm.custom_price) {
      alert('Name, Platform, Price required');
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
      alert(err.response?.data?.message || 'Failed to add service');
    }
    setAdding(false);
  };

  const keyBadge = providerInfo ? keyStatusLabel(providerInfo.api_key_status) : null;
  const rawJson = providerInfo?.raw_response != null
    ? JSON.stringify(providerInfo.raw_response, null, 2)
    : null;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="admin-page-title" style={{ margin: 0, marginBottom: 8 }}>Services & API</h1>
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
            {syncing ? 'Syncing from provider…' : 'Sync all services'}
          </button>
        </div>
      </div>

      {providerInfo && (
        <div className="card admin-api-diagnostics">
          <h3 className="card-title" style={{ marginBottom: 12 }}>Provider diagnostics</h3>
          <dl className="admin-api-diagnostics-grid">
            <div>
              <dt>Provider URL</dt>
              <dd>{providerInfo.api_url || '—'}</dd>
            </div>
            <div>
              <dt>Provider status</dt>
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
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    {providerInfo.api_key_preview}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt>Last sync</dt>
              <dd>{formatSyncTime(providerInfo.last_sync_at)}</dd>
            </div>
            {providerInfo.provider_id != null && (
              <div>
                <dt>Provider ID</dt>
                <dd>{providerInfo.provider_id}</dd>
              </div>
            )}
            {providerInfo.services_count != null && (
              <div>
                <dt>Services on provider</dt>
                <dd>{providerInfo.services_count}</dd>
              </div>
            )}
            {providerInfo.reason_code && (
              <div>
                <dt>Reason code</dt>
                <dd>{providerInfo.reason_code}</dd>
              </div>
            )}
          </dl>
          {providerInfo.request_body && (
            <>
              <dt style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                Request (key masked)
              </dt>
              <pre className="admin-api-raw" style={{ marginBottom: 12 }}>{providerInfo.request_body}</pre>
            </>
          )}
          {rawJson && (
            <>
              <dt style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                Raw provider response
              </dt>
              <pre className="admin-api-raw">{rawJson}</pre>
            </>
          )}
          {!providerInfo.connected && providerInfo.api_key_status === 'invalid' && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
              SW1Z means the provider rejected your API key. Open TheWorldSMM → API, copy the key, paste it in Admin → Settings → API &amp; Profit (replace the masked •••• value), then Save and Test connection again.
            </p>
          )}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>Add service manually</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <input className="input" placeholder="Service name"
            value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="input" placeholder="Platform (e.g. Instagram)"
            value={addForm.platform} onChange={(e) => setAddForm((p) => ({ ...p, platform: e.target.value }))} />
          <input className="input" placeholder="Category (optional)"
            value={addForm.category} onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value }))} />
          <input className="input" type="number" step="0.01" placeholder="Your price / 1000 (₹)"
            value={addForm.custom_price} onChange={(e) => setAddForm((p) => ({ ...p, custom_price: e.target.value }))} />
          <input className="input" type="number" placeholder="Min qty"
            value={addForm.min_quantity} onChange={(e) => setAddForm((p) => ({ ...p, min_quantity: e.target.value }))} />
          <input className="input" type="number" placeholder="Max qty"
            value={addForm.max_quantity} onChange={(e) => setAddForm((p) => ({ ...p, max_quantity: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8ca0b8', fontSize: 13 }}>
            <input type="checkbox" checked={!!addForm.is_active}
              onChange={(e) => setAddForm((p) => ({ ...p, is_active: e.target.checked }))} />
            Active
          </label>
          <button type="button" className="btn btn-primary" onClick={createManualService} disabled={adding}>
            {adding ? 'Adding...' : 'Add Service'}
          </button>
        </div>
        <p style={{ color: '#8ca0b8', fontSize: 12, marginTop: 10 }}>
          Manual services are non-provider listings. Provider sync uses POST action=services to your API URL.
        </p>
      </div>

      {syncMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          background: syncMsg.type === 'success' ? '#1a3a2a' : '#3a1a1a',
          color: syncMsg.type === 'success' ? '#4caf50' : '#f44336',
        }}
        >
          {syncMsg.text}
        </div>
      )}

      <div className="admin-services-filters" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 12rem', minWidth: 0, maxWidth: '100%' }}
        />
        <div className="admin-services-platforms">
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
      </div>

      <p style={{ color: '#8ca0b8', fontSize: 13, marginBottom: 16 }}>
        Original = provider price | Your Price = price charged to users
      </p>

      <div className="admin-services-table-wrap table-wrap">
        <table className="table">
          <thead>
            <tr>
              {['Service', 'Platform', 'Original/1000', 'Your Price/1000', 'Min', 'Max', 'Active', 'Save'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((svc) => (
              <tr key={svc.id}>
                <td data-label="Service" style={{ maxWidth: 200 }}>{svc.name}</td>
                <td data-label="Platform">{svc.platform}</td>
                <td data-label="Original/1000" style={{ color: 'var(--text-muted)' }}>₹{parseFloat(svc.original_price).toFixed(4)}</td>
                <td data-label="Your Price/1000">
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={editPrices[svc.id] || ''}
                    onChange={(e) => setEditPrices((prev) => ({ ...prev, [svc.id]: e.target.value }))}
                    style={{ width: '100%', maxWidth: 100, padding: '6px 8px', fontSize: 13 }}
                  />
                </td>
                <td data-label="Min">{svc.min_quantity}</td>
                <td data-label="Max">{svc.max_quantity}</td>
                <td data-label="Active">
                  <button
                    type="button"
                    onClick={() => toggleActive(svc)}
                    className={`btn btn-sm ${svc.is_active ? 'btn-primary' : 'btn-danger'}`}
                  >
                    {svc.is_active ? 'ON' : 'OFF'}
                  </button>
                </td>
                <td data-label="Save">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSave(svc)}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
