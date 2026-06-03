import React from 'react';

export const SettingsCard = ({ icon, title, description, children }) => (
  <section className="settings-enterprise-card">
    <header className="settings-enterprise-card__head">
      <span className="settings-enterprise-card__icon" aria-hidden="true">{icon}</span>
      <div>
        <h3 className="settings-enterprise-card__title">{title}</h3>
        {description && <p className="settings-enterprise-card__desc">{description}</p>}
      </div>
    </header>
    <div className="settings-enterprise-card__body">{children}</div>
  </section>
);

export const SettingsField = ({ label, value, onChange, type = 'text', placeholder, hint }) => (
  <div className="form-group">
    <label className="label">{label}</label>
    {type === 'textarea' ? (
      <textarea
        className="textarea"
        rows={4}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        className="input"
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
    {hint && <p className="settings-field-hint">{hint}</p>}
  </div>
);

export const SettingsSelect = ({ label, value, onChange, options }) => (
  <div className="form-group">
    <label className="label">{label}</label>
    <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export const SettingsToggle = ({ label, checked, onChange, hint }) => (
  <label className="settings-toggle-row">
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    <span>
      <span className="settings-toggle-row__label">{label}</span>
      {hint && <span className="settings-field-hint">{hint}</span>}
    </span>
  </label>
);

export const SettingsToggleGrid = ({ children }) => (
  <div className="settings-enterprise-toggle-grid">{children}</div>
);

export const StatTile = ({ label, value, sub }) => (
  <div className="settings-stat-tile">
    <span className="settings-stat-tile__label">{label}</span>
    <strong className="settings-stat-tile__value">{value}</strong>
    {sub && <span className="settings-stat-tile__sub">{sub}</span>}
  </div>
);
