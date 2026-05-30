import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Single insufficient-balance warning — render at most once per page.
 */
const InsufficientBalanceAlert = ({ need, have, currencySymbol = '₹', onDismiss }) => {
  if (need == null || have == null) return null;

  return (
    <div
      className="balance-warning-alert"
      role="alert"
      aria-live="polite"
      data-balance-warning="active"
    >
      <div className="balance-warning-alert__body">
        <span className="balance-warning-alert__icon" aria-hidden="true">⚠️</span>
        <div className="balance-warning-alert__text">
          <strong>Insufficient balance</strong>
          <span>
            Need {currencySymbol}{need}, have {currencySymbol}{have}.
            {' '}
            <Link to="/add-funds" className="balance-warning-alert__link">Add funds</Link>
          </span>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="balance-warning-alert__close"
          onClick={onDismiss}
          aria-label="Dismiss balance warning"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default InsufficientBalanceAlert;
