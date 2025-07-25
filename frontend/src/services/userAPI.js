import api from './api';

// User profile operations
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/profile/${userId}`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// User followers/following
export const followUser = async (userId) => {
  const response = await api.post(`/users/follow/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.delete(`/users/follow/${userId}`);
  return response.data;
};

export const getUserFollowers = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUserFollowing = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/users/${userId}/following?page=${page}&limit=${limit}`);
  return response.data;
};

// User search and discovery
export const searchUsers = async (query, page = 1, limit = 20) => {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  return response.data;
};

export const getSuggestedUsers = async (limit = 10) => {
  const response = await api.get(`/users/suggestions?limit=${limit}`);
  return response.data;
};

// User blogs
export const getUserBlogs = async (userId, page = 1, limit = 10, status = 'published') => {
  const response = await api.get(`/users/${userId}/blogs?page=${page}&limit=${limit}&status=${status}`);
  return response.data;
};

// User statistics
export const getUserStats = async (userId) => {
  const response = await api.get(`/users/${userId}/stats`);
  return response.data;
};

// Upload avatar
export const uploadAvatar = async (formData) => {
  const response = await api.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete account
export const deleteAccount = async (password) => {
  const response = await api.delete('/users/account', {
    data: { password }
  });
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.put('/users/password', passwordData);
  return response.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  const response = await api.put('/users/notifications', preferences);
  return response.data;
};

// Get user activity
export const getUserActivity = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/users/${userId}/activity?page=${page}&limit=${limit}`);
  return response.data;
};

export default {
  getUserProfile,
  getUserById,
  updateUserProfile,
  getCurrentUserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  getSuggestedUsers,
  getUserBlogs,
  getUserStats,
  uploadAvatar,
  deleteAccount,
  changePassword,
  updateNotificationPreferences,
  getUserActivity,
};

