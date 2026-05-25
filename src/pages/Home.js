import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicStats, getServicesPreview } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import PublicNav from '../components/PublicNav';
import BrandLogo from '../components/BrandLogo';
import { BRAND } from '../config/brand';
import { formatStatCount } from '../utils/formatStat';

const Home = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const sym = settings.currency_symbol || '₹';

  useEffect(() => {
    getPublicStats().then((r) => setStats(r.data)).catch(() => {});
    getServicesPreview().then((r) => setServices(r.data)).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <PublicNav />

      <section className="hero fade-in">
        <div className="hero-logo-wrap">
          <BrandLogo size="hero" showText={false} siteLogo={settings.site_logo} />
        </div>
        <p className="hero-badge">{BRAND.shortName} · {BRAND.domain.replace('https://', '')}</p>
        <h1>
          India&apos;s <span>Premium</span> SMM Panel
        </h1>
        <p>{settings.site_tagline || BRAND.tagline}</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary btn-lg">Create Free Account</Link>
          <Link to="/download-app" className="btn btn-ghost btn-lg">📱 Download App</Link>
        </div>
        <div className="stats-grid home-stats" style={{ marginTop: 48, maxWidth: 900, width: '100%' }}>
          <div className="stat-card">
            <div className="stat-value">
              {formatStatCount(stats.totalOrders, { minimum: BRAND.marketingStats.totalOrders, fallback: '10K+' })}
            </div>
            <div className="stat-label">Orders Delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {formatStatCount(stats.totalUsers, { minimum: BRAND.marketingStats.totalUsers, fallback: '10K+' })}
            </div>
            <div className="stat-label">Happy Clients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {formatStatCount(stats.activeServices, { minimum: BRAND.marketingStats.activeServices, fallback: '500+' })}
            </div>
            <div className="stat-label">Live Services</div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="responsive-grid-auto">
          {['⚡ Instant delivery', '💳 Razorpay Instant Pay', '🔌 Reseller API', '🎫 24/7 Support'].map((t) => (
            <div key={t} className="card" style={{ padding: 20, textAlign: 'center', fontWeight: 600 }}>{t}</div>
          ))}
        </div>
      </section>

      {services.length > 0 && (
        <section className="home-section">
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Popular Services</h2>
          <div className="responsive-grid-auto">
            {services.slice(0, 6).map((s, i) => (
              <div key={i} className="card card-hover">
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.platform} · {s.category}</div>
                <div style={{ color: 'var(--primary)', marginTop: 8, fontWeight: 700 }}>{sym}{s.custom_price || s.price}/1k</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        © {new Date().getFullYear()} {settings.site_name || BRAND.name} · <a href={BRAND.domain}>{BRAND.domain.replace('https://', '')}</a>
      </footer>
    </div>
  );
};

export default Home;
