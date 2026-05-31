/** Website development — categories, estimator, CRM statuses */

export const CONSULTATION_FEE = 99;

export const TRUST_STATS = [
  { icon: '⭐', label: '500+ Websites Delivered' },
  { icon: '⭐', label: '100+ Business Clients' },
  { icon: '⭐', label: '99% Client Satisfaction' },
  { icon: '⭐', label: 'PAN India Service' },
];

export const PROJECT_SUCCESS_RATE = 98;

export const WEBSITE_DEV_CATEGORIES = [
  { id: 'landing-page', name: 'Landing Page Website', icon: '🚀', priceMin: 5000, priceMax: 15000, deliveryTime: '5–10 days', description: 'High-converting single-page site for campaigns and lead capture.', features: ['Responsive design', 'Contact form', 'WhatsApp button', 'Basic SEO', 'Mobile optimized'] },
  { id: 'portfolio', name: 'Portfolio Website', icon: '🎨', priceMin: 10000, priceMax: 30000, deliveryTime: '7–14 days', description: 'Showcase your work, skills, and personal brand professionally.', features: ['Project gallery', 'About page', 'Social links', 'Blog optional', 'Fast loading'] },
  { id: 'business', name: 'Business Website', icon: '🏢', priceMin: 15000, priceMax: 75000, deliveryTime: '10–25 days', description: 'Multi-page corporate site for services, team, and credibility.', features: ['Multi-page layout', 'Services section', 'Google Maps', 'Analytics', 'Admin optional'] },
  { id: 'ecommerce', name: 'Ecommerce Website', icon: '🛒', priceMin: 30000, priceMax: 500000, deliveryTime: '20–45 days', description: 'Online store with cart, checkout, and order management.', features: ['Product catalog', 'Cart & checkout', 'Payment gateway', 'Order tracking', 'Inventory'] },
  { id: 'blog', name: 'Blog Website', icon: '📚', priceMin: 10000, priceMax: 50000, deliveryTime: '10–15 days', description: 'Content-focused site with CMS for articles and newsletters.', features: ['Blog CMS', 'Categories', 'Newsletter', 'Comments', 'SEO URLs'] },
  { id: 'hospital', name: 'Hospital Website', icon: '🏥', priceMin: 30000, priceMax: 200000, deliveryTime: '20–40 days', description: 'Healthcare portal with departments, doctors, and appointments.', features: ['Departments', 'Doctor profiles', 'Appointments', 'Emergency info', 'Patient resources'] },
  { id: 'hotel', name: 'Hotel Website', icon: '🏨', priceMin: 25000, priceMax: 150000, deliveryTime: '15–35 days', description: 'Hospitality site with rooms, booking, and gallery.', features: ['Room listings', 'Online booking', 'Gallery', 'Amenities', 'Reviews'] },
  { id: 'restaurant', name: 'Restaurant Website', icon: '🍽️', priceMin: 15000, priceMax: 80000, deliveryTime: '10–20 days', description: 'Food business site with menu, orders, and reservations.', features: ['Digital menu', 'Table booking', 'Gallery', 'Location map', 'WhatsApp orders'] },
  { id: 'school', name: 'School Website', icon: '🏫', priceMin: 20000, priceMax: 100000, deliveryTime: '15–30 days', description: 'Institution portal for admissions, notices, and information.', features: ['Admissions', 'Courses', 'Notice board', 'Gallery', 'Parent portal'] },
  { id: 'corporate', name: 'Corporate Website', icon: '💼', priceMin: 40000, priceMax: 300000, deliveryTime: '20–50 days', description: 'Enterprise-grade corporate presence with investor relations.', features: ['Brand pages', 'Team & leadership', 'Case studies', 'Careers', 'Multi-branch'] },
  { id: 'mobile-app', name: 'Mobile App', icon: '📱', priceMin: 80000, priceMax: 800000, deliveryTime: '45–90 days', description: 'Native or cross-platform mobile applications.', features: ['Android / iOS', 'Push notifications', 'API backend', 'App store deploy', 'Analytics'] },
  { id: 'ai-saas', name: 'AI SaaS Platform', icon: '🤖', priceMin: 150000, priceMax: 2500000, deliveryTime: '60–120 days', description: 'AI-powered SaaS with subscriptions and dashboards.', features: ['AI integrations', 'Subscriptions', 'Admin dashboard', 'API layer', 'Scalable cloud'] },
  { id: 'trading', name: 'Trading Website', icon: '📈', priceMin: 100000, priceMax: 1500000, deliveryTime: '45–90 days', description: 'Trading platforms with charts, wallets, and KYC flows.', features: ['Live charts', 'Wallet system', 'KYC module', 'Admin panel', 'Security hardened'] },
  { id: 'ott', name: 'OTT Platform', icon: '🎥', priceMin: 200000, priceMax: 3000000, deliveryTime: '90–150 days', description: 'Video streaming platform with subscriptions and DRM.', features: ['Video streaming', 'Subscriptions', 'Content CMS', 'CDN delivery', 'Mobile apps'] },
  { id: 'logistics', name: 'Logistics Website', icon: '📦', priceMin: 50000, priceMax: 500000, deliveryTime: '30–60 days', description: 'Courier and logistics tracking with driver panels.', features: ['Shipment tracking', 'Driver panel', 'Invoicing', 'API integrations', 'Notifications'] },
  { id: 'payment-gateway', name: 'Payment Gateway Website', icon: '💳', priceMin: 150000, priceMax: 2000000, deliveryTime: '60–120 days', description: 'Fintech payment solutions with compliance-ready flows.', features: ['Payment APIs', 'Merchant dashboard', 'Settlement reports', 'PCI awareness', 'Multi-gateway'] },
  { id: 'admin-dashboard', name: 'Admin Dashboard', icon: '📊', priceMin: 40000, priceMax: 600000, deliveryTime: '25–60 days', description: 'Custom admin panels and internal business tools.', features: ['Role-based access', 'Reports & charts', 'CRUD modules', 'Export data', 'API ready'] },
  { id: 'digital-marketing', name: 'Digital Marketing Website', icon: '📢', priceMin: 12000, priceMax: 120000, deliveryTime: '10–25 days', description: 'Agency or marketing service showcase with lead funnels.', features: ['Service pages', 'Case studies', 'Lead forms', 'Blog', 'SEO optimized'] },
];

