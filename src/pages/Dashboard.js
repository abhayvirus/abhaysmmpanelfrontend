import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { getServices, getPlatforms, placeOrder, getMe } from '../api';

const platformIcons = {
  All: '⚡', Instagram: '📸', TikTok: '🎵', YouTube: '▶️',
  Facebook: '👤', WhatsApp: '💬', Twitter: '🐦',
  Telegram: '✈️', Spotify: '🎧', Other: '🌐',
};

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [services, setServices] = useState([]);
  const [platforms, setPlatforms] = useState(['All']);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedService, setSelectedService] = useState(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getMe().then((res) => {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    }).catch(() => {});
    getPlatforms().then((res) => setPlatforms(['All', ...res.data])).catch(() => {});
  }, []);

  useEffect(() => {
    const params = selectedPlatform !== 'All' ? { platform: selectedPlatform } : {};
    getServices(params).then((res) => {
      setServices(res.data);
      setSelectedService(null);
    }).catch(() => {});
  }, [selectedPlatform]);

  const totalCost = () => {
    if (!selectedService || !quantity || Number.isNaN(Number(quantity))) return null;
    return ((selectedService.price / 1000) * parseInt(quantity, 10)).toFixed(2);
  };

  const handleOrder = async () => {
    if (!selectedService) return setMessage({ type: 'error', text: 'Pehle service select karo' });
    if (!link) return setMessage({ type: 'error', text: 'Link daalo' });
    if (!quantity) return setMessage({ type: 'error', text: 'Quantity daalo' });

    setLoading(true);
    setMessage(null);
    try {
      const res = await placeOrder({
        service_id: selectedService.id,
        link,
        quantity: parseInt(quantity, 10),
      });
      setMessage({ type: 'success', text: `✅ ${res.data.message}` });
      setLink('');
      setQuantity('');
      setSelectedService(null);
      getMe().then((r) => {
        setUser(r.data);
        localStorage.setItem('user', JSON.stringify(r.data));
      });
    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.response?.data?.message || 'Order fail hua'}` });
    }
    setLoading(false);
  };

  return (
    <UserLayout title="Dashboard">
      <div className="dashboard-page fade-in">
        <h1 className="page-title">Dashboard</h1>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-label">Username</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{user.name || '...'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Balance</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              ₹{parseFloat(user.balance || 0).toFixed(2)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Status</div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: user.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' }}>
              {user.status || '...'}
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPlatform(p)}
              className={`dashboard-tab${selectedPlatform === p ? ' active' : ''}`}
            >
              {platformIcons[p] || '🌐'} {p}
            </button>
          ))}
        </div>

        <div className="dashboard-services">
          {services.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <p>📭 Koi service nahi mili</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Admin panel mein jaake Sync karo</p>
            </div>
          ) : (
            services.map((svc) => (
              <div
                key={svc.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedService(svc)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedService(svc)}
                className={`dashboard-service-item${selectedService?.id === svc.id ? ' selected' : ''}`}
              >
                <span style={{ fontSize: 14, flex: 1, minWidth: 0 }}>{svc.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{svc.price}/1000</span>
              </div>
            ))
          )}
        </div>

        {selectedService && (
          <div className="dashboard-order-form" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: 16, fontSize: 18 }}>📝 New Order</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>🎯 {selectedService.name}</span>
              <span>Min: {selectedService.min_quantity} | Max: {selectedService.max_quantity?.toLocaleString()}</span>
            </div>

            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>{message.text}</div>
            )}

            <div className="form-group">
              <label className="label">🔗 Link</label>
              <input className="input" placeholder="https://instagram.com/username" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">🔢 Quantity</label>
              <input
                className="input"
                type="number"
                placeholder={`${selectedService.min_quantity} – ${selectedService.max_quantity}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={selectedService.min_quantity}
                max={selectedService.max_quantity}
              />
            </div>

            {totalCost() && (
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, padding: '0.875rem 1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Cost</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.375rem' }}>₹{totalCost()}</span>
              </div>
            )}

            <button type="button" className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={handleOrder}>
              {loading ? '⏳ Order ho raha hai...' : '🚀 Place Order'}
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Dashboard;
