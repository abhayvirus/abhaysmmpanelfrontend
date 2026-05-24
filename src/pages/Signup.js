import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signup } from '../api';
import GoogleLoginButton from '../components/GoogleLoginButton';
import PasswordInput from '../components/PasswordInput';
import { isGoogleConfigured } from '../config/google';
import AuthBrandHeader from '../components/AuthBrandHeader';
import { BRAND } from '../config/brand';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleSignup = async () => {
    if (!name || !email || !password) return setError('Sab fields bharo');
    if (password.length < 6) return setError('Password kam se kam 6 characters ka hona chahiye');
    setLoading(true);
    setError('');
    try {
      const res = await signup({ name, email, password, referral_code: refCode || undefined });
      if (res.data?.verify_email) {
        setSuccess('Account created! Check your email to verify before login.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div className="card auth-card" style={styles.card}>
        <AuthBrandHeader />
        <h2 className="auth-heading">Create Account</h2>
        <p className="auth-subheading">Join {BRAND.name}</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            placeholder="Apna naam daalo"
            value={name}
            onChange={e => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <PasswordInput
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            inputStyle={styles.input}
            autoComplete="new-password"
          />
        </div>

        {isGoogleConfigured() && (
          <>
            <GoogleLoginButton style={{ marginBottom: 16 }} />
            <div style={{ textAlign: 'center', margin: '8px 0 16px', color: '#8ca0b8' }}>OR</div>
          </>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>

        <p style={styles.bottomText}>
          Pehle se account hai?{' '}
          <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d1520 0%, #1a2535 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: '#1a2535',
    borderRadius: 20,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 460,
    border: '1px solid #2d3a50',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#8ca0b8', fontSize: 14, textAlign: 'center', marginBottom: 32 },
  error: { background: '#3a1a1a', color: '#f87171', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, border: '1px solid #5a2d2d' },
  success: { background: '#1a3a2a', color: '#4ade80', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, border: '1px solid #2d5a3d' },
  inputGroup: { marginBottom: 18 },
  label: { display: 'block', color: '#8ca0b8', fontSize: 13, fontWeight: 600, marginBottom: 8 },
  input: { width: '100%', padding: '14px 16px', borderRadius: 10, background: '#0d1520', border: '1px solid #2d3a50', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '15px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6c63ff, #9b59b6)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, marginBottom: 24 },
  bottomText: { textAlign: 'center', color: '#8ca0b8', fontSize: 14 },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 700 },
};

export default Signup;