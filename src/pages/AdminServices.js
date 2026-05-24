import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetServices, adminSyncServices, adminUpdateService, adminProviderStatus } from '../api';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [editPrices, setEditPrices] = useState({});
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');

  useEffect(() => {
    loadServices();
    adminProviderStatus().then((r) => setProviderInfo(r.data)).catch((e) => {
      setProviderInfo({ connected: false, message: e.response?.data?.message });
    });
  }, []);

  const loadServices = async () => {
    const res = await adminGetServices();
    setServices(res.data);
    const prices = {};
    res.data.forEach(s => { prices[s.id] = s.custom_price; });
    setEditPrices(prices);
  };

  const handleSync = async () => {
    setSyncing(true); setSyncMsg(null);
    try {
      const res = await adminSyncServices();
      setSyncMsg({ type: 'success', text: res.data.message });
      await loadServices();
    } catch (err) {
      setSyncMsg({ type: 'error', text: 'Sync failed' });
    }
    setSyncing(false);
  };

  const handleSave = async (svc) => {
    try {
      await adminUpdateService(svc.id, { custom_price: parseFloat(editPrices[svc.id]), is_active: svc.is_active });
      alert('Saved!');
    } catch (err) { alert('Failed'); }
  };

  const toggleActive = async (svc) => {
    try {
      await adminUpdateService(svc.id, { custom_price: parseFloat(editPrices[svc.id]), is_active: !svc.is_active });
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !svc.is_active } : s));
    } catch (err) { alert('Failed'); }
  };

  const platforms = ['All', ...new Set(services.map(s => s.platform))];
  const filtered = services.filter(s =>
    (platform === 'All' || s.platform === platform) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: 8 }}>Services & API</h1>
            {providerInfo && (
              <span className={`badge ${providerInfo.connected ? 'badge-success' : 'badge-danger'}`}>
                {providerInfo.connected
                  ? `API OK · Balance: ${providerInfo.balance} ${providerInfo.currency || ''}`
                  : `API Error: ${providerInfo.message}`}
              </span>
            )}
          </div>
          <button type="button" className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing from provider...' : '🔄 Sync all services'}
          </button>
        </div>

        {syncMsg && (
          <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, background: syncMsg.type === 'success' ? '#1a3a2a' : '#3a1a1a', color: syncMsg.type === 'success' ? '#4caf50' : '#f44336' }}>
            {syncMsg.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, background: '#1a2535', border: '1px solid #2d3a50', color: '#fff', fontSize: 14, width: 250, outline: 'none' }} />
          {platforms.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              style={{ padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', background: platform === p ? '#6c63ff' : '#1a2535', color: '#fff', fontSize: 12 }}>{p}</button>
          ))}
        </div>

        <p style={{ color: '#8ca0b8', fontSize: 13, marginBottom: 16 }}>
          💡 Original = TheWorldSMM ka price | Your Price = aap apne users se lo
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                {['Service', 'Platform', 'Original/1000', 'Your Price/1000', 'Min', 'Max', 'Active', 'Save'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#8ca0b8', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(svc => (
                <tr key={svc.id} style={{ borderBottom: '1px solid #1e2a3a' }}>
                  <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{svc.name}</td>
                  <td style={td}>{svc.platform}</td>
                  <td style={{ ...td, color: '#8ca0b8' }}>₹{parseFloat(svc.original_price).toFixed(4)}</td>
                  <td style={td}>
                    <input type="number" step="0.01" value={editPrices[svc.id] || ''}
                      onChange={e => setEditPrices(prev => ({ ...prev, [svc.id]: e.target.value }))}
                      style={{ width: 90, padding: '6px 8px', borderRadius: 6, background: '#0d1520', border: '1px solid #6c63ff', color: '#6c63ff', fontWeight: 700, fontSize: 13, outline: 'none' }} />
                  </td>
                  <td style={{ ...td, fontSize: 12 }}>{svc.min_quantity}</td>
                  <td style={{ ...td, fontSize: 12 }}>{svc.max_quantity}</td>
                  <td style={td}>
                    <button onClick={() => toggleActive(svc)}
                      style={{ padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: svc.is_active ? '#1a3a2a' : '#3a1a1a', color: svc.is_active ? '#2ecc71' : '#e74c3c' }}>
                      {svc.is_active ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td style={td}>
                    <button onClick={() => handleSave(svc)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#6c63ff', color: '#fff', cursor: 'pointer', fontSize: 12 }}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </AdminLayout>
  );
};

const td = { padding: '12px 12px', fontSize: 13, color: '#d0d8e8' };

export default AdminServices;