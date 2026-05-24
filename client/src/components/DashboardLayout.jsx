import { useState } from 'react';
import useAuth from '../context/useAuth.js';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

function DashboardLayout({ title, children, notifications = [] }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} role={user?.role} />
      <Topbar title={title} user={user} notifications={notifications} onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="dashboard-main">
        <div className="dashboard-container">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;
