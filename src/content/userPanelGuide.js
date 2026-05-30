/** User Panel help guide — content for /help */

export const USER_GUIDE_META = {
  title: 'User Panel Guide',
  subtitle:
    'A complete guide to signing in, placing orders, tracking status, and managing your account on ABHAYSMM Panel.',
};

export const USER_QUICK_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { to: '/services', label: 'Place Order', icon: '📋' },
  { to: '/orders', label: 'My Orders', icon: '📦' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export const USER_UI_FEATURES = [
  'Responsive cards and stat summaries',
  'Sortable order tables with status badges',
  'Search and refresh on My Orders',
  'Loading states while data fetches',
  'Mobile-friendly layout with bottom navigation',
];

export const USER_STATUS_FLOW = [
  {
    key: 'pending',
    label: 'Pending',
    desc: 'Order received and saved. Status starts here automatically after submit.',
    badge: 'badge-warning',
  },
  {
    key: 'processing',
    label: 'In Progress',
    desc: 'Work has started. Shown as “Processing” in the panel.',
    badge: 'badge-info',
  },
  {
    key: 'completed',
    label: 'Completed',
    desc: 'Finished. Order is read-only — no edit or cancel/delete.',
    badge: 'badge-success',
  },
];

/** Full 12-step real workflow (user + admin interaction) */
export const USER_WORKFLOW_STEPS = [
  { step: 1, text: 'User logs in using Gmail (Google) or email and password.' },
  { step: 2, text: 'User places an order from Dashboard or Services.' },
  { step: 3, text: 'Order status is automatically set to Pending.' },
  { step: 4, text: 'Admin receives the order in the Admin Panel.' },
  { step: 5, text: 'Admin reviews the order details.' },
  { step: 6, text: 'Admin changes status to In Progress.' },
  { step: 7, text: 'User sees the updated status instantly (My Orders + Notifications).' },
  { step: 8, text: 'Admin completes the work at the provider.' },
  { step: 9, text: 'Admin changes status to Completed.' },
  { step: 10, text: 'User panel automatically removes Edit and Cancel/Delete options.' },
  { step: 11, text: 'Order becomes read-only — view details only.' },
  { step: 12, text: 'Order remains stored permanently with user Gmail and user name.' },
];

export const USER_GUIDE_SECTIONS = [
  {
    id: 'dashboard',
    icon: '⚡',
    title: '1. Dashboard',
    route: '/dashboard',
    summary: 'Your home screen after authentication — profile, order summary, and quick placement.',
    points: [
      'Log in using Gmail authentication (Sign in with Google) or email and password.',
      'View your profile information: display name, email address, and wallet balance.',
      'See total orders placed and recent order activity on the dashboard.',
      'Check current order status for recent submissions at a glance.',
      'Use the order form here to select a service, enter link and quantity, and submit.',
    ],
  },
  {
    id: 'place-order',
    icon: '📋',
    title: '2. Place Order',
    route: '/services',
    summary: 'Create a new order in a few steps.',
    points: [
      'Fill in the order form with the target link and quantity.',
      'Select the required service or product from the Services catalog.',
      'Submit the order — wallet balance is checked and charged on success.',
      'The order is stored in the database with your Gmail, user name, order details, timestamp, and status (Pending).',
    ],
  },
  {
    id: 'my-orders',
    icon: '📦',
    title: '3. My Orders',
    route: '/orders',
    summary: 'View every order you have submitted.',
    points: [
      'All your orders are listed in one place with search and status refresh.',
      'Each row includes the fields below (your name and Gmail come from your account profile).',
      'Pending orders may show Cancel while still in the short cancel window.',
      'Completed orders show status only — no destructive actions.',
    ],
    tableColumns: [
      'Order ID',
      'User Name',
      'Gmail Address',
      'Service / Product',
      'Order Date',
      'Current Status',
    ],
    tableSampleRow: {
      'Order ID': '#1042',
      'User Name': 'John Doe',
      'Gmail Address': 'user@gmail.com',
      'Service / Product': 'Instagram Followers',
      'Order Date': '30 May 2026, 10:30',
      'Current Status': { badge: 'badge-warning', text: 'Pending' },
    },
  },
  {
    id: 'status-flow',
    icon: '🔄',
    title: '4. Order Status Flow',
    summary: 'Every order moves through these main stages.',
    points: [
      'Pending — order created; awaiting or starting fulfillment.',
      'In Progress — admin or provider has started work (shown as Processing in the app).',
      'Completed — delivery finished; no further user actions allowed.',
      'Other statuses (Partial, Cancelled, Failed) may appear — check Notifications for updates.',
    ],
  },
  {
    id: 'completed',
    icon: '✅',
    title: '5. Completed Orders',
    summary: 'When status becomes Completed, the order is locked.',
    points: [
      'The Edit button disappears (if shown for earlier statuses).',
      'The Cancel / Delete button disappears.',
      'The order becomes read-only — you can only view completed order details.',
      'Historical record (Gmail, name, service, date, amount) stays in your account permanently.',
    ],
  },
  {
    id: 'notifications',
    icon: '🔔',
    title: '6. Notifications',
    route: '/notifications',
    summary: 'Stay updated on order progress and account activity.',
    points: [
      'Receive in-app notifications when order status changes.',
      'See the latest order progress without opening My Orders.',
      'Alerts also cover wallet credits, payments, and support ticket replies.',
      'Unread count appears in the sidebar; mark items read individually or all at once.',
    ],
  },
  {
    id: 'security',
    icon: '🔒',
    title: '7. Security',
    summary: 'Your data is private to your account.',
    points: [
      'Users can only see their own orders — API requests are scoped to your user ID.',
      'No user can access another user’s orders, even by guessing order IDs.',
      'Sessions use secure tokens; sign out from Profile or the sidebar to end your session.',
      'Admin panel routes are blocked for normal user accounts (role-based access).',
    ],
  },
];
