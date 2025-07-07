import api from './api';

class AnalyticsAPI {
  // Get dashboard analytics
  async getDashboardAnalytics(timeRange = '7d') {
    try {
      const response = await api.get(`/analytics/dashboard?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Dashboard analytics API error:', error);
      throw error;
    }
  }

  // Get blog-specific analytics
  async getBlogAnalytics(blogId, timeRange = '30d') {
    try {
      const response = await api.get(`/analytics/blog/${blogId}?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Blog analytics API error:', error);
      throw error;
    }
  }

  // Get user analytics
  async getUserAnalytics(timeRange = '30d') {
    try {
      const response = await api.get(`/analytics/user?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('User analytics API error:', error);
      throw error;
    }
  }

  // Get admin analytics (admin only)
  async getAdminAnalytics(timeRange = '7d') {
    try {
      const response = await api.get(`/analytics/admin/overview?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Admin analytics API error:', error);
      throw error;
    }
  }

  // Track a custom event
  async trackEvent(type, metadata = {}) {
    try {
      const response = await api.post('/analytics/track', {
        type,
        metadata
      });
      return response.data;
    } catch (error) {
      console.error('Event tracking API error:', error);
      // Don't throw error for tracking to avoid disrupting user experience
    }
  }

  // Track page view
  async trackPageView(page, metadata = {}) {
    return this.trackEvent('page_view', { page, ...metadata });
  }

  // Track blog view
  async trackBlogView(blogId, metadata = {}) {
    return this.trackEvent('blog_view', { blogId, ...metadata });
  }

  // Track blog like
  async trackBlogLike(blogId, metadata = {}) {
    return this.trackEvent('blog_like', { blogId, ...metadata });
  }

  // Track blog share
  async trackBlogShare(blogId, platform, metadata = {}) {
    return this.trackEvent('blog_share', { blogId, platform, ...metadata });
  }

  // Track search
  async trackSearch(query, results, metadata = {}) {
    return this.trackEvent('search', { query, results, ...metadata });
  }

  // Track comment
  async trackComment(blogId, metadata = {}) {
    return this.trackEvent('comment', { blogId, ...metadata });
  }
}

export default new AnalyticsAPI();
