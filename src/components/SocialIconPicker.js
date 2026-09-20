import React, { useId, useState } from 'react';
import { SOCIAL_ICONS, SOCIAL_PLATFORMS } from '../constants/socialPlatforms';
import '../styles/socialIconPicker.css';

/**
 * Dropdown of social icons/platforms + optional manual text.
 * mode="platform" → value is platform name (e.g. Instagram)
 * mode="icon" → value is emoji icon (e.g. 📸)
 */
const SocialIconPicker = ({
  value = '',
  onChange,
  mode = 'icon',
  placeholder,
  className = '',
}) => {
  const id = useId();
  const [showCustom, setShowCustom] = useState(false);
  const options = mode === 'platform' ? SOCIAL_PLATFORMS : SOCIAL_ICONS;
  const selectPlaceholder = mode === 'platform' ? 'Select platform…' : 'Select icon…';
  const inputPlaceholder = placeholder
    || (mode === 'platform' ? 'e.g. Facebook' : 'e.g. 📸');

  const matched = mode === 'platform'
    ? options.find((o) => o.name === value)
    : options.find((o) => o.icon === value);

  const selectValue = matched
    ? (mode === 'platform' ? matched.name : matched.icon)
    : (value && !showCustom ? '' : '');

  return (
    <div className={`social-icon-picker${className ? ` ${className}` : ''}`}>
      <div className="social-icon-picker__row">
        <select
          id={id}
          className="select social-icon-picker__select"
          value={matched ? selectValue : ''}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            setShowCustom(false);
            onChange(v);
          }}
        >
          <option value="">{selectPlaceholder}</option>
          {mode === 'platform'
            ? SOCIAL_PLATFORMS.map((p) => (
              <option key={p.name} value={p.name}>{p.icon} {p.name}</option>
            ))
            : SOCIAL_ICONS.map((p) => (
              <option key={`${p.icon}-${p.label}`} value={p.icon}>{p.icon} {p.label}</option>
            ))}
        </select>
        {matched ? (
          <span className="social-icon-picker__preview" title={mode === 'platform' ? matched.name : matched.label}>
            {mode === 'platform' ? matched.icon : matched.icon}
            <span className="social-icon-picker__preview-label">
              {mode === 'platform' ? matched.name : matched.label}
            </span>
          </span>
        ) : null}
      </div>

      {(showCustom || (!matched && value)) ? (
        <input
          className="input social-icon-picker__manual"
          placeholder={inputPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={inputPlaceholder}
        />
      ) : (
        <button
          type="button"
          className="social-icon-picker__custom-btn"
          onClick={() => setShowCustom(true)}
        >
          {mode === 'platform' ? 'Type platform manually…' : 'Custom emoji…'}
        </button>
      )}
    </div>
  );
};

export default SocialIconPicker;
