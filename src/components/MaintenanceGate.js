import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const MaintenanceGate = ({ children }) => {
  const { settings } = useSettings();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = user.role === 'admin';

  if (settings.maintenance_mode && !isAdminRoute && !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', padding: 24, textAlign: 'center',
      }}>
        <div className="card" style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
          <h1 style={{ marginBottom: 12 }}>Under Maintenance</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {settings.site_name} is temporarily unavailable. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default MaintenanceGate;
