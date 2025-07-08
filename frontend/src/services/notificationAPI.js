import api from './api';

// Get user notifications
export const getNotifications = (page = 1, limit = 20) => {
  return api.get(`/notifications?page=${page}&limit=${limit}`);
};

// Mark notification as read
export const markAsRead = (notificationId) => {
  return api.patch(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = () => {
  return api.patch('/notifications/read-all');
};

// Delete notification
export const deleteNotification = (notificationId) => {
  return api.delete(`/notifications/${notificationId}`);
};

// Get unread count
export const getUnreadCount = () => {
  return api.get('/notifications/unread-count');
};

