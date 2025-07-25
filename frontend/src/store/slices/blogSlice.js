import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogAPI from '../../services/blogAPI';

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBlogs(params);
      // Use response.data.data.blogs and response.data.data.pagination
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch blogs'
      );
    }
  }
);

export const fetchTrendingBlogs = createAsyncThunk(
  'blogs/fetchTrendingBlogs',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getTrendingBlogs(limit);
      return response.data.blogs;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trending blogs'
      );
    }
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blogs/fetchBlogBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBlogBySlug(slug);
      return response.data.data.blog;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Blog not found'
      );
    }
  }
);

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await blogAPI.createBlog(blogData);
      return response.data.blog;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create blog'
      );
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await blogAPI.updateBlog(id, blogData);
      return response.data.blog;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update blog'
      );
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      await blogAPI.deleteBlog(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete blog'
      );
    }
  }
);

export const likeBlog = createAsyncThunk(
  'blogs/likeBlog',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogAPI.likeBlog(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to like blog'
      );
    }
  }
);

export const bookmarkBlog = createAsyncThunk(
  'blogs/bookmarkBlog',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogAPI.bookmarkBlog(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to bookmark blog'
      );
    }
  }
);

export const fetchUserBlogs = createAsyncThunk(
  'blogs/fetchUserBlogs',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getUserBlogs(userId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user blogs'
      );
    }
  }
);

export const fetchBookmarkedBlogs = createAsyncThunk(
  'blogs/fetchBookmarkedBlogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBookmarkedBlogs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bookmarked blogs'
      );
    }
  }
);

export const searchBlogs = createAsyncThunk(
  'blogs/searchBlogs',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await blogAPI.searchBlogs(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Search failed'
      );
    }
  }
);

// Initial state
const initialState = {
  blogs: [],
  trendingBlogs: [],
  userBlogs: [],
  bookmarkedBlogs: [],
  searchResults: [],
  currentBlog: null,
  loading: false,
  searchLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  userBlogsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  bookmarksPagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  searchPagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    category: '',
    tags: [],
    author: '',
    sort: 'latest',
  },
};

// Slice
const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = initialState.searchPagination;
    },
    updateBlogInList: (state, action) => {
      const { blogId, updates } = action.payload;
      
      // Update in main blogs list
      const blogIndex = state.blogs.findIndex(blog => blog._id === blogId);
      if (blogIndex !== -1) {
        state.blogs[blogIndex] = { ...state.blogs[blogIndex], ...updates };
      }
      
      // Update in trending blogs
      const trendingIndex = state.trendingBlogs.findIndex(blog => blog._id === blogId);
      if (trendingIndex !== -1) {
        state.trendingBlogs[trendingIndex] = { ...state.trendingBlogs[trendingIndex], ...updates };
      }
      
      // Update current blog if it matches
      if (state.currentBlog && state.currentBlog._id === blogId) {
        state.currentBlog = { ...state.currentBlog, ...updates };
      }
    },
    removeBlogFromList: (state, action) => {
      const blogId = action.payload;
      state.blogs = state.blogs.filter(blog => blog._id !== blogId);
      state.trendingBlogs = state.trendingBlogs.filter(blog => blog._id !== blogId);
      state.userBlogs = state.userBlogs.filter(blog => blog._id !== blogId);
      state.bookmarkedBlogs = state.bookmarkedBlogs.filter(blog => blog._id !== blogId);
      state.searchResults = state.searchResults.filter(blog => blog._id !== blogId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Trending Blogs
      .addCase(fetchTrendingBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.trendingBlogs = action.payload;
      })
      .addCase(fetchTrendingBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Blog by Slug
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentBlog = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.unshift(action.payload);
        state.userBlogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBlog = action.payload;
        
        // Update in all relevant arrays
        const updateBlogInArray = (array) => {
          const index = array.findIndex(blog => blog._id === updatedBlog._id);
          if (index !== -1) {
            array[index] = updatedBlog;
          }
        };
        
        updateBlogInArray(state.blogs);
        updateBlogInArray(state.userBlogs);
        updateBlogInArray(state.trendingBlogs);
        
        if (state.currentBlog && state.currentBlog._id === updatedBlog._id) {
          state.currentBlog = updatedBlog;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        const blogId = action.payload;
        
        // Remove from all arrays
        state.blogs = state.blogs.filter(blog => blog._id !== blogId);
        state.userBlogs = state.userBlogs.filter(blog => blog._id !== blogId);
        state.trendingBlogs = state.trendingBlogs.filter(blog => blog._id !== blogId);
        state.bookmarkedBlogs = state.bookmarkedBlogs.filter(blog => blog._id !== blogId);
        
        if (state.currentBlog && state.currentBlog._id === blogId) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like Blog
      .addCase(likeBlog.fulfilled, (state, action) => {
        const { id, likeCount, isLiked } = action.payload;
        
        // Update in all relevant arrays
        const updateLike = (blog) => {
          if (blog._id === id) {
            blog.likeCount = likeCount;
            blog.isLiked = isLiked;
          }
        };
        
        state.blogs.forEach(updateLike);
        state.trendingBlogs.forEach(updateLike);
        state.userBlogs.forEach(updateLike);
        state.bookmarkedBlogs.forEach(updateLike);
        state.searchResults.forEach(updateLike);
        
        if (state.currentBlog && state.currentBlog._id === id) {
          state.currentBlog.likeCount = likeCount;
          state.currentBlog.isLiked = isLiked;
        }
      })
      
      // Bookmark Blog
      .addCase(bookmarkBlog.fulfilled, (state, action) => {
        const { id, bookmarkCount, isBookmarked } = action.payload;
        
        // Update in all relevant arrays
        const updateBookmark = (blog) => {
          if (blog._id === id) {
            blog.bookmarkCount = bookmarkCount;
            blog.isBookmarked = isBookmarked;
          }
        };
        
        state.blogs.forEach(updateBookmark);
        state.trendingBlogs.forEach(updateBookmark);
        state.userBlogs.forEach(updateBookmark);
        state.searchResults.forEach(updateBookmark);
        
        if (state.currentBlog && state.currentBlog._id === id) {
          state.currentBlog.bookmarkCount = bookmarkCount;
          state.currentBlog.isBookmarked = isBookmarked;
        }
        
        // Remove from bookmarked blogs if unbookmarked
        if (!isBookmarked) {
          state.bookmarkedBlogs = state.bookmarkedBlogs.filter(blog => blog._id !== id);
        }
      })
      
      // Fetch User Blogs
      .addCase(fetchUserBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.userBlogs = action.payload.blogs;
        state.userBlogsPagination = action.payload.pagination;
      })
      .addCase(fetchUserBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Bookmarked Blogs
      .addCase(fetchBookmarkedBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarkedBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarkedBlogs = action.payload.blogs;
        state.bookmarksPagination = action.payload.pagination;
      })
      .addCase(fetchBookmarkedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search Blogs
      .addCase(searchBlogs.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchBlogs.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.blogs;
        state.searchPagination = action.payload.pagination;
      })
      .addCase(searchBlogs.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentBlog,
  setFilters,
  resetFilters,
  clearSearchResults,
  updateBlogInList,
  removeBlogFromList,
} = blogSlice.actions;

export default blogSlice.reducer;
