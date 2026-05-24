import { useState } from 'react';
import NotificationPanel from './NotificationPanel.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';
import './Topbar.css';

function Topbar({ title, user, notifications, onMenuClick }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [readAll, setReadAll] = useState(false);
  const visibleNotifications = (notifications || [])
    .filter((item) => !dismissedIds.includes(item.id))
    .map((item) => ({ ...item, is_read: readAll ? 1 : item.is_read }));
  const unreadCount = visibleNotifications.filter((item) => !item.is_read).length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenuClick} type="button" aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <div>
          <p className="topbar-kicker">Biscuit Factory</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="notification-button"
          onClick={() => setShowNotifications((value) => !value)}
          type="button"
          aria-label="Open notifications"
        >
          AL
          <span>{unreadCount}</span>
        </button>
        {showNotifications && (
          <NotificationPanel
            notifications={visibleNotifications}
            onDismiss={(id) => setDismissedIds((items) => [...items, id])}
            onReadAll={() => setReadAll(true)}
          />
        )}

        <button className="profile-chip" onClick={() => setShowProfile((value) => !value)} type="button">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Factory User')}&background=176b5b&color=fff`} alt="" />
          <span>{user?.role || 'Operator'}</span>
        </button>
        {showProfile && <ProfileDropdown user={user} />}
      </div>
    </header>
  );
}

export default Topbar;
