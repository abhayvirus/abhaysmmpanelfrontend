import React, { useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import { getPasswordStrength, validateResetPassword } from '../utils/passwordStrength';
import PasswordInput from '../components/PasswordInput';
import AuthBrandHeader from '../components/AuthBrandHeader';
import { saveAuthSession } from '../utils/authRedirect';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMsg({ type: 'error', text: 'Invalid or missing reset link. Request a new one from forgot password.' });
      return;
    }
    const validationError = validateResetPassword(password, confirm);
    if (validationError) {
      setMsg({ type: 'error', text: validationError });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await resetPassword({ token, password });
      if (data?.token && data?.user) {
        saveAuthSession(data.token, data.user);
        setMsg({ type: 'success', text: data.message || 'Password updated. Redirecting...' });
        setTimeout(() => {
          navigate(data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }, 1200);
        return;
      }
      setMsg({ type: 'success', text: data?.message || 'Password updated. You can log in now.' });
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setMsg({ type: 'error', text: getApiErrorMessage(err, 'Failed to reset password') });
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div style={styles.page}>
        <div className="card fade-in auth-card" style={styles.card}>
          <AuthBrandHeader />
          <h2 className="auth-heading">Reset password</h2>
          <div className="alert alert-error" role="alert">
            This reset link is invalid or incomplete. Please request a new link.
          </div>
          <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
            Request new reset link
          </Link>
          <p style={{ textAlign: 'center', marginTop: 20 }}><Link to="/login">Back to login</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div className="card fade-in auth-card" style={styles.card}>
        <AuthBrandHeader />
        <h2 className="auth-heading">Reset password</h2>
        <p className="auth-subheading">Choose a strong new password for your account</p>

        {msg && (
          <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} role="alert">
            {msg.text}
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="label">New password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              disabled={loading}
            />
            {password && (
              <div style={{ marginTop: 8 }}>
                <div style={styles.strengthTrack}>
                  <div
                    style={{
                      ...styles.strengthFill,
                      width: `${strength.percent}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="label">Confirm password</label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <span className="auth-loading-row">
                <span className="auth-spinner" aria-hidden="true" />
                Updating password...
              </span>
            ) : (
              'Update password & sign in'
            )}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
};

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
  strengthTrack: {
    height: 4,
    background: 'var(--border)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.2s ease, background 0.2s ease',
  },
};

export default ResetPassword;
