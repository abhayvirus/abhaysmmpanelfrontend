import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <AdminSidebar />
    <div className="main admin-main fade-in">{children}</div>
  </div>
);

export default AdminLayout;
