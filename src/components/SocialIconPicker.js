import React, { useId } from 'react';
import { SOCIAL_ICONS, SOCIAL_PLATFORMS } from '../constants/socialPlatforms';

/**
 * Dropdown of social icons/platforms + manual text input.
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
  const options = mode === 'platform' ? SOCIAL_PLATFORMS : SOCIAL_ICONS;
  const selectPlaceholder = mode === 'platform' ? 'Select platform…' : 'Select icon…';
  const inputPlaceholder = placeholder || (mode === 'platform' ? 'Or type platform manually' : 'Or type icon manually');

  const matched = mode === 'platform'
    ? options.find((o) => o.name === value)
    : options.find((o) => o.icon === value);

  return (
    <div className={`social-icon-picker${className ? ` ${className}` : ''}`}>
      <select
        id={id}
        className="select social-icon-picker__select"
        value={matched ? value : ''}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
      >
        <option value="">{selectPlaceholder}</option>
        {mode === 'platform'
          ? SOCIAL_PLATFORMS.map((p) => (
            <option key={p.name} value={p.name}>{p.icon} {p.name}</option>
          ))
          : SOCIAL_ICONS.map((p) => (
            <option key={p.icon} value={p.icon}>{p.icon} {p.label}</option>
          ))}
      </select>
      <input
        className="input social-icon-picker__manual"
        placeholder={inputPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={inputPlaceholder}
      />
    </div>
  );
};

export default SocialIconPicker;
