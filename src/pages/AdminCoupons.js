import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import { adminGetCoupons, adminCreateCoupon, adminDeleteCoupon } from '../api';

const AdminCoupons = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', discount_value: 10, min_amount: 100, max_uses: 100,
  });

  const load = () => adminGetCoupons().then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    await adminCreateCoupon(form);
    setForm({ code: '', discount_type: 'percent', discount_value: 10, min_amount: 100, max_uses: 100 });
    load();
  };

  const columns = [
    { key: 'code', label: 'Code', render: (c) => <strong>{c.code}</strong> },
    { key: 'discount_type', label: 'Type' },
    { key: 'discount_value', label: 'Value' },
    {
      key: 'used_count',
      label: 'Used',
      render: (c) => `${c.used_count}${c.max_uses ? ` / ${c.max_uses}` : ''}`,
    },
    {
      key: 'actions',
      label: '',
      render: (c) => (
        <button type="button" className="btn btn-danger btn-sm" onClick={() => adminDeleteCoupon(c.id).then(load)}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Coupons</h1>
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Create coupon</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
          <input className="input" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <select className="select" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed ₹</option>
          </select>
          <input className="input" type="number" placeholder="Value" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
          <input className="input" type="number" placeholder="Min amount" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} />
          <input className="input" type="number" placeholder="Max uses" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: 12, width: '100%', maxWidth: 280 }} onClick={create}>
          Create
        </button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <AdminResponsiveTable columns={columns} rows={list} emptyMessage="No coupons" />
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
