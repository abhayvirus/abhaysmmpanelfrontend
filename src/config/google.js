/** Google OAuth Web Client ID (Google Cloud Console → Credentials) */
export const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export function isGoogleConfigured() {
  const id = GOOGLE_CLIENT_ID.trim();
  return Boolean(id && id.includes('.apps.googleusercontent.com') && !id.startsWith('your_'));
}
