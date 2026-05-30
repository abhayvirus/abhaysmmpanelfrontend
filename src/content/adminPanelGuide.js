/** Admin Panel help guide — content for /admin/help */

export const ADMIN_GUIDE_META = {
  title: 'Admin Panel Guide',
  subtitle:
    'How to manage orders, users, and statuses across the platform. Only admin accounts can access this area.',
};

export const ADMIN_QUICK_NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export const ADMIN_UI_FEATURES = [
  'Dashboard stat cards and recent-order tables',
  'Full order list with search, filters, and pagination',
  'Status badges and one-click status updates',
  'Responsive tables and mobile card layouts',
  'Loading states during API fetches',
];

export const ADMIN_STATUS_FLOW = [
  { key: 'pending', label: 'Pending', desc: 'New order — ready for review.', badge: 'badge-warning' },
  { key: 'processing', label: 'In Progress', desc: 'Work started — update from admin or provider sync.', badge: 'badge-info' },
  { key: 'completed', label: 'Completed', desc: 'Done — user panel becomes read-only.', badge: 'badge-success' },
];

export const ADMIN_WORKFLOW_STEPS = [
  { step: 1, text: 'User logs in using Gmail.' },
  { step: 2, text: 'User places an order.' },
  { step: 3, text: 'Order status is automatically set to Pending.' },
  { step: 4, text: 'Admin receives order in Admin Panel → Orders.' },
  { step: 5, text: 'Admin reviews order (user Gmail, name, service, link, amount).' },
  { step: 6, text: 'Admin changes status to In Progress.' },
  { step: 7, text: 'User sees updated status instantly on My Orders and Notifications.' },
  { step: 8, text: 'Admin completes work at the SMM provider.' },
  { step: 9, text: 'Admin changes status to Completed.' },
  { step: 10, text: 'User panel automatically removes Edit and Delete options.' },
  { step: 11, text: 'Order becomes read-only for the user.' },
  { step: 12, text: 'Order remains stored permanently with user Gmail and user name.' },
];

export const ADMIN_GUIDE_SECTIONS = [
  {
    id: 'dashboard',
    icon: '📊',
    title: '1. Admin Dashboard',
    route: '/admin',
    summary: 'High-level metrics for the whole platform.',
    points: [
      'Display total registered users.',
      'Display total orders across all customers.',
      'Monitor pending orders awaiting action.',
      'Track completed orders and revenue trends.',
      'View in-progress (processing) workload via Orders filters and Analytics.',
    ],
    stats: [
      { label: 'Total users', value: '1,240' },
      { label: 'Total orders', value: '8,502' },
      { label: 'Pending', value: '42', badge: 'badge-warning' },
      { label: 'In progress', value: '18', badge: 'badge-info' },
      { label: 'Completed', value: '7,890', badge: 'badge-success' },
    ],
  },
  {
    id: 'orders',
    icon: '📦',
    title: '2. Order Management',
    route: '/admin/orders',
    summary: 'View and manage all orders from every user.',
    points: [
      'Admin can view all orders from all users in one list.',
      'Each order shows user Gmail, user name, order ID, service/product, order date, and status.',
      'Open order details for link, quantity, price, and provider reference.',
      'Delete or update orders only when necessary — changes persist in the database.',
    ],
    tableColumns: [
      'Order ID',
      'User Name',
      'User Gmail',
      'Service / Product',
      'Order Date',
      'Status',
    ],
    tableSampleRow: {
      'Order ID': '#1042',
      'User Name': 'John Doe',
      'User Gmail': 'user@gmail.com',
      'Service / Product': 'Instagram Followers',
      'Order Date': '30 May 2026, 10:30',
      Status: { badge: 'badge-info', text: 'Processing' },
    },
  },
  {
    id: 'status',
    icon: '🔄',
    title: '3. Status Management',
    route: '/admin/orders',
    summary: 'Control the order lifecycle.',
    points: [
      'Change order status along the path: Pending → In Progress → Completed.',
      'When status changes, the database updates automatically.',
      'The user panel reflects changes on refresh and via notifications (near real-time).',
      'Provider API sync may also move orders to Processing or Completed automatically.',
    ],
  },
  {
    id: 'completed-rules',
    icon: '✅',
    title: '4. Completed Orders Rules',
    summary: 'Effects when admin marks an order Completed.',
    points: [
      'User can no longer edit the order from their panel.',
      'User can no longer delete or cancel the order.',
      'User only sees completed information (read-only view).',
      'Action buttons disappear from the user’s My Orders list.',
    ],
  },
  {
    id: 'users',
    icon: '👥',
    title: '5. User Management',
    route: '/admin/users',
    summary: 'Manage customer accounts and history.',
    points: [
      'Admin can view all registered users with balance and account status.',
      'Search users by Gmail (email) or name from the users list.',
      'Open a user to adjust balance, ban/unban, or review their activity.',
      'View order history for a specific user via their profile and the Orders search.',
    ],
  },
  {
    id: 'search',
    icon: '🔍',
    title: '6. Search & Filter',
    route: '/admin/orders',
    summary: 'Find orders quickly on the Orders page.',
    points: [
      'Filter orders by status: Pending, Processing, Completed, Cancelled, Failed, or All.',
      'Search by order ID, user Gmail, user name, service name, or target link.',
      'List is ordered by date (newest first) with pagination for large volumes.',
      'Use mobile card view on small screens — same data as the desktop table.',
    ],
    filterChips: ['All', 'Pending', 'Processing', 'Completed', 'Cancelled'],
  },
  {
    id: 'security',
    icon: '🔒',
    title: '7. Security & Permissions',
    summary: 'Protect admin routes and customer data.',
    points: [
      'Only admin accounts can access the admin panel (/admin/*).',
      'Normal users cannot access admin routes — they are redirected to the user dashboard.',
      'Role-based authentication: JWT token includes role; API enforces admin middleware.',
      'Banned users are blocked from all protected endpoints.',
    ],
  },
];
