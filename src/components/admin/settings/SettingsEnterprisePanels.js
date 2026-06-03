import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SettingsCard,
  SettingsField,
  SettingsSelect,
  SettingsToggle,
  SettingsToggleGrid,
  StatTile,
} from './SettingsPrimitives';
import {
  adminGetSettingsAnalytics,
  adminGetCronStatus,
  adminCronHeartbeat,
  API_URL,
} from '../../../api';

const fmtMoney = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const parseList = (val) => {
  if (Array.isArray(val)) return val;
  try {
    const arr = JSON.parse(val || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return String(val || '').split(',').map((s) => s.trim()).filter(Boolean);
  }
};

const listToDraft = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

export function UsersSettingsPanel({ draft, updateDraft, isOn, setBool }) {
  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="👥" title="Registration & access" description="Control how new users join your panel.">
        <SettingsToggleGrid>
          <SettingsToggle label="Allow new registrations" checked={isOn(draft, 'registration_enabled')} onChange={(v) => setBool(updateDraft, 'registration_enabled', v)} />
          <SettingsToggle label="Google login" checked={isOn(draft, 'google_login_enabled')} onChange={(v) => setBool(updateDraft, 'google_login_enabled', v)} />
          <SettingsToggle label="Email verification required" checked={isOn(draft, 'email_verification_required')} onChange={(v) => setBool(updateDraft, 'email_verification_required', v)} />
          <SettingsToggle label="Referral system" checked={draft.feature_referrals !== 'false' && draft.feature_referrals !== false} onChange={(v) => setBool(updateDraft, 'feature_referrals', v)} />
        </SettingsToggleGrid>
      </SettingsCard>
      <SettingsCard icon="⚙️" title="Defaults & approval" description="Applied to new accounts unless overridden.">
        <SettingsField label="Default wallet balance (₹)" type="number" value={draft.default_user_balance} onChange={(v) => updateDraft('default_user_balance', v)} />
        <SettingsSelect
          label="Default user role"
          value={draft.default_user_role || 'user'}
          onChange={(v) => updateDraft('default_user_role', v)}
          options={[
            { value: 'user', label: 'User' },
            { value: 'reseller', label: 'Reseller' },
          ]}
        />
        <SettingsSelect
          label="Account approval mode"
          value={draft.account_approval_mode || 'auto'}
          onChange={(v) => updateDraft('account_approval_mode', v)}
          options={[
            { value: 'auto', label: 'Auto-approve (instant access)' },
            { value: 'manual', label: 'Manual approval by admin' },
          ]}
        />
        <p className="settings-field-hint">
          <Link to="/admin/users">Open User Management →</Link> for per-user roles, balance, and status.
        </p>
      </SettingsCard>
    </div>
  );
}

export function OrdersSettingsPanel({ draft, updateDraft, isOn, setBool }) {
  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="📦" title="Order processing" description="Automation and review rules for SMM orders.">
        <SettingsToggleGrid>
          <SettingsToggle label="Auto processing" checked={isOn(draft, 'orders_auto_processing')} onChange={(v) => setBool(updateDraft, 'orders_auto_processing', v)} hint="Send orders to provider API automatically" />
          <SettingsToggle label="Manual review queue" checked={isOn(draft, 'orders_manual_review')} onChange={(v) => setBool(updateDraft, 'orders_manual_review', v)} />
          <SettingsToggle label="Refill enabled" checked={isOn(draft, 'orders_refill_enabled')} onChange={(v) => setBool(updateDraft, 'orders_refill_enabled', v)} />
          <SettingsToggle label="Cancellation allowed" checked={isOn(draft, 'orders_cancellation_enabled')} onChange={(v) => setBool(updateDraft, 'orders_cancellation_enabled', v)} />
          <SettingsToggle label="Drip feed" checked={isOn(draft, 'orders_drip_feed_enabled')} onChange={(v) => setBool(updateDraft, 'orders_drip_feed_enabled', v)} />
          <SettingsToggle label="Bulk orders" checked={isOn(draft, 'orders_bulk_enabled')} onChange={(v) => setBool(updateDraft, 'orders_bulk_enabled', v)} />
        </SettingsToggleGrid>
      </SettingsCard>
      <SettingsCard icon="💰" title="Order limits" description="Minimum and maximum charge per order (₹).">
        <div className="settings-enterprise-two-col">
          <SettingsField label="Minimum order amount" type="number" value={draft.orders_min_amount} onChange={(v) => updateDraft('orders_min_amount', v)} />
          <SettingsField label="Maximum order amount" type="number" value={draft.orders_max_amount} onChange={(v) => updateDraft('orders_max_amount', v)} />
        </div>
      </SettingsCard>
    </div>
  );
}

