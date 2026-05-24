import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getServices, getPlatforms, placeOrder, getMe } from '../api';

const platformIcons = {
  All: '⚡', Instagram: '📸', TikTok: '🎵', YouTube: '▶️',
  Facebook: '👤', WhatsApp: '💬', Twitter: '🐦',
  Telegram: '✈️', Spotify: '🎧', Other: '🌐'
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
    getMe().then(res => {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    }).catch(err => console.log('getMe error:', err));

    getPlatforms().then(res => {
      setPlatforms(['All', ...res.data]);
    }).catch(err => console.log('platforms error:', err));
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const params = {};
        if (selectedPlatform !== 'All') params.platform = selectedPlatform;
        const res = await getServices(params);
        setServices(res.data);
        setSelectedService(null);
      } catch (err) {
        console.log('services error:', err);
      }
    };
    
    loadServices();
  }, [selectedPlatform]);

  const totalCost = () => {
    if (!selectedService || !quantity || isNaN(quantity)) return null;
    return ((selectedService.price / 1000) * parseInt(quantity)).toFixed(2);
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
        quantity: parseInt(quantity)
      });
      setMessage({ type: 'success', text: '✅ ' + res.data.message });
      setLink('');
      setQuantity('');
      setSelectedService(null);
      getMe().then(r => {
        setUser(r.data);
        localStorage.setItem('user', JSON.stringify(r.data));
      });
    } catch (err) {
      setMessage({ type: 'error', text: '❌ ' + (err.response?.data?.message || 'Order fail hua') });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Username</p>
            <p style={styles.statValue}>{user.name || '...'}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Balance</p>
            <p style={{ ...styles.statValue, color: '#6c63ff' }}>
              ₹{parseFloat(user.balance || 0).toFixed(2)}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Status</p>
            <p style={{ ...styles.statValue, color: user.status === 'ACTIVE' ? '#4ade80' : '#f87171' }}>
              {user.status || '...'}
            </p>
          </div>
        </div>

        <div style={styles.tabs}>
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              style={{
                ...styles.tab,
                ...(selectedPlatform === p ? styles.activeTab : {})
              }}
            >
              {platformIcons[p] || '🌐'} {p}
            </button>
          ))}
        </div>

        <div style={styles.servicesList}>
          {services.length === 0 ? (
            <div style={styles.emptyState}>
              <p>📭 Koi service nahi mili</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Admin panel mein jaake "Sync" karo</p>
            </div>
          ) : (
            services.map(svc => (
              <div
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                style={{
                  ...styles.serviceItem,
                  ...(selectedService?.id === svc.id ? styles.selectedService : {})
                }}
              >
                <span style={{ fontSize: 14 }}>{svc.name}</span>
                <span style={styles.servicePrice}>₹{svc.price}/1000</span>
              </div>
            ))
          )}
        </div>

        {selectedService && (
          <div style={styles.orderForm}>
            <h3 style={{ marginBottom: 16, fontSize: 18 }}>📝 New Order</h3>

            <div style={styles.serviceInfo}>
              <span>🎯 {selectedService.name}</span>
              <span>Min: {selectedService.min_quantity} | Max: {selectedService.max_quantity?.toLocaleString()}</span>
            </div>

            {message && (
              <div style={{
                ...styles.message,
                background: message.type === 'success' ? '#1a3a2a' : '#3a1a1a',
                color: message.type === 'success' ? '#4ade80' : '#f87171',
                borderColor: message.type === 'success' ? '#2d5a3d' : '#5a2d2d',
              }}>
                {message.text}
              </div>
            )}

            <label style={styles.label}>🔗 Link</label>
            <input
              placeholder="https://instagram.com/username"
              value={link}
              onChange={e => setLink(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>🔢 Quantity</label>
            <input
              type="number"
              placeholder={`${selectedService.min_quantity} se ${selectedService.max_quantity} tak`}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min={selectedService.min_quantity}
              max={selectedService.max_quantity}
              style={styles.input}
            />

            {totalCost() && (
              <div style={styles.costBox}>
                <span style={{ color: '#8ca0b8' }}>Total Cost:</span>
                <span style={{ color: '#6c63ff', fontWeight: 800, fontSize: 22 }}>₹{totalCost()}</span>
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={loading}
              style={{ ...styles.orderBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Order ho raha hai...' : '🚀 Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  main: { marginLeft: 240, minHeight: '100vh', background: '#0d1520', color: '#fff', padding: '32px 40px', width: 'calc(100% - 240px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  pageTitle: { fontSize: 28, fontWeight: 800 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 },
  statCard: { background: '#1a2535', borderRadius: 14, padding: '20px 24px', border: '1px solid #1e2a3a' },
  statLabel: { color: '#8ca0b8', fontSize: 13, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 700 },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  tab: { padding: '8px 18px', borderRadius: 50, border: 'none', cursor: 'pointer', background: '#1a2535', color: '#8ca0b8', fontSize: 13, fontWeight: 600 },
  activeTab: { background: '#6c63ff', color: '#fff' },
  servicesList: { marginBottom: 28 },
  emptyState: { textAlign: 'center', padding: 60, color: '#8ca0b8' },
  serviceItem: { padding: '14px 20px', marginBottom: 8, borderRadius: 10, background: '#1a2535', border: '1px solid #1e2a3a', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' },
  selectedService: { background: '#2d3a50', border: '1px solid #6c63ff' },
  servicePrice: { color: '#6c63ff', fontWeight: 700, fontSize: 15 },
  orderForm: { background: '#1a2535', borderRadius: 16, padding: 28, border: '1px solid #2d3a50' },
  serviceInfo: { display: 'flex', justifyContent: 'space-between', background: '#0d1520', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#8ca0b8', flexWrap: 'wrap', gap: 8 },
  message: { padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, border: '1px solid' },
  label: { display: 'block', color: '#8ca0b8', fontSize: 13, marginBottom: 8, marginTop: 4 },
  input: { width: '100%', padding: '13px 16px', borderRadius: 10, background: '#0d1520', border: '1px solid #2d3a50', color: '#fff', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', outline: 'none' },
  costBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1520', padding: '14px 20px', borderRadius: 10, marginBottom: 16 },
  orderBtn: { width: '100%', padding: 16, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6c63ff, #9b59b6)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};

export default Dashboard;