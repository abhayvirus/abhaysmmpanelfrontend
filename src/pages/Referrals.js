import React, { useEffect, useState } from 'react';
import UserLayout from '../components/UserLayout';
import { getReferrals, getCashback } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const Referrals = () => {
  const { t } = useLanguage();
  const [data, setData] = useState({ referrals: [], stats: {}, referral_link: '' });
  const [cashback, setCashback] = useState({ history: [], total_cashback: 0 });

  useEffect(() => {
    getReferrals().then((r) => setData(r.data));
    getCashback().then((r) => setCashback(r.data));
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(data.referral_link);
    alert('Link copied!');
  };

  const referrals = data.referrals || [];

  return (
    <UserLayout title="Referrals">
      <div className="referrals-page">
        <h1 style={{ marginBottom: 8 }}>{t('referral.title')}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Share your link and earn commission on referrals&apos; deposits.</p>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-value">{data.stats?.total_referred || 0}</div><div className="stat-label">Referrals</div></div>
          <div className="stat-card"><div className="stat-value">₹{parseFloat(data.stats?.total_earned || 0).toFixed(2)}</div><div className="stat-label">Earned</div></div>
          <div className="stat-card"><div className="stat-value">₹{parseFloat(cashback.total_cashback || 0).toFixed(2)}</div><div className="stat-label">Cashback</div></div>
        </div>

        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <label className="label">Your referral code</label>
          <div className="referral-code-row">
            <code>{data.referral_code}</code>
            <button type="button" className="btn btn-primary" onClick={copy}>{t('referral.copy')}</button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, wordBreak: 'break-all' }}>{data.referral_link}</p>
        </div>

        <h3 style={{ marginBottom: 12 }}>Referral history</h3>
        {referrals.length === 0 ? (
          <div className="card user-panel-empty">
            <p className="user-panel-empty-title">No referrals yet</p>
            <span>Share your link to start earning commission.</span>
          </div>
        ) : (
          <>
            <div className="table-wrap user-panel-table-wrap card">
              <table>
                <thead><tr><th>User</th><th>Commission</th><th>Joined</th></tr></thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id}>
                      <td>{r.referred_name}<br /><small>{r.referred_email}</small></td>
                      <td>₹{parseFloat(r.commission_earned || 0).toFixed(2)}</td>
                      <td>{new Date(r.joined_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="user-panel-mobile-list">
              {referrals.map((r) => (
                <article className="card user-panel-mobile-card" key={`ref-m-${r.id}`}>
                  <div className="user-panel-mobile-top">
                    <strong>{r.referred_name}</strong>
                    <span className="badge badge-success">₹{parseFloat(r.commission_earned || 0).toFixed(2)}</span>
                  </div>
                  <div className="user-panel-mobile-row user-panel-mobile-row--stack">
                    <span>Email</span>
                    <span>{r.referred_email}</span>
                  </div>
                  <div className="user-panel-mobile-row">
                    <span>Joined</span>
                    <span>{new Date(r.joined_at).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default Referrals;
