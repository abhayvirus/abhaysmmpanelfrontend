/** Category icon helpers — mirrors backend categoriesSchema.iconForCategory */

export function iconForCategoryName(name) {
  const n = String(name || '').toLowerCase();
  if (n.includes('instagram')) return '📸';
  if (n.includes('youtube')) return '▶️';
  if (n.includes('tiktok')) return '🎵';
  if (n.includes('facebook')) return '👍';
  if (n.includes('twitter') || n.includes('x ')) return '🐦';
  if (n.includes('telegram')) return '✈️';
  if (n.includes('whatsapp')) return '💬';
  if (n.includes('spotify')) return '🎧';
  if (n.includes('linkedin')) return '💼';
  if (n.includes('snapchat')) return '👻';
  if (n.includes('pinterest')) return '📌';
  if (n.includes('discord')) return '🎮';
  if (n.includes('twitch')) return '📺';
  if (n.includes('reddit')) return '🤖';
  if (n.includes('threads')) return '🧵';
  return '📱';
}

export function resolveCategoryIcon(name, icon) {
  const s = String(icon || '').trim();
  if (!s || s === '?' || s === '??' || s.includes('\uFFFD') || s === '�') {
    return iconForCategoryName(name);
  }
  return s;
}
