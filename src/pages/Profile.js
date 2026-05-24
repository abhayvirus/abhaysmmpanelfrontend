import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { getMe, updateProfile, changePassword } from '../api';
import { BRAND } from '../config/brand';

const Profile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getMe().then((r) => {
      setUser(r.data);
      setName(r.data.name || '');
    });
  }, []);

  const show = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const saveProfile = async () => {
    try {
      const { data } = await updateProfile({ name });
      setUser(data);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: data.name }));
      show('Profile updated');
    } catch (e) {
      show(e.response?.data?.message || 'Update failed', 'error');
    }
  };

  const savePassword = async () => {
    try {
      await changePassword({ current_password: pw.current, new_password: pw.next });
      setPw({ current: '', next: '' });
      show('Password changed');
    } catch (e) {
      show(e.response?.data?.message || 'Password change failed', 'error');
    }
  };

  return (
    <UserLayout>
      <h1 style={{ marginBottom: 8 }}>Profile Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{BRAND.domain}</p>
      {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="card" style={{ padding: 24, marginBottom: 20, maxWidth: 520 }}>
        <h3 style={{ marginBottom: 16 }}>Account</h3>
        <div className="form-group">
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" value={user.email || ''} disabled />
        </div>
        <div className="form-group">
          <label className="label">Referral code</label>
          <input className="input" value={user.referral_code || '—'} disabled />
        </div>
        <button type="button" className="btn btn-primary" onClick={saveProfile}>Save profile</button>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 520 }}>
        <h3 style={{ marginBottom: 16 }}>Change password</h3>
        <input className="input" type="password" placeholder="Current password" value={pw.current}
          onChange={(e) => setPw({ ...pw, current: e.target.value })} style={{ marginBottom: 10 }} />
        <input className="input" type="password" placeholder="New password" value={pw.next}
          onChange={(e) => setPw({ ...pw, next: e.target.value })} style={{ marginBottom: 12 }} />
        <button type="button" className="btn btn-ghost" onClick={savePassword}>Update password</button>
      </div>
    </UserLayout>
  );
};

export default Profile;
