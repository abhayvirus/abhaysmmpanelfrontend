import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    verifyEmail(token)
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <div className="auth-page fade-in">
      <div className="card" style={{ maxWidth: 400, margin: '80px auto', padding: 32, textAlign: 'center' }}>
        {status === 'loading' && <p>Verifying email...</p>}
        {status === 'ok' && (
          <>
            <h2>✅ Email verified</h2>
            <p style={{ color: 'var(--text-muted)', margin: '16px 0' }}>You can now log in.</p>
            <Link to="/login" className="btn btn-primary">Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>Invalid link</h2>
            <p style={{ color: 'var(--text-muted)', margin: '16px 0' }}>Request a new verification email from signup.</p>
            <Link to="/login" className="btn btn-ghost">Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
