import React, { useState, useEffect, useMemo } from 'react';
import UserLayout from '../components/UserLayout';
import OrderFormModal from '../components/OrderFormModal';
import { getServices, getPlatforms, getServiceCategories } from '../api';
import { useSettings } from '../contexts/SettingsContext';

const Services = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [services, setServices] = useState([]);
  const [platforms, setPlatforms] = useState(['All']);
  const [categories, setCategories] = useState(['All']);
  const [platform, setPlatform] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderService, setOrderService] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getPlatforms().then((r) => setPlatforms(['All', ...r.data])).catch(() => {});
    getServiceCategories().then((r) => setCategories(['All', ...r.data])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (platform !== 'All') params.platform = platform;
    if (category !== 'All') params.category = category;
    if (search.trim()) params.search = search.trim();
    getServices(params)
      .then((r) => setServices(r.data))
      .finally(() => setLoading(false));
  }, [platform, category, search]);

  const grouped = useMemo(() => {
    return services.reduce((acc, s) => {
      const cat = s.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {});
  }, [services]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <UserLayout>
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 8 }}>Services</h1>
          <p style={{ color: 'var(--text-muted)' }}>{services.length} services · orders sent to provider automatically</p>
        </div>
      </div>

      {toast && <div className="alert alert-success">{toast}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <input
          className="input"
          placeholder="🔍 Search by name, category, platform..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>PLATFORM</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {platforms.map((p) => (
              <button key={p} type="button" className={`btn btn-sm ${platform === p ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPlatform(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>CATEGORY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c) => (
              <button key={c} type="button" className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Loading services...</p>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: 'var(--text-muted)' }}>No services found. Ask admin to sync from API provider.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, svcs]) => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <h3 style={{
              color: 'var(--text-muted)', fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
            }}>{cat}</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {svcs.map((svc) => (
                <div key={svc.id} className="card services-row-card">
                  <div className="services-row-main">
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{svc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {svc.platform} · Min {svc.min_quantity} · Max {svc.max_quantity?.toLocaleString()}
                    </div>
                  </div>
                  <div className="services-row-price">
                    <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 16 }}>{sym}{svc.price}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per 1000</div>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm services-row-order-btn" onClick={() => setOrderService(svc)}>
                    Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <OrderFormModal
        service={orderService}
        open={!!orderService}
        onClose={() => setOrderService(null)}
        onSuccess={(data) => showToast(`Order #${data.order_id} placed! Charged ${sym}${data.amount_charged}`)}
      />
    </UserLayout>
  );
};

export default Services;
