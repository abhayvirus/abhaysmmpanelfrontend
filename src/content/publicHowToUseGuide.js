/** Public landing guide — how to add funds & use the panel */

export const PUBLIC_HOW_TO_USE_META = {
  title: 'How to Use Guide',
  subtitle:
    'Step-by-step instructions to create your account, add wallet funds via UPI/Cards, and place your first order on ABHAYSMM Panel.',
};

export const PUBLIC_FUND_WORKFLOW_STEPS = [
  { step: 1, text: 'Create a free account on abhaysmmpanel.in or log in with Google / email.' },
  { step: 2, text: 'Open the sidebar menu and tap “Add Funds” (wallet recharge page).' },
  { step: 3, text: 'Enter the amount (minimum ₹10) or pick a quick amount — ₹100, ₹250, ₹500, etc.' },
  { step: 4, text: 'Choose a payment method: UPI, Google Pay, PhonePe, Paytm, Cards, Netbanking, or Wallets.' },
  { step: 5, text: 'Tap the Pay button — Razorpay secure checkout opens in a popup.' },
  { step: 6, text: 'Complete payment in the Razorpay window (UPI ID, QR scan, card, etc.).' },
  { step: 7, text: 'Wait for “Payment successful” — balance updates instantly on your dashboard.' },
  { step: 8, text: 'Go to Services, select a service, enter link + quantity, and place your order.' },
];

export const PUBLIC_HOW_TO_USE_SECTIONS = [
  {
    id: 'wallet',
    icon: '💰',
    title: '1. What is Wallet Balance?',
    summary: 'Every order is paid from your in-panel wallet — you must add funds before placing orders.',
    points: [
      'Wallet balance is shown on Dashboard and Add Funds page (top-right card).',
      'When you place an order, the order cost is deducted automatically from your wallet.',
      'If balance is low, orders will fail — recharge first, then order.',
      'You can view payment history and wallet transactions on the Add Funds page.',
    ],
  },
  {
    id: 'add-funds-page',
    icon: '➕',
    title: '2. Open Add Funds Page',
    route: '/add-funds',
    summary: 'After login, use the left sidebar (desktop) or bottom menu (mobile).',
    points: [
      'Click “Add Funds” in the navigation menu.',
      'You will see your current wallet balance at the top.',
      'The main card shows “Instant payment” powered by Razorpay (live gateway).',
      'Minimum recharge amount is ₹10 unless admin changes settings.',
    ],
  },
  {
    id: 'amount',
    icon: '🔢',
    title: '3. Enter Amount',
    summary: 'Type any amount or use quick-select buttons.',
    points: [
      'Quick buttons: ₹100, ₹250, ₹500, ₹1000, ₹2000 — tap one to auto-fill.',
      'Or type a custom amount in the Amount field.',
      'Optional: enter a coupon code and tap “Apply” for discount (if admin enabled coupons).',
      'Review “Selected Method” and final payable amount before paying.',
    ],
  },
  {
    id: 'payment-methods',
    icon: '💳',
    title: '4. Choose Payment Method',
    summary: 'Select how you want to pay — all methods go through secure Razorpay checkout.',
    points: [
      'UPI — Pay with any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.).',
      'Google Pay / PhonePe / Paytm / BHIM — shortcuts that open UPI in Razorpay.',
      'Scan QR — Scan & Pay using QR in the Razorpay popup.',
      'Cards — Visa, Mastercard, RuPay, Amex supported.',
      'Netbanking — All major Indian banks.',
      'Wallets — Paytm Wallet and other Razorpay-supported wallets.',
    ],
  },
  {
    id: 'razorpay-pay',
    icon: '🔒',
    title: '5. Complete Payment (Razorpay)',
    summary: 'Tap Pay — complete payment in the Razorpay window — do not close until success.',
    points: [
      'Tap the glowing Pay button (shows your selected method, e.g. “Pay with UPI”).',
      'A secure Razorpay popup opens — enter UPI ID, scan QR, or card details.',
      'If you cancel the popup, no money is deducted — you can try again.',
      'On success you see “Payment successful” and wallet balance updates immediately.',
      'Failed payments show an error message — check internet and retry, or contact support.',
    ],
  },
  {
    id: 'after-payment',
    icon: '✅',
    title: '6. After Payment — Check Balance',
    summary: 'Confirm your wallet was credited before placing orders.',
    points: [
      'Dashboard wallet card and Add Funds page both show the new balance.',
      'Payment History table lists each recharge: amount, gateway, status, date.',
      'Status “Success” (green) = money added. “Pending” = wait or contact admin.',
      'Keep Razorpay payment ID from history if you need support for a failed credit.',
    ],
  },
  {
    id: 'place-order',
    icon: '📋',
    title: '7. Place Your First Order',
    route: '/services',
    summary: 'Once wallet has enough balance, order from Services or Dashboard.',
    points: [
      'Go to Services — browse by platform (Instagram, YouTube, etc.).',
      'Select a service, enter target link (profile/post URL), and quantity.',
      'System checks min/max quantity and wallet balance before submitting.',
      'Order appears in My Orders with status Pending → Processing → Completed.',
    ],
  },
  {
    id: 'troubleshooting',
    icon: '🛠️',
    title: '8. Common Issues & Fixes',
    summary: 'Quick help if add funds or payment does not work.',
    points: [
      'Payment unavailable — Razorpay may be updating; try again in a few minutes.',
      'Amount deducted but balance not updated — open Tickets with UTR / Razorpay payment ID.',
      'Minimum ₹10 — lower amounts are rejected.',
      'Login required — Add Funds works only after sign in (guests must register first).',
      'Use correct UPI / card details in Razorpay — wrong PIN or cancelled UPI shows failed.',
    ],
  },
  {
    id: 'support',
    icon: '🎫',
    title: '9. Need Help?',
    route: '/tickets',
    summary: 'Our support team can help with payments and orders.',
    points: [
      'Open Tickets from the sidebar after login.',
      'Subject example: “Payment not credited” — attach Razorpay payment ID or screenshot.',
      'Include your registered email and exact amount paid.',
      'Join our Telegram channel from the landing page for updates and offers.',
    ],
  },
];

export const PUBLIC_HOW_TO_USE_QUICK_NAV = [
  { to: '/signup', label: 'Create Account', icon: '🚀' },
  { to: '/login', label: 'Login', icon: '🔑' },
  { to: '/add-funds', label: 'Add Funds', icon: '💰' },
  { to: '/services', label: 'Services', icon: '📋' },
];

export const PUBLIC_HOW_TO_USE_FEATURES = [
  'Fully responsive — readable on mobile and desktop',
  'Instant Razorpay wallet credit on successful payment',
  'Payment history with status badges',
  'Secure checkout — we do not store card/UPI PIN',
];
