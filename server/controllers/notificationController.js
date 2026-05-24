const { all, run } = require('../database/database');

const listNotifications = async (req, res) => {
  const notifications = req.user.role === 'admin'
    ? await all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20')
    : await all(
      `SELECT *
       FROM notifications
       WHERE role IN (?, 'all')
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.role],
    );
  return res.json({ notifications });
};

const markNotificationsRead = async (req, res) => {
  if (req.user.role === 'admin') {
    await run('UPDATE notifications SET is_read = 1');
  } else {
    await run("UPDATE notifications SET is_read = 1 WHERE role IN (?, 'all')", [req.user.role]);
  }
  return res.json({ message: 'Notifications marked as read' });
};

const deleteNotification = async (req, res) => {
  if (req.user.role === 'admin') {
    await run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
  } else {
    await run("DELETE FROM notifications WHERE id = ? AND role IN (?, 'all')", [req.params.id, req.user.role]);
  }
  return res.json({ message: 'Notification deleted' });
};

module.exports = {
  listNotifications,
  markNotificationsRead,
  deleteNotification,
};
