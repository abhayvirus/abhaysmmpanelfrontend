import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetAnalytics, adminGetDailyReport, emailDailyReport } from '../api';

const BarChart = ({ data, valueKey, labelKey = 'day', color = 'var(--primary)' }) => {
  const max = Math.max(...data.map((d) => parseFloat(d[valueKey]) || 0), 1);
  return (
    <div className="mini-chart">
      {data.map((d) => (
        <div key={d[labelKey]} className="mini-chart-bar-wrap" title={`${d[labelKey]}: ${d[valueKey]}`}>
          <div className="mini-chart-bar" style={{ height: `${((parseFloat(d[valueKey]) || 0) / max) * 100}%`, background: color }} />
          <span className="mini-chart-label">{String(d[labelKey]).slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({ ordersByDay: [], depositsByDay: [], usersByDay: [], topServices: [] });
  const [report, setReport] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    adminGetAnalytics().then((r) => setAnalytics(r.data));
  }, []);

  useEffect(() => {
    adminGetDailyReport(date).then((r) => setReport(r.data));
  }, [date]);

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Analytics & Reports</h1>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Daily report</h3>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 200, marginBottom: 16 }} />
        {report && (
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{report.orders?.count || 0}</div><div className="stat-label">Orders</div></div>
            <div className="stat-card"><div className="stat-value">₹{parseFloat(report.orders?.revenue || 0).toFixed(0)}</div><div className="stat-label">Revenue</div></div>
            <div className="stat-card"><div className="stat-value">₹{parseFloat(report.deposits?.total || 0).toFixed(0)}</div><div className="stat-label">Deposits</div></div>
            <div className="stat-card"><div className="stat-value">{report.signups?.count || 0}</div><div className="stat-label">Signups</div></div>
          </div>
        )}
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => emailDailyReport(date).then(() => alert('Report sent'))}>
          Email report to admin
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h4>Orders (14 days)</h4>
          <BarChart data={analytics.ordersByDay} valueKey="orders" color="#6366f1" />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4>Deposits (14 days)</h4>
          <BarChart data={analytics.depositsByDay} valueKey="deposits" color="#22c55e" />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4>Signups (14 days)</h4>
          <BarChart data={analytics.usersByDay} valueKey="signups" color="#a855f7" />
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Top services (30 days)</h4>
        <table className="table">
          <thead><tr><th>Service</th><th>Orders</th><th>Revenue</th></tr></thead>
          <tbody>
            {analytics.topServices?.map((s, i) => (
              <tr key={i}><td>{s.name}</td><td>{s.order_count}</td><td>₹{parseFloat(s.revenue || 0).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
