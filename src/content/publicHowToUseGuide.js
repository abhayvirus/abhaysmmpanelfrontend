/** Public how-to-use — simple heading + text sections */

export const PUBLIC_HOW_TO_USE_META = {
  title: 'How to Use',
  subtitle:
    'Simple steps to create your account, add funds, and place orders on ABHAYSMM PANEL.',
};

/** Linear guide: one heading, then short text under it */
export const GUIDE_TOPICS = [
  {
    id: 'create-account',
    title: 'How to Create Account',
    body: [
      'Open the Sign Up page on abhaysmmpanel.in.',
      'Enter your name, email, and password — or continue with Google.',
      'If asked, enter the OTP sent to your email.',
      'After signup you will reach your dashboard. Registration is free.',
    ],
  },
  {
    id: 'login',
    title: 'How to Login',
    body: [
      'Open the Login page.',
      'Sign in with the same email and password, or use Continue with Google.',
      'If you forgot your password, use Forgot Password on the login page.',
      'After login you can open Dashboard, Services, Add Funds, Orders, and Support.',
    ],
  },
  {
    id: 'add-funds',
    title: 'How to Add Funds',
    body: [
      'After login, open Add Funds from the sidebar (or mobile menu).',
      'Enter the amount you want to add (minimum usually ₹10), or tap a quick amount like ₹100, ₹250, or ₹500.',
      'Choose a payment method: UPI, Google Pay, PhonePe, Paytm, Cards, Netbanking, or Wallets.',
      'Tap Pay — Razorpay secure checkout opens.',
      'Complete the payment. When it succeeds, your wallet balance updates on the dashboard.',
    ],
  },
  {
    id: 'place-order',
    title: 'How to Place an Order',
    body: [
      'Make sure your wallet has enough balance.',
      'Go to Services and choose a platform and service.',
      'Enter the target link and quantity (within the service min/max).',
      'Confirm the cost — it is deducted from your wallet when you place the order.',
    ],
  },
  {
    id: 'track-orders',
    title: 'How to Track Orders',
    body: [
      'Open My Orders from the menu.',
      'Check status such as Pending, Processing, or Completed.',
      'Status updates as the provider processes your order.',
      'Keep your order ID ready if you contact support.',
    ],
  },
  {
    id: 'services',
    title: 'How to Use Services',
    body: [
      'Browse Instagram, YouTube, and other platforms in Services.',
      'Each service shows rate, min/max quantity, and a short description.',
      'Start with a small test order before placing larger ones.',
    ],
  },
  {
    id: 'help',
    title: 'Need Help?',
    body: [
      'Open Tickets from the sidebar after login for payment or order issues.',
      'Include your registered email, amount paid, and Razorpay payment ID or screenshot.',
      'You can also join our Telegram channel from the homepage for updates.',
    ],
  },
];

/** Legacy exports kept so older imports do not break */
export const GUIDE_SIDEBAR = [];
export const GUIDE_STEP_CARDS = [];
export const GUIDE_DETAIL_SECTIONS = GUIDE_TOPICS.map((t) => ({
  id: t.id,
  title: t.title,
  points: t.body,
}));
export const GUIDE_FAQ = [];
export const PUBLIC_FUND_WORKFLOW_STEPS = [];
export const PUBLIC_HOW_TO_USE_SECTIONS = GUIDE_TOPICS.map((t, i) => ({
  id: t.id,
  icon: '📌',
  title: t.title,
  summary: t.body[0],
  points: t.body,
}));
export const PUBLIC_HOW_TO_USE_QUICK_NAV = [
  { to: '/signup', label: 'Create Account', icon: '🚀' },
  { to: '/login', label: 'Login', icon: '🔑' },
  { to: '/add-funds', label: 'Add Funds', icon: '💰' },
  { to: '/services', label: 'Services', icon: '📋' },
];
export const PUBLIC_HOW_TO_USE_FEATURES = [];
