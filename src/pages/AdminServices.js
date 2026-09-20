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
  adminGetCategories,
  adminApplyServiceMargin,
} from '../api';
import SocialIconPicker from '../components/SocialIconPicker';
import { displayServiceName, truncateText } from '../utils/serviceTitle';
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

function money(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return (0).toFixed(digits);
  return n.toFixed(digits);
}

function sellingFromMargin(original, marginPct) {
  const o = parseFloat(original);
  const m = parseFloat(marginPct);
  if (!Number.isFinite(o) || o < 0) return '';
  const pct = Number.isFinite(m) ? m : 50;
  return (o * (1 + pct / 100)).toFixed(4);
}

function serviceToDraft(svc) {
  return {
    name: svc.name || '',
    platform: svc.platform || '',
    category: svc.category || svc.category_name || '',
    original_price: svc.original_price != null && svc.original_price !== '' ? String(svc.original_price) : '0',
    custom_price: svc.custom_price != null && svc.custom_price !== '' ? String(svc.custom_price) : '0',
    profit_margin: svc.profit_margin != null && svc.profit_margin !== '' ? String(svc.profit_margin) : '50',
    description: svc.description || '',
    min_quantity: svc.min_quantity ?? '',
    max_quantity: svc.max_quantity ?? '',
    is_active: Boolean(svc.is_active),
  };
}

