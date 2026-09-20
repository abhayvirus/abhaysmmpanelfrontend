import React, { useMemo, useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import InsufficientBalanceAlert from '../components/InsufficientBalanceAlert';
import PanelLoading from '../components/PanelLoading';
import { getServices, placeOrder, getMe } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/balanceWarning.css';
import '../styles/dashboardOrder.css';
import { getLinkPlaceholder } from '../utils/linkPlaceholder';
import {
  getServiceUnitPrice,
  formatServicePrice,
  isSellableService,
} from '../utils/servicePrice';
import { cleanServiceTitle } from '../utils/serviceTitle';

const platformIcons = {
  All: '⚡', Instagram: '📸', TikTok: '🎵', YouTube: '▶️',
  Facebook: '👤', WhatsApp: '💬', Twitter: '🐦',
  Telegram: '✈️', Spotify: '🎧', Other: '🌐',
};

const Dashboard = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [allServices, setAllServices] = useState([]);
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

  // Load priced services once — filter Platform / Category / Service on client
  useEffect(() => {
    let cancelled = false;
    setPageReady(false);
    setLoadError('');
    setServicesLoading(true);

    Promise.allSettled([
      getMe().then((res) => {
        if (!cancelled) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      }),
      getServices({}).then((res) => {
        if (cancelled) return;
        const list = (Array.isArray(res.data) ? res.data : [])
          .filter(isSellableService)
          .map((s) => ({
            ...s,
            name: cleanServiceTitle(s.name, 120),
            platform: String(s.platform || '').trim() || 'Other',
            category: String(s.category || '').trim() || 'General',
            price: getServiceUnitPrice(s),
          }));
        setAllServices(list);
      }),
    ])
      .then((results) => {
        if (cancelled) return;
        if (results[0].status === 'rejected') {
          setLoadError('Could not load dashboard. Please refresh.');
        }
        if (results[1].status === 'rejected') {
          setAllServices([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPageReady(true);
          setServicesLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  const platforms = useMemo(() => {
    const set = new Set();
    allServices.forEach((s) => {
      if (s.platform && s.platform !== 'Other') set.add(s.platform);
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allServices]);

  const categories = useMemo(() => {
    const set = new Set();
    allServices.forEach((s) => {
      if (selectedPlatform !== 'All' && s.platform !== selectedPlatform) return;
      if (s.category && s.category !== 'Other') set.add(s.category);
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allServices, selectedPlatform]);

  const visibleServices = useMemo(() => {
    return allServices.filter((s) => {
      if (selectedPlatform !== 'All' && s.platform !== selectedPlatform) return false;
      if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
      return true;
    });
  }, [allServices, selectedPlatform, selectedCategory]);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return visibleServices.find((s) => String(s.id) === String(selectedServiceId)) || null;
  }, [visibleServices, selectedServiceId]);

  // If current service falls out of filter, clear selection
  useEffect(() => {
    if (!selectedServiceId) return;
    const stillVisible = visibleServices.some((s) => String(s.id) === String(selectedServiceId));
    if (!stillVisible) {
      setSelectedServiceId('');
      setLink('');
      setQuantity('');
    }
  }, [visibleServices, selectedServiceId]);

  // Keep category options valid when platform changes
  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
      setSelectedServiceId('');
    }
  }, [categories, selectedCategory]);

  const unitPrice = selectedService ? getServiceUnitPrice(selectedService) : 0;
  const linkPlaceholder = getLinkPlaceholder(selectedService?.platform, selectedService?.name);

  const orderCost = useMemo(() => {
    if (!selectedService || !quantity || Number.isNaN(Number(quantity))) return null;
    const qty = parseInt(quantity, 10);
    if (qty < 1 || !(unitPrice > 0)) return null;
    return (unitPrice / 1000) * qty;
  }, [selectedService, quantity, unitPrice]);

  const walletBalance = parseFloat(user.balance || 0);

  const insufficientBalance = useMemo(() => {
    if (orderCost == null) return null;
    if (walletBalance >= orderCost) return null;
    return { need: orderCost.toFixed(2), have: walletBalance.toFixed(2) };
  }, [orderCost, walletBalance]);

  const showBalanceWarning = Boolean(insufficientBalance) && !balanceWarningDismissed;

  useEffect(() => {
    setBalanceWarningDismissed(false);
  }, [selectedServiceId, insufficientBalance?.need, insufficientBalance?.have]);

  const onPlatformChange = (value) => {
    setSelectedPlatform(value);
    setSelectedCategory('All');
    setSelectedServiceId('');
    setLink('');
    setQuantity('');
    setOrderMessage(null);
  };

  const onCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedServiceId('');
    setLink('');
    setQuantity('');
    setOrderMessage(null);
  };

  const onServiceChange = (value) => {
    setSelectedServiceId(value);
    setLink('');
    setQuantity('');
    setOrderMessage(null);
    if (value) {
      const svc = visibleServices.find((s) => String(s.id) === String(value));
      if (svc?.category) setSelectedCategory(svc.category);
      if (svc?.platform && svc.platform !== 'Other') {
        // optional: don't force platform tab — keep user filter
      }
    }
  };

  const handleOrder = async () => {
    if (!selectedService) return setOrderMessage({ type: 'error', text: 'Please select a service first' });
    if (!(unitPrice > 0)) return setOrderMessage({ type: 'error', text: 'This service has no price. Ask admin to sync.' });
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
            <div
              className="stat-value"
              style={{
                fontSize: '1.25rem',
                color: (user.status || 'ACTIVE') === 'ACTIVE' ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {user.status || 'ACTIVE'}
            </div>
          </div>
        </div>

        <div className="dashboard-tabs" role="tablist" aria-label="Platform filter">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={selectedPlatform === p}
              onClick={() => onPlatformChange(p)}
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
          ) : allServices.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <p>📭 No priced services found</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Ask admin to Sync / Fetch all services from the provider.</p>
            </div>
          ) : (
            <div className="dashboard-order-form">
              <h3 className="dashboard-order-form__title">📝 Place order</h3>
              <p className="dashboard-order-form__hint">
                Choose Platform → Category → Service. Only services with a real price are listed.
              </p>

              {orderMessage && (
                <div className={`alert alert-${orderMessage.type === 'success' ? 'success' : 'error'}`}>
                  {orderMessage.text}
                </div>
              )}

              <div className="dashboard-order-grid">
                <div className="form-group">
                  <label className="label" htmlFor="order-platform">Platform</label>
                  <select
                    id="order-platform"
                    className="select"
                    value={selectedPlatform}
                    onChange={(e) => onPlatformChange(e.target.value)}
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="order-category">Category</label>
                  <select
                    id="order-category"
                    className="select"
                    value={categories.includes(selectedCategory) ? selectedCategory : 'All'}
                    onChange={(e) => onCategoryChange(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {categories.length <= 1 && (
                    <span className="dashboard-field-note">No categories for this platform yet</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="order-service">Service</label>
                  <select
                    id="order-service"
                    className="select"
                    value={selectedServiceId}
                    onChange={(e) => onServiceChange(e.target.value)}
                  >
                    <option value="">Select service ({visibleServices.length})</option>
                    {visibleServices.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} — {sym}{formatServicePrice(svc)}/1000
                      </option>
                    ))}
                  </select>
                  {visibleServices.length === 0 && (
                    <span className="dashboard-field-note">No services match these filters</span>
                  )}
                </div>
              </div>

              {selectedService ? (
                <div className="dashboard-order-details">
                  <div className="dashboard-service-summary card">
                    <div className="dashboard-service-summary__name">{selectedService.name}</div>
                    <div className="dashboard-service-summary__meta">
                      <span>
                        <em>Platform</em> {selectedService.platform}
                      </span>
                      <span>
                        <em>Category</em> {selectedService.category}
                      </span>
                      <span className="dashboard-service-summary__price">
                        {sym}{formatServicePrice(selectedService)} / 1000
                      </span>
                    </div>
                    <div className="dashboard-service-summary__qty">
                      Min {Number(selectedService.min_quantity).toLocaleString()}
                      {' — '}
                      Max {Number(selectedService.max_quantity).toLocaleString()}
                    </div>
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
                    <label className="label" htmlFor="order-link">🔗 Link</label>
                    <input
                      id="order-link"
                      className="input"
                      placeholder={linkPlaceholder}
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="order-qty">🔢 Quantity</label>
                    <input
                      id="order-qty"
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
                    <div className="dashboard-total card">
                      <span>Total Cost</span>
                      <strong>{sym}{orderCost.toFixed(2)}</strong>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading || Boolean(insufficientBalance) || !(unitPrice > 0)}
                    onClick={handleOrder}
                  >
                    {loading ? '⏳ Placing order…' : '🚀 Place Order'}
                  </button>
                </div>
              ) : (
                <p className="dashboard-order-empty">Select a service above to continue.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
