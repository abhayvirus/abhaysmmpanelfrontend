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
  adminGetProviders,
  adminDeleteAllServices,
  adminUpdateProvider,
} from '../api';
import SocialIconPicker from '../components/SocialIconPicker';
import '../styles/adminServices.css';
import '../styles/filterControls.css';

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
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [editDrafts, setEditDrafts] = useState({});
  const [editingIds, setEditingIds] = useState({});
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
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

  const loadProviderStatus = useCallback(async (providerId) => {
    try {
      const id = providerId || selectedProviderId || undefined;
      const r = await adminProviderStatus(id || undefined);
      setProviderInfo(r.data);
    } catch (e) {
      setProviderInfo({
        connected: false,
        message: e.response?.data?.message || e.message,
      });
    }
  }, [selectedProviderId]);

  const loadProviders = useCallback(async () => {
    try {
      const r = await adminGetProviders();
      const list = Array.isArray(r.data) ? r.data : [];
      setProviders(list);
      setSelectedProviderId((prev) => {
        if (prev && list.some((p) => String(p.id) === String(prev))) return prev;
        const def = list.find((p) => p.is_default) || list[0];
        return def ? String(def.id) : '';
      });
    } catch {
      setProviders([]);
    }
  }, []);

  useEffect(() => {
    loadServices();
    loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    if (selectedProviderId) loadProviderStatus(selectedProviderId);
  }, [selectedProviderId, loadProviderStatus]);

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
      const res = await adminTestConnection(selectedProviderId || undefined);
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

  const selectedProvider = providers.find((p) => String(p.id) === String(selectedProviderId));

  const handleUseProvider = async (providerId) => {
    setSelectedProviderId(String(providerId));
    setSyncMsg(null);
    try {
      setSettingDefault(true);
      await adminUpdateProvider(providerId, { is_default: true });
      await loadProviders();
      setSelectedProviderId(String(providerId));
      setSyncMsg({
        type: 'success',
        text: 'Provider selected as default. Click “Sync all services” to fetch every service from this API.',
      });
      await loadProviderStatus(providerId);
    } catch (err) {
      setSyncMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not set provider as default',
      });
    }
    setSettingDefault(false);
  };

  const handleSync = async () => {
    if (!selectedProviderId) {
      setSyncMsg({ type: 'error', text: 'Pehle provider choose karo (theworldsmm ya topfollower).' });
      return;
    }
    setSyncing(true);
    setSyncMsg(null);
    try {
      // Ensure selected provider is the one we sync against
      try {
        await adminUpdateProvider(selectedProviderId, { is_default: true });
      } catch (_) { /* sync still uses provider_id */ }

      const res = await adminSyncServices(selectedProviderId);
      const d = res.data || {};
      const pname = d.providerName || selectedProvider?.name || 'provider';
      const parts = [
        `${pname}: ${d.message || 'Sync complete'}`,
        d.total != null ? `API list: ${d.total}` : null,
        d.added != null ? `+${d.added} new` : null,
        d.updated != null ? `${d.updated} updated` : null,
        d.failed ? `${d.failed} failed` : null,
      ].filter(Boolean);
      setSyncMsg({ type: 'success', text: parts.join(' · ') });
      await loadServices();
      await loadProviders();
      await loadProviderStatus(selectedProviderId);
    } catch (err) {
      const d = err.response?.data || {};
      setSyncMsg({ type: 'error', text: d.message || d.reasonCode || err.message || 'Sync failed' });
    }
    setSyncing(false);
  };

  const handleDeleteAll = async () => {
    if (!services.length) {
      setSyncMsg({ type: 'error', text: 'No services to delete' });
      return;
    }
    const ok = window.confirm(
      `Delete ALL ${services.length} services?\n\nServices with order history will be archived (hidden). Others are removed permanently.\n\nThis cannot be undone.`
    );
    if (!ok) return;
    const ok2 = window.confirm('Type confirmation: really delete ALL services from the panel?');
    if (!ok2) return;

    setDeletingAll(true);
    setSyncMsg(null);
    try {
      const res = await adminDeleteAllServices();
      setSyncMsg({
        type: 'success',
        text: res.data?.message || 'All services deleted',
      });
      await loadServices();
    } catch (err) {
      setSyncMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete all services',
      });
    }
    setDeletingAll(false);
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
    const serviceId = Number(svc.id);
    console.log('Deleting Service ID:', serviceId, 'name:', svc.name);
    setDeletingId(svc.id);
    setDeleteError('');
    try {
      const res = await adminDeleteService(serviceId);
      console.log('Delete service response:', res.data);
      setServices((prev) => prev.filter((s) => Number(s.id) !== serviceId));
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
      setSyncMsg({ type: 'success', text: '✅ Service deleted successfully' });
      await loadServices();
    } catch (err) {
      console.error('Delete service failed:', err.response?.data || err.message);
      const message = err.response?.data?.message || 'Failed to delete service';
      setDeleteError(message);
      setSyncMsg({ type: 'error', text: '❌ Failed to delete service' });
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
            <button type="button" className="btn btn-ghost" onClick={handleTestConnection} disabled={testing || syncing || deletingAll || !selectedProviderId}>
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSync} disabled={syncing || testing || deletingAll || !selectedProviderId}>
              {syncing
                ? `Syncing ${selectedProvider?.name || '…'}…`
                : `Sync all from ${selectedProvider?.name || 'provider'}`}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteAll}
              disabled={deletingAll || syncing || testing || !services.length}
              title="Delete every service from the panel"
            >
              {deletingAll ? 'Deleting…' : 'Delete all services'}
            </button>
          </div>
        </div>

        <div className="card admin-provider-picker">
          <h3 className="card-title">Kaunsa provider use karna hai?</h3>
          <p className="admin-provider-picker__hint">
            Neeche se <strong>theworldsmm</strong> ya <strong>topfollower</strong> choose karo, phir{' '}
            <strong>Sync all</strong> dabao — us API ki saari services fetch ho jayengi (margin usi provider ki lagegi).
          </p>
          {providers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Koi provider nahi mila. Settings → API &amp; Profit mein add karo.
            </p>
          ) : (
            <div className="admin-provider-picker__grid">
              {providers.map((p) => {
                const active = String(p.id) === String(selectedProviderId);
                const isDefault = Boolean(p.is_default);
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    className={`admin-provider-card${active ? ' is-active' : ''}${isDefault ? ' is-default' : ''}`}
                    onClick={() => setSelectedProviderId(String(p.id))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProviderId(String(p.id));
                      }
                    }}
                  >
                    <div className="admin-provider-card__top">
                      <strong>{p.name}</strong>
                      <span className="admin-provider-card__badges">
                        {isDefault && <span className="badge badge-success">In use ★</span>}
                        {active && !isDefault && <span className="badge badge-info">Selected</span>}
                      </span>
                    </div>
                    <div className="admin-provider-card__url">{p.api_url || '—'}</div>
                    <div className="admin-provider-card__meta">Margin: {p.profit_margin ?? 50}%</div>
                    <div className="admin-provider-card__actions">
                      {!isDefault && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={settingDefault || syncing}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseProvider(p.id);
                          }}
                        >
                          {settingDefault ? '…' : 'Use this provider'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={syncing || testing || !p.id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setSelectedProviderId(String(p.id));
                          setSyncing(true);
                          setSyncMsg(null);
                          try {
                            try {
                              await adminUpdateProvider(p.id, { is_default: true });
                            } catch (_) { /* ok */ }
                            const res = await adminSyncServices(p.id);
                            const d = res.data || {};
                            setSyncMsg({
                              type: 'success',
                              text: `${p.name}: Added ${d.added ?? 0}, Updated ${d.updated ?? 0}, Total API ${d.total ?? '—'} (${d.marginPct ?? p.profit_margin}% margin)`,
                            });
                            await loadServices();
                            await loadProviders();
                            setSelectedProviderId(String(p.id));
                            await loadProviderStatus(p.id);
                          } catch (err) {
                            const d = err.response?.data || {};
                            setSyncMsg({ type: 'error', text: d.message || 'Sync failed' });
                          }
                          setSyncing(false);
                        }}
                      >
                        {syncing && String(selectedProviderId) === String(p.id) ? 'Fetching…' : 'Fetch all services'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {providerInfo && (
          <div className="card admin-api-diagnostics">
            <h3 className="card-title">
              Provider diagnostics
              {selectedProvider ? ` · ${selectedProvider.name}` : ''}
            </h3>
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
          <div className="filter-section filter-section--platform">
            <span className="filter-section__label">Platform</span>
            <div className="filter-group" role="group" aria-label="Platform filter">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`filter-chip${platform === p ? ' filter-chip--active' : ''}`}
                  aria-pressed={platform === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {categories.length > 1 && (
            <div className="filter-section filter-section--category">
              <span className="filter-section__label">Category</span>
              <div className="filter-group" role="group" aria-label="Category filter">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryFilter(c)}
                    className={`filter-chip${categoryFilter === c ? ' filter-chip--active' : ''}`}
                    aria-pressed={categoryFilter === c}
                  >
                    {c}
                  </button>
                ))}
              </div>
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
