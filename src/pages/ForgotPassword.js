import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import AuthBrandHeader from '../components/AuthBrandHeader';

const GENERIC_SUCCESS =
  'If the email exists, a reset link has been sent. Check your inbox and spam folder.';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMsg({ type: 'error', text: 'Enter your email address' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await forgotPassword(email.trim().toLowerCase());
      setSent(true);
      setMsg({ type: 'success', text: data?.message || GENERIC_SUCCESS });
    } catch (err) {
      setMsg({ type: 'error', text: getApiErrorMessage(err, 'Failed to send reset email') });
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div className="card fade-in auth-card" style={styles.card}>
        <AuthBrandHeader />
        <h2 className="auth-heading">Forgot password</h2>
        <p className="auth-subheading">
          Enter your email and we&apos;ll send a secure reset link (valid 1 hour).
        </p>

        {msg && (
          <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} role="alert">
            {msg.text}
          </div>
        )}

        {!sent ? (
          <form onSubmit={submit} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading-row">
                  <span className="auth-spinner" aria-hidden="true" />
                  Sending reset link...
                </span>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Didn&apos;t receive it? Wait a few minutes or check spam, then try again.
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: '100%' }}
              onClick={() => { setSent(false); setMsg(null); }}
            >
              Send again
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'var(--bg)',
  },
  card: { width: '100%', maxWidth: 440, padding: 'clamp(24px, 5vw, 40px)' },
};
