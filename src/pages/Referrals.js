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

  return (
    <UserLayout>
      <h1 style={{ marginBottom: 8 }}>{t('referral.title')}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Share your link and earn commission on referrals&apos; deposits.</p>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-value">{data.stats?.total_referred || 0}</div><div className="stat-label">Referrals</div></div>
        <div className="stat-card"><div className="stat-value">₹{parseFloat(data.stats?.total_earned || 0).toFixed(2)}</div><div className="stat-label">Earned</div></div>
        <div className="stat-card"><div className="stat-value">₹{parseFloat(cashback.total_cashback || 0).toFixed(2)}</div><div className="stat-label">Cashback</div></div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <label className="label">Your referral code</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <code style={{ flex: 1, padding: 12, background: 'var(--bg-hover)', borderRadius: 8 }}>{data.referral_code}</code>
          <button type="button" className="btn btn-primary" onClick={copy}>{t('referral.copy')}</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, wordBreak: 'break-all' }}>{data.referral_link}</p>
      </div>

      <h3 style={{ marginBottom: 12 }}>Referral history</h3>
      <div className="table-wrap card">
        <table className="table">
          <thead><tr><th>User</th><th>Commission</th><th>Joined</th></tr></thead>
          <tbody>
            {data.referrals?.map((r) => (
              <tr key={r.id}>
                <td>{r.referred_name}<br /><small>{r.referred_email}</small></td>
                <td>₹{parseFloat(r.commission_earned || 0).toFixed(2)}</td>
                <td>{new Date(r.joined_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!data.referrals?.length && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No referrals yet</td></tr>}
          </tbody>
        </table>
      </div>
    </UserLayout>
  );
};

export default Referrals;
