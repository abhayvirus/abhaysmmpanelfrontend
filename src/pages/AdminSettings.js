import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import SettingsLivePreview from '../components/SettingsLivePreview';
import FileUploadZone from '../components/FileUploadZone';
import { PAYMENT_METHODS } from '../config/paymentMethods';
import {
  adminGetSettings,
  adminUpdateSettings,
  adminUploadQR,
  adminUploadLogo,
  adminDeleteQR,
  adminDeleteLogo,
  adminUploadApk,
  adminDeleteApk,
  adminUploadAppScreenshot,
  adminDeleteAppScreenshot,
  adminChangePassword,
  adminChangeEmail,
  adminGetProviders,
  adminAddProvider,
  adminDeleteProvider,
  adminGetAnnouncements,
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminTestTelegram,
  adminGetTelegramStatus,
  adminTestConnection,
  API_BASE,
} from '../api';
import { useSettings, applyThemeToDocument } from '../contexts/SettingsContext';
import ThemeSettingsPanel from '../components/ThemeSettingsPanel';
import AdminUserControlPanel from '../components/admin/AdminUserControlPanel';
import { DEFAULT_THEME, mergeTheme } from '../theme/themeConfig';
import '../styles/adminUserControl.css';

const TABS = [
  { id: 'general', label: 'General', icon: '🏠' },
  { id: 'users', label: 'User Control', icon: '👤' },
  { id: 'branding', label: 'Branding', icon: '🎨' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'api', label: 'API & Profit', icon: '🔌' },
  { id: 'social', label: 'Social', icon: '🔗' },
  { id: 'mobile', label: 'Mobile App', icon: '📱' },
  { id: 'theme', label: 'Theme', icon: '🌙' },
  { id: 'announce', label: 'Popups', icon: '📢' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'telegram', label: 'Telegram', icon: '📲' },
  { id: 'premium', label: 'Premium', icon: '✨' },
];

const DEFAULT_PAYMENT_IDS = PAYMENT_METHODS.map((m) => m.id);
const TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai'];

