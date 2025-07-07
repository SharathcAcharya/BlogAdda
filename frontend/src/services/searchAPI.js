import api from './api';

class SearchAPI {
  // Main search function
  async search(query, filters = {}, page = 0, hitsPerPage = 20) {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        hitsPerPage: hitsPerPage.toString()
      });

      // Add filters to params
      if (filters.category && filters.category.length > 0) {
        filters.category.forEach(cat => params.append('category', cat));
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      
      if (filters.author && filters.author.length > 0) {
        filters.author.forEach(author => params.append('author', author));
      }

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.isFeatured !== undefined) {
        params.append('isFeatured', filters.isFeatured.toString());
      }

      if (filters.minViews) {
        params.append('minViews', filters.minViews.toString());
      }

      if (filters.dateRange) {
        if (filters.dateRange.start) {
          params.append('dateStart', filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          params.append('dateEnd', filters.dateRange.end);
        }
      }

      const response = await api.get(`/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Search API error:', error);
      throw error;
    }
  }

  // Get search suggestions
  async getSuggestions(query, limit = 5) {
    try {
      const response = await api.get(`/search/suggestions`, {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Suggestions API error:', error);
      throw error;
    }
  }

  // Get popular searches
  async getPopularSearches(limit = 10) {
    try {
      const response = await api.get(`/search/popular`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Popular searches API error:', error);
      throw error;
    }
  }

  // Reindex all blogs (admin only)
  async reindex() {
    try {
      const response = await api.post('/search/reindex');
      return response.data;
    } catch (error) {
      console.error('Reindex API error:', error);
      throw error;
    }
  }
}

export default new SearchAPI();
