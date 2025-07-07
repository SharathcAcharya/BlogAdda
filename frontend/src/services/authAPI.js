import API from './api';

const authAPI = {
  // Register user
  register: (userData) => {
    return API.post('/auth/register', userData);
  },

  // Login user
  login: (credentials) => {
    return API.post('/auth/login', credentials);
  },

  // Get current user
  getCurrentUser: () => {
    return API.get('/auth/me');
  },

  // Update profile
  updateProfile: (profileData) => {
    return API.put('/users/profile', profileData);
  },

  // Forgot password
  forgotPassword: (data) => {
    return API.post('/auth/forgot-password', data);
  },

  // Reset password
  resetPassword: (token, data) => {
    return API.post(`/auth/reset-password/${token}`, data);
  },

  // Verify email
  verifyEmail: (token) => {
    return API.post(`/auth/verify-email/${token}`);
  },

  // Logout
  logout: () => {
    return API.post('/auth/logout');
  },

  // Google OAuth (if implemented)
  googleAuth: (token) => {
    return API.post('/auth/google', { token });
  },
};

export default authAPI;
