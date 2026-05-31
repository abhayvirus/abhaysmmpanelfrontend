import React, { useRef } from 'react';
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  mergeTheme,
  importThemeJson,
  downloadThemeFile,
} from '../theme/themeConfig';

const COLOR_FIELDS = [
  { key: 'theme_primary', label: 'Primary color' },
  { key: 'theme_accent', label: 'Secondary color' },
  { key: 'theme_button', label: 'Button color' },
  { key: 'theme_bg', label: 'Background color' },
  { key: 'theme_card', label: 'Card color' },
  { key: 'theme_text', label: 'Text color' },
  { key: 'theme_border', label: 'Border color', text: true },
  { key: 'theme_success', label: 'Success color' },
  { key: 'theme_warning', label: 'Warning color' },
  { key: 'theme_danger', label: 'Danger color' },
];

const ThemeSettingsPanel = ({ draft, updateDraft, onApplyPreview, onRequestReset }) => {
  const fileRef = useRef(null);

  const patchTheme = (patch) => {
    Object.entries(patch).forEach(([k, v]) => updateDraft(k, v));
    onApplyPreview?.(mergeTheme({ ...draft, ...patch }));
  };

  const applyPreset = (preset) => {
    const { id, name, swatch, ...colors } = preset;
    patchTheme(colors);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const theme = importThemeJson(reader.result);
        patchTheme(theme);
      } catch {
        window.alert('Invalid theme file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="theme-settings-panel">
      <h3 className="admin-settings-section-title">🎨 Quick Theme Presets</h3>
      <p className="theme-settings-hint">One click applies colors site-wide in live preview. Click Save to persist for all users.</p>
      <div className="theme-preset-grid">
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="theme-preset-card"
            onClick={() => applyPreset(p)}
          >
            <span className="theme-preset-card__swatches">
              {p.swatch.map((c) => (
                <span key={c} style={{ background: c }} aria-hidden="true" />
              ))}
            </span>
            <span className="theme-preset-card__name">{p.name}</span>
          </button>
        ))}
      </div>

      <hr className="admin-settings-divider" />

      <div className="form-group">
        <label className="label">Theme mode (default for new users)</label>
        <select
          className="select"
          value={draft.theme_mode || 'dark'}
          onChange={(e) => {
            updateDraft('theme_mode', e.target.value);
            onApplyPreview?.(mergeTheme({ ...draft, theme_mode: e.target.value }));
          }}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div className="theme-color-grid">
        {COLOR_FIELDS.map(({ key, label, text }) => (
          <div key={key} className="form-group theme-color-field">
            <label className="label">{label}</label>
            <div className="theme-color-input-row">
              {!text && (
                <input
                  type="color"
                  value={String(draft[key] || DEFAULT_THEME[key]).startsWith('rgba') ? '#2563eb' : (draft[key] || DEFAULT_THEME[key])}
                  onChange={(e) => {
                    updateDraft(key, e.target.value);
                    onApplyPreview?.(mergeTheme({ ...draft, [key]: e.target.value }));
                  }}
                />
              )}
              <input
                className="input"
                value={draft[key] ?? DEFAULT_THEME[key] ?? ''}
                onChange={(e) => {
                  updateDraft(key, e.target.value);
                  onApplyPreview?.(mergeTheme({ ...draft, [key]: e.target.value }));
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="theme-io-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadThemeFile(draft)}>
          📤 Export Theme
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
          📥 Import Theme
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        <button type="button" className="btn btn-ghost btn-sm theme-reset-btn" onClick={() => onRequestReset?.()}>
          🔄 Reset Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeSettingsPanel;
