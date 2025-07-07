import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBlogs, getBlogById, deleteBlog, toggleBlogFeature } from '../../services/adminAPI';
import toast from 'react-hot-toast';

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getBlogs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch blogs.'
      );
    }
  }
);

export const fetchBlogDetails = createAsyncThunk(
  'blogs/fetchBlogDetails',
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await getBlogById(blogId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch blog details.'
      );
    }
  }
);

export const removeBlog = createAsyncThunk(
  'blogs/removeBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await deleteBlog(blogId);
      return { ...response.data, blogId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete blog.'
      );
    }
  }
);

export const featureBlog = createAsyncThunk(
  'blogs/featureBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await toggleBlogFeature(blogId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update blog feature status.'
      );
    }
  }
);

const initialState = {
  blogs: [],
  currentBlog: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
  },
  loading: false,
  error: null,
};

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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch Blog Details
      .addCase(fetchBlogDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogDetails.fulfilled, (state, action) => {
        state.currentBlog = action.payload;
        state.loading = false;
      })
      .addCase(fetchBlogDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Remove Blog
      .addCase(removeBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload.blogId);
        toast.success(action.payload.message);
      })
      .addCase(removeBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Feature Blog
      .addCase(featureBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(featureBlog.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in the blogs list
        const index = state.blogs.findIndex(blog => blog._id === action.payload.blog.id);
        if (index !== -1) {
          state.blogs[index].isFeatured = action.payload.blog.isFeatured;
        }
        
        // Update in the current blog if viewing blog details
        if (state.currentBlog && state.currentBlog._id === action.payload.blog.id) {
          state.currentBlog.isFeatured = action.payload.blog.isFeatured;
        }
        
        toast.success(action.payload.message);
      })
      .addCase(featureBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError, clearCurrentBlog } = blogSlice.actions;

export default blogSlice.reducer;
