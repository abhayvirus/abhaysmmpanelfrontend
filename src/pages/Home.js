import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicStats, getServicesPreview, API_BASE } from '../api';
import { useSettings } from '../contexts/SettingsContext';

const Home = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const sym = settings.currency_symbol || '₹';
  const logoUrl = settings.site_logo ? `${API_BASE}${settings.site_logo}` : null;

  useEffect(() => {
    getPublicStats().then((r) => setStats(r.data)).catch(() => {});
    getServicesPreview().then((r) => setServices(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <nav className="nav-public">
        <span style={{ fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ height: 32, borderRadius: 6 }} /> : '⚡'}
          {settings.site_name || 'WorldSMM'}
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>
      <section className="hero fade-in">
        <h1>The <span>Premium</span> SMM Panel</h1>
        <p>{settings.site_tagline || 'Boost your social media with instant delivery, best prices & 24/7 support.'}</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary">Create Account</Link>
          <Link to="/download-app" className="btn btn-ghost">📱 Download App</Link>
        </div>
        <div className="stats-grid" style={{ marginTop: 48, maxWidth: 800, width: '100%' }}>
          <div className="stat-card"><div className="stat-value">{stats.totalOrders || '10K+'}</div><div className="stat-label">Orders Delivered</div></div>
          <div className="stat-card"><div className="stat-value">{stats.totalUsers || '5K+'}</div><div className="stat-label">Happy Clients</div></div>
          <div className="stat-card"><div className="stat-value">{stats.activeServices || '500+'}</div><div className="stat-label">Services</div></div>
        </div>
      </section>
      {services.length > 0 && (
        <section style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Popular Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {services.slice(0, 6).map((s, i) => (
              <div key={i} className="card">
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.platform} · {s.category}</div>
                <div style={{ color: 'var(--primary)', marginTop: 8, fontWeight: 700 }}>{sym}{s.custom_price || s.price}/1k</div>
              </div>
            ))}
          </div>
        </section>
      )}
      <footer style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        © {new Date().getFullYear()} {settings.site_name || 'WorldSMM Panel'}
      </footer>
    </div>
  );
};

export default Home;
