/** Website development — frontend display data */

export const CONSULTATION_FEE = 99;

export const WEBSITE_DEV_CATEGORIES = [
  { id: 'landing-page', name: 'Landing Page Website', icon: '🚀', priceMin: 5000, priceMax: 15000, deliveryTime: '5–10 days', description: 'High-converting single-page site for campaigns and lead capture.', domainInfo: 'Custom .com / .in', hostingInfo: 'Basic shared hosting', features: ['Responsive design', 'Contact form', 'WhatsApp', 'Basic SEO'] },
  { id: 'portfolio', name: 'Portfolio Website', icon: '🎨', priceMin: 10000, priceMax: 30000, deliveryTime: '7–14 days', description: 'Showcase your work and personal brand.', domainInfo: 'Personal domain', hostingInfo: 'Shared / VPS', features: ['Gallery', 'About page', 'Social links', 'Blog optional'] },
  { id: 'blog', name: 'Blog Website', icon: '✍️', priceMin: 10000, priceMax: 50000, deliveryTime: '10–15 days', description: 'Content site with CMS for articles.', domainInfo: 'Blog domain + SSL', hostingInfo: 'WordPress / CMS', features: ['Blog CMS', 'Categories', 'Newsletter', 'SEO URLs'] },
  { id: 'business', name: 'Business Website', icon: '🏢', priceMin: 15000, priceMax: 75000, deliveryTime: '10–25 days', description: 'Corporate multi-page site for services and team.', domainInfo: 'Business domain', hostingInfo: 'Cloud hosting', features: ['Multi-page', 'Services', 'Maps', 'Analytics'] },
  { id: 'school', name: 'School Website', icon: '🎓', priceMin: 20000, priceMax: 100000, deliveryTime: '15–30 days', description: 'Institution portal for admissions and notices.', domainInfo: '.edu.in / .ac.in', hostingInfo: 'Secure cloud', features: ['Admissions', 'Courses', 'Notice board', 'Gallery'] },
  { id: 'hospital', name: 'Hospital Website', icon: '🏥', priceMin: 30000, priceMax: 200000, deliveryTime: '20–40 days', description: 'Healthcare portal with doctors and appointments.', domainInfo: 'Healthcare domain', hostingInfo: 'Secure hosting', features: ['Departments', 'Doctors', 'Appointments', 'Emergency info'] },
  { id: 'real-estate', name: 'Real Estate Website', icon: '🏠', priceMin: 50000, priceMax: 500000, deliveryTime: '25–50 days', description: 'Property listings with search and leads.', domainInfo: 'Brand domain', hostingInfo: 'High-performance cloud', features: ['Listings', 'Filters', 'Agents', 'Maps'] },
  { id: 'ecommerce', name: 'E-Commerce Website', icon: '🛒', priceMin: 30000, priceMax: 500000, deliveryTime: '20–45 days', description: 'Online store with cart and payments.', domainInfo: 'Store domain', hostingInfo: 'Scalable cloud', features: ['Catalog', 'Cart', 'Payments', 'Orders'] },
  { id: 'marketplace', name: 'Multi Vendor Marketplace', icon: '🏬', priceMin: 100000, priceMax: 1000000, deliveryTime: '45–90 days', description: 'Multi-seller platform with vendor panels.', domainInfo: 'Marketplace domain', hostingInfo: 'Dedicated cloud', features: ['Vendor panels', 'Commissions', 'Reviews', 'Payouts'] },
  { id: 'custom-app', name: 'Custom Web Application', icon: '⚙️', priceMin: 100000, priceMax: 2500000, deliveryTime: '60–120 days', description: 'Custom web app with integrations.', domainInfo: 'Custom + API subdomain', hostingInfo: 'AWS / VPS', features: ['Custom UX', 'Dashboards', 'APIs', 'Database'] },
  { id: 'enterprise', name: 'Enterprise Software', icon: '🏛️', priceMin: 500000, priceMax: 5000000, deliveryTime: '90–180+ days', description: 'Enterprise systems with SLA support.', domainInfo: 'Enterprise + CDN', hostingInfo: 'Enterprise infra', features: ['Multi-language', 'Security', 'Integrations', 'SLA'] },
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
  { id: 'basic', name: 'Basic Hosting', priceYear: 2999, storage: '10 GB SSD', bandwidth: '100 GB/mo', ssl: true, backup: 'Weekly', emailAccounts: 5 },
  { id: 'business', name: 'Business Hosting', priceYear: 5999, storage: '50 GB SSD', bandwidth: '500 GB/mo', ssl: true, backup: 'Daily', emailAccounts: 25 },
  { id: 'premium', name: 'Premium Hosting', priceYear: 9999, storage: '100 GB NVMe', bandwidth: 'Unlimited', ssl: true, backup: 'Daily + offsite', emailAccounts: 50 },
  { id: 'cloud', name: 'Cloud Hosting', priceYear: 14999, storage: 'Scalable', bandwidth: 'Unlimited', ssl: true, backup: 'Real-time', emailAccounts: 'Unlimited' },
];

