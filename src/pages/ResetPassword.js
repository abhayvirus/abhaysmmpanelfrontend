import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api';
import PasswordInput from '../components/PasswordInput';
import AuthBrandHeader from '../components/AuthBrandHeader';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMsg({ type: 'error', text: 'Invalid or missing reset link. Request a new one.' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await resetPassword({ token, password });
      setMsg({ type: 'success', text: data.message });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div className="card fade-in auth-card" style={styles.card}>
        <AuthBrandHeader />
        <h2 className="auth-heading">Reset password</h2>
        <p className="auth-subheading">Choose a new password for your account</p>
        {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">New password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label className="label">Confirm password</label>
            <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' },
  card: { width: '100%', maxWidth: 440, padding: 40 },
};

export default ResetPassword;
