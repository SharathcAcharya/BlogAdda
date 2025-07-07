import API from './api';

const blogAPI = {
  // Get all blogs
  getBlogs: (params = {}) => {
    return API.get('/blogs', { params });
  },

  // Get trending blogs
  getTrendingBlogs: (limit = 10) => {
    return API.get('/blogs/trending', { params: { limit } });
  },

  // Get blog by slug
  getBlogBySlug: (slug) => {
    return API.get(`/blogs/${slug}`);
  },

  // Create new blog
  createBlog: (blogData) => {
    return API.post('/blogs', blogData);
  },

  // Update blog
  updateBlog: (id, blogData) => {
    return API.put(`/blogs/${id}`, blogData);
  },

  // Delete blog
  deleteBlog: (id) => {
    return API.delete(`/blogs/${id}`);
  },

  // Like/Unlike blog
  likeBlog: (id) => {
    return API.post(`/blogs/${id}/like`);
  },

  // Bookmark/Unbookmark blog
  bookmarkBlog: (id) => {
    return API.post(`/blogs/${id}/bookmark`);
  },

  // Get user's blogs
  getUserBlogs: (userId, params = {}) => {
    return API.get(`/users/${userId}/blogs`, { params });
  },

  // Get bookmarked blogs
  getBookmarkedBlogs: (params = {}) => {
    return API.get('/blogs/user/bookmarks', { params });
  },

  // Search blogs
  searchBlogs: (searchParams) => {
    return API.get('/blogs', { params: searchParams });
  },

  // Get blog by ID (for editing)
  getBlogById: (id) => {
    return API.get(`/blogs/by-id/${id}`);
  },

  // Get categories
  getCategories: () => {
    return API.get('/blogs/categories');
  },

  // Get popular tags
  getPopularTags: (limit = 20) => {
    return API.get('/blogs/tags/popular', { params: { limit } });
  },
};

export default blogAPI;
