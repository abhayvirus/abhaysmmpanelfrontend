import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { getMe, updateProfile, changePassword } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { BRAND } from '../config/brand';

const Profile = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
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
    <UserLayout title="Profile">
      <div className="profile-page">
        <header className="profile-page__header page-header">
          <div className="profile-page__header-text">
            <h1 className="profile-page__title">Profile Settings</h1>
            <p className="profile-page__subtitle">{BRAND.domain}</p>
          </div>
          <div className="profile-page__balance" aria-label="Wallet balance">
            <span className="profile-page__balance-label">Balance</span>
            <span className="profile-page__balance-value">
              {sym}{parseFloat(user.balance || 0).toFixed(2)}
            </span>
          </div>
        </header>

        {msg && (
          <div className={`profile-page__alert alert alert-${msg.type === 'error' ? 'error' : 'success'}`} role="status">
            {msg.text}
          </div>
        )}

        <div className="profile-page__grid">
          <section className="card profile-card profile-card--account">
            <h2 className="profile-card__title">Account</h2>
            <div className="profile-card__body">
              <div className="form-group profile-field">
                <label className="label" htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  className="input profile-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="form-group profile-field">
                <label className="label" htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  className="input profile-input profile-input--readonly"
                  value={user.email || ''}
                  disabled
                  readOnly
                  title={user.email || ''}
                />
              </div>
              <div className="form-group profile-field profile-field--last">
                <label className="label" htmlFor="profile-referral">Referral code</label>
                <input
                  id="profile-referral"
                  className="input profile-input profile-input--readonly profile-input--code"
                  value={user.referral_code || '—'}
                  disabled
                  readOnly
                />
              </div>
            </div>
            <div className="profile-card__actions">
              <button type="button" className="btn btn-primary profile-btn" onClick={saveProfile}>
                Save profile
              </button>
            </div>
          </section>

          <section className="card profile-card profile-card--password">
            <h2 className="profile-card__title">Change password</h2>
            <div className="profile-card__body profile-card__body--stack">
              <div className="form-group profile-field">
                <label className="label visually-hidden" htmlFor="profile-pw-current">
                  Current password
                </label>
                <input
                  id="profile-pw-current"
                  className="input profile-input"
                  type="password"
                  placeholder="Current password"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group profile-field profile-field--last">
                <label className="label visually-hidden" htmlFor="profile-pw-new">
                  New password
                </label>
                <input
                  id="profile-pw-new"
                  className="input profile-input"
                  type="password"
                  placeholder="New password"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="profile-card__actions">
              <button type="button" className="btn btn-ghost profile-btn" onClick={savePassword}>
                Update password
              </button>
            </div>
          </section>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;
