import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import AuthBrandHeader from '../components/AuthBrandHeader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await forgotPassword(email);
      setMsg({ type: 'success', text: data.message });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send reset email' });
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div className="card fade-in auth-card" style={styles.card}>
        <AuthBrandHeader />
        <h2 className="auth-heading">Forgot password</h2>
        <p className="auth-subheading">We&apos;ll email you a secure reset link (valid 1 hour)</p>
        {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24 }}><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' },
  card: { width: '100%', maxWidth: 440, padding: 40 },
};