export const FEATURE_OPTIONS = [
  { id: 'admin_panel', label: 'Admin Panel', cost: 15000 },
  { id: 'user_login', label: 'User Login System', cost: 12000 },
  { id: 'payment_gateway', label: 'Payment Gateway', cost: 18000 },
  { id: 'whatsapp', label: 'WhatsApp Integration', cost: 3000 },
  { id: 'contact_forms', label: 'Contact Forms', cost: 2000 },
  { id: 'blog_system', label: 'Blog System', cost: 8000 },
  { id: 'seo_setup', label: 'SEO Setup', cost: 5000 },
  { id: 'multi_language', label: 'Multi Language', cost: 20000 },
  { id: 'otp_login', label: 'OTP Login', cost: 10000 },
  { id: 'android_app', label: 'Android App', cost: 80000 },
  { id: 'ios_app', label: 'iOS App', cost: 120000 },
  { id: 'api_integration', label: 'API Integration', cost: 25000 },
  { id: 'sms_integration', label: 'SMS Integration', cost: 8000 },
  { id: 'crm', label: 'CRM System', cost: 35000 },
  { id: 'inventory', label: 'Inventory Management', cost: 30000 },
  { id: 'membership', label: 'Membership System', cost: 22000 },
];

export const PROJECT_STAGES = [
  { key: 'request_submitted', label: 'Request Submitted', step: 1 },
  { key: 'requirement_review', label: 'Requirement Review', step: 2 },
  { key: 'client_discussion', label: 'Client Discussion', step: 3 },
  { key: 'quotation_sent', label: 'Quotation Sent', step: 4 },
  { key: 'approved', label: 'Approved', step: 5 },
  { key: 'design_started', label: 'Design Started', step: 6 },
  { key: 'development_started', label: 'Development Started', step: 7 },
  { key: 'testing', label: 'Testing', step: 8 },
  { key: 'final_review', label: 'Final Review', step: 9 },
  { key: 'completed', label: 'Completed', step: 10 },
];

export const PRICE_FACTORS = ['Domain', 'Hosting', 'Design', 'Development', 'Features', 'API Integration', 'Mobile App', 'Security', 'Maintenance'];

export function formatInr(n, sym = '₹') {
  if (n >= 10000000) return `${sym}${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `${sym}${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)} L`;
  return `${sym}${Number(n).toLocaleString('en-IN')}`;
}

export function formatInrRange(min, max, sym = '₹') {
  if (max >= 500000) return `${formatInr(min, sym)} – ${formatInr(max, sym)}+`;
  return `${formatInr(min, sym)} – ${formatInr(max, sym)}`;
}

export function estimateCostLocal({ categoryId, featureIds = [], domainExt, hostingId }) {
  const cat = WEBSITE_DEV_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return { min: 5000, max: 50000 };
  let min = cat.priceMin;
  let max = cat.priceMax;
  featureIds.forEach((fid) => {
    const f = FEATURE_OPTIONS.find((x) => x.id === fid);
    if (f) { min += Math.round(f.cost * 0.8); max += f.cost; }
  });
  const domain = DOMAIN_EXTENSIONS.find((d) => d.ext === domainExt);
  if (domain) { min += domain.priceYear; max += domain.priceYear * 2; }
  const hosting = HOSTING_PLANS.find((h) => h.id === hostingId);
  if (hosting) { min += hosting.priceYear; max += hosting.priceYear * 3; }
  return { min, max };
}

export function projectProgress(projectStatus) {
  const idx = PROJECT_STAGES.findIndex((s) => s.key === projectStatus);
  return idx >= 0 ? ((idx + 1) / PROJECT_STAGES.length) * 100 : 10;
}
