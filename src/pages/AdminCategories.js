import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import SocialIconPicker from '../components/SocialIconPicker';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../api';
import '../styles/adminCategories.css';

const EMPTY_FORM = { name: '', icon: '📱', sort_order: 0, is_active: true };

const AdminCategories = () => {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState(null);

  const load = () => adminGetCategories().then((r) => setCats(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return showMsg('Category name required', 'error');
    adminCreateCategory({
      name: form.name.trim(),
      icon: form.icon || '📱',
      sort_order: parseInt(form.sort_order, 10) || 0,
      is_active: form.is_active !== false,
    })
      .then(() => {
        load();
        setForm(EMPTY_FORM);
        showMsg('Category added');
      })
      .catch((err) => showMsg(err.response?.data?.message || 'Failed', 'error'));
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      icon: cat.icon || '📱',
      sort_order: cat.sort_order ?? 0,
      is_active: cat.is_active !== 0 && cat.is_active !== false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const saveEdit = (id) => {
    adminUpdateCategory(id, {
      name: editForm.name.trim(),
      icon: editForm.icon || '📱',
      sort_order: parseInt(editForm.sort_order, 10) || 0,
      is_active: editForm.is_active !== false,
    })
      .then(() => {
        load();
        cancelEdit();
        showMsg('Category updated');
      })
      .catch((err) => showMsg(err.response?.data?.message || 'Update failed', 'error'));
  };

  const toggleActive = (cat) => {
    adminUpdateCategory(cat.id, {
      name: cat.name,
      icon: cat.icon,
      sort_order: cat.sort_order ?? 0,
      is_active: !(cat.is_active !== 0 && cat.is_active !== false),
    })
      .then(load)
      .catch(() => showMsg('Toggle failed', 'error'));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this category?')) return;
    adminDeleteCategory(id)
      .then(() => { load(); showMsg('Deleted'); })
      .catch((err) => showMsg(err.response?.data?.message || 'Delete failed', 'error'));
  };

  const renderCategoryCard = (c) => {
    const isActive = c.is_active !== 0 && c.is_active !== false;

    return (
      <article key={c.id} className="admin-cat-card">
        <div className="admin-cat-card__head">
          <span className="admin-cat-card__icon" aria-hidden="true">{c.icon || '📱'}</span>
          <h3 className="admin-cat-card__name">{c.name || '—'}</h3>
        </div>
        <div className="admin-cat-card__grid">
          <div className="admin-cat-card__cell">
            <span>Order</span>
            <strong>{c.sort_order ?? 0}</strong>
          </div>
          <div className="admin-cat-card__cell">
            <span>Status</span>
            <strong>{isActive ? 'Active' : 'Disabled'}</strong>
          </div>
        </div>
        <div className="admin-cat-card__actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>Edit</button>
          <button
            type="button"
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-danger'}`}
            onClick={() => toggleActive(c)}
          >
            {isActive ? 'ON' : 'OFF'}
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
        </div>
      </article>
    );
  };

  return (
    <AdminLayout>
      <div className="admin-categories-page">
        <h1 className="admin-page-title">Categories</h1>

        <div className="card admin-categories-form">
          <h3 className="card-title" style={{ marginBottom: 8, fontSize: '1rem' }}>Add category</h3>
          <div className="admin-categories-form__grid">
            <input
              className="input"
              placeholder="Category name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              type="number"
              placeholder="Display order"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
            <div className="admin-categories-form__icon-wrap">
              <SocialIconPicker
                mode="icon"
                value={form.icon}
                onChange={(icon) => setForm({ ...form, icon })}
                placeholder="Icon (emoji or text)"
              />
            </div>
            <label className="admin-categories-form__active">
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="admin-categories-form__actions">
            <button type="button" className="btn btn-primary" onClick={handleAdd}>Add Category</button>
          </div>
        </div>

        {msg && (
          <div className={`admin-cat-msg admin-cat-msg--${msg.type}`}>{msg.text}</div>
        )}

        {editingId != null && (
          <div className="card admin-categories-form admin-categories-edit-panel">
            <h3 className="card-title" style={{ marginBottom: 8, fontSize: '1rem' }}>Edit category</h3>
            <div className="admin-categories-form__grid">
              <input
                className="input"
                placeholder="Category name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="input"
                type="number"
                placeholder="Display order"
                value={editForm.sort_order}
                onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })}
              />
              <div className="admin-categories-form__icon-wrap">
                <SocialIconPicker
                  mode="icon"
                  value={editForm.icon}
                  onChange={(icon) => setEditForm({ ...editForm, icon })}
                />
              </div>
              <label className="admin-categories-form__active">
                <input
                  type="checkbox"
                  checked={!!editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="admin-categories-form__actions">
              <button type="button" className="btn btn-primary" onClick={() => saveEdit(editingId)}>Save changes</button>
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        )}

        {!cats.length ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No categories yet</p>
        ) : (
          <>
            <div className="admin-categories-desktop table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Order</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map((c) => {
                    const isActive = c.is_active !== 0 && c.is_active !== false;
                    return (
                      <tr key={c.id}>
                        <td>{c.icon}</td>
                        <td>{c.name}</td>
                        <td>{c.sort_order ?? 0}</td>
                        <td>{isActive ? 'Yes' : 'No'}</td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>Edit</button>
                            <button
                              type="button"
                              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-danger'}`}
                              onClick={() => toggleActive(c)}
                            >
                              {isActive ? 'ON' : 'OFF'}
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-categories-mobile">
              {cats.map(renderCategoryCard)}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
