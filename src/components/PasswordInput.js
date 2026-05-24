import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Password field with show/hide toggle (eye icon).
 */
const PasswordInput = ({
  value,
  onChange,
  placeholder = 'Password',
  className = 'input',
  style,
  inputStyle,
  onKeyDown,
  id,
  autoComplete = 'current-password',
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="password-field" style={style}>
      <input
        id={id}
        className={className}
        style={inputStyle}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
