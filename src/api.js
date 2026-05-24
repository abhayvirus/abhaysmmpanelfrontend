import axios from 'axios';
import { API_URL, API_BASE } from './config/env';

export { API_BASE };

const API = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

const AUTH_PUBLIC = ['/auth/login', '/auth/signup', '/auth/google', '/auth/firebase', '/auth/forgot-password', '/auth/reset-password'];

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const authUrl = err.config?.url || '';
    const isPublicAuth = AUTH_PUBLIC.some((p) => authUrl.includes(p));
    if (err.response?.status === 401 && !isPublicAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const getAuthConfig = () => API.get('/auth/config');
export const login = (data) => API.post('/auth/login', data);
export const signup = (data) => API.post('/auth/signup', data);
/** Google Sign-In: send ID token from @react-oauth/google */
export const googleLogin = (idToken) => API.post('/auth/google', { idToken });
/** Legacy Firebase route */
export const firebaseLogin = (idToken) => API.post('/auth/firebase', { idToken });
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const verifyEmail = (token) => API.get('/auth/verify-email', { params: { token } });
export const resendVerification = (email) => API.post('/auth/resend-verification', { email });

// Chat
export const getChatMessages = () => API.get('/chat/my');
export const sendChatMessage = (message) => API.post('/chat', { message });
export const adminGetChatConversations = () => API.get('/chat/admin/conversations');
export const adminGetChatMessages = (userId) => API.get(`/chat/admin/user/${userId}`);
export const adminReplyChat = (userId, message) => API.post(`/chat/admin/user/${userId}`, { message });

// Referrals & coupons
export const getReferrals = () => API.get('/referrals/my');
export const getCashback = () => API.get('/referrals/cashback');
export const validateCoupon = (code, amount) => API.post('/coupons/validate', { code, amount });

// Premium / analytics
export const pollNotifications = (since) => API.get('/notifications/poll', { params: since ? { since } : {} });
export const updatePreferences = (data) => API.put('/premium/preferences', data);
export const sessionHeartbeat = () => API.post('/premium/heartbeat');
export const adminGetAnalytics = () => API.get('/premium/analytics');
export const adminGetDailyReport = (date) => API.get('/premium/daily-report', { params: { date } });
export const emailDailyReport = (date) => API.post('/premium/daily-report/email', null, { params: { date } });
export const adminGetActivityLogs = () => API.get('/premium/activity-logs');
export const adminTestTelegram = () => API.post('/premium/telegram-test');
export const adminGetCoupons = () => API.get('/coupons/admin');
export const adminCreateCoupon = (data) => API.post('/coupons/admin', data);
export const adminDeleteCoupon = (id) => API.delete(`/coupons/admin/${id}`);

// Public
export const getPublicStats = () => API.get('/public/stats');
export const getPublicSettings = () => API.get('/settings/public');
export const getAppSettings = () => API.get('/settings/app');
export const getServicesPreview = () => API.get('/public/services-preview');

// Services & orders
export const getServices = (params) => API.get('/services', { params });
export const getPlatforms = () => API.get('/services/platforms');
export const getServiceCategories = () => API.get('/services/categories-list');
export const placeOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my');
export const refreshOrderStatus = (id) => API.get(`/orders/status/${id}`);
export const refillOrder = (id) => API.post(`/orders/${id}/refill`);
export const cancelOrder = (id) => API.post(`/orders/${id}/cancel`);

// Wallet & payments
export const submitUtrPayment = (formData) => API.post('/payments/utr', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const addFundsRequest = submitUtrPayment;
export const getPaymentInfo = () => API.get('/wallet/payment-info');
export const getFundRequests = () => API.get('/payments/history');
export const getTransactions = () => API.get('/wallet/transactions');
export const createRazorpayOrder = (amount) => API.post('/payments/razorpay/create-order', { amount });
export const verifyRazorpay = (data) => API.post('/payments/razorpay/verify', data);
export const getPaymentHistory = () => API.get('/payments/history');
export const adminGetAllPayments = (status) => API.get('/payments/admin/all', { params: { status } });
export const adminGetPendingPayments = () => API.get('/payments/admin/pending');
export const adminApprovePayment = (id, data) => API.put(`/payments/admin/${id}/approve`, data);
export const adminRejectPayment = (id, data) => API.put(`/payments/admin/${id}/reject`, data);

// Tickets
export const getTickets = () => API.get('/tickets');
export const createTicket = (data) => API.post('/tickets', data);
export const getTicket = (id) => API.get(`/tickets/${id}`);
export const replyTicket = (id, message) => API.post(`/tickets/${id}/reply`, { message });

// Notifications
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead = () => API.put('/notifications/read-all');
export const getAnnouncements = () => API.get('/settings/announcements');

// Categories
export const getCategories = () => API.get('/categories');

// Child panel
export const requestChildPanel = (data) => API.post('/child-panel/request', data);
export const getMyChildPanels = () => API.get('/child-panel/my');

// API key
export const generateApiKey = () => API.post('/v2/generate-key');

// Admin
export const adminGetUsers = () => API.get('/admin/users');
export const adminUpdateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminGetStats = () => API.get('/admin/stats');
export const adminGetFundRequests = () => API.get('/admin/fund-requests');
export const adminUpdateFundRequest = (id, data) => API.put(`/admin/fund-requests/${id}`, data);
export const adminGetAllOrders = () => API.get('/orders/admin/all');
export const adminUpdateOrderStatus = (id, status) => API.put(`/admin/orders/${id}/status`, { status });
export const adminGetServices = () => API.get('/services/admin/all');
export const adminSyncServices = (provider_id) => API.post('/services/admin/sync', { provider_id });
export const adminProviderStatus = (provider_id) => API.get('/services/admin/provider-status', { params: { provider_id } });
export const adminUpdateService = (id, data) => API.put(`/services/admin/${id}`, data);
export const adminGetSettings = () => API.get('/settings/admin');
export const adminUpdateSettings = (data) => API.put('/settings/admin', data);
export const adminUploadQR = (formData) => API.post('/settings/admin/qr', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUploadLogo = (formData) => API.post('/settings/admin/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUploadApk = (formData) => API.post('/settings/admin/apk', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUploadAppScreenshot = (formData) => API.post('/settings/admin/screenshot', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteAppScreenshot = (index) => API.delete(`/settings/admin/screenshots/${index}`);
export const adminChangePassword = (data) => API.put('/settings/admin/password', data);
export const adminChangeEmail = (data) => API.put('/settings/admin/email', data);
export const adminGetProviders = () => API.get('/settings/providers');
export const adminAddProvider = (data) => API.post('/settings/providers', data);
export const adminUpdateProvider = (id, data) => API.put(`/settings/providers/${id}`, data);
export const adminDeleteProvider = (id) => API.delete(`/settings/providers/${id}`);
export const adminGetAnnouncements = () => API.get('/settings/announcements/admin');
export const adminCreateAnnouncement = (data) => API.post('/settings/announcements', data);
export const adminUpdateAnnouncement = (id, data) => API.put(`/settings/announcements/${id}`, data);
export const adminDeleteAnnouncement = (id) => API.delete(`/settings/announcements/${id}`);
export const adminGetCategories = () => API.get('/categories/admin/all');
export const adminCreateCategory = (data) => API.post('/categories/admin', data);
export const adminUpdateCategory = (id, data) => API.put(`/categories/admin/${id}`, data);
export const adminDeleteCategory = (id) => API.delete(`/categories/admin/${id}`);
export const adminGetTickets = () => API.get('/tickets/admin/all');
export const adminUpdateTicketStatus = (id, status) => API.put(`/tickets/${id}/status`, { status });
export const adminGetPayments = adminGetAllPayments;
export const adminGetChildPanels = () => API.get('/child-panel/admin/all');
export const adminUpdateChildPanel = (id, data) => API.put(`/child-panel/admin/${id}`, data);

export default API;
