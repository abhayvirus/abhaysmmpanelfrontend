import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import { adminGetCoupons, adminCreateCoupon, adminDeleteCoupon } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import { wakeApi } from '../utils/apiWake';

const EMPTY = {
  code: '',
  discount_type: 'percent',
  discount_value: '10',
  min_amount: '100',
  max_uses: '100',
  expires_at: '',
};

const AdminCoupons = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await wakeApi(8000);
      const { data } = await adminGetCoupons();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setList([]);
      setError(getApiErrorMessage(err, 'Could not load coupons'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const create = async () => {
    const code = String(form.code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return setError('Enter a coupon code');
    const value = parseFloat(form.discount_value);
    if (!Number.isFinite(value) || value <= 0) return setError('Enter a valid discount value');
    if (form.discount_type === 'percent' && value > 100) {
      return setError('Percent cannot be more than 100');
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await wakeApi(8000);
      await adminCreateCoupon({
        code,
        discount_type: form.discount_type,
        discount_value: value,
        min_amount: form.min_amount === '' ? 0 : parseFloat(form.min_amount) || 0,
        max_uses: form.max_uses === '' ? null : parseInt(form.max_uses, 10) || null,
        expires_at: form.expires_at || null,
      });
      setForm(EMPTY);
      setSuccess(`Coupon ${code} created`);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create coupon'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, code) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    setError('');
    try {
      await adminDeleteCoupon(id);
      setSuccess(`Deleted ${code}`);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete coupon'));
    }
  };

  const columns = [
    { key: 'code', label: 'Code', render: (c) => <strong>{c.code}</strong> },
    {
      key: 'discount_type',
      label: 'Type',
      render: (c) => (c.discount_type === 'fixed' ? 'Fixed ₹' : 'Percent %'),
    },
    {
      key: 'discount_value',
      label: 'Value',
      render: (c) =>
        c.discount_type === 'fixed' ? `₹${c.discount_value}` : `${c.discount_value}%`,
    },
    {
      key: 'min_amount',
      label: 'Min ₹',
      render: (c) => `₹${c.min_amount ?? 0}`,
    },
    {
      key: 'used_count',
      label: 'Used',
      render: (c) => `${c.used_count || 0}${c.max_uses != null ? ` / ${c.max_uses}` : ' / ∞'}`,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (c) => (Number(c.is_active) === 1 || c.is_active === true ? 'Active' : 'Off'),
    },
    {
      key: 'actions',
      label: '',
      render: (c) => (
        <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(c.id, c.code)}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Coupons</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: -8, marginBottom: 20, fontSize: 14 }}>
        Create discount codes for Add Funds. Users enter the code at checkout.
      </p>

      {error ? (
        <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            Retry
          </button>
        </div>
      ) : null}
      {success ? <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div> : null}

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Create coupon</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 14,
          }}
        >
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Code</label>
            <input
              className="input"
              placeholder="e.g. ABHAY0777"
              value={form.code}
              onChange={(e) => update('code', e.target.value.toUpperCase())}
              autoComplete="off"
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Type</label>
            <select
              className="select"
              value={form.discount_type}
              onChange={(e) => update('discount_type', e.target.value)}
            >
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed ₹</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">
              {form.discount_type === 'fixed' ? 'Discount ₹' : 'Discount %'}
            </label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder={form.discount_type === 'fixed' ? '50' : '10'}
              value={form.discount_value}
              onChange={(e) => update('discount_value', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Min amount ₹</label>
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              placeholder="100"
              value={form.min_amount}
              onChange={(e) => update('min_amount', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Max uses (empty = unlimited)</label>
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              placeholder="100"
              value={form.max_uses}
              onChange={(e) => update('max_uses', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Expires (optional)</label>
            <input
              className="input"
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => update('expires_at', e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 16, width: '100%', maxWidth: 280 }}
          disabled={saving}
          onClick={create}
        >
          {saving ? 'Creating…' : 'Create coupon'}
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading coupons…</p>
        ) : (
          <AdminResponsiveTable columns={columns} rows={list} emptyMessage="No coupons yet — create one above" />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
