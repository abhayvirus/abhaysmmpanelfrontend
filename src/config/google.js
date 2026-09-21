/** Google OAuth Web Client ID (Google Cloud Console → Credentials) */
const PRODUCTION_GOOGLE_CLIENT_ID =
  '823492481609-3isf05i8640jdang6inl3v0tmgie663r.apps.googleusercontent.com';

export const GOOGLE_CLIENT_ID = (
  process.env.REACT_APP_GOOGLE_CLIENT_ID
  || (typeof window !== 'undefined'
    && /abhaysmmpanel\.in$/i.test(window.location.hostname)
    && PRODUCTION_GOOGLE_CLIENT_ID)
  || ''
).trim();

export function isGoogleConfigured() {
  const id = GOOGLE_CLIENT_ID.trim();
  return Boolean(id && id.includes('.apps.googleusercontent.com') && !id.startsWith('your_'));
}
