import React, { useState, useEffect, useMemo } from 'react';
import UserLayout from '../components/UserLayout';
import OrderFormModal from '../components/OrderFormModal';
import ServiceCard from '../components/ServiceCard';
import { getServices, getPlatforms, getServiceCategories } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/servicesPage.css';
import '../styles/filterControls.css';

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
    const entries = services.reduce((acc, s) => {
      const cat = s.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {});
    return Object.entries(entries).sort(([a], [b]) => a.localeCompare(b));
  }, [services]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <UserLayout title="Services">
      <div className="services-page">
        <header className="services-page__header page-header">
          <div>
            <h1>Services</h1>
            <p className="services-page__subtitle">
              {services.length} services · orders sent to provider automatically
            </p>
          </div>
        </header>

        {toast && <div className="alert alert-success services-page__toast">{toast}</div>}

        <div className="card services-filter-card">
          <input
            type="search"
            className="input services-filter-search"
            placeholder="Search by name, category, platform…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search services"
          />
          <div className="filter-section filter-section--platform">
            <span className="filter-section__label">Platform</span>
            <div className="filter-group" role="group" aria-label="Filter by platform">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`filter-chip${platform === p ? ' filter-chip--active' : ''}`}
                  onClick={() => setPlatform(p)}
                  aria-pressed={platform === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section filter-section--category">
            <span className="filter-section__label">Category</span>
            <div className="filter-group" role="group" aria-label="Filter by category">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`filter-chip${category === c ? ' filter-chip--active' : ''}`}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <p className="services-page__loading">Loading services…</p>
        ) : services.length === 0 ? (
          <div className="card services-page__empty">
            <p>No services found. Ask admin to sync from API provider.</p>
          </div>
        ) : (
          <div className="services-sections">
            {grouped.map(([cat, svcs]) => (
              <section key={cat} className="services-section" aria-labelledby={`svc-cat-${cat.replace(/\s+/g, '-')}`}>
                <h2
                  id={`svc-cat-${cat.replace(/\s+/g, '-')}`}
                  className="services-section__title"
                >
                  {cat}
                </h2>
                <div className="services-list">
                  {svcs.map((svc) => (
                    <ServiceCard
                      key={svc.id}
                      service={svc}
                      currencySymbol={sym}
                      onOrder={setOrderService}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <OrderFormModal
          service={orderService}
          open={!!orderService}
          onClose={() => setOrderService(null)}
          onSuccess={(data) => showToast(`Order #${data.order_id} placed! Charged ${sym}${data.amount_charged}`)}
        />
      </div>
    </UserLayout>
  );
};

export default Services;
