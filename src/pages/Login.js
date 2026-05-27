import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import GoogleLoginButton from '../components/GoogleLoginButton';
import PasswordInput from '../components/PasswordInput';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import AuthBrandHeader from '../components/AuthBrandHeader';
import { BRAND } from '../config/brand';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enabled: googleEnabled } = useGoogleAuth();

  useEffect(() => {
    const googleError = new URLSearchParams(window.location.search).get('google_error');
    if (googleError) setError(googleError);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token) navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) return setError('Email and password required');
    setLoading(true);
    setError('');
    try {
      const res = await login({ email, password, otp: otp || undefined });
      if (res.data.otp_required) {
        setOtpRequired(true);
        setError('');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div className="card fade-in auth-card" style={styles.card}>
        <AuthBrandHeader />
        <h2 className="auth-heading">Welcome Back</h2>
        <p className="auth-subheading">Sign in to {BRAND.name}</p>
        {error && <div className="alert alert-error">{error}</div>}

        {googleEnabled && (
          <>
            <GoogleLoginButton />
            <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>OR</div>
          </>
        )}

        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Your password"
          />
        </div>
        {otpRequired && (
          <div className="form-group">
            <label className="label">Email OTP</label>
            <input
              className="input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
        )}
        <Link to="/forgot-password" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>Forgot password?</Link>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={handleLogin}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)' }}>
          No account? <Link to="/signup">Create one</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12 }}><Link to="/">← Back to home</Link></p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 'clamp(12px, 4vw, 20px)',
    paddingTop: 'clamp(16px, 6vh, 56px)',
    paddingBottom: 'clamp(16px, 6vh, 56px)',
    background: 'var(--bg)',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  card: { width: '100%', maxWidth: 440, padding: 'clamp(18px, 4vw, 36px)' },
};

export default Login;
