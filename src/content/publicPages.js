/** Shared public marketing content + contact */

export const SUPPORT_WHATSAPP = {
  display: '6307048631',
  e164: '916307048631',
  get waUrl() {
    return `https://wa.me/${this.e164}`;
  },
  get telUrl() {
    return `tel:+${this.e164}`;
  },
};

export const PUBLIC_SERVICES_CONTENT = {
  title: 'Our SMM Services',
  subtitle:
    'Grow Instagram, YouTube, Facebook, Telegram, and more with fast delivery and wallet-based pricing on ABHAYSMM PANEL.',
  intro:
    'ABHAYSMM PANEL offers a wide catalog of social media marketing services. Browse platforms after login, compare rates, and place orders from your wallet balance.',
  platforms: [
    {
      name: 'Instagram',
      items: ['Followers', 'Likes', 'Views', 'Reels Views', 'Comments', 'Story Views'],
    },
    {
      name: 'YouTube',
      items: ['Subscribers', 'Views', 'Likes', 'Watch Time / Hours', 'Comments'],
    },
    {
      name: 'Facebook',
      items: ['Page Likes', 'Post Likes', 'Followers', 'Video Views'],
    },
    {
      name: 'Telegram',
      items: ['Members', 'Post Views', 'Reactions'],
    },
    {
      name: 'Other platforms',
      items: ['Twitter / X', 'TikTok', 'LinkedIn', 'and more as listed in the panel'],
    },
  ],
  notes: [
    'Exact services, rates, and min/max quantities are shown live inside the Services page after you log in.',
    'Always use a valid public link and stay within the service limits.',
    'Start with a small test order before placing large quantities.',
  ],
};

export const PUBLIC_PRICING_CONTENT = {
  title: 'Pricing',
  subtitle: 'Simple prepaid wallet — pay only for what you order.',
  sections: [
    {
      heading: 'How pricing works',
      body: [
        'Create a free account on ABHAYSMM PANEL.',
        'Add funds to your wallet using Razorpay (UPI, cards, netbanking, and more).',
        'Each service shows its own price and quantity range in the Services catalog.',
        'When you place an order, the cost is deducted from your wallet balance.',
      ],
    },
    {
      heading: 'Why wallet pricing?',
      body: [
        'No forced monthly plan just to place orders.',
        'Recharge once and order multiple services.',
        'Transparent rates shown before you confirm an order.',
        'You control spending — start with ₹100–₹500 if you prefer.',
      ],
    },
    {
      heading: 'Payments',
      body: [
        'Wallet top-ups are processed securely via Razorpay.',
        'Successful payments usually credit your balance instantly.',
        'Keep your Razorpay payment ID handy if you need support.',
      ],
    },
  ],
};

export const PUBLIC_BLOG_POSTS = [
  {
    id: 'getting-started',
    title: 'How to get started on ABHAYSMM PANEL',
    date: '2026',
    body: [
      'Sign up with email OTP or Google, then open Add Funds to recharge your wallet.',
      'Browse Services, pick a platform, enter your link and quantity, and place your order.',
      'Track progress anytime under My Orders.',
    ],
  },
  {
    id: 'add-funds-safe',
    title: 'Tips for safe wallet recharge',
    date: '2026',
    body: [
      'Always complete payment inside the official Razorpay checkout window.',
      'Never share your UPI PIN or OTP with anyone claiming to be support.',
      'If balance does not update after a successful payment, contact Support with your payment ID.',
    ],
  },
  {
    id: 'order-quality',
    title: 'Getting better results from orders',
    date: '2026',
    body: [
      'Use a public link that matches the service type (profile, post, video, etc.).',
      'Place a small test order first to check speed and quality.',
      'Avoid changing the target link while an order is processing.',
    ],
  },
  {
    id: 'updates',
    title: 'Where we post updates',
    date: '2026',
    body: [
      'Service and offer updates are shared on our Telegram channel and in-panel announcements.',
      'For urgent help, use WhatsApp Support or open a ticket after login.',
    ],
  },
];

export const PUBLIC_SUPPORT_CONTENT = {
  title: 'Support',
  subtitle: 'Need help with signup, payments, or orders? Contact ABHAYSMM PANEL support.',
  hours: 'Support is available every day. Response time is usually within a few hours.',
  tips: [
    'Share your registered email address.',
    'For payments: include Razorpay payment ID, amount, and approximate time.',
    'For orders: include Order ID and the service name.',
    'Screenshots help us resolve issues faster.',
  ],
};
