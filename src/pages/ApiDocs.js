import React, { useState, useCallback } from 'react';
import UserLayout from '../components/UserLayout';
import ApiCodeBlock from '../components/ApiCodeBlock';
import { generateApiKey, API_BASE } from '../api';
import '../styles/apiDocsPage.css';

const ENDPOINT_URL = `${API_BASE}/api/v2`;

function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 10) return '••••••••••';
  return `${key.slice(0, 4)}${'•'.repeat(Math.min(24, key.length - 8))}${key.slice(-4)}`;
}

const EXAMPLES = [
  {
    id: 'balance',
    title: 'Balance',
    request: `{
  "key": "YOUR_API_KEY",
  "action": "balance"
}`,
    response: `{
  "balance": "1250.50",
  "currency": "INR"
}`,
  },
  {
    id: 'services',
    title: 'Services',
    request: `{
  "key": "YOUR_API_KEY",
  "action": "services"
}`,
    response: `[
  {
    "service": 1,
    "name": "Instagram Followers",
    "category": "Instagram",
    "rate": "12.50",
    "min": 100,
    "max": 10000
  }
]`,
  },
  {
    id: 'add',
    title: 'Add Order',
    request: `{
  "key": "YOUR_API_KEY",
  "action": "add",
  "service": 1,
  "link": "https://instagram.com/username",
  "quantity": 1000
}`,
    response: `{
  "order": 12345
}`,
  },
  {
    id: 'status',
    title: 'Order Status',
    request: `{
  "key": "YOUR_API_KEY",
  "action": "status",
  "order": 12345
}`,
    response: `{
  "status": "processing",
  "charge": "12.50",
  "start_count": "100",
  "remains": "900"
}`,
  },
  {
    id: 'multiple',
    title: 'Multiple Orders',
    request: `// Check each order with a separate status request
{
  "key": "YOUR_API_KEY",
  "action": "status",
  "order": 12345
}

{
  "key": "YOUR_API_KEY",
  "action": "status",
  "order": 12346
}`,
    response: `{
  "status": "completed",
  "charge": "12.50"
}`,
    note: 'Send one POST per order ID. Batch status is not supported on this endpoint.',
  },
  {
    id: 'refill',
    title: 'Refill',
    request: `{
  "key": "YOUR_API_KEY",
  "action": "refill",
  "order": 12345
}`,
    response: `{
  "refill": 1,
  "message": "Refill requested"
}`,
  },
  {
    id: 'cancel',
    title: 'Cancel',
    request: `{
  "key": "YOUR_API_KEY",
  "action": "cancel",
  "order": 12345
}`,
    response: `{
  "cancel": 1,
  "message": "Order cancelled"
}`,
  },
];

const ApiDocs = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [key, setKey] = useState(user.api_key || '');
  const [revealed, setRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const displayKey = key
    ? revealed
      ? key
      : maskApiKey(key)
    : 'Not generated yet — create a key below';

  const copyKey = useCallback(async () => {
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      /* ignore */
    }
  }, [key]);

  const doRegenerate = async () => {
    setRegenerating(true);
    setConfirmOpen(false);
    try {
      const res = await generateApiKey();
      setKey(res.data.api_key);
      setRevealed(true);
      const u = { ...user, api_key: res.data.api_key };
      localStorage.setItem('user', JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setRegenerating(false);
  };

  return (
    <UserLayout title="API Docs">
      <div className="api-docs-page">
        <header className="api-docs-page__hero">
          <h1 className="api-docs-page__title">API Documentation</h1>
          <p className="api-docs-page__subtitle">
            Reseller API v2 — integrate balance checks, services, and orders into your applications.
            All requests use <code>POST</code> with a JSON body.
          </p>
        </header>

        <section className="api-docs-section" aria-labelledby="api-endpoint-heading">
          <h2 id="api-endpoint-heading" className="api-docs-section__heading">
            Endpoint
          </h2>
          <div className="api-endpoint-card">
            <div className="api-endpoint-card__route">
              <span className="api-endpoint-card__method">POST</span>
              <span className="api-endpoint-card__path">/api/v2</span>
            </div>
            <span className="api-endpoint-card__label">URL</span>
            <a href={ENDPOINT_URL} className="api-endpoint-card__url" target="_blank" rel="noreferrer">
              {ENDPOINT_URL}
            </a>
            <p className="api-endpoint-card__note">
              Content-Type: <code>application/json</code> · Authenticate with your API key in every request body.
            </p>
          </div>
        </section>

        <section className="api-docs-section" aria-labelledby="api-key-heading">
          <h2 id="api-key-heading" className="api-docs-section__heading">
            Your API Key
          </h2>
          <div className="api-key-card">
            <div className="api-key-card__row">
              <code className="api-key-card__value">{displayKey}</code>
              <div className="api-key-card__actions">
                <button
                  type="button"
                  className="api-key-card__icon-btn"
                  onClick={() => setRevealed((v) => !v)}
                  disabled={!key}
                  aria-label={revealed ? 'Hide API key' : 'Show API key'}
                  title={revealed ? 'Hide' : 'Show'}
                >
                  {revealed ? '🙈' : '👁'}
                </button>
                <button
                  type="button"
                  className="api-key-card__icon-btn"
                  onClick={copyKey}
                  disabled={!key}
                  aria-label="Copy API key"
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>
            <div className="api-key-card__footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => (key ? setConfirmOpen(true) : doRegenerate())}
                disabled={regenerating}
              >
                {regenerating ? 'Working…' : key ? 'Regenerate key' : 'Generate API key'}
              </button>
              {copiedKey && (
                <span className="api-key-card__hint" style={{ alignSelf: 'center', margin: 0 }}>
                  Copied to clipboard
                </span>
              )}
            </div>
            <p className="api-key-card__hint">
              Keep your key secret. Regenerating invalidates the previous key immediately.
            </p>
          </div>
        </section>

        <section className="api-docs-section" aria-labelledby="api-examples-heading">
          <h2 id="api-examples-heading" className="api-docs-section__heading">
            Example requests
          </h2>
          <div className="api-docs-examples">
            {EXAMPLES.map((ex) => (
              <article key={ex.id} className="api-docs-example">
                <h4>{ex.title}</h4>
                {ex.note && (
                  <p className="api-endpoint-card__note" style={{ marginBottom: '0.5rem' }}>
                    {ex.note}
                  </p>
                )}
                <div className="api-docs-example__pair">
                  <p className="api-docs-example__label">Request</p>
                  <ApiCodeBlock code={ex.request.replace(/YOUR_API_KEY/g, key || 'YOUR_API_KEY')} />
                  <p className="api-docs-example__label">Response</p>
                  <ApiCodeBlock code={ex.response} />
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>

      {confirmOpen && (
        <div
          className="api-docs-confirm-overlay"
          role="presentation"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="api-docs-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="regen-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="regen-title">Regenerate API key?</h3>
            <p>
              Your current key will stop working immediately. Update any apps or scripts using the old key.
            </p>
            <div className="api-docs-confirm__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={doRegenerate}>
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default ApiDocs;
