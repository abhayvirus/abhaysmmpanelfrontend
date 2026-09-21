import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminRole } from '../utils/roles';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (_) { /* ignore */ }
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdminRole(user)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;
