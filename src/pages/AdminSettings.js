import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import SettingsLivePreview from '../components/SettingsLivePreview';
import {
  adminGetSettings, adminUpdateSettings, adminUploadQR, adminUploadLogo,
  adminUploadApk, adminUploadAppScreenshot, adminDeleteAppScreenshot,
  adminChangePassword, adminChangeEmail,
  adminGetProviders, adminAddProvider, adminDeleteProvider,
  adminGetAnnouncements, adminCreateAnnouncement, adminDeleteAnnouncement,
  adminTestTelegram,
  API_BASE,
} from '../api';
import { useSettings } from '../contexts/SettingsContext';

const TABS = [
  { id: 'general', label: 'General', icon: '🏠' },
  { id: 'branding', label: 'Branding', icon: '🎨' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'api', label: 'API & Profit', icon: '🔌' },
  { id: 'social', label: 'Social & App', icon: '📱' },
  { id: 'theme', label: 'Theme', icon: '🌙' },
  { id: 'announce', label: 'Popups', icon: '📢' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'premium', label: 'Premium', icon: '✨' },
];

const AdminSettings = () => {
  const { refresh: refreshGlobalSettings } = useSettings();
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [draft, setDraft] = useState({});
  const [providers, setProviders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [pw, setPw] = useState({ current_password: '', new_password: '' });
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [newProvider, setNewProvider] = useState({ name: '', api_url: '', api_key: '', profit_margin: 30, is_default: true });
  const [annForm, setAnnForm] = useState({ title: '', content: '', is_active: true, show_on_login: true });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [s, p, a] = await Promise.all([
      adminGetSettings(),
      adminGetProviders(),
      adminGetAnnouncements(),
    ]);
    const parsed = {
      ...s.data,
      app_screenshots: parseScreenshots(s.data.app_screenshots),
      pwa_enabled: s.data.pwa_enabled !== 'false',
    };
    setSettings(parsed);
    setDraft(parsed);
    setProviders(p.data);
    setAnnouncements(a.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateDraft = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await adminUpdateSettings({
        ...draft,
        maintenance_mode: draft.maintenance_mode === true || draft.maintenance_mode === 'true' ? 'true' : 'false',
        pwa_enabled: draft.pwa_enabled === true || draft.pwa_enabled === 'true' ? 'true' : 'false',
        otp_enabled: draft.otp_enabled === true || draft.otp_enabled === 'true' ? 'true' : 'false',
        email_verification_required: draft.email_verification_required === true || draft.email_verification_required === 'true' ? 'true' : 'false',
        live_chat_enabled: draft.live_chat_enabled === false || draft.live_chat_enabled === 'false' ? 'false' : 'true',
      });
      setSettings(draft);
      await refreshGlobalSettings();
      showMsg(`Saved · v${res.data.settings_version}`);
    } catch (e) {
      showMsg(e.response?.data?.message || 'Save failed', 'error');
    }
    setSaving(false);
  };

  const uploadQR = async (e) => {
    if (!e.target.files[0]) return;
    const fd = new FormData();
    fd.append('qr', e.target.files[0]);
    const r = await adminUploadQR(fd);
    updateDraft('qr_image', r.data.qr_image);
    showMsg('QR code uploaded');
  };

  const uploadLogo = async (e) => {
    if (!e.target.files[0]) return;
    const fd = new FormData();
    fd.append('logo', e.target.files[0]);
    const r = await adminUploadLogo(fd);
    updateDraft('site_logo', r.data.site_logo);
    showMsg('Logo uploaded');
  };

  const renderTab = () => {
    switch (tab) {
      case 'general':
        return (
          <>
            <Field label="Site name" value={draft.site_name} onChange={(v) => updateDraft('site_name', v)} />
            <Field label="Tagline" value={draft.site_tagline} onChange={(v) => updateDraft('site_tagline', v)} />
            <Field label="Support email" value={draft.support_email} onChange={(v) => updateDraft('support_email', v)} />
            <Toggle label="Maintenance mode" checked={draft.maintenance_mode === 'true' || draft.maintenance_mode === true}
              onChange={(v) => updateDraft('maintenance_mode', v ? 'true' : 'false')} />
          </>
        );
      case 'branding':
        return (
          <>
            <div className="form-group">
              <label className="label">Site logo</label>
              <input type="file" accept="image/*" onChange={uploadLogo} />
              {draft.site_logo && (
                <img src={`${API_BASE}${draft.site_logo}`} alt="Logo" style={{ marginTop: 12, maxHeight: 64, borderRadius: 8 }} />
              )}
            </div>
            <div className="form-group">
              <label className="label">QR code (payments)</label>
              <input type="file" accept="image/*" onChange={uploadQR} />
              {draft.qr_image && (
                <img src={`${API_BASE}${draft.qr_image}`} alt="QR" style={{ marginTop: 12, maxWidth: 160, borderRadius: 8 }} />
              )}
            </div>
          </>
        );
      case 'payments':
        return (
          <>
            <Field label="UPI ID" value={draft.upi_id} onChange={(v) => updateDraft('upi_id', v)} />
            <Field label="Razorpay Key ID" value={draft.razorpay_key_id} onChange={(v) => updateDraft('razorpay_key_id', v)} />
            <Field label="Razorpay Secret" value={draft.razorpay_key_secret} onChange={(v) => updateDraft('razorpay_key_secret', v)} type="password" />
            <Field label="Google Client ID" value={draft.google_client_id} onChange={(v) => updateDraft('google_client_id', v)} />
          </>
        );
      case 'api':
        return (
          <>
            <Field label="Default profit margin (%)" value={draft.profit_margin} onChange={(v) => updateDraft('profit_margin', v)} type="number" />
            <Field label="SMM API URL" value={draft.smm_api_url} onChange={(v) => updateDraft('smm_api_url', v)} placeholder="https://provider.com/api/v2" />
            <Field label="SMM API Key" value={draft.smm_api_key} onChange={(v) => updateDraft('smm_api_key', v)} type="password" />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Used when syncing services. Leave key blank to keep current.</p>
            <h4 style={{ marginBottom: 12 }}>API Providers</h4>
            {providers.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{p.name} {p.is_default ? '★' : ''} — {p.profit_margin}%</span>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => adminDeleteProvider(p.id).then(load)}>Delete</button>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
              <input className="input" placeholder="Provider name" value={newProvider.name} onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })} />
              <input className="input" placeholder="API URL" value={newProvider.api_url} onChange={(e) => setNewProvider({ ...newProvider, api_url: e.target.value })} />
              <input className="input" placeholder="API Key" value={newProvider.api_key} onChange={(e) => setNewProvider({ ...newProvider, api_key: e.target.value })} />
              <button type="button" className="btn btn-ghost" onClick={() => adminAddProvider(newProvider).then(load)}>+ Add provider</button>
            </div>
          </>
        );
      case 'social':
        return (
          <>
            <h3 style={{ marginBottom: 16 }}>Social links</h3>
            <Field label="Telegram link" value={draft.telegram_link} onChange={(v) => updateDraft('telegram_link', v)} placeholder="https://t.me/yourchannel" />
            <Field label="WhatsApp link" value={draft.whatsapp_link} onChange={(v) => updateDraft('whatsapp_link', v)} placeholder="https://wa.me/91..." />
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
            <h3 style={{ marginBottom: 16 }}>📱 Mobile app (Download page)</h3>
            <Field label="App version" value={draft.app_version} onChange={(v) => updateDraft('app_version', v)} placeholder="1.0.0" />
            <Field label="iOS App Store / TestFlight URL" value={draft.app_ios_url} onChange={(v) => updateDraft('app_ios_url', v)} placeholder="https://apps.apple.com/..." />
            <Field label="Legacy download link (optional)" value={draft.app_download_url} onChange={(v) => updateDraft('app_download_url', v)} />
            <div className="form-group">
              <label className="label">App description</label>
              <textarea className="textarea" rows={2} value={draft.app_description || ''} onChange={(e) => updateDraft('app_description', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Android install instructions (one step per line)</label>
              <textarea className="textarea" rows={5} value={draft.app_install_instructions || ''} onChange={(e) => updateDraft('app_install_instructions', e.target.value)} />
            </div>
            <Toggle label="Enable PWA (install web app)" checked={draft.pwa_enabled} onChange={(v) => updateDraft('pwa_enabled', v)} />
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="label">Android APK (max 150MB)</label>
              {draft.app_apk_path && (
                <p style={{ fontSize: 13, color: 'var(--success)', marginBottom: 8 }}>
                  Current: <a href={`${API_BASE}${draft.app_apk_path}`} target="_blank" rel="noreferrer">{draft.app_apk_path}</a>
                </p>
              )}
              <input type="file" accept=".apk,application/vnd.android.package-archive" onChange={async (e) => {
                if (!e.target.files[0]) return;
                const fd = new FormData();
                fd.append('apk', e.target.files[0]);
                try {
                  const res = await adminUploadApk(fd);
                  updateDraft('app_apk_path', res.data.app_apk_path);
                  updateDraft('app_download_url', res.data.app_apk_path);
                  await refreshGlobalSettings();
                  showMsg('APK uploaded');
                } catch (err) {
                  showMsg(err.response?.data?.message || 'APK upload failed', 'error');
                }
                e.target.value = '';
              }} />
            </div>
            <div className="form-group">
              <label className="label">App screenshots</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                {(draft.app_screenshots || []).map((src, i) => (
                  <div key={src} style={{ position: 'relative' }}>
                    <img src={`${API_BASE}${src}`} alt="" style={{ width: 80, height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <button type="button" className="btn btn-danger btn-sm" style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px' }} onClick={async () => {
                      try {
                        const res = await adminDeleteAppScreenshot(i);
                        updateDraft('app_screenshots', res.data.app_screenshots);
                        await refreshGlobalSettings();
                        showMsg('Screenshot removed');
                      } catch (err) {
                        showMsg(err.response?.data?.message || 'Delete failed', 'error');
                      }
                    }}>×</button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" onChange={async (e) => {
                if (!e.target.files[0]) return;
                const fd = new FormData();
                fd.append('screenshot', e.target.files[0]);
                try {
                  const res = await adminUploadAppScreenshot(fd);
                  updateDraft('app_screenshots', res.data.app_screenshots);
                  await refreshGlobalSettings();
                  showMsg('Screenshot added');
                } catch (err) {
                  showMsg(err.response?.data?.message || 'Upload failed', 'error');
                }
                e.target.value = '';
              }} />
            </div>
            <a href="/download-app" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Preview download page →</a>
          </>
        );
      case 'theme':
        return (
          <>
            <Field label="Primary color" value={draft.theme_primary} onChange={(v) => updateDraft('theme_primary', v)} type="color" />
            <Field label="Accent color" value={draft.theme_accent} onChange={(v) => updateDraft('theme_accent', v)} type="color" />
            <div className="form-group">
              <label className="label">Theme mode</label>
              <select className="select" value={draft.theme_mode || 'dark'} onChange={(e) => updateDraft('theme_mode', e.target.value)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <Field label="Currency code" value={draft.currency_code} onChange={(v) => updateDraft('currency_code', v)} placeholder="INR" />
            <Field label="Currency symbol" value={draft.currency_symbol} onChange={(v) => updateDraft('currency_symbol', v)} placeholder="₹" />
          </>
        );
      case 'announce':
        return (
          <>
            <Field label="Popup title" value={annForm.title} onChange={(v) => setAnnForm({ ...annForm, title: v })} />
            <div className="form-group">
              <label className="label">Popup content</label>
              <textarea className="textarea" rows={4} value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} />
            </div>
            <Toggle label="Active" checked={annForm.is_active} onChange={(v) => setAnnForm({ ...annForm, is_active: v })} />
            <Toggle label="Show on login" checked={annForm.show_on_login} onChange={(v) => setAnnForm({ ...annForm, show_on_login: v })} />
            <button type="button" className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => adminCreateAnnouncement(annForm).then(() => { load(); setAnnForm({ title: '', content: '', is_active: true, show_on_login: true }); showMsg('Announcement created'); })}>
              Create announcement
            </button>
            {announcements.map((a) => (
              <div key={a.id} className="card" style={{ marginBottom: 10, padding: 14 }}>
                <strong>{a.title}</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0' }}>{a.content}</p>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => adminDeleteAnnouncement(a.id).then(load)}>Delete</button>
              </div>
            ))}
          </>
        );
      case 'premium':
        return (
          <>
            <h3>Email (SMTP)</h3>
            <Field label="SMTP host" value={draft.smtp_host} onChange={(v) => updateDraft('smtp_host', v)} placeholder="smtp.gmail.com" />
            <Field label="SMTP port" value={draft.smtp_port} onChange={(v) => updateDraft('smtp_port', v)} />
            <Field label="SMTP user" value={draft.smtp_user} onChange={(v) => updateDraft('smtp_user', v)} />
            <Field label="SMTP password" value={draft.smtp_pass} onChange={(v) => updateDraft('smtp_pass', v)} type="password" />
            <Field label="From email" value={draft.smtp_from} onChange={(v) => updateDraft('smtp_from', v)} />
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
            <h3>Security & rewards</h3>
            <Toggle label="OTP on login (email)" checked={draft.otp_enabled === true || draft.otp_enabled === 'true'} onChange={(v) => updateDraft('otp_enabled', v)} />
            <Toggle label="Require email verification" checked={draft.email_verification_required === true || draft.email_verification_required === 'true'} onChange={(v) => updateDraft('email_verification_required', v)} />
            <Field label="Referral commission %" value={draft.referral_commission_percent} onChange={(v) => updateDraft('referral_commission_percent', v)} />
            <Field label="Order cashback %" value={draft.cashback_percent} onChange={(v) => updateDraft('cashback_percent', v)} />
            <Field label="Auto logout (minutes idle)" value={draft.session_timeout_minutes} onChange={(v) => updateDraft('session_timeout_minutes', v)} />
            <Field label="Default language" value={draft.default_language} onChange={(v) => updateDraft('default_language', v)} placeholder="en" />
            <Toggle label="Live chat enabled" checked={draft.live_chat_enabled !== false && draft.live_chat_enabled !== 'false'} onChange={(v) => updateDraft('live_chat_enabled', v)} />
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
            <h3>Telegram bot</h3>
            <Field label="Bot token" value={draft.telegram_bot_token} onChange={(v) => updateDraft('telegram_bot_token', v)} type="password" />
            <Field label="Admin chat ID" value={draft.telegram_admin_chat_id} onChange={(v) => updateDraft('telegram_admin_chat_id', v)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => adminTestTelegram().then(() => showMsg('Test message sent')).catch((e) => showMsg(e.response?.data?.message || 'Failed', 'error'))}>
              Test Telegram
            </button>
          </>
        );
      case 'security':
        return (
          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <h4 style={{ marginBottom: 12 }}>Change password</h4>
              <input className="input" type="password" placeholder="Current password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} style={{ marginBottom: 8 }} />
              <input className="input" type="password" placeholder="New password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} style={{ marginBottom: 8 }} />
              <button type="button" className="btn btn-ghost" onClick={() => adminChangePassword(pw).then(() => { setPw({ current_password: '', new_password: '' }); showMsg('Password updated'); })}>Update password</button>
            </div>
            <div>
              <h4 style={{ marginBottom: 12 }}>Change admin email</h4>
              <input className="input" placeholder="New email" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} style={{ marginBottom: 8 }} />
              <input className="input" type="password" placeholder="Confirm password" value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} style={{ marginBottom: 8 }} />
              <button type="button" className="btn btn-ghost" onClick={() => adminChangeEmail(emailForm).then(() => showMsg('Email updated'))}>Update email</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Changes sync to user panel every ~20s · version {draft.settings_version || '—'}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={saveAll} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save all settings'}
        </button>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="settings-admin-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {TABS.map((t) => (
              <button key={t.id} type="button" className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="card fade-in">{renderTab()}</div>
        </div>
        <SettingsLivePreview draft={draft} />
      </div>
    </AdminLayout>
  );
};

const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="form-group">
    <label className="label">{label}</label>
    {type === 'color' ? (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="color" value={value || '#6366f1'} onChange={(e) => onChange(e.target.value)} style={{ width: 48, height: 40, border: 'none', cursor: 'pointer' }} />
        <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }} />
      </div>
    ) : (
      <input className="input" type={type} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    )}
  </div>
);

function parseScreenshots(val) {
  if (Array.isArray(val)) return val;
  try {
    const arr = JSON.parse(val || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const Toggle = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="label" style={{ margin: 0 }}>{label}</span>
  </label>
);

export default AdminSettings;
