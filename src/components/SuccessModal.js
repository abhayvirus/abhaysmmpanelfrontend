import React from 'react';

const SuccessModal = ({ open, onClose, title, message, type = 'success' }) => {
  if (!open) return null;
  const isPending = type === 'pending';

  return (
    <div style={overlay} onClick={onClose}>
      <div className="card fade-in" style={{ maxWidth: 400, textAlign: 'center', padding: 32 }} onClick={(e) => e.stopPropagation()}>
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

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10001,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};

export default SuccessModal;
