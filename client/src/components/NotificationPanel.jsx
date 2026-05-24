import './NotificationPanel.css';
import api from '../services/api.js';
import useToast from '../context/useToast.js';

function NotificationPanel({ notifications = [], onDismiss, onReadAll }) {
  const { showToast } = useToast();

  const markAllRead = async () => {
    await api.put('/notifications/read');
    onReadAll();
    showToast('Notifications marked as read');
  };

  const deleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`);
    onDismiss(id);
    showToast('Notification removed');
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <strong>Notifications</strong>
        <button type="button" onClick={markAllRead}>Mark read</button>
      </div>
      {notifications.length === 0 && (
        <div className="notification-item">
          <span />
          <p>No new notifications.</p>
        </div>
      )}
      {notifications.map((alert) => (
        <div className={`notification-item ${alert.is_read ? 'read' : ''}`} key={alert.id}>
          <span />
          <p>{alert.message}</p>
          <button type="button" onClick={() => deleteNotification(alert.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}

export default NotificationPanel;
