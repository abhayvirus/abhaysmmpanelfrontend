/** Export orders to printable PDF via browser print dialog */
export function exportOrdersPdf(orders, siteName = 'SMM Panel') {
  const rows = orders.map((o) => `
    <tr>
      <td>#${o.id}</td>
      <td>${escapeHtml(o.service_name || '')}</td>
      <td style="max-width:180px;word-break:break-all">${escapeHtml(o.link || '')}</td>
      <td>${o.quantity}</td>
      <td>₹${parseFloat(o.price || 0).toFixed(2)}</td>
      <td>${o.status}</td>
      <td>${new Date(o.created_at).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><title>Orders Export</title>
    <style>body{font-family:Inter,sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f0f0f0}</style></head>
    <body><h1>${escapeHtml(siteName)} — Orders</h1><p>Exported ${new Date().toLocaleString()}</p>
    <table><thead><tr><th>ID</th><th>Service</th><th>Link</th><th>Qty</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
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