function draftToPayload(draft) {
  const original = parseFloat(draft.original_price);
  const custom = parseFloat(draft.custom_price);
  const margin = parseFloat(draft.profit_margin);
  return {
    name: String(draft.name).trim(),
    platform: String(draft.platform).trim(),
    category: String(draft.category).trim(),
    original_price: Number.isFinite(original) ? original : 0,
    custom_price: Number.isFinite(custom) ? custom : 0,
    profit_margin: Number.isFinite(margin) ? margin : 50,
    description: String(draft.description || '').trim(),
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
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    platform: '',
    category: '',
    custom_price: '',
    min_quantity: 100,
    max_quantity: 1000000,
    is_active: true,
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [marginDrafts, setMarginDrafts] = useState({});
  const [applyingMarginId, setApplyingMarginId] = useState(null);

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
      setMarginDrafts((prev) => {
        const next = { ...prev };
        list.forEach((p) => {
          if (next[p.id] == null) next[p.id] = String(p.profit_margin ?? 50);
        });
        return next;
      });
      setSelectedProviderId((prev) => {
        if (prev && list.some((p) => String(p.id) === String(prev))) return prev;
        const def = list.find((p) => p.is_default) || list[0];
        return def ? String(def.id) : '';
      });
    } catch {
      setProviders([]);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const r = await adminGetCategories();
      const list = Array.isArray(r.data) ? r.data : [];
      setCategoryOptions(list.map((c) => c.name).filter(Boolean));
    } catch {
      setCategoryOptions([]);
    }
  }, []);

  useEffect(() => {
    loadServices();
    loadProviders();
    loadCategories();
  }, [loadProviders, loadCategories]);

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
    setEditDrafts((prev) => {
      const cur = { ...(prev[id] || {}) };
      cur[field] = value;
      if (field === 'original_price' || field === 'profit_margin') {
        const next = sellingFromMargin(
          field === 'original_price' ? value : cur.original_price,
          field === 'profit_margin' ? value : cur.profit_margin
        );
        if (next !== '') cur.custom_price = next;
      }
      return { ...prev, [id]: cur };
    });
  };

  const applyProviderMargin = async (providerId) => {
    const margin = marginDrafts[providerId] ?? providers.find((p) => p.id === providerId)?.profit_margin ?? 50;
    setApplyingMarginId(providerId);
    setSyncMsg(null);
    try {
      await adminUpdateProvider(providerId, { profit_margin: margin });
      const res = await adminApplyServiceMargin(providerId, margin);
      setSyncMsg({
        type: 'success',
        text: res.data?.message || `Margin ${margin}% applied — selling prices updated`,
      });
      await loadServices();
      await loadProviders();
    } catch (err) {
      setSyncMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to apply margin',
      });
    }
    setApplyingMarginId(null);
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
        `${pname}: Sync complete`,
        d.imported != null ? `imported ${d.imported}/${d.total ?? '?'}` : (d.total != null ? `API ${d.total}` : null),
        d.added != null ? `+${d.added} new` : null,
        d.updated != null ? `${d.updated} updated` : null,
        d.restored ? `${d.restored} restored` : null,
        d.skippedJunk ? `${d.skippedJunk} junk skipped` : null,
        d.categoriesCreated != null ? `+${d.categoriesCreated} categories` : null,
        d.categoriesTotal != null ? `${d.categoriesTotal} categories total` : null,
        d.pricesUpdated != null ? `${d.pricesUpdated} prices @ ${d.marginPct}%` : null,
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

  const handleDeleteAll = () => {
    if (!services.length) {
      setSyncMsg({ type: 'error', text: 'No services to delete' });
      return;
    }
    setDeleteAllOpen(true);
  };

  const confirmDeleteAllForProvider = async (providerKey) => {
    const isAll = providerKey === 'all';
    const provider = isAll ? null : providers.find((p) => String(p.id) === String(providerKey));
    const label = isAll ? 'ALL providers' : (provider?.name || `provider #${providerKey}`);
    const count = isAll
      ? services.length
      : services.filter((s) => String(s.provider_id) === String(providerKey)).length;

    if (!count) {
      setSyncMsg({ type: 'error', text: `${label} ke liye koi service nahi mili` });
      setDeleteAllOpen(false);
      return;
    }

    const ok = window.confirm(
      `Delete ${count} services from "${label}"?\n\nOrders wali services archive ho jayengi. Baaki permanently delete.\n\nUndo nahi hoga.`
    );
    if (!ok) return;

    setDeletingAll(true);
    setSyncMsg(null);
    setDeleteAllOpen(false);
    try {
      const res = await adminDeleteAllServices(isAll ? 'all' : providerKey);
      setSyncMsg({
        type: 'success',
        text: res.data?.message || `${label} services deleted`,
      });
      await loadServices();
    } catch (err) {
      setSyncMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete services',
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
      const price = parseFloat(svc.custom_price);
      await adminUpdateService(svc.id, {
        ...(Number.isFinite(price) ? { custom_price: price } : {}),
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
    if (!addForm.name.trim() || addForm.name.trim().length < 3) {
      setSyncMsg({ type: 'error', text: 'Service name likho — e.g. Facebook Followers — HQ' });
      return;
    }
    if (!addForm.platform.trim()) {
      setSyncMsg({ type: 'error', text: 'Platform choose karo — e.g. Facebook' });
      return;
    }
    if (!addForm.custom_price || !(parseFloat(addForm.custom_price) >= 0)) {
      setSyncMsg({ type: 'error', text: 'Selling price /1000 likho — e.g. 170' });
      return;
    }
    setAdding(true);
    setSyncMsg(null);
    try {
      const price = parseFloat(addForm.custom_price);
      await adminCreateService({
        name: addForm.name.trim(),
        platform: addForm.platform.trim(),
        category: (addForm.category || '').trim() || `${addForm.platform.trim()} Services`,
        custom_price: price,
        original_price: price,
        min_quantity: parseInt(addForm.min_quantity, 10) || 100,
        max_quantity: parseInt(addForm.max_quantity, 10) || 1000000,
        is_active: !!addForm.is_active,
      });
      setSyncMsg({ type: 'success', text: 'Service added successfully' });
      setAddForm({
        name: '', platform: '', category: '', custom_price: '', min_quantity: 100, max_quantity: 1000000, is_active: true,
      });
      await loadServices();
      try {
        const r = await adminGetCategories();
        const list = Array.isArray(r.data) ? r.data : [];
        setCategoryOptions(list.map((c) => c.name).filter(Boolean));
      } catch (_) { /* ok */ }
    } catch (err) {
      setSyncMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add service' });
    }
    setAdding(false);
  };

  const platforms = ['All', ...new Set(services.map((s) => s.platform).filter(Boolean))];
  const categories = [
    'All',
    ...new Set(
      services
        .map((s) => s.category || s.category_name)
        .filter(Boolean)
    ),
  ];

  const filtered = services.filter((s) => {
    const q = search.trim().toLowerCase();
    const cat = s.category || s.category_name || '';
    if (platform !== 'All' && s.platform !== platform) return false;
    if (categoryFilter !== 'All' && cat !== categoryFilter) return false;
    if (!q) return true;
    return (
      (s.name || '').toLowerCase().includes(q)
      || (s.platform || '').toLowerCase().includes(q)
      || cat.toLowerCase().includes(q)
      || (s.description || '').toLowerCase().includes(q)
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
          <h3 className="admin-svc-card__title" title={svc.name || ''}>
            {displayServiceName(svc, 100)}
            {svc.needs_price ? (
              <span className="badge badge-warning" style={{ marginLeft: 8, fontSize: 11 }}>No price — Sync or set rate</span>
            ) : null}
          </h3>
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
            <span>Category</span>
            {editing ? (
              <>
                <input
                  className="input admin-svc-card__field-input"
                  list={`cat-card-${svc.id}`}
                  value={draft.category}
                  onChange={(e) => updateDraft(svc.id, 'category', e.target.value)}
                />
                <datalist id={`cat-card-${svc.id}`}>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </>
            ) : (
              <strong>{svc.category || svc.category_name || '—'}</strong>
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
              <strong>₹{money(svc.original_price, 4)}</strong>
            )}
          </div>
          <div className="admin-svc-card__cell">
            <span>Margin %</span>
            {editing ? (
              <input
                type="number"
                step="1"
                min="0"
                max="500"
                className="input admin-svc-card__field-input"
                value={draft.profit_margin}
                onChange={(e) => updateDraft(svc.id, 'profit_margin', e.target.value)}
                title="Selling price auto-updates from provider price × margin"
              />
            ) : (
              <strong>{money(svc.profit_margin ?? 50, 0)}%</strong>
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
              <strong>₹{money(svc.custom_price, 2)}</strong>
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
              <strong>{svc.min_quantity ?? '—'}</strong>
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
              <strong>{svc.max_quantity != null ? Number(svc.max_quantity).toLocaleString() : '—'}</strong>
            )}
          </div>
          {editing ? (
            <div className="admin-svc-card__cell admin-svc-card__cell--full">
              <span>Description</span>
              <textarea
                className="input admin-svc-card__field-input"
                rows={3}
                value={draft.description}
                onChange={(e) => updateDraft(svc.id, 'description', e.target.value)}
                placeholder="Service description from provider"
              />
            </div>
          ) : null}
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
              title="Pehle choose karo — kis provider ki services delete karni hain"
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
                    <div className="admin-provider-card__meta admin-provider-card__margin-row">
                      <label htmlFor={`prov-margin-${p.id}`}>Margin %</label>
                      <input
                        id={`prov-margin-${p.id}`}
                        type="number"
                        min={0}
                        max={500}
                        className="input admin-provider-card__margin-input"
                        value={marginDrafts[p.id] ?? String(p.profit_margin ?? 50)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setMarginDrafts((prev) => ({ ...prev, [p.id]: e.target.value }));
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={applyingMarginId === p.id || syncing}
                        onClick={(e) => {
                          e.stopPropagation();
                          applyProviderMargin(p.id);
                        }}
                        title="Save margin and recalculate all selling prices"
                      >
                        {applyingMarginId === p.id ? '…' : 'Apply → prices'}
                      </button>
                    </div>
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
                              text: `${p.name}: imported ${d.imported ?? d.total ?? '—'} (API ${d.total ?? '—'}) · +${d.added ?? 0} new · ${d.updated ?? 0} updated · junk ${d.skippedJunk ?? 0} · fail ${d.failed ?? 0} · categories ${d.categoriesTotal ?? '—'} · prices @ ${d.marginPct ?? p.profit_margin}%`,
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
          <p className="admin-services-add-note" style={{ marginTop: 0 }}>
            Provider sync ke alawa yahan se apni service + category add kar sakte ho.
          </p>
          <div className="admin-services-add-grid">
            <label className="admin-services-add-field">
              <span className="admin-services-add-label">Service name</span>
              <input
                className="input"
                placeholder="e.g. Facebook Followers — HQ"
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
              />
            </label>
            <label className="admin-services-add-field admin-services-add-span-2">
              <span className="admin-services-add-label">Platform</span>
              <SocialIconPicker
                mode="platform"
                value={addForm.platform}
                onChange={(v) => setAddForm((p) => ({ ...p, platform: v }))}
                placeholder="e.g. Facebook / Instagram / YouTube"
              />
            </label>
            <label className="admin-services-add-field">
              <span className="admin-services-add-label">Category</span>
              <input
                className="input"
                list="admin-manual-categories"
                placeholder="e.g. Facebook Followers"
                value={addForm.category}
                onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value }))}
              />
              <datalist id="admin-manual-categories">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="admin-services-add-field">
              <span className="admin-services-add-label">Selling price / 1000 (₹)</span>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 170"
                value={addForm.custom_price}
                onChange={(e) => setAddForm((p) => ({ ...p, custom_price: e.target.value }))}
              />
            </label>
            <label className="admin-services-add-field">
              <span className="admin-services-add-label">Min quantity</span>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={addForm.min_quantity}
                onChange={(e) => setAddForm((p) => ({ ...p, min_quantity: e.target.value }))}
              />
            </label>
            <label className="admin-services-add-field">
              <span className="admin-services-add-label">Max quantity</span>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="e.g. 1000000"
                value={addForm.max_quantity}
                onChange={(e) => setAddForm((p) => ({ ...p, max_quantity: e.target.value }))}
              />
            </label>
          </div>
          <div className="admin-services-add-actions">
            <label className="admin-services-add-active">
              <input
                type="checkbox"
                checked={!!addForm.is_active}
                onChange={(e) => setAddForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              Active (users ko dikhe)
            </label>
            <button type="button" className="btn btn-primary" onClick={createManualService} disabled={adding}>
              {adding ? 'Adding…' : 'Add Service'}
            </button>
          </div>
          <p className="admin-services-add-note">
            Nayi category name likhne se woh auto create ho jayegi. Provider API sync alag se chalti hai.
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

<p className="admin-services-hint" style={{ marginTop: '0.75rem' }}>
          Provider price + margin → selling auto. Table shows clean service names only — open Edit for description.
        </p>

        {!filtered.length ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No services found</p>
        ) : (
          <>
            <div className="admin-services-desktop admin-services-table-wrap table-wrap">
              <table className="table admin-svc-table">
                <thead>
                  <tr>
                    {['Service', 'Platform', 'Category', 'Provider/1000', 'Margin%', 'Selling/1000', 'Min', 'Max', 'Status', 'Actions'].map((h) => (
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
                        <td className="admin-svc-col-name">
                          {editing ? (
                            <div className="admin-svc-table-name-wrap">
                              <input
                                className="input admin-svc-table-input"
                                value={draft.name}
                                onChange={(e) => updateDraft(svc.id, 'name', e.target.value)}
                                placeholder="Service name"
                              />
                              <textarea
                                className="input admin-svc-table-input"
                                rows={2}
                                placeholder="Description (optional)"
                                value={draft.description}
                                onChange={(e) => updateDraft(svc.id, 'description', e.target.value)}
                              />
                            </div>
                          ) : (
                            <div
                              className="admin-svc-table-name-cell"
                              title={truncateText(svc.description, 200) || svc.name || ''}
                            >
                              <span className="admin-svc-table-title">
                                {displayServiceName(svc, 72)}
                              </span>
                              {svc.needs_price ? (
                                <span className="badge badge-warning admin-svc-price-badge">No price</span>
                              ) : null}
                            </div>
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
                            <span className="admin-svc-platform-pill">{svc.platform || '—'}</span>
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              className="input admin-svc-table-input"
                              list={`cat-tbl-${svc.id}`}
                              value={draft.category}
                              onChange={(e) => updateDraft(svc.id, 'category', e.target.value)}
                            />
                          ) : (
                            <span className="admin-svc-category-pill">{svc.category || svc.category_name || '—'}</span>
                          )}
                          {editing && (
                            <datalist id={`cat-tbl-${svc.id}`}>
                              {categoryOptions.map((c) => (
                                <option key={c} value={c} />
                              ))}
                            </datalist>
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
                            <span style={{ color: 'var(--text-muted)' }}>₹{money(svc.original_price, 4)}</span>
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <input
                              type="number"
                              step="1"
                              className="input admin-svc-table-input admin-svc-table-input--num"
                              value={draft.profit_margin}
                              onChange={(e) => updateDraft(svc.id, 'profit_margin', e.target.value)}
                              title="Changes selling price automatically"
                            />
                          ) : (
                            `${money(svc.profit_margin ?? 50, 0)}%`
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
                            `₹${money(svc.custom_price, Number(svc.custom_price) < 1 ? 4 : 2)}`
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

      {deleteAllOpen && (
        <div className="modal-overlay" onClick={() => !deletingAll && setDeleteAllOpen(false)} role="presentation">
          <div
            className="card fade-in modal-panel admin-svc-delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="admin-svc-delete-all-title"
          >
            <h3 id="admin-svc-delete-all-title" className="admin-svc-delete-modal__title">
              Kis provider ki services delete karni hain?
            </h3>
            <p className="admin-svc-delete-modal__text">
              Pehle choose karo — sirf usi provider ki list hategi.
            </p>
            <div className="admin-delete-provider-list">
              {providers.map((p) => {
                const count = services.filter((s) => String(s.provider_id) === String(p.id)).length;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className="btn btn-ghost admin-delete-provider-btn"
                    disabled={deletingAll || count === 0}
                    onClick={() => confirmDeleteAllForProvider(p.id)}
                  >
                    <strong>{p.name}</strong>
                    <span>{count} services</span>
                  </button>
                );
              })}
              <button
                type="button"
                className="btn btn-danger admin-delete-provider-btn"
                disabled={deletingAll || !services.length}
                onClick={() => confirmDeleteAllForProvider('all')}
              >
                <strong>Sab providers (ALL)</strong>
                <span>{services.length} services</span>
              </button>
            </div>
            <div className="admin-svc-delete-modal__actions" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDeleteAllOpen(false)}
                disabled={Boolean(deletingAll)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            <p className="admin-svc-delete-modal__name">{displayServiceName(deleteTarget, 120)}</p>
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