export const DOMAIN_EXTENSIONS = [
  { ext: '.com', priceYear: 899 },
  { ext: '.in', priceYear: 599 },
  { ext: '.org', priceYear: 999 },
  { ext: '.net', priceYear: 899 },
  { ext: '.co.in', priceYear: 499 },
  { ext: '.shop', priceYear: 1299 },
  { ext: '.store', priceYear: 1199 },
];

export const HOSTING_PLANS = [
  { id: 'basic', name: 'Basic Hosting', priceYear: 2999 },
  { id: 'business', name: 'Business Hosting', priceYear: 5999 },
  { id: 'premium', name: 'Premium Hosting', priceYear: 9999 },
  { id: 'cloud', name: 'Cloud Hosting', priceYear: 14999 },
];

export const MAINTENANCE_PLANS = [
  { id: 'none', name: 'No Maintenance', priceYear: 0 },
  { id: 'basic', name: 'Basic Maintenance', priceYear: 5000 },
  { id: 'standard', name: 'Standard Maintenance', priceYear: 12000 },
  { id: 'premium', name: 'Premium Maintenance', priceYear: 25000 },
];

export const FEATURE_OPTIONS = [
  { id: 'custom_design', label: 'Custom Design', cost: 25000, estimatorOnly: true },
  { id: 'admin_panel', label: 'Admin Panel', cost: 15000 },
  { id: 'payment_gateway', label: 'Payment Gateway', cost: 18000 },
  { id: 'whatsapp', label: 'WhatsApp Integration', cost: 3000 },
  { id: 'google_login', label: 'Google Login', cost: 8000 },
  { id: 'otp_login', label: 'OTP Login', cost: 10000 },
  { id: 'multi_language', label: 'Multi Language', cost: 20000 },
  { id: 'android_app', label: 'Android App', cost: 80000 },
  { id: 'ios_app', label: 'iOS App', cost: 120000 },
  { id: 'seo_setup', label: 'SEO Setup', cost: 5000 },
  { id: 'api_integration', label: 'API Integration', cost: 25000 },
];

