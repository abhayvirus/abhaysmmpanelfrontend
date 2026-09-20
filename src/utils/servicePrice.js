/**
 * Safe service selling price /1000.
 * Formula: provider × (1 + margin%/100) → e.g. ₹100 + 70% = ₹170
 * Zero custom_price is unset; custom≈original with margin>0 is treated as stale.
 */
function nearlyEqual(a, b, eps = 0.00005) {
  return Math.abs(a - b) <= eps;
}

export function getServiceUnitPrice(service) {
  if (!service || typeof service !== 'object') return 0;

  const original = Number(service.original_price);
  const custom = Number(
    service.custom_price != null && service.custom_price !== ''
      ? service.custom_price
      : (service.price != null ? service.price : service.selling_price)
  );
  const marginRaw = Number(service.profit_margin);
  const marginPct = Number.isFinite(marginRaw) && marginRaw >= 0 ? marginRaw : 50;

  if (Number.isFinite(original) && original > 0) {
    const computed = Number((original * (1 + marginPct / 100)).toFixed(4));
    if (!Number.isFinite(custom) || custom <= 0) return computed;
    if (marginPct > 0 && nearlyEqual(custom, original)) return computed;
    if (nearlyEqual(custom, computed, 0.00015)) return computed;
    return custom;
  }

  if (Number.isFinite(custom) && custom > 0) return custom;

  for (const c of [service.price, service.selling_price, service.rate]) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

export function formatServicePrice(service, digits = 2) {
  const n = getServiceUnitPrice(service);
  if (!(n > 0)) return '0.00';
  if (n < 1) return Number(n.toFixed(4)).toString();
  return n.toFixed(digits);
}

export function isSellableService(service) {
  return getServiceUnitPrice(service) > 0;
}

export function formatUnitPrice(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return '0.00';
  if (v < 1) return Number(v.toFixed(4)).toString();
  return v.toFixed(2);
}
