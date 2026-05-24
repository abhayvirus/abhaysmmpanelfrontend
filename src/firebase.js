import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

function isPlaceholder(value) {
  if (!value || typeof value !== 'string') return true;
  const v = value.trim();
  return (
    !v
    || v.startsWith('your_')
    || v.includes('xxxxx')
    || v === 'undefined'
  );
}

/** True when Firebase Web config is set in Frontend/.env */
export function isFirebaseConfigured() {
  return (
    !isPlaceholder(process.env.REACT_APP_FIREBASE_API_KEY)
    && !isPlaceholder(process.env.REACT_APP_FIREBASE_PROJECT_ID)
    && !isPlaceholder(process.env.REACT_APP_FIREBASE_APP_ID)
  );
}

let app = null;
let auth = null;
let googleProvider = null;

function ensureFirebase() {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp({
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    });
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return auth;
}

export function getFirebaseAuth() {
  return ensureFirebase();
}

export function getGoogleProvider() {
  ensureFirebase();
  return googleProvider;
}

export default app;