export const CRM_STATUSES = [
  { key: 'request_submitted', label: 'Pending' },
  { key: 'requirement_review', label: 'Reviewing' },
  { key: 'quotation_sent', label: 'Quotation Sent' },
  { key: 'approved', label: 'Payment Received' },
  { key: 'development_started', label: 'Development Started' },
  { key: 'testing', label: 'Testing' },
  { key: 'completed', label: 'Completed' },
  { key: 'delivered', label: 'Delivered' },
];

/** Legacy stages for progress tracking */
export const PROJECT_STAGES = CRM_STATUSES.map((s, i) => ({ ...s, step: i + 1 }));

export const PRICE_FACTORS = ['Domain', 'Hosting', 'Design', 'Development', 'Features', 'API Integration', 'Mobile App', 'Security', 'Maintenance'];

export function getCrmStatusLabel(projectStatus, status) {
  const key = projectStatus || status || 'request_submitted';
  const found = CRM_STATUSES.find((s) => s.key === key);
  if (found) return found.label;
  if (status === 'quoted') return 'Quotation Sent';
  if (status === 'pending') return 'Pending';
  return String(key).replace(/_/g, ' ');
}

export function formatInr(n, sym = '₹') {
  if (n >= 10000000) return `${sym}${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `${sym}${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)} L`;
  return `${sym}${Number(n).toLocaleString('en-IN')}`;
}

export function formatInrRange(min, max, sym = '₹') {
  if (max >= 500000) return `${formatInr(min, sym)} – ${formatInr(max, sym)}+`;
  return `${formatInr(min, sym)} – ${formatInr(max, sym)}`;
}

export function estimateCostLocal({
  categoryId,
  featureIds = [],
  domainExt,
  hostingId,
  pageCount = 5,
  customDesign = false,
  maintenanceId = 'none',
}) {
  const cat = WEBSITE_DEV_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return { min: 5000, max: 50000, estimated: 25000, developmentTime: '2–4 weeks', recommendedPlan: 'Starter' };
  let min = cat.priceMin;
  let max = cat.priceMax;
  const pages = Math.max(1, Number(pageCount) || 5);
  const pageAddon = (pages - 5) * 2500;
  if (pageAddon > 0) { min += pageAddon * 0.8; max += pageAddon; }
  if (customDesign) { min += 20000; max += 50000; }
  featureIds.forEach((fid) => {
    const f = FEATURE_OPTIONS.find((x) => x.id === fid);
    if (f) { min += Math.round(f.cost * 0.85); max += f.cost; }
  });
  const domain = DOMAIN_EXTENSIONS.find((d) => d.ext === domainExt);
  if (domain) { min += domain.priceYear; max += domain.priceYear * 2; }
  const hosting = HOSTING_PLANS.find((h) => h.id === hostingId);
  if (hosting) { min += hosting.priceYear; max += hosting.priceYear * 2; }
  const maint = MAINTENANCE_PLANS.find((m) => m.id === maintenanceId);
  if (maint?.priceYear) { min += maint.priceYear; max += maint.priceYear; }
  const estimated = Math.round((min + max) / 2);
  const developmentTime = cat.deliveryTime;
  let recommendedPlan = 'Starter';
  if (estimated >= 500000) recommendedPlan = 'Enterprise';
  else if (estimated >= 150000) recommendedPlan = 'Business Pro';
  else if (estimated >= 50000) recommendedPlan = 'Business';
  else if (estimated >= 20000) recommendedPlan = 'Growth';
  return { min, max, estimated, developmentTime, recommendedPlan };
}

export function projectProgress(projectStatus) {
  const idx = CRM_STATUSES.findIndex((s) => s.key === projectStatus);
  return idx >= 0 ? ((idx + 1) / CRM_STATUSES.length) * 100 : 10;
}

export function requestAmount(row, sym = '₹') {
  if (row?.quotation?.final_price) return formatInr(row.quotation.final_price, sym);
  if (row?.quote_amount) return formatInr(row.quote_amount, sym);
  return '—';
}
