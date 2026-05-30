import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthProvider } from './contexts/GoogleAuthContext';
import GoogleOAuthCallback from './pages/GoogleOAuthCallback';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PremiumFeatures from './components/PremiumFeatures';
import MaintenanceGate from './components/MaintenanceGate';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Services from './pages/Services';
import AddFunds from './pages/AddFunds';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import ApiDocs from './pages/ApiDocs';
import ChildPanel from './pages/ChildPanel';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Referrals from './pages/Referrals';
import Profile from './pages/Profile';
import WebsiteDev from './pages/WebsiteDev';
import AdminWebsiteDev from './pages/AdminWebsiteDev';
import UserGuide from './pages/UserGuide';
import AdminGuide from './pages/AdminGuide';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import AdminOrders from './pages/AdminOrders';
import AdminFunds from './pages/AdminFunds';
import AdminSettings from './pages/AdminSettings';
import AdminCategories from './pages/AdminCategories';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminTickets from './pages/AdminTickets';
import AdminChildPanels from './pages/AdminChildPanels';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCoupons from './pages/AdminCoupons';
import AdminChat from './pages/AdminChat';
import AdminActivityLogs from './pages/AdminActivityLogs';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <SettingsProvider>
      <LanguageProvider>
      <Router basename={process.env.PUBLIC_URL || '/'}>
        <MaintenanceGate>
          <PremiumFeatures />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/add-funds" element={<ProtectedRoute><AddFunds /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
            <Route path="/child-panel" element={<ProtectedRoute><ChildPanel /></ProtectedRoute>} />
            <Route path="/website-dev" element={<ProtectedRoute><WebsiteDev /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/help" element={<AdminRoute><AdminGuide /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/services" element={<AdminRoute><AdminServices /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/funds" element={<AdminRoute><AdminFunds /></AdminRoute>} />
            <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
            <Route path="/admin/child-panels" element={<AdminRoute><AdminChildPanels /></AdminRoute>} />
            <Route path="/admin/website-dev" element={<AdminRoute><AdminWebsiteDev /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
            <Route path="/admin/chat" element={<AdminRoute><AdminChat /></AdminRoute>} />
            <Route path="/admin/activity-logs" element={<AdminRoute><AdminActivityLogs /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MaintenanceGate>
      </Router>
      </LanguageProvider>
    </SettingsProvider>
  );
}

function App() {
  return (
    <GoogleAuthProvider>
      <AppRoutes />
    </GoogleAuthProvider>
  );
}

export default App;
