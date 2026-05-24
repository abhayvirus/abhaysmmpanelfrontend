import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      setMsg({ type: 'success', text: data.message });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
    }
    setLoading(false);
  };

  return (
    <div className="auth-page fade-in">
      <div className="card" style={{ maxWidth: 400, margin: '80px auto', padding: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Forgot password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>We&apos;ll email you a reset link.</p>
        {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginBottom: 12 }} />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center' }}><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
