import React, { useState } from 'react';
import UserLayout from '../components/UserLayout';
import { generateApiKey, API_BASE } from '../api';

const ApiDocs = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [key, setKey] = useState(user.api_key || '');
  const endpoint = `${API_BASE}/api/v2`;

  const genKey = async () => {
    const res = await generateApiKey();
    setKey(res.data.api_key);
    const u = { ...user, api_key: res.data.api_key };
    localStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <UserLayout title="API Docs">
      <div className="api-docs-page">
        <h1 style={{ marginBottom: 8 }}>API Documentation</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Reseller API v2 — integrate orders into your apps.</p>
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="card-title">Your API Key</h3>
          <code style={{ display: 'block', padding: 12, background: 'var(--bg)', borderRadius: 8, wordBreak: 'break-all' }}>
            {key || 'Not generated yet'}
          </code>
          <button type="button" className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={genKey}>
            Generate / Regenerate Key
          </button>
        </div>
        <div className="card">
          <h3 className="card-title">Endpoint</h3>
          <code style={{ display: 'block', wordBreak: 'break-all', marginBottom: 16 }}>POST {endpoint}</code>
          <h4 style={{ marginTop: 20, marginBottom: 12 }}>Actions</h4>
          <pre className="api-docs-pre">{`// Balance
{ "key": "YOUR_KEY", "action": "balance" }

// Services list
{ "key": "YOUR_KEY", "action": "services" }

// Place order
{ "key": "YOUR_KEY", "action": "add", "service": 1, "link": "https://...", "quantity": 1000 }

// Order status
{ "key": "YOUR_KEY", "action": "status", "order": 123 }`}</pre>
        </div>
      </div>
    </UserLayout>
  );
};

export default ApiDocs;