export function NotificationsSettingsPanel({ draft, updateDraft, isOn, setBool }) {
  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="🔔" title="Admin alerts" description="Telegram and email alerts (Telegram also needs bot configured).">
        <SettingsToggle label="Master Telegram notifications" checked={isOn(draft, 'notify_telegram_master')} onChange={(v) => setBool(updateDraft, 'notify_telegram_master', v)} />
        <SettingsField label="Admin notification email" value={draft.admin_notification_email} onChange={(v) => updateDraft('admin_notification_email', v)} placeholder="falls back to support email" />
        <SettingsToggleGrid>
          <SettingsToggle label="New user signup" checked={isOn(draft, 'notify_new_user_signup')} onChange={(v) => setBool(updateDraft, 'notify_new_user_signup', v)} />
          <SettingsToggle label="New order" checked={isOn(draft, 'notify_new_order')} onChange={(v) => setBool(updateDraft, 'notify_new_order', v)} />
          <SettingsToggle label="Payment success" checked={isOn(draft, 'notify_payment_success')} onChange={(v) => setBool(updateDraft, 'notify_payment_success', v)} />
          <SettingsToggle label="Payment failed" checked={isOn(draft, 'notify_payment_failed')} onChange={(v) => setBool(updateDraft, 'notify_payment_failed', v)} />
          <SettingsToggle label="Support ticket" checked={isOn(draft, 'notify_support_ticket')} onChange={(v) => setBool(updateDraft, 'notify_support_ticket', v)} />
          <SettingsToggle label="Admin login" checked={isOn(draft, 'notify_admin_login')} onChange={(v) => setBool(updateDraft, 'notify_admin_login', v)} />
          <SettingsToggle label="User login (legacy)" checked={isOn(draft, 'telegram_notify_user_login')} onChange={(v) => setBool(updateDraft, 'telegram_notify_user_login', v)} />
          <SettingsToggle label="Browser push (PWA)" checked={isOn(draft, 'notify_browser_push')} onChange={(v) => setBool(updateDraft, 'notify_browser_push', v)} hint="Requires user permission in browser" />
        </SettingsToggleGrid>
      </SettingsCard>
    </div>
  );
}

export function SupportSettingsPanel({ draft, updateDraft, isOn, setBool }) {
  const setCategories = (raw) => updateDraft('support_ticket_categories', raw.split(',').map((s) => s.trim()).filter(Boolean));
  const setPriorities = (raw) => updateDraft('support_ticket_priorities', raw.split(',').map((s) => s.trim()).filter(Boolean));

  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="🎫" title="Support inbox" description="Live chat and ticket workflow defaults.">
        <SettingsToggle label="Support inbox enabled" checked={isOn(draft, 'support_inbox_enabled')} onChange={(v) => setBool(updateDraft, 'support_inbox_enabled', v)} />
        <SettingsToggle label="Live chat widget" checked={isOn(draft, 'live_chat_enabled')} onChange={(v) => setBool(updateDraft, 'live_chat_enabled', v)} />
        <SettingsField label="Working hours" value={draft.support_working_hours} onChange={(v) => updateDraft('support_working_hours', v)} placeholder="Mon–Sat 10:00–22:00 IST" />
        <SettingsField label="Auto-close tickets after (days)" type="number" value={draft.support_auto_close_days} onChange={(v) => updateDraft('support_auto_close_days', v)} />
        <Link to="/admin/chat" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>Open Support Inbox →</Link>
      </SettingsCard>
      <SettingsCard icon="💬" title="Templates & taxonomy" description="Comma-separated lists saved as JSON arrays.">
        <SettingsField label="Auto-reply template" type="textarea" value={draft.support_auto_reply_template} onChange={(v) => updateDraft('support_auto_reply_template', v)} />
        <SettingsField label="Ticket categories" value={listToDraft(parseList(draft.support_ticket_categories))} onChange={setCategories} placeholder="Billing, Orders, Technical" />
        <SettingsField label="Ticket priorities" value={listToDraft(parseList(draft.support_ticket_priorities))} onChange={setPriorities} placeholder="low, normal, high, urgent" />
      </SettingsCard>
    </div>
  );
}

