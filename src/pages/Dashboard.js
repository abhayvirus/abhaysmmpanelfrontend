import React, { useMemo, useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import InsufficientBalanceAlert from '../components/InsufficientBalanceAlert';
import PanelLoading from '../components/PanelLoading';
import { getServices, getPlatforms, placeOrder, getMe } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/balanceWarning.css';

const platformIcons = {
  All: '⚡', Instagram: '📸', TikTok: '🎵', YouTube: '▶️',
  Facebook: '👤', WhatsApp: '💬', Twitter: '🐦',
  Telegram: '✈️', Spotify: '🎧', Other: '🌐',
};

const Dashboard = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [services, setServices] = useState([]);
  const [platforms, setPlatforms] = useState(['All']);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [orderMessage, setOrderMessage] = useState(null);
  const [balanceWarningDismissed, setBalanceWarningDismissed] = useState(false);

  const refreshUser = () => {
    getMe().then((res) => {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    }).catch(() => {});
  };

  useEffect(() => {
    let cancelled = false;
    setPageReady(false);
    setLoadError('');
    Promise.all([
      getMe().then((res) => {
        if (!cancelled) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      }),
      getPlatforms().then((res) => {
        if (!cancelled) setPlatforms(['All', ...res.data]);
      }),
    ])
      .catch(() => {
        if (!cancelled) setLoadError('Could not load dashboard. Please refresh.');
      })
      .finally(() => {
        if (!cancelled) setPageReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setServicesLoading(true);
    const params = selectedPlatform !== 'All' ? { platform: selectedPlatform } : {};
    getServices(params)
      .then((res) => {
        if (cancelled) return;
        setServices(res.data);
        setSelectedCategory('All');
        setSelectedServiceId('');
        setLink('');
        setQuantity('');
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedPlatform]);

  useEffect(() => {
    if (selectedServiceId) refreshUser();
  }, [selectedServiceId, quantity]);

  const categories = useMemo(() => {
    const set = new Set();
    services.forEach((s) => {
      const c = String(s.category || '').trim();
      if (c) set.add(c);
    });
    return ['All', ...Array.from(set)];
  }, [services]);

  const visibleServices = useMemo(() => {
    if (selectedCategory === 'All') return services;
    return services.filter((s) => String(s.category || '').trim() === selectedCategory);
  }, [services, selectedCategory]);

  const selectedService = useMemo(
    () => visibleServices.find((s) => String(s.id) === String(selectedServiceId)) || null,
    [visibleServices, selectedServiceId]
  );

  const orderCost = useMemo(() => {
    if (!selectedService || !quantity || Number.isNaN(Number(quantity))) return null;
    const qty = parseInt(quantity, 10);
    if (qty < 1) return null;
    return (selectedService.price / 1000) * qty;
  }, [selectedService, quantity]);

  const walletBalance = parseFloat(user.balance || 0);

  const insufficientBalance = useMemo(() => {
    if (orderCost == null) return null;
    if (walletBalance >= orderCost) return null;
    return {
      need: orderCost.toFixed(2),
      have: walletBalance.toFixed(2),
    };
  }, [orderCost, walletBalance]);

  const showBalanceWarning = Boolean(insufficientBalance) && !balanceWarningDismissed;

  useEffect(() => {
    setBalanceWarningDismissed(false);
  }, [selectedServiceId, insufficientBalance?.need, insufficientBalance?.have]);

  const handleOrder = async () => {
    if (!selectedService) return setOrderMessage({ type: 'error', text: 'Please select a service first' });
    if (!link) return setOrderMessage({ type: 'error', text: 'Please enter a valid link' });
    if (!quantity) return setOrderMessage({ type: 'error', text: 'Please enter quantity' });
    if (insufficientBalance) {
      return setOrderMessage({
        type: 'error',
        text: `Insufficient balance. Need ${sym}${insufficientBalance.need}, have ${sym}${insufficientBalance.have}`,
      });
    }

    setLoading(true);
    setOrderMessage(null);
    try {
      const res = await placeOrder({
        service_id: selectedService.id,
        link,
        quantity: parseInt(quantity, 10),
      });
      setOrderMessage({ type: 'success', text: `✅ ${res.data.message}` });
      setLink('');
      setQuantity('');
      setSelectedServiceId('');
      refreshUser();
    } catch (err) {
      setOrderMessage({ type: 'error', text: `❌ ${err.response?.data?.message || 'Order failed'}` });
    }
    setLoading(false);
  };

  return (
    <UserLayout title="New Order">
      <div className="dashboard-page fade-in">
        <div className="page-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>New Order</h1>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-label">Username</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{user.name || '...'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Balance</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              {sym}{walletBalance.toFixed(2)}
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
          {!pageReady || servicesLoading ? (
            <PanelLoading message={!pageReady ? 'Loading dashboard…' : 'Loading services…'} />
          ) : loadError ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--danger)' }}>
              <p>{loadError}</p>
            </div>
          ) : services.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <p>📭 No services found</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Ask admin to sync services from provider.</p>
            </div>
          ) : (
            <div className="dashboard-order-form">
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>📝 Place order</h3>

              {orderMessage && (
                <div className={`alert alert-${orderMessage.type === 'success' ? 'success' : 'error'}`}>
                  {orderMessage.text}
                </div>
              )}

              <div className="dashboard-order-grid">
                <div className="form-group">
                  <label className="label">Platform</label>
                  <select
                    className="select"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedServiceId('');
                      setLink('');
                      setQuantity('');
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Service</label>
                  <select
                    className="select"
                    value={selectedServiceId}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      setLink('');
                      setQuantity('');
                    }}
                  >
                    <option value="">Select service</option>
                    {visibleServices.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} ({sym}{svc.price}/1000)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedService && (
                <div className="dashboard-order-details">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      margin: '1.25rem 0 1rem',
                      fontSize: 13,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>🎯 {selectedService.name}</span>
                    <span>
                      Min: {selectedService.min_quantity} | Max: {selectedService.max_quantity?.toLocaleString()}
                    </span>
                  </div>

                  {showBalanceWarning && insufficientBalance && (
                    <InsufficientBalanceAlert
                      need={insufficientBalance.need}
                      have={insufficientBalance.have}
                      currencySymbol={sym}
                      onDismiss={() => setBalanceWarningDismissed(true)}
                    />
                  )}

                  <div className="form-group">
                    <label className="label">🔗 Link</label>
                    <input
                      className="input"
                      placeholder="https://instagram.com/username"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
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

                  {orderCost != null && (
                    <div
                      className="card"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 16,
                        padding: '0.875rem 1rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Total Cost</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.375rem' }}>
                        {sym}{orderCost.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading || Boolean(insufficientBalance)}
                    onClick={handleOrder}
                  >
                    {loading ? '⏳ Placing order…' : '🚀 Place Order'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
