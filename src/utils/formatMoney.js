/** Safe money formatting — never returns "NaN". */
export function formatMoney(value, digits = 2) {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return (0).toFixed(digits);
  return n.toFixed(digits);
}

export function parseMoney(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
