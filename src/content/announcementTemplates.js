/**
 * Ready-to-use popup announcement templates for Admin → Announcements.
 * Users see these as a modal when they open the account (show_on_login).
 */
export const ANNOUNCEMENT_TEMPLATES = [
  {
    key: 'welcome',
    label: 'Welcome',
    emoji: '👋',
    style: 'welcome',
    title: 'Welcome to ABHAYSMM!',
    content:
      'Thanks for joining us.\n\n• Place orders from New Order\n• Add funds anytime from Wallet\n• Need help? Open Support Tickets\n\nWe are glad to have you here.',
    cta: 'Let’s go',
  },
  {
    key: 'offer',
    label: 'Special Offer',
    emoji: '🔥',
    style: 'offer',
    title: 'Limited-time offer — extra value!',
    content:
      'For a short time, selected services are running at better rates.\n\nOpen Services / New Order and grab the deal before it ends.\n\nStay tuned for more drops on Telegram.',
    cta: 'View offers',
  },
  {
    key: 'low_balance',
    label: 'Low Balance',
    emoji: '💰',
    style: 'warning',
    title: 'Your balance is running low',
    content:
      'Add funds now so your orders are never delayed.\n\nGo to Add Funds → pay via UPI / Razorpay → balance updates instantly.\n\nNeed help? Message Support.',
    cta: 'Add funds',
  },
  {
    key: 'new_services',
    label: 'New Services',
    emoji: '✨',
    style: 'info',
    title: 'New services just went live',
    content:
      'Fresh Instagram, Telegram, YouTube & more packages are now in your panel.\n\nCheck Services or New Order to try the latest IDs.\n\nQuality + speed — updated regularly.',
    cta: 'Browse services',
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    emoji: '🛠️',
    style: 'maintenance',
    title: 'Scheduled maintenance notice',
    content:
      'We will perform a short maintenance window soon.\n\nOrders already in progress will continue. New orders may pause briefly.\n\nThank you for your patience.',
    cta: 'Understood',
  },
  {
    key: 'referral',
    label: 'Refer & Earn',
    emoji: '🎁',
    style: 'referral',
    title: 'Invite friends & earn rewards',
    content:
      'Share your referral link from Refer & Earn.\n\nWhen friends deposit, you get commission in your wallet.\n\nMore referrals = more earnings. Start sharing today!',
    cta: 'Open Refer & Earn',
  },
  {
    key: 'festival',
    label: 'Festival Deal',
    emoji: '🎉',
    style: 'festival',
    title: 'Festival special is live!',
    content:
      'Celebrate with bonus rates on top categories.\n\nStock up on followers, views & likes while the festive menu lasts.\n\nHappy ordering from Team ABHAYSMM!',
    cta: 'Shop deals',
  },
  {
    key: 'speed',
    label: 'Speed Update',
    emoji: '⚡',
    style: 'success',
    title: 'Faster delivery is active',
    content:
      'Provider lines have been optimized.\n\nMost orders now start quicker with smoother completion.\n\nPlace a test order and feel the difference.',
    cta: 'Place order',
  },
  {
    key: 'security',
    label: 'Security Tip',
    emoji: '🔐',
    style: 'security',
    title: 'Keep your account safe',
    content:
      'Never share your password or OTP with anyone.\n\nABHAYSMM support will never ask for your full password.\n\nEnable a strong password and log out on shared devices.',
    cta: 'Got it',
  },
  {
    key: 'support',
    label: 'Support Hours',
    emoji: '🎧',
    style: 'support',
    title: 'Support is here for you',
    content:
      'Open a ticket anytime from Support Tickets.\n\nTypical reply window: Mon–Sat, business hours (IST).\n\nFor urgent order issues, include Order ID in your ticket.',
    cta: 'Open tickets',
  },
];

export function getAnnouncementTemplate(key) {
  return ANNOUNCEMENT_TEMPLATES.find((t) => t.key === key) || null;
}
