import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AnnouncementPopup from './AnnouncementPopup';
import { getMe } from '../api';

const UserLayout = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    getMe().then((res) => {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="layout fade-in">
      <Sidebar user={user} />
      <main className="main">{children}</main>
      <AnnouncementPopup />
    </div>
  );
};

export default UserLayout;
