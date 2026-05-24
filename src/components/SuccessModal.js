import React from 'react';

const SuccessModal = ({ open, onClose, title, message, type = 'success' }) => {
  if (!open) return null;
  const isPending = type === 'pending';

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="card fade-in modal-panel" style={{ textAlign: 'center', padding: 32 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div style={{ fontSize: 48, marginBottom: 16 }}>{isPending ? '⏳' : '✅'}</div>
        <h2 style={{ marginBottom: 12 }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{message}</p>
        {isPending && (
          <span className="badge badge-warning" style={{ marginBottom: 20, display: 'inline-block' }}>PENDING</span>
        )}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default SuccessModal;
