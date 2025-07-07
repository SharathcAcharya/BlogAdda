import { setAuthToken } from '../services/api';

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage and axios headers
export const setToken = (token) => {
  localStorage.setItem('token', token);
  setAuthToken(token);
};

// Remove token from localStorage and axios headers
export const removeToken = () => {
  localStorage.removeItem('token');
  setAuthToken(null);
};

// Check if user has specific role
export const hasRole = (user, role) => {
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
};

// Check if user is admin
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

// Check if user is moderator or admin
export const isModerator = (user) => {
  return hasRole(user, ['admin', 'moderator']);
};

// Get user initials for avatar
export const getUserInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Format user display name
export const formatDisplayName = (user) => {
  if (!user) return 'Unknown User';
  return user.name || user.email?.split('@')[0] || 'User';
};

// Check if current user owns resource
export const isOwner = (currentUser, resourceUserId) => {
  if (!currentUser || !resourceUserId) return false;
  return currentUser._id === resourceUserId || currentUser.id === resourceUserId;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get password strength
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/(?=.*[a-z])/.test(password)) strength++;
  if (/(?=.*[A-Z])/.test(password)) strength++;
  if (/(?=.*\d)/.test(password)) strength++;
  if (/(?=.*[@$!%*?&])/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: 'red' };
  if (strength <= 4) return { level: 'medium', color: 'yellow' };
  return { level: 'strong', color: 'green' };
};

export { setAuthToken };
