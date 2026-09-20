import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  adminGetAnnouncements,
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminUpdateAnnouncement,
} from '../api';
import { ANNOUNCEMENT_TEMPLATES } from '../content/announcementTemplates';
import '../styles/announcementPopup.css';

const EMPTY = {
  title: '',
  content: '',
  is_active: true,
  show_on_login: true,
  template_key: '',
};

const AdminAnnouncements = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [selectedTpl, setSelectedTpl] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => adminGetAnnouncements()
    .then((r) => setList(Array.isArray(r.data) ? r.data : []))
    .catch(() => setList([]));

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const applyTemplate = (tpl) => {
    setSelectedTpl(tpl.key);
    setForm({
      title: tpl.title,
      content: tpl.content,
      is_active: true,
      show_on_login: true,
      template_key: tpl.key,
    });
  };

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showMsg('Title aur content dono chahiye — pehle template choose karo ya likho', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminCreateAnnouncement({
        title: form.title.trim(),
        content: form.content.trim(),
        is_active: !!form.is_active,
        show_on_login: !!form.show_on_login,
        template_key: form.template_key || selectedTpl || null,
      });
      setForm(EMPTY);
      setSelectedTpl('');
      showMsg('Announcement created — users ko login/account open pe popup dikhega');
      await load();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to create', 'error');
    }
    setSaving(false);
  };

  const toggleActive = async (a) => {
    try {
      await adminUpdateAnnouncement(a.id, {
        title: a.title,
        content: a.content,
        is_active: !(a.is_active === 1 || a.is_active === true),
        show_on_login: a.show_on_login !== 0 && a.show_on_login !== false,
        template_key: a.template_key || null,
      });
      await load();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-ann-page">
        <h1 className="admin-page-title">Popup Announcements</h1>
        <p className="admin-ann-intro">
          10 templates mein se ek choose karo → edit karo → Create. User jab account / panel open karega,
          login popup dikhega (Show on login ON hona chahiye).
        </p>

        <h2 className="card-title" style={{ fontSize: '1rem', marginBottom: 8 }}>1. Choose a template</h2>
        <div className="admin-ann-templates">
          {ANNOUNCEMENT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              className={`admin-ann-tpl${selectedTpl === tpl.key ? ' is-active' : ''}`}
              onClick={() => applyTemplate(tpl)}
            >
              <div className="admin-ann-tpl__top">
                <span className="admin-ann-tpl__emoji" aria-hidden="true">{tpl.emoji}</span>
                <span className="admin-ann-tpl__label">{tpl.label}</span>
              </div>
              <p className="admin-ann-tpl__title">{tpl.title}</p>
              <p className="admin-ann-tpl__preview">{tpl.content}</p>
            </button>
          ))}
        </div>

        <div className="card admin-ann-form">
          <h3 className="card-title" style={{ marginBottom: 8, fontSize: '1rem' }}>2. Edit &amp; publish</h3>
          <div className="admin-ann-form__grid">
            <label>
              <span className="admin-ann-form__label">Title</span>
              <input
                className="input"
                placeholder="e.g. Welcome to ABHAYSMM!"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              <span className="admin-ann-form__label">Content</span>
              <textarea
                className="textarea"
                rows={6}
                placeholder="Popup message users will see…"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </label>
            <div className="admin-ann-form__checks">
              <label>
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!!form.show_on_login}
                  onChange={(e) => setForm({ ...form, show_on_login: e.target.checked })}
                />
                Show popup when account opens
              </label>
            </div>
          </div>
          <div className="admin-ann-form__actions">
            <button type="button" className="btn btn-primary" onClick={create} disabled={saving}>
              {saving ? 'Publishing…' : 'Create Announcement'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setForm(EMPTY); setSelectedTpl(''); }}
            >
              Clear
            </button>
          </div>
        </div>

        {msg && (
          <div className={`admin-ann-msg admin-ann-msg--${msg.type}`}>{msg.text}</div>
        )}

        <h2 className="card-title" style={{ fontSize: '1rem', marginBottom: 8 }}>Live announcements</h2>
        {!list.length ? (
          <p style={{ color: 'var(--text-muted)' }}>No announcements yet — pick a template above.</p>
        ) : (
          list.map((a) => {
            const active = a.is_active === 1 || a.is_active === true;
            const onLogin = a.show_on_login !== 0 && a.show_on_login !== false;
            return (
              <div key={a.id} className="card admin-ann-list-item">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong>{a.title}</strong>
                  <div className="admin-ann-list-item__meta">
                    {a.template_key ? `Template: ${a.template_key} · ` : ''}
                    {active ? 'Active' : 'Off'} · {onLogin ? 'Login popup ON' : 'Login popup OFF'}
                  </div>
                  <p>{a.content}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => toggleActive(a)}
                  >
                    {active ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => adminDeleteAnnouncement(a.id).then(load)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
