import React, { useMemo, useState } from 'react';
import {
  DEFAULT_ADMIN_NAV_LINKS,
  ADMIN_ROUTE_PRESETS,
} from '../../config/adminNav';
import { parseAdminNavJson } from '../../utils/adminNav';

const emptyCustom = () => ({
  id: `custom-${Date.now()}`,
  label: '',
  icon: '🔗',
  path: '/admin',
  external: false,
  openInNewTab: true,
  enabled: true,
});

const AdminNavManager = ({ draft, updateDraft, onToast }) => {
  const hidden = useMemo(
    () => new Set(parseAdminNavJson(draft.admin_sidebar_hidden).map(String)),
    [draft.admin_sidebar_hidden],
  );

  const customLinks = useMemo(
    () => parseAdminNavJson(draft.admin_sidebar_custom),
    [draft.admin_sidebar_custom],
  );

  const [form, setForm] = useState(emptyCustom);

  const setHidden = (id, isHidden) => {
    const next = new Set(hidden);
    if (isHidden) next.add(id);
    else next.delete(id);
    updateDraft('admin_sidebar_hidden', Array.from(next));
  };

  const setCustomLinks = (next) => {
    updateDraft('admin_sidebar_custom', next);
  };

  const addCustomLink = (e) => {
    e.preventDefault();
    const path = String(form.path || '').trim();
    const label = String(form.label || '').trim();
    if (!path || !label) {
      onToast?.('Label and path are required', 'error');
      return;
    }
    const external = form.external || /^https?:\/\//i.test(path);
    setCustomLinks([
      ...customLinks,
      {
        id: form.id || `custom-${Date.now()}`,
        label,
        icon: form.icon || '🔗',
        path,
        external,
        openInNewTab: Boolean(form.openInNewTab),
        enabled: true,
      },
    ]);
    setForm(emptyCustom());
    onToast?.('Custom link added — click Save All Settings to apply');
  };

  const removeCustom = (id) => {
    setCustomLinks(customLinks.filter((c) => c.id !== id));
    onToast?.('Removed — Save All Settings to apply');
  };

  return (
    <div className="admin-nav-manager">
      <p className="admin-nav-manager__intro">
        Show or hide built-in menu items and add your own links (admin pages or external URLs).
        After changes, press <strong>Save All Settings</strong> at the top, then refresh the admin panel if needed.
      </p>

      <section className="admin-nav-manager__section card">
        <h3 className="admin-settings-section-title">Built-in menu items</h3>
        <p className="admin-nav-manager__hint">Uncheck to hide from the left sidebar.</p>
        <ul className="admin-nav-manager__builtin-list">
          {DEFAULT_ADMIN_NAV_LINKS.map((item) => (
            <li key={item.id}>
              <label className="admin-nav-manager__builtin-row">
                <input
                  type="checkbox"
                  checked={!hidden.has(item.id)}
                  onChange={(e) => setHidden(item.id, !e.target.checked)}
                />
                <span className="admin-nav-manager__builtin-icon" aria-hidden="true">{item.icon}</span>
                <span className="admin-nav-manager__builtin-label">{item.label}</span>
                <code className="admin-nav-manager__path">{item.to}</code>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-nav-manager__section card">
        <h3 className="admin-settings-section-title">Add custom sidebar link</h3>
        <form className="admin-nav-manager__form" onSubmit={addCustomLink}>
          <div className="admin-nav-manager__form-grid">
            <div className="form-group">
              <label className="label">Label</label>
              <input
                className="input"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. My Tool"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Icon (emoji)</label>
              <input
                className="input"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🔗"
                maxLength={4}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Quick pick admin page</label>
            <select
              className="select"
              value={form.external ? '' : form.path}
              onChange={(e) => {
                const v = e.target.value;
                if (v) setForm((f) => ({ ...f, path: v, external: false }));
              }}
            >
              <option value="">— or type path below —</option>
              {ADMIN_ROUTE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label} ({p.value})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Path or URL</label>
            <input
              className="input"
              value={form.path}
              onChange={(e) => {
                const path = e.target.value;
                setForm((f) => ({
                  ...f,
                  path,
                  external: f.external || /^https?:\/\//i.test(path),
                }));
              }}
              placeholder="/admin/users or https://..."
              required
            />
          </div>

          <label className="admin-nav-manager__check">
            <input
              type="checkbox"
              checked={form.external}
              onChange={(e) => setForm((f) => ({ ...f, external: e.target.checked }))}
            />
            External link (opens website)
          </label>
          <label className="admin-nav-manager__check">
            <input
              type="checkbox"
              checked={form.openInNewTab}
              onChange={(e) => setForm((f) => ({ ...f, openInNewTab: e.target.checked }))}
            />
            Open in new tab
          </label>

          <button type="submit" className="btn btn-primary">➕ Add to sidebar</button>
        </form>
      </section>

      {customLinks.length > 0 ? (
        <section className="admin-nav-manager__section card">
          <h3 className="admin-settings-section-title">Your custom links</h3>
          <ul className="admin-nav-manager__custom-list">
            {customLinks.map((c) => (
              <li key={c.id} className="admin-nav-manager__custom-item">
                <span aria-hidden="true">{c.icon || '🔗'}</span>
                <div className="admin-nav-manager__custom-body">
                  <strong>{c.label}</strong>
                  <code>{c.path}</code>
                  {c.external ? <span className="badge badge-info">External</span> : null}
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeCustom(c.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

export default AdminNavManager;