const parseScreenshots = (val) => {
  if (Array.isArray(val)) return val;
  try {
    const arr = JSON.parse(val || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const isOn = (draft, key) => draft[key] === true || draft[key] === 'true';
const isFeatureOn = (draft, key) => draft[key] !== 'false' && draft[key] !== false;
const setBool = (updateDraft, key, v) => updateDraft(key, v ? 'true' : 'false');

const AdminSettings = () => {
  const { refresh: refreshGlobalSettings } = useSettings();
  const [tab, setTab] = useState('general');
  const [draft, setDraft] = useState({});
  const [providers, setProviders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [pw, setPw] = useState({ current_password: '', new_password: '' });
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [newProvider, setNewProvider] = useState({ name: '', api_url: '', api_key: '', profit_margin: 50, is_default: true });
  const [annForm, setAnnForm] = useState({ title: '', content: '', is_active: true, show_on_login: true });
  const [apiStatus, setApiStatus] = useState(null);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [themeResetOpen, setThemeResetOpen] = useState(false);

  const updateDraft = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const applyThemeDraft = (patch) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      applyThemeToDocument(mergeTheme(next));
      return next;
    });
  };

  const resetThemeToDefault = () => {
    applyThemeDraft(DEFAULT_THEME);
    setThemeResetOpen(false);
    showMsg('✅ Theme reset successfully');
  };

  const load = useCallback(async () => {
    const [s, p, a] = await Promise.all([
      adminGetSettings(),
      adminGetProviders(),
      adminGetAnnouncements(),
    ]);
    const paymentIds = Array.isArray(s.data.payment_methods_enabled) && s.data.payment_methods_enabled.length
      ? s.data.payment_methods_enabled
      : DEFAULT_PAYMENT_IDS;
    setDraft({
      ...s.data,
      app_screenshots: parseScreenshots(s.data.app_screenshots),
      pwa_enabled: s.data.pwa_enabled !== 'false',
      payment_methods_enabled: paymentIds,
    });
    setProviders(p.data);
    setAnnouncements(a.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    applyThemeToDocument(mergeTheme(draft));
  }, [
    draft.theme_mode,
    draft.theme_primary,
    draft.theme_accent,
    draft.theme_button,
    draft.theme_bg,
    draft.theme_card,
    draft.theme_text,
    draft.theme_border,
    draft.theme_success,
    draft.theme_warning,
    draft.theme_danger,
  ]);

  const loadTelegramStatus = useCallback(() => {
    adminGetTelegramStatus()
      .then((r) => setTelegramStatus(r.data))
      .catch(() => setTelegramStatus({ connected: false, configured: false }));
  }, []);

  useEffect(() => {
    if (tab === 'telegram') loadTelegramStatus();
  }, [tab, loadTelegramStatus]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4500);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const bool = (k) => (isOn(draft, k) ? 'true' : 'false');
      const res = await adminUpdateSettings({
        ...draft,
        maintenance_mode: bool('maintenance_mode'),
        pwa_enabled: bool('pwa_enabled'),
        otp_enabled: bool('otp_enabled'),
        email_verification_required: bool('email_verification_required'),
        live_chat_enabled: bool('live_chat_enabled'),
        enable_2fa: bool('enable_2fa'),
        feature_referrals: isFeatureOn(draft, 'feature_referrals') ? 'true' : 'false',
        feature_child_panel: isFeatureOn(draft, 'feature_child_panel') ? 'true' : 'false',
        feature_coupons: isFeatureOn(draft, 'feature_coupons') ? 'true' : 'false',
        feature_rewards: isFeatureOn(draft, 'feature_rewards') ? 'true' : 'false',
        feature_premium: isFeatureOn(draft, 'feature_premium') ? 'true' : 'false',
        feature_custom_branding: isFeatureOn(draft, 'feature_custom_branding') ? 'true' : 'false',
        payment_methods_enabled: draft.payment_methods_enabled || DEFAULT_PAYMENT_IDS,
      });
      await refreshGlobalSettings();
      applyThemeToDocument(mergeTheme(draft));
      const themeMsg = tab === 'theme'
        ? '✅ Theme updated successfully. Changes applied globally.'
        : 'Settings saved successfully';
      showMsg(themeMsg);
      updateDraft('settings_version', res.data.settings_version);
    } catch (e) {
      showMsg(e.response?.data?.message || 'Save failed', 'error');
    }
    setSaving(false);
  };

  const uploadLogoFile = async (file) => {
    const fd = new FormData();
    fd.append('logo', file);
    const r = await adminUploadLogo(fd);
    updateDraft('site_logo', r.data.site_logo);
    await refreshGlobalSettings();
    showMsg('Logo uploaded');
  };

  const uploadQRFile = async (file) => {
    const fd = new FormData();
    fd.append('qr', file);
    const r = await adminUploadQR(fd);
    updateDraft('qr_image', r.data.qr_image);
    await refreshGlobalSettings();
    showMsg('QR code uploaded');
  };

  const togglePaymentMethod = (id) => {
    const cur = draft.payment_methods_enabled || DEFAULT_PAYMENT_IDS;
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    updateDraft('payment_methods_enabled', next.length ? next : [id]);
  };

  const testApi = () => {
    adminTestConnection()
      .then((r) => setApiStatus({
        ok: r.data.connected,
        message: r.data.message,
        balance: r.data.balance,
        reasonCode: r.data.reasonCode,
      }))
      .catch((e) => setApiStatus({ ok: false, message: e.response?.data?.message || 'Test failed' }));
  };

  const testTelegram = () => {
    setTelegramTesting(true);
    adminTestTelegram()
      .then(() => {
        showMsg('Test notification sent to Telegram');
        loadTelegramStatus();
      })
      .catch((e) => showMsg(e.response?.data?.message || 'Telegram test failed', 'error'))
      .finally(() => setTelegramTesting(false));
  };

  const renderTab = () => {
    switch (tab) {
      case 'general':
        return (
          <>
            <Field label="Website name" value={draft.site_name} onChange={(v) => updateDraft('site_name', v)} />
            <Field label="Website URL" value={draft.site_url} onChange={(v) => updateDraft('site_url', v)} placeholder="https://abhaysmmpanel.in" />
            <Field label="Tagline" value={draft.site_tagline} onChange={(v) => updateDraft('site_tagline', v)} />
            <Field label="Currency code" value={draft.currency_code} onChange={(v) => updateDraft('currency_code', v)} placeholder="INR" />
            <Field label="Currency symbol" value={draft.currency_symbol} onChange={(v) => updateDraft('currency_symbol', v)} placeholder="₹" />
            <Field label="Support email" value={draft.support_email} onChange={(v) => updateDraft('support_email', v)} />
            <Field label="Support WhatsApp" value={draft.whatsapp_link} onChange={(v) => updateDraft('whatsapp_link', v)} placeholder="https://wa.me/91..." />
            <Field label="Telegram link" value={draft.telegram_link} onChange={(v) => updateDraft('telegram_link', v)} placeholder="https://t.me/..." />
            <div className="form-group">
              <label className="label">Timezone</label>
              <select className="select" value={draft.timezone || 'Asia/Kolkata'} onChange={(e) => updateDraft('timezone', e.target.value)}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <Toggle label="Maintenance mode" checked={isOn(draft, 'maintenance_mode')} onChange={(v) => setBool(updateDraft, 'maintenance_mode', v)} />
          </>
        );
      case 'branding':
        return (
          <>
            <FileUploadZone
              label="Site logo"
              accept="image/*"
              previewUrl={draft.site_logo ? `${API_BASE}${draft.site_logo}` : null}
              onUpload={uploadLogoFile}
              onRemove={async () => {
                await adminDeleteLogo();
                updateDraft('site_logo', '');
                await refreshGlobalSettings();
                showMsg('Logo removed');
              }}
              hint="PNG, JPG, SVG · max 10MB"
            />
            <FileUploadZone
              label="QR payment image"
              accept="image/*"
              previewUrl={draft.qr_image ? `${API_BASE}${draft.qr_image}` : null}
              onUpload={uploadQRFile}
              onRemove={async () => {
                await adminDeleteQR();
                updateDraft('qr_image', '');
                await refreshGlobalSettings();
                showMsg('QR removed');
              }}
              hint="Shown for manual UPI / QR payments"
            />
          </>
        );
      case 'payments':
        return (
          <>
            <Field label="UPI ID (manual)" value={draft.upi_id} onChange={(v) => updateDraft('upi_id', v)} />
            <Field label="Razorpay Key ID" value={draft.razorpay_key_id} onChange={(v) => updateDraft('razorpay_key_id', v)} />
            <Field label="Razorpay Secret" value={draft.razorpay_key_secret} onChange={(v) => updateDraft('razorpay_key_secret', v)} type="password" />
            <Field label="Webhook secret" value={draft.razorpay_webhook_secret} onChange={(v) => updateDraft('razorpay_webhook_secret', v)} type="password" />
            <Field label="Google Client ID" value={draft.google_client_id} onChange={(v) => updateDraft('google_client_id', v)} />
            <h3 className="admin-settings-section-title">Enabled payment methods</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Controls which options users see on Add Funds (Razorpay checkout).
            </p>
            <div className="admin-settings-payment-grid">
              {PAYMENT_METHODS.map((m) => (
                <Toggle
                  key={m.id}
                  label={m.label}
                  checked={(draft.payment_methods_enabled || DEFAULT_PAYMENT_IDS).includes(m.id)}
                  onChange={() => togglePaymentMethod(m.id)}
                />
              ))}
            </div>
          </>
        );
      case 'api':
        return (
          <>
            {apiStatus && (
              <div className={`admin-settings-api-status admin-settings-api-status--${apiStatus.ok ? 'ok' : 'err'}`}>
                {apiStatus.ok ? '● Connected' : '● Disconnected'}
                {apiStatus.balance != null && ` · Balance: ${apiStatus.balance}`}
                {apiStatus.reasonCode && ` [${apiStatus.reasonCode}]`}
                {apiStatus.message && ` — ${apiStatus.message}`}
              </div>
            )}
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={testApi}>
              Test API connection
            </button>
            <Field label="Global profit margin (%)" value={draft.profit_margin} onChange={(v) => updateDraft('profit_margin', v)} type="number" />
            <Field label="Provider API URL" value={draft.smm_api_url} onChange={(v) => updateDraft('smm_api_url', v)} placeholder="https://provider.com/api/v2" />
            <Field label="Provider API Key" value={draft.smm_api_key} onChange={(v) => updateDraft('smm_api_key', v)} type="password" />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Sync services from Admin → Services. Leave key blank when saving to keep the current key.
            </p>
            <h3 className="admin-settings-section-title">API providers</h3>
            {providers.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 8, flexWrap: 'wrap' }}>
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
            <h3 className="admin-settings-section-title">Social links</h3>
            <Field label="Facebook page URL" value={draft.facebook_link} onChange={(v) => updateDraft('facebook_link', v)} />
            <Field label="Instagram profile URL" value={draft.instagram_link} onChange={(v) => updateDraft('instagram_link', v)} placeholder="https://instagram.com/abhay_d95" />
            <Field label="Instagram username" value={draft.instagram_username} onChange={(v) => updateDraft('instagram_username', v)} placeholder="@abhay_d95" />
            <Field label="Instagram profile image URL" value={draft.instagram_profile_image} onChange={(v) => updateDraft('instagram_profile_image', v)} placeholder="https://… or /uploads/…" />
            <Field label="YouTube channel URL" value={draft.youtube_link} onChange={(v) => updateDraft('youtube_link', v)} />
            <Field label="LinkedIn profile URL" value={draft.linkedin_link} onChange={(v) => updateDraft('linkedin_link', v)} />
            <Field label="Telegram channel URL" value={draft.telegram_link} onChange={(v) => updateDraft('telegram_link', v)} />
            <Field label="WhatsApp (direct)" value={draft.whatsapp_link} onChange={(v) => updateDraft('whatsapp_link', v)} />
            <Field label="WhatsApp Community URL" value={draft.whatsapp_community_link} onChange={(v) => updateDraft('whatsapp_community_link', v)} />
            <Field label="Play Store link (optional)" value={draft.play_store_url} onChange={(v) => updateDraft('play_store_url', v)} />

            <h3 className="admin-settings-section-title" style={{ marginTop: 24 }}>Social proof counters (landing page)</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Enter raw numbers (e.g. 13200). The landing page animates and displays them as 13.2K+ automatically.
            </p>
            <Field label="Instagram followers" value={draft.social_instagram_followers} onChange={(v) => updateDraft('social_instagram_followers', v)} placeholder="13200" />
            <Field label="YouTube subscribers" value={draft.social_youtube_subscribers} onChange={(v) => updateDraft('social_youtube_subscribers', v)} placeholder="2500" />
            <Field label="LinkedIn followers" value={draft.social_linkedin_followers} onChange={(v) => updateDraft('social_linkedin_followers', v)} placeholder="1200" />
            <Field label="Facebook followers" value={draft.social_facebook_followers} onChange={(v) => updateDraft('social_facebook_followers', v)} placeholder="3500" />
          </>
        );
      case 'mobile':
        return (
          <>
            <div className="admin-mobile-stats card" style={{ padding: 16, marginBottom: 20 }}>
              <h3 className="admin-settings-section-title" style={{ marginTop: 0 }}>Download analytics</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
                Total APK downloads: <strong style={{ color: 'var(--text)' }}>{draft.app_apk_download_count || '0'}</strong>
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
                Latest download:{' '}
                <strong style={{ color: 'var(--text)' }}>
                  {draft.app_apk_last_download_at
                    ? new Date(draft.app_apk_last_download_at).toLocaleString()
                    : 'Never'}
                </strong>
              </p>
            </div>

            <Field
              label="Android APK URL"
              value={draft.app_android_apk_url}
              onChange={(v) => updateDraft('app_android_apk_url', v)}
              placeholder="https://… or leave empty and upload APK below"
            />
            <Field
              label="Android APK version"
              value={draft.app_version}
              onChange={(v) => updateDraft('app_version', v)}
              placeholder="1.0.0"
            />
            <Field
              label="iOS App Store URL"
              value={draft.app_ios_url}
              onChange={(v) => updateDraft('app_ios_url', v)}
              placeholder="https://apps.apple.com/…"
            />
            <div className="form-group">
              <label className="label">App update notes</label>
              <textarea
                className="textarea"
                rows={3}
                value={draft.app_update_notes || ''}
                onChange={(e) => updateDraft('app_update_notes', e.target.value)}
                placeholder="Release notes for the mobile app (optional)"
              />
            </div>

            <div className="form-group">
              <label className="label">Upload APK (.apk only)</label>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                File is stored in uploads/apk/ and a public download URL is generated automatically.
              </p>
              {draft.app_apk_path && (
                <div style={{ marginBottom: 12, fontSize: 13 }}>
                  <span className="badge badge-success">Hosted on server</span>
                  <a href={`${API_BASE}${draft.app_apk_path}`} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>
                    {draft.app_apk_path}
                  </a>
                  {draft.app_apk_size_bytes && (
                    <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
                      ({(Number(draft.app_apk_size_bytes) / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                      if (!window.confirm('Remove hosted APK from server?')) return;
                      await adminDeleteApk();
                      updateDraft('app_apk_path', '');
                      updateDraft('app_apk_size_bytes', '');
                      if (String(draft.app_android_apk_url || '').startsWith(API_BASE)) {
                        updateDraft('app_android_apk_url', '');
                      }
                      showMsg('Hosted APK removed');
                    }}
                  >
                    Remove file
                  </button>
                </div>
              )}
              <input
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                className="input"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.name.toLowerCase().endsWith('.apk')) {
                    alert('Only .apk files are allowed');
                    e.target.value = '';
                    return;
                  }
                  const fd = new FormData();
                  fd.append('apk', file);
                  try {
                    const res = await adminUploadApk(fd);
                    updateDraft('app_apk_path', res.data.app_apk_path);
                    updateDraft('app_android_apk_url', res.data.app_android_apk_url);
                    updateDraft('app_apk_size_bytes', String(res.data.app_apk_size_bytes || ''));
                    showMsg('APK uploaded — URL updated');
                  } catch (err) {
                    alert(err.response?.data?.message || 'Upload failed');
                  }
                  e.target.value = '';
                }}
              />
            </div>

            <div className="form-group">
              <label className="label">App description</label>
              <textarea className="textarea" rows={2} value={draft.app_description || ''} onChange={(e) => updateDraft('app_description', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Install instructions (one step per line)</label>
              <textarea className="textarea" rows={4} value={draft.app_install_instructions || ''} onChange={(e) => updateDraft('app_install_instructions', e.target.value)} />
            </div>
            <Toggle label="Enable PWA install prompt" checked={draft.pwa_enabled} onChange={(v) => updateDraft('pwa_enabled', v)} />

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="label">App screenshots</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                {(parseScreenshots(draft.app_screenshots)).map((src, i) => (
                  <div key={src} style={{ position: 'relative' }}>
                    <img src={`${API_BASE}${src}`} alt="" style={{ width: 72, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <button type="button" className="btn btn-danger btn-sm" style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px' }} onClick={async () => {
                      const res = await adminDeleteAppScreenshot(i);
                      updateDraft('app_screenshots', res.data.app_screenshots);
                      showMsg('Screenshot removed');
                    }}>×</button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" className="input" onChange={async (e) => {
                if (!e.target.files[0]) return;
                const fd = new FormData();
                fd.append('screenshot', e.target.files[0]);
                const res = await adminUploadAppScreenshot(fd);
                updateDraft('app_screenshots', res.data.app_screenshots);
                showMsg('Screenshot added');
                e.target.value = '';
              }} />
            </div>
          </>
        );
      case 'theme':
        return (
          <ThemeSettingsPanel
            draft={draft}
            updateDraft={updateDraft}
            onApplyPreview={(t) => applyThemeToDocument(t)}
            onRequestReset={() => setThemeResetOpen(true)}
          />
        );
      case 'users':
        return (
          <AdminUserControlPanel onToast={(text, type = 'success') => showMsg(text, type)} />
        );
      case 'announce':
        return (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Global popups for all users. For one user only, use the <strong>User Control</strong> tab.
            </p>
            <Field label="Popup button text" value={draft.popup_button_text} onChange={(v) => updateDraft('popup_button_text', v)} placeholder="Learn more" />
            <Field label="Popup button URL" value={draft.popup_button_url} onChange={(v) => updateDraft('popup_button_url', v)} placeholder="https://..." />
            <Field label="Popup image URL" value={draft.popup_image} onChange={(v) => updateDraft('popup_image', v)} placeholder="/uploads/..." />
            <hr className="admin-settings-divider" />
            <Field label="Announcement title" value={annForm.title} onChange={(v) => setAnnForm({ ...annForm, title: v })} />
            <div className="form-group">
              <label className="label">Announcement message</label>
              <textarea className="textarea" rows={4} value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} />
            </div>
            <Toggle label="Active" checked={annForm.is_active} onChange={(v) => setAnnForm({ ...annForm, is_active: v })} />
            <Toggle label="Show on login" checked={annForm.show_on_login} onChange={(v) => setAnnForm({ ...annForm, show_on_login: v })} />
            <button type="button" className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => adminCreateAnnouncement(annForm).then(() => {
              load();
              setAnnForm({ title: '', content: '', is_active: true, show_on_login: true });
              showMsg('Popup created');
            })}>
              Create popup
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
      case 'security':
        return (
          <>
            <Toggle label="Enable 2FA (stored preference)" checked={isOn(draft, 'enable_2fa')} onChange={(v) => setBool(updateDraft, 'enable_2fa', v)} />
            <Field label="Login attempt limit" value={draft.login_attempt_limit} onChange={(v) => updateDraft('login_attempt_limit', v)} type="number" placeholder="5" />
            <Field label="Session timeout (minutes)" value={draft.session_timeout_minutes} onChange={(v) => updateDraft('session_timeout_minutes', v)} type="number" />
            <Field label="Admin IP whitelist (comma-separated)" value={draft.admin_ip_whitelist} onChange={(v) => updateDraft('admin_ip_whitelist', v)} placeholder="1.2.3.4, 5.6.7.8" />
            <hr className="admin-settings-divider" />
            <h3 className="admin-settings-section-title">Change admin password</h3>
            <input className="input" type="password" placeholder="Current password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} style={{ marginBottom: 8 }} />
            <input className="input" type="password" placeholder="New password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} style={{ marginBottom: 8 }} />
            <button type="button" className="btn btn-ghost" onClick={() => adminChangePassword(pw).then(() => { setPw({ current_password: '', new_password: '' }); showMsg('Password updated'); })}>
              Update password
            </button>
            <hr className="admin-settings-divider" />
            <h3 className="admin-settings-section-title">Change admin email</h3>
            <input className="input" placeholder="New email" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} style={{ marginBottom: 8 }} />
            <input className="input" type="password" placeholder="Confirm password" value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} style={{ marginBottom: 8 }} />
            <button type="button" className="btn btn-ghost" onClick={() => adminChangeEmail(emailForm).then(() => showMsg('Email updated'))}>
              Update email
            </button>
          </>
        );
      case 'telegram':
        return (
          <>
            <h3 className="admin-settings-section-title">Telegram Notifications</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Real-time admin alerts via Telegram Bot API. Environment variables on Render take priority over saved fields below.
            </p>
            <div className="admin-settings-status-row" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span className="label">Connection status</span>
              <span
                className={`badge ${telegramStatus?.connected ? 'badge-success' : 'badge-warning'}`}
              >
                {telegramStatus?.connected ? '● Connected' : '○ Not Connected'}
              </span>
              {telegramStatus?.source && telegramStatus.source !== 'none' && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  ({telegramStatus.source === 'env' ? 'from env vars' : 'from database'})
                </span>
              )}
            </div>
            <Field
              label="Bot Token"
              value={draft.telegram_bot_token}
              onChange={(v) => updateDraft('telegram_bot_token', v)}
              type="password"
              placeholder={telegramStatus?.envTokenSet ? 'Set via TELEGRAM_BOT_TOKEN env' : '123456789:ABC...'}
            />
            <Field
              label="Chat ID"
              value={draft.telegram_admin_chat_id}
              onChange={(v) => updateDraft('telegram_admin_chat_id', v)}
              placeholder={telegramStatus?.envChatIdSet ? 'Set via TELEGRAM_CHAT_ID env' : '5572416825'}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, marginBottom: 16 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={testTelegram} disabled={telegramTesting}>
                {telegramTesting ? 'Sending…' : 'Send Test Notification'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={loadTelegramStatus}>
                Refresh status
              </button>
            </div>
            <hr className="admin-settings-divider" />
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>Active notification events</h4>
            <ul style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
              <li>New user registration · User login · Add funds request</li>
              <li>Successful Razorpay payment · Failed payment</li>
              <li>New order · Completed · Cancelled · Refunded</li>
              <li>Website development order · Child panel · Support ticket</li>
              <li>Referral signup · Referral commission · Admin login</li>
            </ul>
          </>
        );
      case 'premium':
        return (
          <>
            <h3 className="admin-settings-section-title">Feature toggles</h3>
            <div className="admin-settings-toggle-grid">
              <Toggle label="Enable referrals" checked={isFeatureOn(draft, 'feature_referrals')} onChange={(v) => setBool(updateDraft, 'feature_referrals', v)} />
              <Toggle label="Enable child panel" checked={isFeatureOn(draft, 'feature_child_panel')} onChange={(v) => setBool(updateDraft, 'feature_child_panel', v)} />
              <Toggle label="Enable coupons" checked={isFeatureOn(draft, 'feature_coupons')} onChange={(v) => setBool(updateDraft, 'feature_coupons', v)} />
              <Toggle label="Enable rewards / cashback" checked={isFeatureOn(draft, 'feature_rewards')} onChange={(v) => setBool(updateDraft, 'feature_rewards', v)} />
              <Toggle label="Premium features" checked={isFeatureOn(draft, 'feature_premium')} onChange={(v) => setBool(updateDraft, 'feature_premium', v)} />
              <Toggle label="Custom branding" checked={isFeatureOn(draft, 'feature_custom_branding')} onChange={(v) => setBool(updateDraft, 'feature_custom_branding', v)} />
              <Toggle label="Live chat" checked={isOn(draft, 'live_chat_enabled')} onChange={(v) => setBool(updateDraft, 'live_chat_enabled', v)} />
            </div>
            <hr className="admin-settings-divider" />
            <Field label="Referral commission %" value={draft.referral_commission_percent} onChange={(v) => updateDraft('referral_commission_percent', v)} type="number" />
            <Field label="Order cashback %" value={draft.cashback_percent} onChange={(v) => updateDraft('cashback_percent', v)} type="number" />
            <Toggle label="OTP on login" checked={isOn(draft, 'otp_enabled')} onChange={(v) => setBool(updateDraft, 'otp_enabled', v)} />
            <Toggle label="Require email verification" checked={isOn(draft, 'email_verification_required')} onChange={(v) => setBool(updateDraft, 'email_verification_required', v)} />
            <Field label="Default language" value={draft.default_language} onChange={(v) => updateDraft('default_language', v)} />
            <hr className="admin-settings-divider" />
            <h3 className="admin-settings-section-title">Email (SMTP)</h3>
            <Field label="SMTP host" value={draft.smtp_host} onChange={(v) => updateDraft('smtp_host', v)} />
            <Field label="SMTP port" value={draft.smtp_port} onChange={(v) => updateDraft('smtp_port', v)} />
            <Field label="SMTP user" value={draft.smtp_user} onChange={(v) => updateDraft('smtp_user', v)} />
            <Field label="SMTP password" value={draft.smtp_pass} onChange={(v) => updateDraft('smtp_pass', v)} type="password" />
            <Field label="From email" value={draft.smtp_from} onChange={(v) => updateDraft('smtp_from', v)} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="admin-settings-page">
        <div className="admin-settings-top">
          <div>
            <h1 className="admin-page-title" style={{ marginBottom: 4 }}>Settings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
              Saves to database · syncs to user panel · v{draft.settings_version || '—'}
            </p>
          </div>
          <div className="admin-settings-top-actions">
            {tab === 'theme' && (
              <button type="button" className="btn btn-ghost" onClick={() => setThemeResetOpen(true)}>
                🔄 Reset Theme
              </button>
            )}
            <button type="button" className="btn btn-primary admin-settings-save-btn" onClick={saveAll} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save All Settings'}
            </button>
          </div>
        </div>

        {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

        {themeResetOpen && (
          <div className="theme-modal-overlay" role="presentation" onClick={() => setThemeResetOpen(false)}>
            <div className="theme-modal card" role="dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Reset all colors to default theme?</h3>
              <p>This restores ABHAYSMM default colors in the preview. Save settings to apply globally for all users.</p>
              <div className="theme-modal__actions">
                <button type="button" className="btn btn-ghost" onClick={() => setThemeResetOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={resetThemeToDefault}>Reset</button>
              </div>
            </div>
          </div>
        )}

        <div className="admin-settings-layout">
          <div className="settings-admin-preview admin-settings-preview-col">
            <SettingsLivePreview draft={draft} />
          </div>
          <div className="admin-settings-main">
            <nav className="admin-settings-tabs" aria-label="Settings sections">
              {TABS.map((t) => (
                <button key={t.id} type="button" className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </nav>
            <div className="card admin-settings-form-card fade-in">{renderTab()}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="form-group">
    <label className="label">{label}</label>
    {type === 'color' ? (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="color" value={value || '#6366f1'} onChange={(e) => onChange(e.target.value)} style={{ width: 48, height: 40, border: 'none', cursor: 'pointer' }} />
        <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
      </div>
    ) : (
      <input className="input" type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    )}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }}>
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="label" style={{ margin: 0 }}>{label}</span>
  </label>
);

export default AdminSettings;
