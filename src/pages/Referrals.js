import React, { useEffect, useMemo, useState } from 'react';
import UserLayout from '../components/UserLayout';
import { getReferrals, getCashback, getMe } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

function siteOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return 'https://abhaysmmpanel.in';
}

const Referrals = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    referrals: [],
    stats: {},
    referral_code: '',
    referral_link: '',
    rules: { min_first_deposit: 100, commission_percent: 5 },
  });
  const [cashback, setCashback] = useState({ history: [], total_cashback: 0 });
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [refRes, cashRes, meRes] = await Promise.allSettled([
        getReferrals(),
        getCashback(),
        getMe(),
      ]);

      let next = { ...data };
      if (refRes.status === 'fulfilled' && refRes.value?.data) {
        next = { ...next, ...refRes.value.data };
      } else if (refRes.status === 'rejected') {
        setError(refRes.reason?.response?.data?.message || 'Could not load referral link. Retrying…');
      }

      if (cashRes.status === 'fulfilled' && cashRes.value?.data) {
        setCashback(cashRes.value.data);
      }

      const meCode =
        meRes.status === 'fulfilled'
          ? meRes.value?.data?.referral_code
          : null;
      const localUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();

      const code = String(next.referral_code || meCode || localUser.referral_code || '').trim();
      if (code) {
        next.referral_code = code;
        next.referral_link =
          next.referral_link || `${siteOrigin()}/signup?ref=${encodeURIComponent(code)}`;
        try {
          localStorage.setItem(
            'user',
            JSON.stringify({ ...localUser, referral_code: code })
          );
        } catch (_) {
          /* ignore */
        }
      }

      setData(next);
      if (!next.referral_code) {
        setError((e) => e || 'Referral code not ready yet. Tap Retry.');
      }
    } catch (e) {
      setError(e.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async () => {
    const link = data.referral_link;
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      window.prompt('Copy referral link:', link);
    }
  };

  const referrals = data.referrals || [];
  const pct = data.rules?.commission_percent ?? 5;
  const minDep = data.rules?.min_first_deposit ?? 100;
  const formatMoney = (v) => `₹${parseFloat(v || 0).toFixed(2)}`;

  const linkLabel = useMemo(() => {
    if (data.referral_link) return data.referral_link;
    if (loading) return 'Loading…';
    return '—';
  }, [data.referral_link, loading]);

  return (
    <UserLayout title="Referrals">
      <div className="referrals-page">
        <h1 style={{ marginBottom: 8 }}>{t('referral.title')}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Share your link. When a friend signs up and makes their first deposit of {formatMoney(minDep)} or more,
          you earn {pct}% commission once — credited to your wallet automatically.
        </p>

        {error && (
          <div className="card" style={{ marginBottom: 16, borderColor: 'var(--danger)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--danger)', flex: 1 }}>{error}</span>
            <button type="button" className="btn btn-sm btn-primary" onClick={load}>Retry</button>
          </div>
        )}

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-value">{data.stats?.total_referred || 0}</div>
            <div className="stat-label">Referrals Count</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatMoney(data.stats?.total_earned)}</div>
            <div className="stat-label">Total Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatMoney(cashback.total_cashback)}</div>
            <div className="stat-label">Cashback</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <label className="label">Your referral link</label>
          <div className="referral-code-row">
            <code>{data.referral_code || (loading ? '…' : '—')}</code>
            <button type="button" className="btn btn-primary" onClick={copy} disabled={!data.referral_link}>
              {copied ? 'Copied!' : (t('referral.copy') || 'Copy link')}
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, wordBreak: 'break-all' }}>
            {linkLabel}
          </p>
          <ul style={{ margin: '16px 0 0', paddingLeft: '1.25rem', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <li>Commission only on the referred user&apos;s <strong>first</strong> successful deposit</li>
            <li>Minimum first deposit: <strong>{formatMoney(minDep)}</strong></li>
            <li>Your bonus: <strong>{pct}%</strong> of that deposit (e.g. {formatMoney(100)} → {formatMoney(100 * pct / 100)})</li>
            <li>Second and later deposits do not pay referral commission</li>
          </ul>
        </div>

        <h3 style={{ marginBottom: 12 }}>Referral history</h3>
        {referrals.length === 0 ? (
          <div className="card user-panel-empty">
            <p className="user-panel-empty-title">No referrals yet</p>
            <span>Share your link to start earning when friends add funds.</span>
          </div>
        ) : (
          <>
            <div className="table-wrap user-panel-table-wrap card">
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Deposit Amount</th>
                    <th>Commission Earned</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.referred_name}
                        <br />
                        <small style={{ color: 'var(--text-muted)' }}>{r.referred_email}</small>
                      </td>
                      <td>
                        {r.deposit_amount != null
                          ? formatMoney(r.deposit_amount)
                          : <span style={{ color: 'var(--text-muted)' }}>Pending deposit</span>}
                      </td>
                      <td>
                        {parseFloat(r.tx_commission || r.commission_earned || 0) > 0 ? (
                          <span className="badge badge-success">
                            {formatMoney(r.tx_commission || r.commission_earned)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        {r.commission_date
                          ? new Date(r.commission_date).toLocaleString('en-IN')
                          : new Date(r.joined_at).toLocaleDateString('en-IN')}
                      </td>
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
                    {parseFloat(r.tx_commission || r.commission_earned || 0) > 0 ? (
                      <span className="badge badge-success">
                        {formatMoney(r.tx_commission || r.commission_earned)}
                      </span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </div>
                  <div className="user-panel-mobile-row user-panel-mobile-row--stack">
                    <span>Email</span>
                    <span>{r.referred_email}</span>
                  </div>
                  <div className="user-panel-mobile-row">
                    <span>Deposit</span>
                    <span>
                      {r.deposit_amount != null ? formatMoney(r.deposit_amount) : 'Not yet'}
                    </span>
                  </div>
                  <div className="user-panel-mobile-row">
                    <span>Date</span>
                    <span>
                      {r.commission_date
                        ? new Date(r.commission_date).toLocaleString('en-IN')
                        : new Date(r.joined_at).toLocaleDateString('en-IN')}
                    </span>
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
