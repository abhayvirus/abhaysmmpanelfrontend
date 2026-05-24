/** Production API — used when REACT_APP_API_URL is unset at build time */
const PRODUCTION_API = 'https://api.abhaysmmpanel.in/api';

const raw = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' ? PRODUCTION_API : 'http://localhost:5001/api'
);

export const API_URL = raw.replace(/\/$/, '');
export const API_BASE = API_URL.replace(/\/api\/?$/, '');