export function SeoSettingsPanel({ draft, updateDraft }) {
  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="🔍" title="Search & social" description="Meta tags injected on the public site after save.">
        <SettingsField label="Meta title" value={draft.seo_meta_title} onChange={(v) => updateDraft('seo_meta_title', v)} />
        <SettingsField label="Meta description" type="textarea" value={draft.seo_meta_description} onChange={(v) => updateDraft('seo_meta_description', v)} />
        <SettingsField label="Keywords" value={draft.seo_keywords} onChange={(v) => updateDraft('seo_keywords', v)} />
        <SettingsField label="Open Graph image URL" value={draft.seo_og_image} onChange={(v) => updateDraft('seo_og_image', v)} placeholder="https://… or /uploads/…" />
        <SettingsField label="Sitemap URL" value={draft.seo_sitemap_url} onChange={(v) => updateDraft('seo_sitemap_url', v)} />
      </SettingsCard>
      <SettingsCard icon="📊" title="Tracking" description="Analytics and ads pixels.">
        <SettingsField label="Google Analytics ID" value={draft.seo_google_analytics_id} onChange={(v) => updateDraft('seo_google_analytics_id', v)} placeholder="G-XXXXXXXX" />
        <SettingsField label="Facebook Pixel ID" value={draft.seo_facebook_pixel_id} onChange={(v) => updateDraft('seo_facebook_pixel_id', v)} />
      </SettingsCard>
      <SettingsCard icon="🤖" title="robots.txt" description="Plain text served conceptually — store for reference / future route.">
        <SettingsField label="robots.txt content" type="textarea" value={draft.seo_robots_txt} onChange={(v) => updateDraft('seo_robots_txt', v)} />
      </SettingsCard>
    </div>
  );
}

