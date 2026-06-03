import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sendSignupOtp, verifySignupOtp, getAuthConfig } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import GoogleLoginButton from '../components/GoogleLoginButton';
import PasswordInput from '../components/PasswordInput';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import AuthBrandHeader from '../components/AuthBrandHeader';
import { getPostLoginPath, isAuthenticated, saveAuthSession } from '../utils/authRedirect';
import { BRAND } from '../config/brand';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSec, setResendSec] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const { enabled: googleEnabled } = useGoogleAuth();
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    getAuthConfig()
      .then(({ data }) => setRegistrationOpen(data?.registrationEnabled !== false))
      .catch(() => setRegistrationOpen(true))
      .finally(() => setConfigLoading(false));
  }, []);

  useEffect(() => {
    if (refCode) {
      try {
        sessionStorage.setItem('signup_ref', refCode.trim().toUpperCase());
      } catch (_) { /* ignore */ }
    }
  }, [refCode]);

  useEffect(() => {
    // Ensure auth pages never inherit fixed body from a previously opened mobile menu
    document.body.classList.remove('mobile-menu-open');
  }, []);

  useEffect(() => {
    if (resendSec <= 0) return undefined;
    const t = setInterval(() => setResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendSec]);

  const handleSendOtp = async () => {
    if (!name || !email || !password) return setError('Please fill all fields');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendSignupOtp({
        name,
        email,
        password,
        referral_code: refCode || undefined,
      });
      setStep('otp');
      setOtp('');
      setSuccess('We sent a 6-digit OTP to your email. Enter it below to create your account.');
      setResendSec(60);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send OTP'));
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendSec > 0) return;
    setLoading(true);
    setError('');
    try {
      await sendSignupOtp({
        name,
        email,
        password,
        referral_code: refCode || undefined,
      });
      setSuccess('A new OTP has been sent to your email.');
      setResendSec(60);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resend OTP'));
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    const code = otp.replace(/\D/g, '').slice(0, 6);
    if (code.length !== 6) return setError('Enter the 6-digit OTP');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await verifySignupOtp({ email: email.trim().toLowerCase(), otp: code });
      if (res.data?.pending_approval) {
        setSuccess(res.data.message || 'Account pending admin approval.');
        setTimeout(() => navigate('/login', { replace: true }), 3500);
        return;
      }
      if (res.data?.verify_email) {
        setSuccess('Account created! Please verify your email before logging in.');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }
      if (res.data?.token && res.data?.user) {
        saveAuthSession(res.data.token, res.data.user);
        setSuccess('Welcome! A welcome email has been sent to your Gmail.');
        setTimeout(() => {
          navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }, 1200);
        return;
      }
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'OTP is invalid or expired'));
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

        {!configLoading && !registrationOpen && (
          <div style={styles.error}>
            New registrations are currently closed.{' '}
            <Link to="/login">Sign in</Link> if you already have an account.
          </div>
        )}

        {registrationOpen && step === 'form' && (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full name</label>
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                autoComplete="name"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                autoComplete="email"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <PasswordInput
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                inputStyle={styles.input}
                autoComplete="new-password"
              />
            </div>

            {googleEnabled && (
              <>
                <GoogleLoginButton style={{ marginBottom: 16 }} />
                <div style={{ textAlign: 'center', margin: '8px 0 16px', color: '#8ca0b8' }}>OR</div>
              </>
            )}

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP to email'}
            </button>
          </>
        )}

        {registrationOpen && step === 'otp' && (
          <>
            <p style={{ ...styles.subtitle, marginBottom: 16 }}>
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email OTP</label>
              <input
                className="input"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                style={{ ...styles.input, letterSpacing: '0.4em', fontSize: 22, textAlign: 'center', fontWeight: 700 }}
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Verify OTP & Create account'}
            </button>

            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setError(''); setSuccess(''); }}
                className="btn btn-ghost"
                style={{ flex: 1, minWidth: 120 }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendSec > 0}
                className="btn btn-ghost"
                style={{ flex: 1, minWidth: 120 }}
              >
                {resendSec > 0 ? `Resend (${resendSec}s)` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}

        <p style={styles.bottomText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100svh',
    background: 'linear-gradient(135deg, #0d1520 0%, #1a2535 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 'clamp(12px, 4vw, 20px)',
    paddingTop: 'calc(clamp(16px, 6vh, 56px) + env(safe-area-inset-top, 0px))',
    paddingBottom: 'calc(clamp(20px, 8vh, 72px) + env(safe-area-inset-bottom, 0px))',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  card: {
    background: '#1a2535',
    borderRadius: 20,
    padding: 'clamp(20px, 5vw, 48px) clamp(16px, 4vw, 40px)',
    width: '100%',
    maxWidth: 460,
    border: '1px solid #2d3a50',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  subtitle: { color: '#8ca0b8', fontSize: 14, textAlign: 'center', lineHeight: 1.45 },
  error: {
    background: '#3a1a1a',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 14,
    border: '1px solid #5a2d2d',
    lineHeight: 1.45,
    wordBreak: 'break-word',
  },
  success: {
    background: '#1a3a2a',
    color: '#4ade80',
    padding: '12px 16px',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 14,
    border: '1px solid #2d5a3d',
    lineHeight: 1.45,
    wordBreak: 'break-word',
  },
  inputGroup: { marginBottom: 18 },
  label: { display: 'block', color: '#8ca0b8', fontSize: 13, fontWeight: 600, marginBottom: 8 },
  input: { width: '100%', padding: '12px 14px', borderRadius: 10, background: '#0d1520', border: '1px solid #2d3a50', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  btn: {
    width: '100%',
    minHeight: 44,
    padding: '12px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #6c63ff, #9b59b6)',
    color: '#fff',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    marginBottom: 8,
  },
  bottomText: { textAlign: 'center', color: '#8ca0b8', fontSize: 14, marginTop: 24 },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 700 },
};

export default Signup;
