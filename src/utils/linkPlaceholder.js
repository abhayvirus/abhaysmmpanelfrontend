/** Link field placeholder from service platform / name (display only). */
export function getLinkPlaceholder(platform, serviceName = '') {
  const p = String(platform || '').toLowerCase();
  const name = String(serviceName || '').toLowerCase();
  const text = `${p} ${name}`;

  if (text.includes('short') && text.includes('youtube')) {
    return 'https://youtube.com/shorts/...';
  }
  if (p.includes('youtube') || name.includes('youtube')) {
    return 'https://youtube.com/watch?v=...';
  }
  if (p.includes('instagram') || name.includes('instagram')) {
    return 'https://instagram.com/username';
  }
  if (p.includes('facebook') || name.includes('facebook')) {
    return 'https://facebook.com/profile';
  }
  if (p.includes('telegram') || name.includes('telegram')) {
    return 'https://t.me/channel';
  }
  if (p.includes('twitter') || p === 'x' || name.includes('twitter') || /\bx\b/.test(name)) {
    return 'https://x.com/username';
  }
  if (p.includes('linkedin') || name.includes('linkedin')) {
    return 'https://linkedin.com/in/username';
  }
  return 'https://instagram.com/username';
}
