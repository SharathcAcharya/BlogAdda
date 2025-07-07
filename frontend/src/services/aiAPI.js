import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const aiAPI = {
  // Generate content ideas
  generateContentIdeas: async (topic, category = 'general', preferences = {}) => {
    try {
      const response = await api.post('/ai/content-ideas', {
        topic,
        category,
        preferences
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate content ideas');
    }
  },

  // Enhance content
  enhanceContent: async (content, enhancementType = 'improve') => {
    try {
      const response = await api.post('/ai/enhance-content', {
        content,
        enhancement_type: enhancementType
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enhance content');
    }
  },

  // SEO analysis
  analyzeSEO: async (title, content, targetKeywords = []) => {
    try {
      const response = await api.post('/ai/seo-analysis', {
        title,
        content,
        target_keywords: targetKeywords
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to analyze SEO');
    }
  },

  // Grammar check
  checkGrammar: async (content) => {
    try {
      const response = await api.post('/ai/grammar-check', {
        content
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check grammar');
    }
  },

  // Get trending topics
  getTrendingTopics: async (timeframe = '7d') => {
    try {
      const response = await api.get(`/ai/trending-topics?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get trending topics');
    }
  }
};

export default aiAPI;