export function AnalyticsSettingsPanel({ onToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminGetSettingsAnalytics()
      .then((r) => setData(r.data))
      .catch(() => onToast?.('Failed to load analytics', 'error'))
      .finally(() => setLoading(false));
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="settings-loading">Loading analytics…</p>;
  if (!data) return null;

  const u = data.users || {};
  const o = data.orders || {};
  const p = data.payments || {};

  return (
    <div className="settings-enterprise-stack">
      <div className="settings-enterprise-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
        <Link to="/admin/analytics" className="btn btn-primary btn-sm">Full analytics dashboard →</Link>
      </div>
      <div className="settings-stat-grid">
        <StatTile label="Total users" value={u.total ?? 0} sub={`+${u.today ?? 0} today`} />
        <StatTile label="Orders" value={o.total ?? 0} sub={`Revenue ${fmtMoney(o.revenue)}`} />
        <StatTile label="Deposits" value={p.total ?? 0} sub={`Completed ${fmtMoney(p.revenue)}`} />
        <StatTile label="Today orders" value={o.today ?? 0} sub={fmtMoney(o.today_revenue)} />
      </div>
      <SettingsCard icon="🏆" title="Top services" description="By order volume (all time).">
        {(data.topServices || []).length === 0 ? (
          <p className="settings-field-hint">No order data yet.</p>
        ) : (
          <div className="settings-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Service</th><th>Platform</th><th>Orders</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {data.topServices.map((s) => (
                  <tr key={`${s.name}-${s.platform}`}>
                    <td>{s.name}</td>
                    <td>{s.platform || '—'}</td>
                    <td>{s.order_count}</td>
                    <td>{fmtMoney(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>
      <SettingsCard icon="📈" title="User growth (14 days)" description="New signups per day.">
        <div className="settings-growth-bars">
          {(data.userGrowth14d || []).map((row) => (
            <div key={row.day} className="settings-growth-bar" title={`${row.day}: ${row.signups}`}>
              <div className="settings-growth-bar__fill" style={{ height: `${Math.min(100, (row.signups || 0) * 12)}%` }} />
              <span>{row.signups}</span>
            </div>
          ))}
        </div>
      </SettingsCard>
      <p className="settings-field-hint">{data.conversionHint?.note}</p>
    </div>
  );
}

export function AutomationSettingsPanel({ draft, updateDraft, isOn, setBool, onToast }) {
  const [cron, setCron] = useState(null);

  useEffect(() => {
    adminGetCronStatus().then((r) => setCron(r.data)).catch(() => {});
  }, [draft.automation_last_cron_run]);

  const pingCron = () => {
    adminCronHeartbeat()
      .then((r) => {
        updateDraft('automation_last_cron_run', r.data.lastRun);
        onToast?.('Cron heartbeat recorded');
        setCron((c) => ({ ...c, lastRun: r.data.lastRun }));
      })
      .catch((e) => onToast?.(e.response?.data?.message || 'Failed', 'error'));
  };

  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="⚡" title="Automation jobs" description="Flags for scheduled workers (configure cron on server).">
        <SettingsToggleGrid>
          <SettingsToggle label="Auto service sync" checked={isOn(draft, 'automation_auto_service_sync')} onChange={(v) => setBool(updateDraft, 'automation_auto_service_sync', v)} />
          <SettingsToggle label="Auto database backup" checked={isOn(draft, 'automation_auto_backup')} onChange={(v) => setBool(updateDraft, 'automation_auto_backup', v)} />
          <SettingsToggle label="Auto settlement reports" checked={isOn(draft, 'automation_auto_settlement_reports')} onChange={(v) => setBool(updateDraft, 'automation_auto_settlement_reports', v)} />
        </SettingsToggleGrid>
      </SettingsCard>
      <SettingsCard icon="🕐" title="Cron status monitor" description="Last heartbeat from admin or external cron.">
        <p className="settings-field-hint">
          Last run: <strong>{cron?.lastRun || draft.automation_last_cron_run || 'Never'}</strong>
        </p>
        <p className="settings-field-hint">Server time: {cron?.serverTime || '—'}</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={pingCron}>Record heartbeat now</button>
        <SettingsField
          label="Scheduled jobs (JSON array)"
          type="textarea"
          value={typeof draft.automation_scheduled_jobs === 'string' ? draft.automation_scheduled_jobs : JSON.stringify(draft.automation_scheduled_jobs || [], null, 2)}
          onChange={(v) => updateDraft('automation_scheduled_jobs', v)}
          hint='e.g. [{"name":"sync-services","cron":"0 */6 * * *"}]'
        />
      </SettingsCard>
    </div>
  );
}

function downloadExport(path, label) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}${path}?format=csv`;
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `${label}.csv`);
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const obj = URL.createObjectURL(blob);
      a.href = obj;
      a.click();
      URL.revokeObjectURL(obj);
    })
    .catch(() => window.open(url, '_blank'));
}

export function BackupSettingsPanel({ onToast }) {
  const [busy, setBusy] = useState('');

  const backupSettings = () => {
    setBusy('settings');
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/settings/admin/backup/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `abhaysmm-settings-${Date.now()}.json`;
        a.click();
        onToast?.('Settings backup downloaded');
      })
      .catch(() => onToast?.('Backup failed', 'error'))
      .finally(() => setBusy(''));
  };

  const runExport = (path, label) => {
    setBusy(label);
    downloadExport(path, label);
    setTimeout(() => {
      setBusy('');
      onToast?.(`${label} export started`);
    }, 400);
  };

  const actions = [
    { id: 'settings', label: 'Download settings backup', icon: '💾', run: backupSettings },
    { id: 'users', label: 'Export users (CSV)', icon: '👥', run: () => runExport('/settings/admin/export/users', 'users') },
    { id: 'orders', label: 'Export orders (CSV)', icon: '📦', run: () => runExport('/settings/admin/export/orders', 'orders') },
    { id: 'payments', label: 'Export payments (CSV)', icon: '💳', run: () => runExport('/settings/admin/export/payments', 'payments') },
    { id: 'services', label: 'Export services (CSV)', icon: '📋', run: () => runExport('/settings/admin/export/services', 'services') },
  ];

  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="🗄️" title="Backup & export" description="Download data for compliance and disaster recovery. Secrets are redacted in settings backup.">
        <div className="settings-backup-grid">
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              className="settings-backup-btn"
              disabled={busy === a.id}
              onClick={a.run}
            >
              <span aria-hidden="true">{a.icon}</span>
              <span>{busy === a.id ? 'Working…' : a.label}</span>
            </button>
          ))}
        </div>
        <p className="settings-field-hint" style={{ marginTop: 16 }}>
          Restore: import settings JSON manually via Save after editing keys, or contact support for full DB restore.
        </p>
      </SettingsCard>
    </div>
  );
}

export function MaintenanceSettingsPanel({ draft, updateDraft, isOn, setBool }) {
  return (
    <div className="settings-enterprise-stack">
      <SettingsCard icon="🔧" title="Maintenance mode" description="Blocks user panel; admins can still access when allowed below.">
        <SettingsToggle label="Enable maintenance mode" checked={isOn(draft, 'maintenance_mode')} onChange={(v) => setBool(updateDraft, 'maintenance_mode', v)} />
        <SettingsToggle label="Allow admin access during maintenance" checked={isOn(draft, 'maintenance_allow_admin')} onChange={(v) => setBool(updateDraft, 'maintenance_allow_admin', v)} />
        <SettingsField label="Maintenance message" type="textarea" value={draft.maintenance_message} onChange={(v) => updateDraft('maintenance_message', v)} />
      </SettingsCard>
    </div>
  );
}
