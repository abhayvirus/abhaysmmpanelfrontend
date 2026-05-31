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

function serviceToDraft(svc) {
  return {
    name: svc.name || '',
    platform: svc.platform || '',
    category: svc.category || '',
    original_price: svc.original_price ?? '',
    custom_price: svc.custom_price ?? '',
    min_quantity: svc.min_quantity ?? '',
    max_quantity: svc.max_quantity ?? '',
    is_active: Boolean(svc.is_active),
  };
}

function draftToPayload(draft) {
  return {
    name: String(draft.name).trim(),
    platform: String(draft.platform).trim(),
    category: String(draft.category).trim(),
    original_price: parseFloat(draft.original_price),
    custom_price: parseFloat(draft.custom_price),
    min_quantity: parseInt(draft.min_quantity, 10),
    max_quantity: parseInt(draft.max_quantity, 10),
    is_active: Boolean(draft.is_active),
  };
}

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [editDrafts, setEditDrafts] = useState({});
  const [editingIds, setEditingIds] = useState({});
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
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
    const drafts = {};
    res.data.forEach((s) => {
      drafts[s.id] = serviceToDraft(s);
    });
    setEditDrafts(drafts);
    setEditingIds({});
  };

  const updateDraft = (id, field, value) => {
    setEditDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const startEdit = (svc) => {
    setEditDrafts((prev) => ({ ...prev, [svc.id]: serviceToDraft(svc) }));
    setEditingIds((prev) => ({ ...prev, [svc.id]: true }));
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
    const draft = editDrafts[svc.id];
    if (!draft) return;

    setSavingId(svc.id);
    try {
      const payload = draftToPayload(draft);
      await adminUpdateService(svc.id, payload);
      const updated = { ...svc, ...payload, is_active: payload.is_active ? 1 : 0 };
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, ...updated, is_active: payload.is_active } : s)));
      setEditDrafts((prev) => ({ ...prev, [svc.id]: serviceToDraft({ ...svc, ...updated, is_active: payload.is_active }) }));
      setEditingIds((prev) => {
        const next = { ...prev };
        delete next[svc.id];
        return next;
      });
      setSyncMsg({ type: 'success', text: 'Service updated successfully' });
    } catch (err) {
      setSyncMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update service' });
    }
    setSavingId(null);
  };

  const toggleActive = async (svc) => {
    if (editingIds[svc.id]) {
      setEditDrafts((prev) => ({
        ...prev,
        [svc.id]: { ...prev[svc.id], is_active: !prev[svc.id].is_active },
      }));
      return;
    }

    const nextActive = !svc.is_active;
    try {
      await adminUpdateService(svc.id, {
        custom_price: parseFloat(svc.custom_price),
        is_active: nextActive,
      });
      setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, is_active: nextActive } : s)));
      setEditDrafts((prev) => ({
        ...prev,
        [svc.id]: { ...prev[svc.id], is_active: nextActive },
      }));
    } catch {
      setSyncMsg({ type: 'error', text: 'Failed to update service' });
    }
  };

  const requestDelete = (svc) => {
    setDeleteError('');
    setDeleteTarget(svc);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletingId) return;
    const svc = deleteTarget;
    setDeletingId(svc.id);
    setDeleteError('');
    try {
      await adminDeleteService(svc.id);
      setServices((prev) => prev.filter((s) => s.id !== svc.id));
      setEditDrafts((prev) => {
        const next = { ...prev };
        delete next[svc.id];
        return next;
      });
      setEditingIds((prev) => {
        const next = { ...prev };
        delete next[svc.id];
        return next;
      });
      setDeleteTarget(null);
      setSyncMsg({ type: 'success', text: 'Service deleted successfully' });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete service';
      setDeleteError(message);
      setSyncMsg({ type: 'error', text: message });
    } finally {
      setDeletingId(null);
    }
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

  const isEditing = (id) => Boolean(editingIds[id]);
  const draftFor = (svc) => editDrafts[svc.id] || serviceToDraft(svc);
  const isActive = (svc) => (isEditing(svc.id) ? draftFor(svc).is_active : svc.is_active);

  const renderActionButtons = (svc) => (
    <div className="admin-svc-card__actions">
      <button
        type="button"
        onClick={() => toggleActive(svc)}
        className={`btn btn-sm ${isActive(svc) ? 'btn-primary' : 'btn-danger'}`}
      >
        {isActive(svc) ? 'ON' : 'OFF'}
      </button>
      <button
        type="button"
        className={`btn btn-sm btn-edit${isEditing(svc.id) ? ' btn-edit--active' : ''}`}
        onClick={() => startEdit(svc)}
        disabled={isEditing(svc.id)}
      >
        Edit
      </button>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => handleSave(svc)}
        disabled={!isEditing(svc.id) || savingId === svc.id}
      >
        {savingId === svc.id ? '…' : 'Save'}
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => requestDelete(svc)}
        disabled={deletingId === svc.id}
      >
        Delete
      </button>
    </div>
  );

  const renderServiceCard = (svc) => {
    const draft = draftFor(svc);
    const editing = isEditing(svc.id);

    return (
      <article key={svc.id} className={`admin-svc-card${editing ? ' admin-svc-card--editing' : ''}`}>
        {editing ? (
          <input
            className="input admin-svc-card__title-input"
            value={draft.name}
            onChange={(e) => updateDraft(svc.id, 'name', e.target.value)}
            placeholder="Service name"
            aria-label="Service name"
          />
        ) : (
          <h3 className="admin-svc-card__title">{svc.name}</h3>
        )}

        <div className="admin-svc-card__grid">
          <div className="admin-svc-card__cell">
            <span>Platform</span>
            {editing ? (
              <SocialIconPicker
                mode="platform"
                value={draft.platform}
                onChange={(v) => updateDraft(svc.id, 'platform', v)}
                placeholder="Platform"
              />
            ) : (
              <strong>{svc.platform || '—'}</strong>
            )}
          </div>
          <div className="admin-svc-card__cell">
            <span>Status</span>
            {editing ? (
              <select
                className="input admin-svc-card__select"
                value={draft.is_active ? '1' : '0'}
                onChange={(e) => updateDraft(svc.id, 'is_active', e.target.value === '1')}
              >
                <option value="1">Active</option>
                <option value="0">Disabled</option>
              </select>
            ) : (
              <strong>{svc.is_active ? 'Active' : 'Disabled'}</strong>
            )}
          </div>
          <div className="admin-svc-card__cell">
            <span>Provider /1000</span>
            {editing ? (
              <input
                type="number"
                step="0.0001"
                className="input admin-svc-card__field-input"
                value={draft.original_price}
                onChange={(e) => updateDraft(svc.id, 'original_price', e.target.value)}
              />
            ) : (
              <strong>₹{parseFloat(svc.original_price).toFixed(2)}</strong>
            )}
          </div>
          <div className="admin-svc-card__cell">
            <span>Selling /1000</span>
            {editing ? (
              <input
                type="number"
                step="0.01"
                className="input admin-svc-card__field-input"
                value={draft.custom_price}
                onChange={(e) => updateDraft(svc.id, 'custom_price', e.target.value)}
              />
            ) : (
              <strong>₹{parseFloat(svc.custom_price).toFixed(2)}</strong>
            )}
          </div>
          <div className="admin-svc-card__cell">
            <span>Min order</span>
            {editing ? (
              <input
                type="number"
                className="input admin-svc-card__field-input"
                value={draft.min_quantity}
                onChange={(e) => updateDraft(svc.id, 'min_quantity', e.target.value)}
              />
            ) : (
              <strong>{svc.min_quantity}</strong>
            )}
          </div>
          <div className="admin-svc-card__cell">
            <span>Max order</span>
            {editing ? (
              <input
                type="number"
                className="input admin-svc-card__field-input"
                value={draft.max_quantity}
                onChange={(e) => updateDraft(svc.id, 'max_quantity', e.target.value)}
              />
            ) : (
              <strong>{svc.max_quantity?.toLocaleString()}</strong>
            )}
          </div>
          <div className="admin-svc-card__cell admin-svc-card__cell--full">
            <span>Category</span>
            {editing ? (
              <input
                className="input admin-svc-card__field-input"
                value={draft.category}
                onChange={(e) => updateDraft(svc.id, 'category', e.target.value)}
                placeholder="Category (optional)"
              />
            ) : (
              <strong>{svc.category || '—'}</strong>
            )}
          </div>
        </div>

        {renderActionButtons(svc)}
      </article>
    );
  };

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

        <p className="admin-services-hint">Original = provider price · Your Price = user charge · Click Edit to modify all fields</p>

        {!filtered.length ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No services found</p>
        ) : (
          <>
            <div className="admin-services-desktop admin-services-table-wrap table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {['Service', 'Platform', 'Category', 'Provider/1000', 'Selling/1000', 'Min', 'Max', 'Status', 'Actions'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((svc) => {
                    const draft = draftFor(svc);
                    const editing = isEditing(svc.id);
                    return (
                      <tr key={svc.id} className={editing ? 'admin-svc-row--editing' : ''}>
                        <td style={{ maxWidth: 180 }}>
                          {editing ? (
                            <input
                              className="input admin-svc-table-input"
                              value={draft.name}
                              onChange={(e) => updateDraft(svc.id, 'name', e.target.value)}
                            />
                          ) : (
                            svc.name
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <SocialIconPicker
                              mode="platform"
                              value={draft.platform}
                              onChange={(v) => updateDraft(svc.id, 'platform', v)}
                              placeholder="Platform"
                            />
                          ) : (
                            svc.platform
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              className="input admin-svc-table-input"
                              value={draft.category}
                              onChange={(e) => updateDraft(svc.id, 'category', e.target.value)}
                            />
                          ) : (
                            svc.category || '—'
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              type="number"
                              step="0.0001"
                              className="input admin-svc-table-input admin-svc-table-input--num"
                              value={draft.original_price}
                              onChange={(e) => updateDraft(svc.id, 'original_price', e.target.value)}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>₹{parseFloat(svc.original_price).toFixed(4)}</span>
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              type="number"
                              step="0.01"
                              className="input admin-svc-table-input admin-svc-table-input--num"
                              value={draft.custom_price}
                              onChange={(e) => updateDraft(svc.id, 'custom_price', e.target.value)}
                            />
                          ) : (
                            `₹${parseFloat(svc.custom_price).toFixed(2)}`
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              type="number"
                              className="input admin-svc-table-input admin-svc-table-input--num"
                              value={draft.min_quantity}
                              onChange={(e) => updateDraft(svc.id, 'min_quantity', e.target.value)}
                            />
                          ) : (
                            svc.min_quantity
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              type="number"
                              className="input admin-svc-table-input admin-svc-table-input--num"
                              value={draft.max_quantity}
                              onChange={(e) => updateDraft(svc.id, 'max_quantity', e.target.value)}
                            />
                          ) : (
                            svc.max_quantity
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <select
                              className="input admin-svc-table-input"
                              value={draft.is_active ? '1' : '0'}
                              onChange={(e) => updateDraft(svc.id, 'is_active', e.target.value === '1')}
                            >
                              <option value="1">Active</option>
                              <option value="0">Disabled</option>
                            </select>
                          ) : (
                            svc.is_active ? 'Active' : 'Disabled'
                          )}
                        </td>
                        <td className="admin-svc-actions-cell">
                          {renderActionButtons(svc)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-services-mobile">
              {filtered.map(renderServiceCard)}
            </div>
          </>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deletingId && setDeleteTarget(null)} role="presentation">
          <div
            className="card fade-in modal-panel admin-svc-delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="admin-svc-delete-title"
          >
            <h3 id="admin-svc-delete-title" className="admin-svc-delete-modal__title">Delete Service?</h3>
            <p className="admin-svc-delete-modal__text">This action cannot be undone.</p>
            <p className="admin-svc-delete-modal__name">{deleteTarget.name}</p>
            {deleteError && (
              <p className="admin-svc-delete-modal__error" role="alert">{deleteError}</p>
            )}
            <div className="admin-svc-delete-modal__actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId === deleteTarget.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;
