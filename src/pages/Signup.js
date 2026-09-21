import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sendSignupOtp, verifySignupOtp, getAuthConfig } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import { wakeApi, startApiKeepAlive } from '../utils/apiWake';
import PasswordInput from '../components/PasswordInput';
import AuthBrandHeader from '../components/AuthBrandHeader';
import { getPostLoginPath, isAuthenticated, saveAuthSession } from '../utils/authRedirect';
import { BRAND } from '../config/brand';

function readStoredRef() {
  try {
    return String(sessionStorage.getItem('signup_ref') || '').trim().toUpperCase();
  } catch {
    return '';
  }
}

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
  const urlRef = String(searchParams.get('ref') || '').trim().toUpperCase();
  const [referralCode, setReferralCode] = useState(() => urlRef || readStoredRef());
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    getAuthConfig()
      .then(({ data }) => setRegistrationOpen(data?.registrationEnabled !== false))
      .catch(() => setRegistrationOpen(true))
      .finally(() => setConfigLoading(false));
  }, []);

  useEffect(() => {
    if (urlRef) {
      setReferralCode(urlRef);
      try {
        sessionStorage.setItem('signup_ref', urlRef);
      } catch (_) { /* ignore */ }
    }
  }, [urlRef]);

  useEffect(() => {
    const code = String(referralCode || '').trim().toUpperCase();
    try {
      if (code) sessionStorage.setItem('signup_ref', code);
      else sessionStorage.removeItem('signup_ref');
    } catch (_) { /* ignore */ }
  }, [referralCode]);

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
      await wakeApi(9000);
      const ref = String(referralCode || '').trim().toUpperCase();
      await sendSignupOtp({
        name,
        email,
        password,
        referral_code: ref || undefined,
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
      const ref = String(referralCode || '').trim().toUpperCase();
      await sendSignupOtp({
        name,
        email,
        password,
        referral_code: ref || undefined,
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
      if (res.data?.token && res.data?.user) {
        saveAuthSession(res.data.token, res.data.user);
        navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        return;
      }
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'OTP is invalid or expired'));
    } finally {
      setLoading(false);
    }
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

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Referral code <span style={{ fontWeight: 500, opacity: 0.75 }}>(optional)</span>
              </label>
              <input
                placeholder="Enter code if you have one"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/\s+/g, '').slice(0, 32))}
                style={styles.input}
                autoComplete="off"
                spellCheck={false}
              />
              {urlRef ? (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6ee7b7' }}>
                  Referral applied from your invite link
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSendOtp}
              disabled={loading || configLoading}
              style={{ width: '100%', opacity: loading ? 0.7 : 1, marginTop: 8 }}
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
              className="btn btn-primary"
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{ width: '100%', opacity: loading ? 0.7 : 1, marginTop: 8 }}
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
  bottomText: { textAlign: 'center', color: '#8ca0b8', fontSize: 14, marginTop: 24 },
  link: { color: 'var(--primary, #3b82f6)', textDecoration: 'none', fontWeight: 700 },
};

export default Signup;
