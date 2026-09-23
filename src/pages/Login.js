import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import { wakeApi, startApiKeepAlive } from '../utils/apiWake';
import GoogleLoginButton from '../components/GoogleLoginButton';
import PasswordInput from '../components/PasswordInput';
import AuthBrandHeader from '../components/AuthBrandHeader';
import { getPostLoginPath, isAuthenticated, saveAuthSession } from '../utils/authRedirect';
import { BRAND } from '../config/brand';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get('google_error');
    const googleCode = params.get('google_code');
    if (googleError) {
      let msg = decodeURIComponent(googleError);
      if (googleCode === 'ACCOUNT_NOT_FOUND' || /sign up first|no account/i.test(msg)) {
        msg = 'No account found for this Google email. Create an account first, then use Google login.';
      }
      setError(msg);
    }
  }, []);

  useEffect(() => {
    document.body.classList.remove('mobile-menu-open');
  }, []);

  useEffect(() => {
    return startApiKeepAlive(45000);
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getPostLoginPath(), { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');
    if (!cleanEmail || !cleanPassword) return setError('Email and password required');
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await wakeApi(12000);
      const res = await login({ email: cleanEmail, password: cleanPassword, otp: otp || undefined });
      if (res.data.otp_required) {
        setOtpRequired(true);
        setInfo(res.data.message || 'OTP sent to your email. Enter it below.');
        setError('');
        return;
      }
      if (!res.data?.token || !res.data?.user) {
        setError('Login succeeded but session was incomplete. Please try again.');
        return;
      }
      saveAuthSession(res.data.token, res.data.user);
      navigate(getPostLoginPath(res.data.user), { replace: true });
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'ACCOUNT_NOT_FOUND') {
        setError('No account found. Please create an account first.');
      } else if (code === 'GOOGLE_ONLY_ACCOUNT') {
        setError(getApiErrorMessage(err, 'Use Google login for this account'));
      } else {
        setError(getApiErrorMessage(err, 'Login failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="card fade-in auth-card" style={styles.card}>
        <AuthBrandHeader />
        <h2 className="auth-heading">Welcome Back</h2>
        <p className="auth-subheading">Sign in to {BRAND.name}</p>
        {error && <div className="alert alert-error">{error}</div>}
        {info && !error && (
          <div className="alert" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)' }}>
            {info}
          </div>
        )}

        <GoogleLoginButton />
        <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>OR</div>

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
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              style={{ letterSpacing: '0.35em', textAlign: 'center', fontWeight: 700 }}
            />
          </div>
        )}
        <Link to="/forgot-password" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>Forgot password?</Link>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={handleLogin}>
          {loading ? 'Signing in...' : otpRequired ? 'Verify OTP & Sign In' : 'Sign In'}
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
    minHeight: '100svh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 'clamp(12px, 4vw, 20px)',
    paddingTop: 'calc(clamp(16px, 6vh, 56px) + env(safe-area-inset-top, 0px))',
    paddingBottom: 'calc(clamp(20px, 8vh, 72px) + env(safe-area-inset-bottom, 0px))',
    background: 'var(--bg)',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  card: { width: '100%', maxWidth: 440, padding: 'clamp(18px, 4vw, 36px)' },
};

export default Login;
