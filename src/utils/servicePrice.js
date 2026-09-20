/** Safe service selling price (never NaN). Prefer user-facing `price`, then custom, then original+margin. */
export function getServiceUnitPrice(service) {
  if (!service || typeof service !== 'object') return 0;
  const candidates = [
    service.price,
    service.custom_price,
    service.selling_price,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  const original = Number(service.original_price);
  const margin = Number(service.profit_margin);
  if (Number.isFinite(original) && original >= 0) {
    const pct = Number.isFinite(margin) ? margin : 50;
    return Number((original * (1 + pct / 100)).toFixed(4));
  }
  return 0;
}

export function formatServicePrice(service, digits = 2) {
  return getServiceUnitPrice(service).toFixed(digits);
}
