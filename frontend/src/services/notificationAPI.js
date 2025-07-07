import api from './api';

// Get user notifications
export const getNotifications = (page = 1, limit = 20) => {
  return api.get(`/api/notifications?page=${page}&limit=${limit}`);
};

// Mark notification as read
export const markAsRead = (notificationId) => {
  return api.patch(`/api/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = () => {
  return api.patch('/api/notifications/read-all');
};

// Delete notification
export const deleteNotification = (notificationId) => {
  return api.delete(`/api/notifications/${notificationId}`);
};

// Get unread count
export const getUnreadCount = () => {
  return api.get('/api/notifications/unread-count');
};
