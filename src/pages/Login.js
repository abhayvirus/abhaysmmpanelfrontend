import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div className="card fade-in" style={styles.card}>
        <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 8 }}>⚡</div>
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 28 }}>Sign in to your SMM panel</p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        </div>
        {otpRequired && (
          <div className="form-group">
            <label className="label">OTP (sent to email)</label>
            <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
          </div>
        )}
        <Link to="/forgot-password" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>Forgot password?</Link>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={handleLogin}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>OR</div>
        <GoogleLoginButton />
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)' }}>
          No account? <Link to="/signup">Create one</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12 }}><Link to="/">← Back to home</Link></p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' },
  card: { width: '100%', maxWidth: 440, padding: 40 },
};

export default Login;
