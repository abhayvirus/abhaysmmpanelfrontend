import React from 'react';

const LOGO_BASE = `${process.env.PUBLIC_URL || ''}/payment-logos`;

/**
 * Official-style brand logos (SVG in /public/payment-logos).
 */
const PaymentMethodLogo = ({ id, size = 28, className = '', alt }) => {
  const src = `${LOGO_BASE}/${id}.svg`;
  const label = alt || id;

  return (
    <img
      src={src}
      alt={label}
      className={`payment-method-logo${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default PaymentMethodLogo;
