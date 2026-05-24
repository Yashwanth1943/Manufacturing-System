import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth.js';
import './Sidebar.css';

const links = [
  { path: '/admin', label: 'Admin', icon: 'AD' },
  { path: '/production', label: 'Production', icon: 'PR' },
  { path: '/defects', label: 'Defects', icon: 'DF' },
  { path: '/quality', label: 'Quality', icon: 'QC' },
];

function Sidebar({ isOpen, onClose, role }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const visibleLinks = role === 'admin' ? links : links.filter((link) => link.path.includes(role || ''));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-label="Close sidebar"
        type="button"
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">MF</div>
          <div>
            <h2>Biscuit ERP</h2>
            <span>Smart factory suite</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <p className="nav-section-title">Operations</p>
          {visibleLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="line-status">
            <span className="line-dot" />
            <div>
              <strong>Plant online</strong>
              <span>{role} portal</span>
            </div>
          </div>
          <button className="logout-nav-btn" onClick={handleLogout} type="button">
            <span className="nav-icon">LO</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
