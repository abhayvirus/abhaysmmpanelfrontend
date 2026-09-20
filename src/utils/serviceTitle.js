/**
 * Provider APIs often dump multi-line marketing text / box-drawing into `name` or `description`.
 * Keep short one-line titles for admin + user lists.
 */

const BOX_OR_RULE = /^[\s\-–—_=═─│┃┆┊\u2500-\u257F]{2,}$/;
const META_LINE = /^(🔗|🌍|⏱|⏱️|📹|✅|❌|📌|📍|ℹ️|⚡|🛒|📝|💡)/u;

function normalizeRaw(raw) {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[═─—–_]{2,}/g, ' ')
    .trim();
}

function isNoiseLine(line) {
  const l = String(line || '').trim();
  if (!l) return true;
  if (BOX_OR_RULE.test(l)) return true;
  if (META_LINE.test(l)) return true;
  if (/^(link|location|start|format|notes?)\s*:/i.test(l)) return true;
  if (/^provider\s*\[/i.test(l)) return true;
  return false;
}

/**
 * Provider APIs often dump multi-line sales copy into `name`.
 * Keep a short one-line title for lists / cards.
 */
export function cleanServiceTitle(raw, maxLen = 90) {
  const full = normalizeRaw(raw);
  if (!full) return 'Untitled service';

  const lines = full
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !isNoiseLine(l));

  let title = (lines[0] || full.split('\n')[0] || full)
    .replace(/^\+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Drop trailing "• Provider [S2]" noise when title is long
  title = title.replace(/\s*[•·]\s*Provider\s*\[[^\]]*\]\s*$/i, '').trim();

  if (title.length > maxLen) {
    title = `${title.slice(0, maxLen - 1).trim()}…`;
  }
  return title || 'Untitled service';
}

/** One-line preview for descriptions — strips ===== / emoji meta rows */
export function truncateText(raw, maxLen = 100) {
  const full = normalizeRaw(raw);
  if (!full) return '';

  const lines = full
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !isNoiseLine(l));

  let s = (lines.length ? lines.join(' · ') : full.replace(/\s+/g, ' ')).trim();
  s = s.replace(/\s+/g, ' ');
  if (!s) return '';
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 1).trim()}…`;
}

/** Prefer a clean title; never return raw multi-line provider dump */
export function displayServiceName(svc, maxLen = 90) {
  if (!svc) return 'Untitled service';
  const fromName = cleanServiceTitle(svc.name, maxLen);
  if (fromName && fromName !== 'Untitled service') return fromName;
  return cleanServiceTitle(svc.description, maxLen);
}
