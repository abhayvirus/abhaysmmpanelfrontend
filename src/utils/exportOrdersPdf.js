/** Export orders to printable PDF via browser print dialog */
export function exportOrdersPdf(orders, siteName = 'SMM Panel') {
  const rows = orders.map((o) => {
    const id = o.id ?? o.order_id ?? '—';
    const charge = parseFloat(o.charge ?? o.price ?? 0).toFixed(2);
    const dateRaw = o.created_at ?? o.createdAt ?? o.date;
    const date = dateRaw ? new Date(dateRaw) : null;
    const dateStr = date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '—';
    const status = o.status || 'pending';
    return `
    <tr>
      <td>#${id}</td>
      <td>${dateStr}</td>
      <td style="max-width:180px;word-break:break-all">${escapeHtml(o.link || '')}</td>
      <td>₹${charge}</td>
      <td>${o.quantity ?? '—'}</td>
      <td>${escapeHtml(o.service_name || '')}</td>
      <td>${escapeHtml(status)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><title>Orders Export</title>
    <style>body{font-family:Inter,sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f0f0f0}</style></head>
    <body><h1>${escapeHtml(siteName)} — Orders</h1><p>Exported ${new Date().toLocaleString()}</p>
    <table><thead><tr><th>ID</th><th>Date</th><th>Link</th><th>Charge</th><th>Quantity</th><th>Service</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
