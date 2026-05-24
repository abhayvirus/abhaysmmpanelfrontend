import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await resetPassword({ token, password });
      setMsg({ type: 'success', text: data.message });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="card" style={{ maxWidth: 400, margin: '80px auto', padding: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Reset password</h2>
        {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <input className="input" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginBottom: 12 }} />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update password</button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center' }}><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;
