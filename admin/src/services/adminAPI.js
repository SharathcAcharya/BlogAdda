import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getUsers = async (params) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const toggleUserBan = async (userId, reason) => {
  const response = await api.put(`/admin/users/${userId}/ban`, { reason });
  return response.data;
};

export const getBlogs = async (params) => {
  const response = await api.get('/admin/blogs', { params });
  return response.data;
};

export const getBlogById = async (blogId) => {
  const response = await api.get(`/blogs/${blogId}`);
  return response.data;
};

export const deleteBlog = async (blogId) => {
  const response = await api.delete(`/admin/blogs/${blogId}`);
  return response.data;
};

export const toggleBlogFeature = async (blogId) => {
  const response = await api.put(`/admin/blogs/${blogId}/feature`);
  return response.data;
};

export const getReportedComments = async (params) => {
  const response = await api.get('/admin/comments/reported', { params });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/admin/comments/${commentId}`);
  return response.data;
};
