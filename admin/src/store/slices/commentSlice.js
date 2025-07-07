import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getReportedComments, deleteComment } from '../../services/adminAPI';
import toast from 'react-hot-toast';

// Async thunks
export const fetchReportedComments = createAsyncThunk(
  'comments/fetchReportedComments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getReportedComments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reported comments.'
      );
    }
  }
);

export const removeComment = createAsyncThunk(
  'comments/removeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await deleteComment(commentId);
      return { ...response.data, commentId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete comment.'
      );
    }
  }
);

const initialState = {
  comments: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
  },
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reported Comments
      .addCase(fetchReportedComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportedComments.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchReportedComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Remove Comment
      .addCase(removeComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment._id !== action.payload.commentId);
        toast.success(action.payload.message);
      })
      .addCase(removeComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError } = commentSlice.actions;

export default commentSlice.reducer;
